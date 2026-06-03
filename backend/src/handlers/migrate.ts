import { Pool } from 'pg';
import initSql from '../../migrations/001_init.sql';
import seedSql from '../../seeds/001_seed.sql';

// One-shot operations Lambda. Reads the cluster's master credentials from
// Secrets Manager, then:
//   1. enables PostGIS,
//   2. creates the `app` role with rds_iam (so app Lambdas authenticate by IAM),
//   3. applies any not-yet-applied migrations,
//   4. (optional) applies seeds when event.seed === true,
//   5. grants the `app` role read/write on the schema.
// Invoke after deploy or whenever new migrations are added.

interface MigrateEvent {
  seed?: boolean;
}

async function connectWithRetry(pool: Pool, attempts: number, waitMs: number) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query('SELECT 1');
      return `resumed on attempt ${i}`;
    } catch (err) {
      const message = (err as { code?: string; message?: string }).code ?? (err as Error).message;
      if (i === attempts) throw err;
      console.log(`connect attempt ${i}/${attempts} failed (${message}); waiting ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
  return 'unreachable';
}

async function applyOnce(pool: Pool, name: string, sql: string): Promise<'applied' | 'skipped'> {
  const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
  if (rows.length > 0) return 'skipped';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
    return 'applied';
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export const handler = async (event: MigrateEvent = {}) => {
  const dbName = process.env.DB_NAME ?? 'lifeventure';
  const appUser = process.env.APP_DB_USER ?? 'app';
  const masterUser = process.env.DB_MASTER_USERNAME;
  const masterPassword = process.env.DB_MASTER_PASSWORD;
  if (!masterUser || !masterPassword) {
    throw new Error('DB_MASTER_USERNAME and DB_MASTER_PASSWORD must be set');
  }

  const pool = new Pool({
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT ?? 5432),
    database: dbName,
    user: masterUser,
    password: masterPassword,
    ssl: { rejectUnauthorized: false },
    max: 2,
    connectionTimeoutMillis: 10_000,
  });

  const log: Record<string, unknown> = {};

  // Aurora Serverless v2 scale-to-zero takes ~15s to resume on first contact;
  // the initial TCP connect can ETIMEDOUT in that window. Retry with backoff.
  log.warmup = await connectWithRetry(pool, 8, 8_000);

  try {
    await pool.query(`CREATE EXTENSION IF NOT EXISTS postgis`);
    log.postgis = 'ok';

    // Idempotent app role creation. rds_iam grant is what enables IAM auth.
    await pool.query(`DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${appUser}') THEN
          EXECUTE format('CREATE USER %I', '${appUser}');
        END IF;
      END $$;`);
    await pool.query(`GRANT rds_iam TO ${appUser}`);
    await pool.query(`GRANT CONNECT ON DATABASE ${dbName} TO ${appUser}`);
    log.appUser = 'ok';

    await pool.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);

    log.migrations = {
      '001_init.sql': await applyOnce(pool, 'migrations/001_init.sql', initSql),
    };

    if (event.seed) {
      log.seeds = {
        '001_seed.sql': await applyOnce(pool, 'seeds/001_seed.sql', seedSql),
      };
    }

    // Grant the app role read/write on all current + future tables.
    await pool.query(`GRANT USAGE ON SCHEMA public TO ${appUser}`);
    await pool.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${appUser}`);
    await pool.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${appUser}`);
    await pool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${appUser}`);
    await pool.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${appUser}`);
    log.grants = 'ok';

    return { status: 'ok', ...log };
  } finally {
    await pool.end();
  }
};

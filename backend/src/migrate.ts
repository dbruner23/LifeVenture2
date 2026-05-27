import 'dotenv/config';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { getPool } from './db';

// Applies migrations/*.sql in order, tracking applied files in schema_migrations.
// With --seed, also applies seeds/*.sql afterwards.
async function applyDir(dir: string, label: string) {
  const pool = getPool();
  const full = path.join(__dirname, '..', dir);
  const files = readdirSync(full)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const { rows } = await pool.query('SELECT 1 FROM schema_migrations WHERE name = $1', [
      `${dir}/${file}`,
    ]);
    if (rows.length > 0) {
      console.log(`  skip  ${dir}/${file} (already applied)`);
      continue;
    }

    const sql = readFileSync(path.join(full, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [`${dir}/${file}`]);
      await client.query('COMMIT');
      console.log(`  apply ${dir}/${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Failed applying ${dir}/${file}: ${(err as Error).message}`);
    } finally {
      client.release();
    }
  }
  console.log(`${label} done.`);
}

async function main() {
  const pool = getPool();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await applyDir('migrations', 'Migrations');
  if (process.argv.includes('--seed')) {
    await applyDir('seeds', 'Seeds');
  }

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

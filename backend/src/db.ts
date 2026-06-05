import { Pool, type PoolConfig } from 'pg';

// Single DB module for both environments:
//  - Local: password auth (DB_PASSWORD), no SSL.
//  - AWS Lambda: DB_IAM_AUTH=true -> a short-lived RDS IAM token is generated
//    per connection (pg accepts an async `password` function), SSL on.
// Token generation is local signing (no network call), so no NAT is needed.

async function resolvePassword(): Promise<string> {
  if (process.env.DB_IAM_AUTH === 'true') {
    const { Signer } = await import('@aws-sdk/rds-signer');
    const signer = new Signer({
      region: process.env.AWS_REGION ?? 'ap-southeast-2',
      hostname: process.env.DB_HOST!,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER!,
    });
    return signer.getAuthToken();
  }
  return process.env.DB_PASSWORD ?? 'postgres';
}

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  const config: PoolConfig = {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? 'lifeventure',
    user: process.env.DB_USER ?? 'postgres',
    password: resolvePassword,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    max: Number(process.env.DB_POOL_MAX ?? 2),
    idleTimeoutMillis: 10_000,
  };

  pool = new Pool({ ...config, connectionTimeoutMillis: 8_000 });
  return pool;
}

/**
 * Aurora Serverless v2 scale-to-zero takes ~10-15s to resume on first contact;
 * the initial TCP connect can ETIMEDOUT in that window. Call this at the top
 * of a handler before issuing the real query.
 */
export async function ensureConnected(
  pool: Pool,
  opts: { attempts?: number; waitMs?: number } = {},
): Promise<void> {
  const attempts = opts.attempts ?? 5;
  const waitMs = opts.waitMs ?? 5_000;
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query('SELECT 1');
      return;
    } catch (err) {
      if (i === attempts) throw err;
      const message = (err as { code?: string; message?: string }).code ?? (err as Error).message;
      console.log(`db connect attempt ${i}/${attempts} failed (${message}); waiting ${waitMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }
}

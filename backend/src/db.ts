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

  pool = new Pool(config);
  return pool;
}

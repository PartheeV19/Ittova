import { Pool } from 'pg';

let pool;

export function getPool() {
  if (pool) return pool;

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured. Copy .env.example to .env and set the database password.');
  }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number.parseInt(process.env.DB_POOL_MAX || '10', 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000
    });

    pool.on('error', (error) => {
      console.error('Unexpected idle PostgreSQL client error:', error.message);
    });

  return pool;
}

export function setPool(customPool) {
  pool = customPool;
}

export async function closePool() {
  if (!pool) return;
  const activePool = pool;
  pool = undefined;
  await activePool.end();
}

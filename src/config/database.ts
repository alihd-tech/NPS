import { Pool, QueryResult } from 'pg';
import { env } from './env';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      max: env.dbPoolSize,
      idleTimeoutMillis: env.dbIdleTimeout,
      statement_timeout: 30000,
      query_timeout: 30000,
    });

    pool.on('error', (err) => {
      console.error('[DB] Unexpected pool error:', err);
    });
  }

  return pool;
}

export async function query<T = any>(
  text: string,
  values?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const result = await getPool().query<T>(text, values);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[DB] Slow query (${duration}ms):`, text);
    }
    return result;
  } catch (error) {
    console.error('[DB] Query error:', error);
    throw error;
  }
}

export async function queryOne<T = any>(
  text: string,
  values?: any[]
): Promise<T | null> {
  const result = await query<T>(text, values);
  return result.rows[0] || null;
}

export async function queryAll<T = any>(
  text: string,
  values?: any[]
): Promise<T[]> {
  const result = await query<T>(text, values);
  return result.rows;
}

export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    return !!result.rows[0];
  } catch {
    return false;
  }
}

import { Pool } from 'pg';
import { env } from '../config/env';

export const pool = new Pool({
  connectionString: env.databaseUrl,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected PG pool error', err);
});

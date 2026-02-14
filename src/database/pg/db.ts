import { envs } from '@/config/envs';
import { drizzle } from 'drizzle-orm/node-postgres';

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: envs.dbUrl,
});

export const db = drizzle(pool);

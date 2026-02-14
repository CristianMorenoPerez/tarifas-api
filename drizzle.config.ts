import { envs } from '@/config/envs';
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/database/pg/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: envs.dbUrl,
  },
});

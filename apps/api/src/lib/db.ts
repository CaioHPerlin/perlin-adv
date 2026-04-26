import { config } from '@/common/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const sql = neon(config.DATABASE_URL);

export const dbClient = drizzle(sql);

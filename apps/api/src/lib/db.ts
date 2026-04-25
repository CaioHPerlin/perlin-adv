import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { config } from '../common/config';

const sql = neon(config.DATABASE_URL);

export const dbClient = drizzle(sql);

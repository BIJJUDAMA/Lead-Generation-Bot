import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

const connectionString = process.env.DATABASE_URL!;

const sql = neon(connectionString);

declare global {
  var db: ReturnType<typeof drizzle> | undefined;
}

export const db = global.db || drizzle(sql);

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}

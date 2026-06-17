import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const getDb = () => {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const client = neon(connectionString);
  return drizzle(client, { schema });
};

declare global {
  var db: ReturnType<typeof getDb> | undefined;
}

export const db = global.db || getDb();

if (process.env.NODE_ENV !== 'production') {
  global.db = db;
}

import * as SQLite from 'expo-sqlite';
import { SCHEMA } from './schema';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    try {
      const database = await SQLite.openDatabaseAsync('orbit.db');

      // Enable foreign keys
      await database.execAsync('PRAGMA foreign_keys = ON;');

      // Execute schema
      await database.execAsync(SCHEMA);

      // Ensure test user exists for auth bypass
      await database.runAsync(
        'INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)',
        ['test-user-id', 'test@example.com', 'Test User']
      );

      return database;
    } catch (error) {
      console.error('Database initialization failed:', error);
      dbPromise = null; // Allow retry on failure
      throw error;
    }
  })();

  return dbPromise;
}

export async function runQuery<T>(query: string, params: any[] = []): Promise<T[]> {
  try {
    const database = await getDb();
    return await database.getAllAsync<T>(query, params);
  } catch (error) {
    console.error(`Query failed: ${query}`, params, error);
    throw error;
  }
}

export async function runExecute(query: string, params: any[] = []): Promise<void> {
  try {
    const database = await getDb();
    await database.runAsync(query, params);
  } catch (error) {
    console.error(`Execution failed: ${query}`, params, error);
    throw error;
  }
}

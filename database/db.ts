import * as SQLite from 'expo-sqlite';

// Mở database bằng API đồng bộ (SDK 50 trở lên)
const db = SQLite.openDatabaseSync('grocery.db');

export function initDB() {
  try {
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS grocery_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        category TEXT,
        bought INTEGER DEFAULT 0,
        created_at INTEGER
      );
    `);

    console.log("DB initialized");
  } catch (err) {
    console.error("DB init error:", err);
  }
}

export async function executeSql(query: string, params: any[] = []) {
  try {
    const result = await db.getAllAsync(query, params);
    return result;
  } catch (err) {
    console.error("SQL error:", err);
    throw err;
  }
}

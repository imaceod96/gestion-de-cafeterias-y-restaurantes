import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { SCHEMA } from "@/integrations/database/schema";

let instance: Database.Database | null = null;

function resolveDatabasePath(): string {
  const configured = process.env.CAFETERIA_DB_PATH;
  if (configured) {
    return resolve(process.cwd(), configured);
  }
  return resolve(process.cwd(), "data", "cafeteria.db");
}

export function getDatabase(): Database.Database {
  if (instance) {
    return instance;
  }

  const path = resolveDatabasePath();
  mkdirSync(dirname(path), { recursive: true });

  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);

  // Migration: fix tables table name column (was NOT NULL UNIQUE, now nullable)
  const tableColumns = db.prepare("PRAGMA table_info(tables)").all() as { name: string }[];
  const tableColumnNames = tableColumns.map((c) => c.name);
  if (tableColumnNames.includes("name")) {
    // Check if name column has NOT NULL constraint by trying to insert a null
    // SQLite doesn't easily expose column nullability, so we check via pragma
    const tableInfo = db.prepare("PRAGMA table_info(tables)").all() as { name: string; notnull: number }[];
    const nameCol = tableInfo.find((c) => c.name === "name");
    if (nameCol && nameCol.notnull === 1) {
      // Recreate table to allow nullable name
      db.exec(`
        CREATE TABLE IF NOT EXISTS tables_new (
          id TEXT PRIMARY KEY,
          number INTEGER NOT NULL,
          name TEXT,
          status TEXT NOT NULL DEFAULT 'libre',
          current_account_id TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL,
          UNIQUE(number)
        );
      `);
      db.exec("INSERT INTO tables_new SELECT * FROM tables");
      db.exec("DROP TABLE tables");
      db.exec("ALTER TABLE tables_new RENAME TO tables");
    }
  }

  instance = db;
  return db;
}

export function runInTransaction<T>(work: (db: Database.Database) => T): T {
  const db = getDatabase();
  const transaction = db.transaction(work);
  return transaction(db);
}
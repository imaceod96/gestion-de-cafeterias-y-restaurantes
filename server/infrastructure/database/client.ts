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

  instance = db;
  return db;
}

export function runInTransaction<T>(work: (db: Database.Database) => T): T {
  const db = getDatabase();
  const transaction = db.transaction(work);
  return transaction(db);
}

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

  // Migration: make products.category_id nullable (no longer required)
    const productColumns = db.prepare("PRAGMA table_info(products)").all() as { name: string; notnull: number }[];
    const categoryCol = productColumns.find((c) => c.name === "category_id");
    if (categoryCol && categoryCol.notnull === 1) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS products_new (
          id TEXT PRIMARY KEY,
          category_id TEXT,
          name TEXT NOT NULL,
          description TEXT,
          unit TEXT NOT NULL,
          current_purchase_price REAL NOT NULL DEFAULT 0,
          current_sale_price REAL NOT NULL DEFAULT 0,
          current_stock REAL NOT NULL DEFAULT 0,
          min_stock REAL NOT NULL DEFAULT 0,
          is_active INTEGER NOT NULL DEFAULT 1,
          photo_url TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      db.exec("INSERT INTO products_new SELECT id, category_id, name, description, unit, current_purchase_price, current_sale_price, current_stock, min_stock, is_active, photo_url, created_at, updated_at FROM products");
      db.exec("DROP TABLE products");
      db.exec("ALTER TABLE products_new RENAME TO products");
    }
  
    // Migration: add unit column to merchandise_entries if missing
    const entryColumns = db.prepare("PRAGMA table_info(merchandise_entries)").all() as { name: string }[];
    const entryColumnNames = entryColumns.map((c) => c.name);
    if (entryColumnNames.length > 0 && !entryColumnNames.includes("unit")) {
      db.exec("ALTER TABLE merchandise_entries ADD COLUMN unit TEXT NOT NULL DEFAULT 'un'");
    }

  // Migration: normalize unit abbreviations to the canonical set (unid, lb, pqte)
  db.exec("UPDATE units SET abbreviation = 'unid' WHERE name = 'Unidad' AND abbreviation = 'un'");
  db.exec("UPDATE units SET abbreviation = 'pqte' WHERE name = 'Paquete' AND abbreviation = 'paq'");
  db.exec("UPDATE products SET unit = 'unid' WHERE unit = 'un'");
  db.exec("UPDATE products SET unit = 'pqte' WHERE unit = 'paq'");

  instance = db;
  return db;
}

export function runInTransaction<T>(work: (db: Database.Database) => T): T {
  const db = getDatabase();
  const transaction = db.transaction(work);
  return transaction(db);
}
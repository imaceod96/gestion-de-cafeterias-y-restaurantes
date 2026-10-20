import { Database } from "better-sqlite3";

export function createTables(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      description TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS units (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      abbreviation TEXT NOT NULL UNIQUE,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      category_id TEXT NOT NULL,
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
      updated_at TEXT NOT NULL,
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS merchandise_entries (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit_cost REAL NOT NULL,
      unit_sale_price REAL NOT NULL DEFAULT 0,
      total_cost REAL NOT NULL,
      supplier TEXT,
      notes TEXT,
      entry_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS inventory_movements (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      previous_stock REAL NOT NULL,
      new_stock REAL NOT NULL,
      reason TEXT,
      reference_id TEXT,
      reference_type TEXT,
      movement_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      price_type TEXT NOT NULL,
      old_price REAL NOT NULL,
      new_price REAL NOT NULL,
      changed_by TEXT,
      change_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      origin TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      items TEXT NOT NULL,
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_method TEXT,
      paid_amount REAL NOT NULL DEFAULT 0,
      change_amount REAL NOT NULL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      closed_at TEXT
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      sale_id TEXT,
      folio TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'pending',
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      payment_method TEXT,
      paid_amount REAL NOT NULL DEFAULT 0,
      change_amount REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      closed_at TEXT,
      FOREIGN KEY (sale_id) REFERENCES sales (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS tables (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'free',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS table_accounts (
      id TEXT PRIMARY KEY,
      table_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      items TEXT NOT NULL DEFAULT '[]',
      subtotal REAL NOT NULL DEFAULT 0,
      tax REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      closed_at TEXT,
      FOREIGN KEY (table_id) REFERENCES tables (id)
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS cuts (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL DEFAULT 'open',
      opening_cash REAL NOT NULL DEFAULT 0,
      expected_cash REAL NOT NULL DEFAULT 0,
      actual_cash REAL,
      difference REAL,
      sales_count INTEGER NOT NULL DEFAULT 0,
      sales_total REAL NOT NULL DEFAULT 0,
      started_at TEXT NOT NULL,
      closed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
    CREATE INDEX IF NOT EXISTS idx_merchandise_entries_product ON merchandise_entries(product_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
  `);

  // Insert default categories if they don't exist
  const categories = db.prepare("SELECT COUNT(*) as count FROM categories").get() as { count: number };
  if (categories.count === 0) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO categories (id, name, description, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `);
    const defaultCategories = [
      ["cat-1", "Café", "Productos de café", now, now],
      ["cat-2", "Bebidas", "Bebidas frías y calientes", now, now],
      ["cat-3", "Comida", "Platos preparados", now, now],
      ["cat-4", "Dulces", "Postres y dulces", now, now],
      ["cat-5", "Snacks", "Botanas y snacks", now, now],
      ["cat-6", "Otros", "Otros productos", now, now],
    ];
    for (const cat of defaultCategories) {
      stmt.run(...cat);
    }
  }

  // Insert default units if they don't exist
  const units = db.prepare("SELECT COUNT(*) as count FROM units").get() as { count: number };
  if (units.count === 0) {
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO units (id, name, abbreviation, is_active, created_at, updated_at)
      VALUES (?, ?, ?, 1, ?, ?)
    `);
    const defaultUnits = [
      ["unit-1", "Unidad", "un", now, now],
      ["unit-2", "Libra", "lb", now, now],
      ["unit-3", "Kilogramo", "kg", now, now],
      ["unit-4", "Caja", "caja", now, now],
      ["unit-5", "Botella", "bot", now, now],
      ["unit-6", "Paquete", "paq", now, now],
    ];
    for (const u of defaultUnits) {
      stmt.run(...u);
    }
  }
}
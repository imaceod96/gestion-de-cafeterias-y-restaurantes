export const SCHEMA = `
-- Categorías
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Productos
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  unit TEXT NOT NULL DEFAULT 'unidad',
  current_purchase_price REAL NOT NULL DEFAULT 0,
  current_sale_price REAL NOT NULL DEFAULT 0,
  current_stock REAL NOT NULL DEFAULT 0,
  min_stock REAL NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  photo_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Historial de precios
CREATE TABLE IF NOT EXISTS price_history (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  price_type TEXT NOT NULL CHECK (price_type IN ('compra', 'venta')),
  old_price REAL,
  new_price REAL NOT NULL,
  changed_by TEXT,
  change_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Entradas de mercancía
CREATE TABLE IF NOT EXISTS merchandise_entries (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_cost REAL NOT NULL,
  total_cost REAL NOT NULL,
  supplier TEXT,
  notes TEXT,
  entry_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Movimientos de inventario
CREATE TABLE IF NOT EXISTS inventory_movements (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('entry', 'sale', 'adjustment')),
  quantity REAL NOT NULL,
  previous_stock REAL NOT NULL,
  new_stock REAL NOT NULL,
  reason TEXT,
  reference_id TEXT,
  reference_type TEXT,
  movement_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Ventas
CREATE TABLE IF NOT EXISTS sales (
  id TEXT PRIMARY KEY,
  origin TEXT NOT NULL CHECK (origin IN ('vale', 'mesa')),
  origin_id TEXT,
  total REAL NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  total_profit REAL NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  sale_date TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Detalles de venta
CREATE TABLE IF NOT EXISTS sale_details (
  id TEXT PRIMARY KEY,
  sale_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_sale_price REAL NOT NULL,
  unit_cost REAL NOT NULL,
  total REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Vales
CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'abierto' CHECK (status IN ('abierto', 'cerrado')),
  total REAL NOT NULL DEFAULT 0,
  sale_id TEXT,
  created_by TEXT,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

-- Mesas
CREATE TABLE IF NOT EXISTS tables (
  id TEXT PRIMARY KEY,
  number INTEGER NOT NULL UNIQUE,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'libre' CHECK (status IN ('libre', 'abierta')),
  current_account_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Cuentas de mesa
CREATE TABLE IF NOT EXISTS table_accounts (
  id TEXT PRIMARY KEY,
  table_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'abierta' CHECK (status IN ('abierta', 'cerrada')),
  total REAL NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  item_count INTEGER NOT NULL DEFAULT 0,
  opened_at TEXT NOT NULL,
  closed_at TEXT,
  sale_id TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (table_id) REFERENCES tables(id),
  FOREIGN KEY (sale_id) REFERENCES sales(id)
);

-- Detalles de cuenta de mesa
CREATE TABLE IF NOT EXISTS table_account_details (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_sale_price REAL NOT NULL,
  unit_cost REAL NOT NULL,
  total REAL NOT NULL,
  added_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (account_id) REFERENCES table_accounts(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Cortes de inventario
CREATE TABLE IF NOT EXISTS inventory_cuts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'completado')),
  created_at TEXT NOT NULL
);

-- Detalles de corte
CREATE TABLE IF NOT EXISTS cut_details (
  id TEXT PRIMARY KEY,
  cut_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  physical_count REAL NOT NULL,
  expected_count REAL NOT NULL,
  difference REAL NOT NULL,
  unit_cost REAL NOT NULL,
  total_cost REAL NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (cut_id) REFERENCES inventory_cuts(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Usuarios
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'dependiente')),
  name TEXT,
  email TEXT,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  last_login_at TEXT
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_merchandise_entries_product ON merchandise_entries(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_sales_origin ON sales(origin);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_table_accounts_table ON table_accounts(table_id);
CREATE INDEX IF NOT EXISTS idx_cut_details_cut ON cut_details(cut_id);
`;

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'database', 'mainframe.db');
const BACKUP_DIR = path.join(__dirname, '..', '..', 'backup');

// Ensure directories exist
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    customer_mobile TEXT,
    product_service TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    amount REAL NOT NULL CHECK(amount > 0),
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    invoice_number TEXT,
    notes TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    expense_title TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Miscellaneous',
    vendor_name TEXT,
    amount REAL NOT NULL CHECK(amount > 0),
    payment_method TEXT NOT NULL DEFAULT 'Cash',
    notes TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK(id = 1),
    business_name TEXT NOT NULL DEFAULT 'Mainframe Computers',
    owner_name TEXT DEFAULT '',
    currency TEXT NOT NULL DEFAULT '₹',
    theme TEXT NOT NULL DEFAULT 'dark'
  );

  -- Insert default settings if not exists
  INSERT OR IGNORE INTO settings (id, business_name, owner_name, currency, theme)
  VALUES (1, 'Mainframe Computers', '', '₹', 'dark');
`);

// Create indexes for search performance
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
  CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customer_name);
  CREATE INDEX IF NOT EXISTS idx_sales_category ON sales(category);
  CREATE INDEX IF NOT EXISTS idx_sales_payment ON sales(payment_method);
  CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
  CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
  CREATE INDEX IF NOT EXISTS idx_expenses_vendor ON expenses(vendor_name);
`);

module.exports = { db, DB_PATH, BACKUP_DIR };

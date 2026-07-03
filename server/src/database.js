const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'database', 'mainframe.db');
const BACKUP_DIR = path.join(__dirname, '..', '..', 'backup');

// Ensure directories exist
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
fs.mkdirSync(BACKUP_DIR, { recursive: true });

const db = new Database(DB_PATH);

// Enable WAL mode for better performance and crash-safety
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
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

// Run automatic monthly backup check on startup
try {
  const now = new Date();
  now.setDate(1);
  now.setMonth(now.getMonth() - 1);
  const prevYear = now.getFullYear();
  const prevMonth = String(now.getMonth() + 1).padStart(2, '0');
  const prevMonthStr = `${prevYear}-${prevMonth}`; // "YYYY-MM"

  // Check if there are sales or expenses from that month
  const saleCount = db.prepare(`SELECT COUNT(*) as count FROM sales WHERE date LIKE ?`).get(`${prevMonthStr}%`).count;
  const expenseCount = db.prepare(`SELECT COUNT(*) as count FROM expenses WHERE date LIKE ?`).get(`${prevMonthStr}%`).count;

  if (saleCount > 0 || expenseCount > 0) {
    const filename = `mainframe_monthly_${prevMonthStr}.db`;
    const backupPath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(backupPath)) {
      console.log(`[Auto-Backup] Creating monthly backup for ${prevMonthStr}...`);
      db.backup(backupPath);
      console.log(`[Auto-Backup] Created monthly backup: ${filename}`);
    }
  }
} catch (backupErr) {
  console.error('[Auto-Backup] Failed to run monthly check:', backupErr.message);
}

// Run rolling safety daily backup on startup
try {
  const todayStr = new Date().toLocaleDateString('en-CA');
  const lastBackupDateFile = path.join(BACKUP_DIR, '.last_daily_backup');
  
  let lastBackupDate = '';
  if (fs.existsSync(lastBackupDateFile)) {
    lastBackupDate = fs.readFileSync(lastBackupDateFile, 'utf8').trim();
  }

  if (lastBackupDate !== todayStr) {
    console.log(`[Safety-Backup] Creating daily safety backup for ${todayStr}...`);
    
    const backup3 = path.join(BACKUP_DIR, 'mainframe_safety_3.db');
    const backup2 = path.join(BACKUP_DIR, 'mainframe_safety_2.db');
    const backup1 = path.join(BACKUP_DIR, 'mainframe_safety_1.db');
    
    // Rotate backups
    if (fs.existsSync(backup2)) {
      fs.copyFileSync(backup2, backup3);
    }
    if (fs.existsSync(backup1)) {
      fs.copyFileSync(backup1, backup2);
    }
    
    // Create new backup
    db.backup(backup1);
    
    // Update last backup date
    fs.writeFileSync(lastBackupDateFile, todayStr, 'utf8');
    console.log('[Safety-Backup] Rolling safety backups updated (mainframe_safety_1.db created)');
  }
} catch (safetyErr) {
  console.error('[Safety-Backup] Failed to run daily safety check:', safetyErr.message);
}

module.exports = { db, DB_PATH, BACKUP_DIR };

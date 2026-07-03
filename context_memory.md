# Context Memory (Mainframe Computers Business Dashboard)

This file serves as the persistent memory and context diary of the **Mainframe Computers Business Dashboard** project. It details the system architecture, database structure, modules, implemented features, and technical design choices.

---

## 🖥️ Project Overview

- **Goal**: A polished, local-first, production-quality desktop-style business management application for **Mainframe Computers** to manage sales, expenses, profits, and reports completely offline.
- **Tech Stack**:
  - **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide Icons, jsPDF, SheetJS.
  - **Backend**: Node.js, Express.js.
  - **Database**: SQLite (managed with Prisma ORM / direct Better-SQLite3 queries).

---

## 🗄️ Database Schema

### `sales` Table
- `id` (INTEGER PRIMARY KEY)
- `customer_name` (TEXT NOT NULL)
- `customer_mobile` (TEXT)
- `product_service` (TEXT NOT NULL)
- `category` (TEXT NOT NULL) — e.g., Laptop, Desktop, Printer, Accessories, Repair, CCTV, Networking, Software, Other.
- `amount` (REAL NOT NULL)
- `payment_method` (TEXT NOT NULL) — Must be one of: Cash, UPI, Credit Card, Debit Card, Bank Transfer.
- `invoice_number` (TEXT)
- `notes` (TEXT)
- `date` (TEXT NOT NULL) — YYYY-MM-DD
- `time` (TEXT NOT NULL) — HH:MM:SS
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

### `expenses` Table
- `id` (INTEGER PRIMARY KEY)
- `expense_title` (TEXT NOT NULL)
- `category` (TEXT NOT NULL)
- `vendor_name` (TEXT)
- `amount` (REAL NOT NULL)
- `payment_method` (TEXT NOT NULL)
- `notes` (TEXT)
- `date` (TEXT NOT NULL) — YYYY-MM-DD
- `time` (TEXT NOT NULL) — HH:MM:SS
- `created_at` (DATETIME DEFAULT CURRENT_TIMESTAMP)

---

## 🛠️ Implemented Modules & Features

### 1. Dashboard Customizations
- **Summary Cards Order**: The cards are ordered logically. **Today's Expenses** and **Monthly Expenses** are placed at the end to keep revenue and profit metrics prominent.
- **Chart Adjustments**:
  - Upgraded grid lines to `rgba(148, 163, 184, 0.25)` (Slate with 0.25 opacity) for visible grid lines across all charts in both light and dark themes.
  - Removed the **Daily Expense Trend** chart card.
  - Filtered out any "Card" / "Credit Card" payment options from the **Payment Method Distribution** pie chart.

### 2. Form Inputs & Usability
- **Autocomplete Input**: Dynamic customer name suggestions. The backend route `GET /api/sales/customers` retrieves a list of unique customer names from the database, which is dynamically rendered in a browser-native `<datalist>` for customer inputs.
- **Enter Key Navigation**: Form inputs and select controls capture `Enter` keypress events to programmatically transfer focus to the next input field, speeding up manual transaction entries.

### 3. Customer Profiles & History
- **Clickable Customer Profile**: Clicking a customer name (in the global search list or inside the Sales History table) opens a dialog containing the customer's full metrics (Total Value, Visit Count, Avg order value, Last Purchase) and their complete transaction history table.

### 4. Clean PDF Reports
- ** Rupee Symbol Replacement**: Replaces the Unicode Rupee symbol `₹` (which renders incorrectly as a superscript `¹` in default PDF fonts due to WinAnsi encoding issues) with standard `Rs. ` (e.g. `Rs. 12345.67`).
- **Comma Formatting**: All currency fields inside PDF exports are formatted cleanly by stripping out any thousand-separator formatting commas (e.g. `12345.67` instead of `12,345.67`).
- **Column Simplification**: Removed redundant metrics (Card Sales, Bank Transfer, Avg Sale, Avg Expense) and moved total expenses to the last position.

### 5. Hybrid File Import System (AI Assistant Uploads)
- **High-Speed Direct Parser**: When an Excel (`.xlsx`, `.xls`) or CSV file is uploaded via the AI Assistant, the backend automatically detects standard transaction columns (e.g. *Customer Name*, *Product*, *Amount*, *Payment Method*, *Date*, etc.). If matching columns are found, the backend parses the records programmatically in milliseconds. This bypasses LLM token limits, allows importing thousands of rows instantly, and prevents AI context limits or parse errors.
- **AI Fallback**: If the uploaded file is unstructured or does not have recognizable columns (like a PDF or Word document), it automatically falls back to the Qwen-based AI extraction pipeline (`qwen/qwen3.6-27b`) with an increased input limit of 60,000 characters.

---

## 📁 Key File Locations

- **Backend API Routes**: `/home/tanish-rathod/Desktop/mainframe/server/src/routes/`
  - `ai.js`: AI Chat, file uploads, programmatic Excel/CSV import logic.
  - `sales.js`: Sales CRUD operations and customer history endpoints.
  - `expenses.js`: Expenses CRUD operations.
  - `dashboard.js`: Dashboard charts and summary statistics.
- **Frontend Pages**: `/home/tanish-rathod/Desktop/mainframe/client/src/pages/`
  - `SalesPage.jsx`: Main sales view.
  - `ExpensesPage.jsx`: Main expenses view.
  - `DashboardPage.jsx`: Dashboard cards and chart renders.
- **Frontend Components**: `/home/tanish-rathod/Desktop/mainframe/client/src/components/`
  - `sales/CustomerHistoryDialog.jsx`: Displays metrics & transaction history for a selected customer.
  - `ai/AiAssistant.jsx`: Floating AI assistant chat UI.

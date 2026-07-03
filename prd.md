# Product Requirements Document (PRD)

# Project Name

**Mainframe Computers Business Dashboard**

---

# Project Goal

Build a modern, premium, local-first business management application for **Mainframe Computers**.

The application will be used inside the shop to record daily sales and expenses, automatically calculate profits, and generate business reports.

This is **not a cloud application**.

Everything must work completely offline.

All data must be stored locally using **SQLite**.

The application should feel like professional business software similar to Tally or Zoho Books, but simplified for a computer sales and service shop.

---

# Tech Stack

## Frontend

* React
* Vite
* Tailwind CSS
* Shadcn UI
* React Router
* React Hook Form
* Recharts
* Lucide Icons

## Backend

* Node.js
* Express.js

## Database

* SQLite
* Prisma ORM

## Other Libraries

* Zod
* React Hot Toast
* jsPDF
* SheetJS (Excel Export)

---

# General Requirements

* Completely offline application
* No cloud services
* No hosting
* No internet required
* Local SQLite database
* Fast performance
* Responsive UI
* Dark mode by default
* Modern glassmorphism design
* Professional animations
* Easy to use for non-technical shop staff

---

# Authentication

Simple login screen.

Fields

* Username
* Password

Only authorized users can access the dashboard.

Provide a logout option.

---

# Sidebar Navigation

* Dashboard
* Sales
* Expenses
* Reports
* Backup & Restore
* Settings
* Logout

---

# Dashboard

The dashboard should provide an instant overview of the business.

## Summary Cards

* Today's Sales
* Today's Expenses
* Today's Profit
* Monthly Sales
* Monthly Expenses
* Monthly Profit
* Cash Sales Today
* UPI Sales Today
* Card Sales Today
* Total Transactions Today

---

## Charts

* Daily Sales Trend
* Daily Expense Trend
* Monthly Revenue vs Expenses
* Payment Method Distribution (Pie Chart)
* Sales by Category
* Expenses by Category

---

## Recent Activity

Display the latest 10 transactions from both sales and expenses.

---

# Sales Module

Allow staff to manually record every sale.

## Fields

Customer Name (Required)

Customer Mobile Number (Optional)

Product / Service Name (Required)

Category

Options

* Laptop
* Desktop
* Printer
* Accessories
* Repair
* CCTV
* Networking
* Software
* Other

Amount (Required)

Payment Method

Options

* Cash
* UPI
* Card
* Bank Transfer

Invoice Number (Optional)

Notes (Optional)

Date

Default = Today's Date

Time

Automatically recorded

---

## Buttons

* Save Sale
* Clear Form

---

## After Saving

* Show success notification
* Update dashboard instantly
* Refresh charts automatically
* Reset form for next entry

---

## Sales History Table

Columns

* Date
* Time
* Customer Name
* Product / Service
* Category
* Amount
* Payment Method
* Invoice Number
* Actions

Actions

* Edit
* Delete

---

## Search

Search by

* Customer Name
* Product Name
* Invoice Number

---

## Filters

* Today
* Yesterday
* Last 7 Days
* This Month
* Custom Date Range

---

## Sorting

* Newest First
* Oldest First
* Highest Amount
* Lowest Amount

---

# Expenses Module

Record all shop expenses.

## Fields

Expense Title (Required)

Category

Options

* Rent
* Electricity
* Salary
* Tea & Snacks
* Transport
* Internet
* Spare Parts
* Marketing
* Stationery
* Maintenance
* Miscellaneous

Amount (Required)

Payment Method

* Cash
* UPI
* Card
* Bank Transfer

Vendor Name (Optional)

Notes (Optional)

Date

Default = Today's Date

Time

Automatically recorded

---

## Buttons

* Save Expense
* Clear Form

---

## Expense History Table

Columns

* Date
* Time
* Expense
* Category
* Vendor
* Amount
* Payment Method
* Actions

Actions

* Edit
* Delete

---

## Search

Search expenses by

* Expense Title
* Vendor
* Category

---

## Filters

* Today
* Yesterday
* This Month
* Custom Range

---

# Reports Module

Generate reports automatically.

Date Filters

* Today
* This Week
* This Month
* Custom Date Range

---

## Display

* Total Sales
* Total Expenses
* Net Profit
* Cash Sales
* UPI Sales
* Card Sales
* Bank Transfer Sales
* Average Sale Amount
* Average Expense Amount
* Largest Sale
* Largest Expense
* Total Number of Transactions

---

## Charts

* Revenue Trend
* Expense Trend
* Profit Trend
* Payment Method Breakdown
* Sales Category Breakdown
* Expense Category Breakdown

---

## Export

Buttons

* Export PDF
* Export Excel
* Print Report

---

# Global Search

Search across

* Customer Name
* Product Name
* Expense Name
* Vendor
* Invoice Number

---

# Backup & Restore

Create database backups.

Buttons

* Create Backup
* Restore Backup

Backup location

/project/backup/

Each backup should include timestamp.

Example

report_2026-07-02_18-30.db

Restore should replace the current database after user confirmation.

---

# Settings

Fields

Business Name

Mainframe Computers

Owner Name

Currency

Indian Rupee (₹)

Theme

* Dark
* Light

Change Password

---

# Automatic Calculations

Dashboard must automatically calculate

Today's Sales

Sum of all today's sales.

Today's Expenses

Sum of today's expenses.

Today's Profit

Today's Sales − Today's Expenses.

Monthly Sales

Sum of all sales for current month.

Monthly Expenses

Sum of all expenses for current month.

Monthly Profit

Monthly Sales − Monthly Expenses.

Cash Sales

Sum of all Cash transactions.

UPI Sales

Sum of all UPI transactions.

Card Sales

Sum of all Card transactions.

Bank Transfer Sales

Sum of all Bank Transfer transactions.

---

# Validation

Customer Name required.

Product/Service required.

Expense Title required.

Amount must be greater than zero.

Payment Method required.

Date required.

Prevent empty submissions.

Display friendly validation messages.

---

# User Experience

* Responsive layout
* Smooth animations
* Loading indicators
* Toast notifications
* Keyboard-friendly forms
* Clean tables with pagination
* Instant search and filtering

---

# Database Tables

## Sales

* id
* customer_name
* customer_mobile
* product_service
* category
* amount
* payment_method
* invoice_number
* notes
* date
* time
* created_at
* updated_at

---

## Expenses

* id
* expense_title
* category
* vendor_name
* amount
* payment_method
* notes
* date
* time
* created_at
* updated_at

---

## Users

* id
* username
* password_hash
* created_at

---

# Folder Structure

/client

/server

/prisma

/database

/backup

/public

---

# Future Features (Design the architecture so these can be added later)

* Inventory Management
* Customer Database
* Supplier Management
* Repair Job Tracking
* Pending Payments
* Invoice Generator
* GST Billing
* Barcode Scanner
* Employee Management
* Warranty Tracking
* Daily Closing Report
* Low Stock Alerts
* AI Business Insights

---

# Final Goal

Create a polished, production-quality desktop-style business management application for Mainframe Computers that runs entirely on a local Windows PC using React, Express, Prisma, and SQLite. The application should be intuitive, fast, secure, visually modern, and reliable enough to be used daily for managing sales, expenses, profits, and reports without any internet connection.

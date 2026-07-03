const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET /api/dashboard/summary
router.get('/summary', (req, res) => {
  try {
    const today = new Date().toLocaleDateString('en-CA');
    const monthStart = today.substring(0, 7) + '-01';

    // Today's stats
    const todaySales = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE date = ?`
    ).get(today).total;

    const todayExpenses = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date = ?`
    ).get(today).total;

    // Monthly stats
    const monthlySales = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE date >= ?`
    ).get(monthStart).total;

    const monthlyExpenses = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE date >= ?`
    ).get(monthStart).total;

    // Payment method breakdown (today)
    const cashSales = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE date = ? AND payment_method = 'Cash'`
    ).get(today).total;

    const upiSales = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE date = ? AND payment_method = 'UPI'`
    ).get(today).total;

    const cardSales = db.prepare(
      `SELECT COALESCE(SUM(amount), 0) as total FROM sales WHERE date = ? AND payment_method = 'Card'`
    ).get(today).total;

    const totalTransactions = db.prepare(
      `SELECT COUNT(*) as total FROM sales WHERE date = ?`
    ).get(today).total;

    res.json({
      todaySales,
      todayExpenses,
      todayProfit: todaySales - todayExpenses,
      monthlySales,
      monthlyExpenses,
      monthlyProfit: monthlySales - monthlyExpenses,
      cashSales,
      upiSales,
      cardSales,
      totalTransactions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/charts
router.get('/charts', (req, res) => {
  try {
    const todayStr = new Date().toLocaleDateString('en-CA');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toLocaleDateString('en-CA');
    const monthStart = todayStr.substring(0, 7) + '-01';

    // Daily sales trend (last 30 days)
    const dailySales = db.prepare(`
      SELECT date, COALESCE(SUM(amount), 0) as total
      FROM sales WHERE date >= ?
      GROUP BY date ORDER BY date
    `).all(thirtyDaysAgo);

    // Daily expense trend (last 30 days)
    const dailyExpenses = db.prepare(`
      SELECT date, COALESCE(SUM(amount), 0) as total
      FROM expenses WHERE date >= ?
      GROUP BY date ORDER BY date
    `).all(thirtyDaysAgo);

    // Monthly revenue vs expenses (last 6 months)
    const monthlyRevenue = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(amount), 0) as total
      FROM sales GROUP BY month ORDER BY month DESC LIMIT 6
    `).all().reverse();

    const monthlyExpenseData = db.prepare(`
      SELECT strftime('%Y-%m', date) as month, COALESCE(SUM(amount), 0) as total
      FROM expenses GROUP BY month ORDER BY month DESC LIMIT 6
    `).all().reverse();

    // Payment method distribution (current month)
    const paymentDistribution = db.prepare(`
      SELECT payment_method as name, COALESCE(SUM(amount), 0) as value
      FROM sales WHERE date >= ?
      GROUP BY payment_method
    `).all(monthStart);

    // Sales by category (current month)
    const salesByCategory = db.prepare(`
      SELECT category as name, COALESCE(SUM(amount), 0) as value
      FROM sales WHERE date >= ?
      GROUP BY category ORDER BY value DESC
    `).all(monthStart);

    // Expenses by category (current month)
    const expensesByCategory = db.prepare(`
      SELECT category as name, COALESCE(SUM(amount), 0) as value
      FROM expenses WHERE date >= ?
      GROUP BY category ORDER BY value DESC
    `).all(monthStart);

    res.json({
      dailySales,
      dailyExpenses,
      monthlyRevenue,
      monthlyExpenseData,
      paymentDistribution,
      salesByCategory,
      expensesByCategory
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/dashboard/recent
router.get('/recent', (req, res) => {
  try {
    const recentSales = db.prepare(`
      SELECT id, 'sale' as type, customer_name as title, product_service as subtitle,
             amount, payment_method, category, date, time
      FROM sales ORDER BY date DESC, time DESC LIMIT 10
    `).all();

    const recentExpenses = db.prepare(`
      SELECT id, 'expense' as type, expense_title as title, vendor_name as subtitle,
             amount, payment_method, category, date, time
      FROM expenses ORDER BY date DESC, time DESC LIMIT 10
    `).all();

    // Merge and sort by date+time, take top 10
    const combined = [...recentSales, ...recentExpenses]
      .sort((a, b) => {
        const dateCompare = b.date.localeCompare(a.date);
        if (dateCompare !== 0) return dateCompare;
        return b.time.localeCompare(a.time);
      })
      .slice(0, 10);

    res.json(combined);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET /api/search?q=
router.get('/', (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q) return res.json({ sales: [], expenses: [] });
    const search = `%${q}%`;
    const sales = db.prepare(`
      SELECT id, 'sale' as type, customer_name, product_service, amount, payment_method, date, time
      FROM sales WHERE customer_name LIKE ? OR product_service LIKE ? OR invoice_number LIKE ?
      ORDER BY date DESC, time DESC LIMIT 20
    `).all(search, search, search);
    const expenses = db.prepare(`
      SELECT id, 'expense' as type, expense_title, vendor_name, amount, payment_method, date, time
      FROM expenses WHERE expense_title LIKE ? OR vendor_name LIKE ? OR category LIKE ?
      ORDER BY date DESC, time DESC LIMIT 20
    `).all(search, search, search);
    res.json({ sales, expenses });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

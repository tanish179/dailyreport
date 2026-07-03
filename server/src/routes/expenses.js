const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET /api/expenses — list with search, filter, sort, pagination
router.get('/', (req, res) => {
  try {
    const {
      search = '',
      filter = 'all',
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 20
    } = req.query;

    let where = [];
    let params = {};

    // Search
    if (search) {
      where.push(`(expense_title LIKE @search OR vendor_name LIKE @search OR category LIKE @search)`);
      params.search = `%${search}%`;
    }

    // Date filter
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    if (filter === 'today') {
      where.push(`date = @filterDate`);
      params.filterDate = today;
    } else if (filter === 'yesterday') {
      where.push(`date = @filterDate`);
      params.filterDate = yesterday;
    } else if (filter === 'month') {
      where.push(`date >= @monthStart`);
      params.monthStart = monthStart;
    } else if (filter === 'custom' && startDate && endDate) {
      where.push(`date >= @startDate AND date <= @endDate`);
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const whereClause = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    // Sort
    let orderBy = 'date DESC, time DESC';
    if (sort === 'oldest') orderBy = 'date ASC, time ASC';
    else if (sort === 'highest') orderBy = 'amount DESC';
    else if (sort === 'lowest') orderBy = 'amount ASC';

    // Count
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM expenses ${whereClause}`);
    const { total } = countStmt.get(params);

    // Paginate
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const dataStmt = db.prepare(
      `SELECT * FROM expenses ${whereClause} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
    );
    const data = dataStmt.all({ ...params, limit: parseInt(limit), offset });

    res.json({
      data,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses — create expense
router.post('/', (req, res) => {
  try {
    const {
      expense_title, category, vendor_name,
      amount, payment_method, notes, date
    } = req.body;

    if (!expense_title || !amount || !payment_method || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });

    const stmt = db.prepare(`
      INSERT INTO expenses (expense_title, category, vendor_name, amount, payment_method, notes, date, time)
      VALUES (@expense_title, @category, @vendor_name, @amount, @payment_method, @notes, @date, @time)
    `);

    const result = stmt.run({
      expense_title,
      category: category || 'Miscellaneous',
      vendor_name: vendor_name || null,
      amount: parseFloat(amount),
      payment_method,
      notes: notes || null,
      date,
      time
    });

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:id — update expense
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      expense_title, category, vendor_name,
      amount, payment_method, notes, date
    } = req.body;

    const stmt = db.prepare(`
      UPDATE expenses SET
        expense_title = @expense_title,
        category = @category,
        vendor_name = @vendor_name,
        amount = @amount,
        payment_method = @payment_method,
        notes = @notes,
        date = @date,
        updated_at = datetime('now', 'localtime')
      WHERE id = @id
    `);

    stmt.run({
      id: parseInt(id),
      expense_title,
      category: category || 'Miscellaneous',
      vendor_name: vendor_name || null,
      amount: parseFloat(amount),
      payment_method,
      notes: notes || null,
      date
    });

    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(parseInt(id));
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id — delete expense
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const expense = db.prepare('SELECT * FROM expenses WHERE id = ?').get(parseInt(id));
    if (!expense) return res.status(404).json({ error: 'Expense not found' });

    db.prepare('DELETE FROM expenses WHERE id = ?').run(parseInt(id));
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

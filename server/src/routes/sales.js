const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET /api/sales — list with search, filter, sort, pagination
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
      where.push(`(customer_name LIKE @search OR product_service LIKE @search OR invoice_number LIKE @search)`);
      params.search = `%${search}%`;
    }

    // Date filter
    const today = new Date().toLocaleDateString('en-CA');
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('en-CA');
    const weekAgo = new Date(Date.now() - 7 * 86400000).toLocaleDateString('en-CA');
    const monthStart = today.substring(0, 7) + '-01';

    if (filter === 'today') {
      where.push(`date = @filterDate`);
      params.filterDate = today;
    } else if (filter === 'yesterday') {
      where.push(`date = @filterDate`);
      params.filterDate = yesterday;
    } else if (filter === 'week') {
      where.push(`date >= @weekStart`);
      params.weekStart = weekAgo;
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

    // Count total
    const countStmt = db.prepare(`SELECT COUNT(*) as total FROM sales ${whereClause}`);
    const { total } = countStmt.get(params);

    // Paginate
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const dataStmt = db.prepare(
      `SELECT * FROM sales ${whereClause} ORDER BY ${orderBy} LIMIT @limit OFFSET @offset`
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

// GET /api/sales/customers — get unique customer names for autocomplete
router.get('/customers', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT customer_name 
      FROM sales 
      WHERE customer_name IS NOT NULL AND customer_name != '' 
      ORDER BY customer_name ASC
    `);
    const customers = stmt.all().map(c => c.customer_name);
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales/customer/history — get total stats and history for a customer
router.get('/customer/history', (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ error: 'Customer name is required' });

    // Fetch all sales for this customer
    const salesStmt = db.prepare(`
      SELECT * FROM sales 
      WHERE customer_name = ? 
      ORDER BY date DESC, time DESC
    `);
    const sales = salesStmt.all(name);

    // Calculate aggregated metrics
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) as total_visits,
        SUM(amount) as total_spent,
        AVG(amount) as avg_spent,
        MAX(date || ' ' || time) as last_active
      FROM sales 
      WHERE customer_name = ?
    `);
    const stats = statsStmt.get(name);

    // Get customer mobile (most recent one)
    const mobileStmt = db.prepare(`
      SELECT customer_mobile FROM sales 
      WHERE customer_name = ? AND customer_mobile IS NOT NULL AND customer_mobile != ''
      ORDER BY date DESC, time DESC LIMIT 1
    `);
    const mobileRow = mobileStmt.get(name);
    const customer_mobile = mobileRow ? mobileRow.customer_mobile : '';

    res.json({
      customer_name: name,
      customer_mobile,
      stats: {
        total_visits: stats.total_visits || 0,
        total_spent: stats.total_spent || 0,
        avg_spent: stats.avg_spent || 0,
        last_active: stats.last_active || ''
      },
      sales
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sales — create sale
router.post('/', (req, res) => {
  try {
    const {
      customer_name, customer_mobile, product_service, category,
      amount, payment_method, invoice_number, notes, date
    } = req.body;

    if (!customer_name || !product_service || !amount || !payment_method || !date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });

    const stmt = db.prepare(`
      INSERT INTO sales (customer_name, customer_mobile, product_service, category, amount, payment_method, invoice_number, notes, date, time)
      VALUES (@customer_name, @customer_mobile, @product_service, @category, @amount, @payment_method, @invoice_number, @notes, @date, @time)
    `);

    const result = stmt.run({
      customer_name,
      customer_mobile: customer_mobile || null,
      product_service,
      category: category || 'Other',
      amount: parseFloat(amount),
      payment_method,
      invoice_number: invoice_number || null,
      notes: notes || null,
      date,
      time
    });

    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/sales/:id — update sale
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      customer_name, customer_mobile, product_service, category,
      amount, payment_method, invoice_number, notes, date
    } = req.body;

    const stmt = db.prepare(`
      UPDATE sales SET
        customer_name = @customer_name,
        customer_mobile = @customer_mobile,
        product_service = @product_service,
        category = @category,
        amount = @amount,
        payment_method = @payment_method,
        invoice_number = @invoice_number,
        notes = @notes,
        date = @date,
        updated_at = datetime('now', 'localtime')
      WHERE id = @id
    `);

    stmt.run({
      id: parseInt(id),
      customer_name,
      customer_mobile: customer_mobile || null,
      product_service,
      category: category || 'Other',
      amount: parseFloat(amount),
      payment_method,
      invoice_number: invoice_number || null,
      notes: notes || null,
      date
    });

    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(parseInt(id));
    if (!sale) return res.status(404).json({ error: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/sales/:id — delete sale
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const sale = db.prepare('SELECT * FROM sales WHERE id = ?').get(parseInt(id));
    if (!sale) return res.status(404).json({ error: 'Sale not found' });

    db.prepare('DELETE FROM sales WHERE id = ?').run(parseInt(id));
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

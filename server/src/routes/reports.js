const express = require('express');
const router = express.Router();
const { db } = require('../database');

router.get('/', (req, res) => {
  try {
    const { filter = 'month', startDate, endDate } = req.query;
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
    const monthStart = today.substring(0, 7) + '-01';

    let dateFilter = '', params = {};
    if (filter === 'today') { dateFilter = `date = @date`; params.date = today; }
    else if (filter === 'week') { dateFilter = `date >= @startDate`; params.startDate = weekAgo; }
    else if (filter === 'month') { dateFilter = `date >= @startDate`; params.startDate = monthStart; }
    else if (filter === 'custom' && startDate && endDate) {
      dateFilter = `date >= @startDate AND date <= @endDate`;
      params.startDate = startDate; params.endDate = endDate;
    }

    const sw = dateFilter ? `WHERE ${dateFilter}` : '';
    const totalSales = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM sales ${sw}`).get(params).t;
    const totalExpenses = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM expenses ${sw}`).get(params).t;
    const and = dateFilter ? 'AND' : 'WHERE';
    const cashSales = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM sales ${sw} ${and} payment_method='Cash'`).get(params).t;
    const upiSales = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM sales ${sw} ${and} payment_method='UPI'`).get(params).t;
    const cardSales = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM sales ${sw} ${and} payment_method='Card'`).get(params).t;
    const bankSales = db.prepare(`SELECT COALESCE(SUM(amount),0) as t FROM sales ${sw} ${and} payment_method='Bank Transfer'`).get(params).t;
    const sc = db.prepare(`SELECT COUNT(*) as t FROM sales ${sw}`).get(params).t;
    const ec = db.prepare(`SELECT COUNT(*) as t FROM expenses ${sw}`).get(params).t;
    const largestSale = db.prepare(`SELECT COALESCE(MAX(amount),0) as t FROM sales ${sw}`).get(params).t;
    const largestExp = db.prepare(`SELECT COALESCE(MAX(amount),0) as t FROM expenses ${sw}`).get(params).t;

    const revTrend = db.prepare(`SELECT date,COALESCE(SUM(amount),0) as total FROM sales ${sw} GROUP BY date ORDER BY date`).all(params);
    const expTrend = db.prepare(`SELECT date,COALESCE(SUM(amount),0) as total FROM expenses ${sw} GROUP BY date ORDER BY date`).all(params);
    const payBreak = db.prepare(`SELECT payment_method as name,COALESCE(SUM(amount),0) as value FROM sales ${sw} GROUP BY payment_method`).all(params);
    const saleCat = db.prepare(`SELECT category as name,COALESCE(SUM(amount),0) as value FROM sales ${sw} GROUP BY category ORDER BY value DESC`).all(params);
    const expCat = db.prepare(`SELECT category as name,COALESCE(SUM(amount),0) as value FROM expenses ${sw} GROUP BY category ORDER BY value DESC`).all(params);
    const salesData = db.prepare(`SELECT * FROM sales ${sw} ORDER BY date DESC, time DESC`).all(params);
    const expensesData = db.prepare(`SELECT * FROM expenses ${sw} ORDER BY date DESC, time DESC`).all(params);

    res.json({
      metrics: { totalSales, totalExpenses, netProfit: totalSales - totalExpenses, cashSales, upiSales, cardSales, bankTransferSales: bankSales, avgSale: sc > 0 ? Math.round(totalSales/sc*100)/100 : 0, avgExpense: ec > 0 ? Math.round(totalExpenses/ec*100)/100 : 0, largestSale, largestExpense: largestExp, totalTransactions: sc + ec },
      charts: { revenueTrend: revTrend, expenseTrend: expTrend, paymentBreakdown: payBreak, salesCategoryBreakdown: saleCat, expenseCategoryBreakdown: expCat },
      salesData, expensesData
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { db } = require('../database');

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/settings
router.put('/', (req, res) => {
  try {
    const { business_name, owner_name, currency, theme } = req.body;
    db.prepare(`UPDATE settings SET business_name=@business_name, owner_name=@owner_name, currency=@currency, theme=@theme WHERE id=1`)
      .run({ business_name, owner_name, currency, theme });
    const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get();
    res.json(settings);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/settings/reset
router.post('/reset', async (req, res) => {
  try {
    // 1. Create a backup first as a safety measure
    const fs = require('fs');
    const path = require('path');
    const backupDir = path.join(__dirname, '..', '..', 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `pre_reset_backup_${timestamp}.db`);
    
    // Perform backup synchronously or wait for it
    await db.backup(backupPath);

    // 2. Clear sales and expenses
    db.prepare('DELETE FROM sales').run();
    db.prepare('DELETE FROM expenses').run();

    res.json({ success: true, message: 'All sales and expenses history wiped successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

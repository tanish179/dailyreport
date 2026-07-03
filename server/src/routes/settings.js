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

module.exports = router;

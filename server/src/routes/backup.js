const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { db, DB_PATH, BACKUP_DIR } = require('../database');

// POST /api/backup/create
router.post('/create', (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T');
    const filename = `mainframe_${timestamp[0]}_${timestamp[1].substring(0, 8)}.db`;
    const backupPath = path.join(BACKUP_DIR, filename);
    db.backup(backupPath);
    res.json({ message: 'Backup created', filename });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/backup/list
router.get('/list', (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.db'))
      .map(f => ({
        filename: f,
        size: fs.statSync(path.join(BACKUP_DIR, f)).size,
        created: fs.statSync(path.join(BACKUP_DIR, f)).birthtime
      }))
      .sort((a, b) => new Date(b.created) - new Date(a.created));
    res.json(files);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/backup/restore
router.post('/restore', (req, res) => {
  try {
    const { filename } = req.body;
    const backupPath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(backupPath)) return res.status(404).json({ error: 'Backup not found' });
    fs.copyFileSync(backupPath, DB_PATH);
    res.json({ message: 'Backup restored. Please restart the application.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/backup/:filename
router.delete('/:filename', (req, res) => {
  try {
    const backupPath = path.join(BACKUP_DIR, req.params.filename);
    if (!fs.existsSync(backupPath)) return res.status(404).json({ error: 'Backup not found' });
    fs.unlinkSync(backupPath);
    res.json({ message: 'Backup deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (creates tables on first run)
require('./database');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/backup', require('./routes/backup'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/search', require('./routes/search'));
app.use('/api/ai', require('./routes/ai'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', '..', 'client', 'dist')));
  app.get('*splat', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'client', 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`\n  🖥️  Mainframe Server running at http://localhost:${PORT}\n`);
});

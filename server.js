const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Database = require('better-sqlite3');

const PORT = process.env.PORT || 8080;
const DB_PATH = path.join(__dirname, 'leaderboard.sqlite');

// Init DB
const db = new Database(DB_PATH);
db.exec(`CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  ts INTEGER NOT NULL
)`);
db.exec(`CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)`);

const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Static
app.use(express.static(__dirname));

// API
app.get('/api/leaderboard', (req, res) => {
  const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20', 10)));
  const rows = db.prepare('SELECT name, score, ts FROM scores ORDER BY score DESC, ts ASC LIMIT ?').all(limit);
  res.json(rows);
});

app.post('/api/leaderboard', (req, res) => {
  const { name, score } = req.body || {};
  if (!name || !/^[A-Za-z0-9]{3,15}$/.test(name)) return res.status(400).json({ error: 'Invalid name' });
  const s = parseInt(score, 10);
  if (!Number.isFinite(s) || s < 0 || s > 1e9) return res.status(400).json({ error: 'Invalid score' });
  db.prepare('INSERT INTO scores(name, score, ts) VALUES(?, ?, ?)').run(name, s, Date.now());
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Microlet Rush running at http://localhost:${PORT}`);
});



// Self-contained leaderboard server: zero npm dependencies.
// Uses Node's built-in HTTP server + built-in SQLite (node:sqlite, Node >= 22.5).
// Serves the static game AND a small REST API, so `node server.js` runs the
// whole thing. The game also works from any plain static server (it falls back
// to localStorage when this API isn't reachable).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORT = process.env.PORT || 8080;
const ROOT = __dirname;
const DB_PATH = path.join(ROOT, 'leaderboard.sqlite');

const db = new DatabaseSync(DB_PATH);
db.exec(`CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  score INTEGER NOT NULL,
  level TEXT,
  ts INTEGER NOT NULL
)`);
db.exec('CREATE INDEX IF NOT EXISTS idx_scores_score ON scores(score DESC)');

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function sendJson(res, code, obj) {
    const body = JSON.stringify(obj);
    res.writeHead(code, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    });
    res.end(body);
}

function getTop(limit, level) {
    if (level) {
        return db.prepare(
            'SELECT name, score, level, ts FROM scores WHERE level = ? ORDER BY score DESC, ts ASC LIMIT ?'
        ).all(level, limit);
    }
    return db.prepare(
        'SELECT name, score, level, ts FROM scores ORDER BY score DESC, ts ASC LIMIT ?'
    ).all(limit);
}

function handleApi(req, res, url) {
    if (req.method === 'OPTIONS') { sendJson(res, 204, {}); return; }

    if (req.method === 'GET') {
        const limit = Math.max(1, Math.min(100, parseInt(url.searchParams.get('limit') || '20', 10)));
        const level = url.searchParams.get('level') || null;
        try { sendJson(res, 200, getTop(limit, level)); }
        catch (e) { sendJson(res, 500, { error: 'db_error' }); }
        return;
    }

    if (req.method === 'POST') {
        let raw = '';
        req.on('data', (c) => { raw += c; if (raw.length > 1e4) req.destroy(); });
        req.on('end', () => {
            let body;
            try { body = JSON.parse(raw || '{}'); } catch (_) { return sendJson(res, 400, { error: 'bad_json' }); }
            const name = body.name;
            const score = parseInt(body.score, 10);
            const level = body.level && /^[a-z0-9_]{1,16}$/i.test(body.level) ? body.level : null;
            if (!name || !/^[A-Za-z0-9]{1,15}$/.test(name)) return sendJson(res, 400, { error: 'invalid_name' });
            if (!Number.isFinite(score) || score < 0 || score > 1e9) return sendJson(res, 400, { error: 'invalid_score' });
            try {
                db.prepare('INSERT INTO scores(name, score, level, ts) VALUES(?,?,?,?)')
                    .run(name, score, level, Date.now());
                sendJson(res, 200, { ok: true });
            } catch (e) { sendJson(res, 500, { error: 'db_error' }); }
        });
        return;
    }

    sendJson(res, 405, { error: 'method_not_allowed' });
}

function serveStatic(req, res, url) {
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';
    // resolve safely within ROOT (block path traversal)
    const filePath = path.normalize(path.join(ROOT, pathname));
    if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
    });
}

http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/leaderboard') return handleApi(req, res, url);
    serveStatic(req, res, url);
}).listen(PORT, () => {
    console.log(`Microlet Rush running at http://localhost:${PORT}`);
});

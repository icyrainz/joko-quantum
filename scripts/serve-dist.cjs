const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const DIST_DIR = path.resolve(process.cwd(), 'dist');

function readArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1]) return process.argv[idx + 1];
  return null;
}

const positionalHost = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : null;
const positionalPort = process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : null;

const host = process.env.HOST || readArg('--host') || positionalHost || null;
const port = Number.parseInt(process.env.PORT || readArg('--port') || positionalPort || '5173', 10);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const rawUrl = req.url || '/';
  const pathname = decodeURIComponent(rawUrl.split('?')[0]);

  let requestedPath = pathname === '/' ? '/index.html' : pathname;
  requestedPath = requestedPath.replace(/^\/+/, '');

  const absolutePath = path.resolve(DIST_DIR, requestedPath);
  if (!absolutePath.startsWith(DIST_DIR)) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('Forbidden');
    return;
  }

  fs.stat(absolutePath, (err, stat) => {
    if (!err && stat.isFile()) {
      sendFile(absolutePath, res);
      return;
    }
    // SPA fallback: serve index.html for non-asset routes
    const isAssetLike = path.extname(requestedPath) !== '';
    if (isAssetLike) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.end('Not found');
      return;
    }
    sendFile(path.join(DIST_DIR, 'index.html'), res);
  });
});

if (host) {
  server.listen(port, host, () => {
    console.log(`[dist server] http://${host}:${port}`);
  });
} else {
  server.listen(port, () => {
    console.log(`[dist server] http://localhost:${port}`);
    console.log(`[dist server] http://127.0.0.1:${port}`);
  });
}

server.on('error', (err) => {
  console.error('[dist server] failed:', err.message);
  process.exit(1);
});

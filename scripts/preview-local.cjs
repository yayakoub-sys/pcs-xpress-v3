#!/usr/bin/env node
// Serveur statique local de secours pour PCS XPRESS V3
// Aucune dépendance npm requise — uniquement Node.js standard
//
// Usage : node scripts/preview-local.cjs [port]
// Default port : 8080
// Ouvre : http://localhost:8080

const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = parseInt(process.argv[2] || process.env.PORT || '8080', 10);
const ROOT = path.resolve(__dirname, '..');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.cjs':  'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.ttf':  'font/ttf',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.xml':  'application/xml; charset=utf-8',
  '.txt':  'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function safeJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const normalized = path.posix.normalize(decoded).replace(/^(\.\.[\/\\])+/, '');
  return path.join(root, normalized);
}

const server = http.createServer((req, res) => {
  let urlPath = req.url || '/';
  if (urlPath === '/') urlPath = '/index.html';

  let filePath = safeJoin(ROOT, urlPath);

  // Routing pretty-URL : /tarifs → /tarifs.html (mimique Netlify clean URLs)
  if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const htmlPath = filePath + '.html';
    if (fs.existsSync(htmlPath)) filePath = htmlPath;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      const fallback = path.join(ROOT, '404.html');
      if (fs.existsSync(fallback)) {
        res.end(fs.readFileSync(fallback));
      } else {
        res.end('<h1>404 — Not Found</h1><p>' + urlPath + '</p>');
      }
      console.log('  404  ' + req.method + ' ' + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const ct = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': ct,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
    console.log('  200  ' + req.method + ' ' + urlPath);
  });
});

server.listen(PORT, () => {
  const url = 'http://localhost:' + PORT + '/';
  console.log('');
  console.log('  PCS XPRESS V3 — preview locale');
  console.log('  ────────────────────────────────────────────');
  console.log('  URL          : ' + url);
  console.log('  Racine       : ' + ROOT);
  console.log('  Pages        : /, /la-carte, /tarifs, /comment-ca-marche,');
  console.log('                 /points-de-vente, /faq, /contact, /mentions-legales');
  console.log('  Mobile test  : Chrome DevTools → mode responsive 375 / 390 / 768');
  console.log('  Stop         : Ctrl+C');
  console.log('  ────────────────────────────────────────────');
  console.log('');

  // Auto-ouverture navigateur (best-effort, ignore si échec)
  const opener = process.platform === 'win32' ? 'start ""' :
                 process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(opener + ' ' + url, () => {});
});

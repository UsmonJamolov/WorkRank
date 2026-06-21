const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 5500;
const API_PORT = 3000;
const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

function serveQrPng(res) {
  const filePath = path.join(__dirname, 'assets', 'workrank-ishxona-qr.png');
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'QR fayl topilmadi' }));
    }
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Disposition': 'attachment; filename="workrank-ishxona-qr.png"',
      'Cache-Control': 'public, max-age=3600',
    });
    res.end(data);
  });
}

function proxyToApi(req, res) {
  const options = {
    hostname: '127.0.0.1',
    port: API_PORT,
    path: req.url,
    method: req.method,
    headers: { ...req.headers, host: `127.0.0.1:${API_PORT}` },
  };

  const proxy = http.request(options, (apiRes) => {
    res.writeHead(apiRes.statusCode, apiRes.headers);
    apiRes.pipe(res);
  });

  proxy.on('error', () => {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Backend ishlamayapti. Avval backend ni ishga tushiring: cd backend && npm start' }));
  });

  req.pipe(proxy);
}

function serveStatic(req, res) {
  const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const file = path.join(__dirname, url);

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'text/plain' });
    res.end(data);
  });
}

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  if (urlPath === '/api/attendance/qr.png' || urlPath === '/api/attendance/workplace-qr.png') {
    return serveQrPng(res);
  }
  if (req.url.startsWith('/api')) {
    return proxyToApi(req, res);
  }
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`WorkRank web: http://localhost:${PORT}`);
  console.log(`API proxy: http://localhost:${PORT}/api -> :${API_PORT}`);
});

'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const publisher = require('./publisher');

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
};

function send(res, status, body, contentType) {
  res.writeHead(status, contentType ? { 'Content-Type': contentType } : undefined);
  res.end(body);
}

function sendJSON(res, status, data) {
  send(res, status, JSON.stringify(data), MIME['.json']);
}

function sendStatic(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      sendJSON(res, 404, { error: 'Not Found' });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    send(res, 200, data, MIME[ext] || 'application/octet-stream');
  });
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url, true);
  const pathname = parsed.pathname;

  // API: 最新一条
  if (pathname === '/api/data' && req.method === 'GET') {
    sendJSON(res, 200, publisher.getLatest());
    return;
  }

  // API: 历史数据
  if (pathname === '/api/history' && req.method === 'GET') {
    const limit = parseInt(parsed.query.limit, 10) || 200;
    sendJSON(res, 200, publisher.getHistory(limit));
    return;
  }

  // 静态文件
  let filePath;
  if (pathname === '/' || pathname === '/index.html') {
    filePath = path.join(PUBLIC_DIR, 'index.html');
  } else if (pathname === '/app.js' || pathname === '/style.css') {
    filePath = path.join(PUBLIC_DIR, pathname);
  } else {
    sendJSON(res, 404, { error: 'Not Found' });
    return;
  }

  sendStatic(res, filePath);
});

// 启动发布器（静默模式，日志交给 HTTP server）
publisher.start({ quiet: true });

server.listen(PORT, () => {
  console.log(`IoT Server 运行中: http://localhost:${PORT}`);
  console.log('(Ctrl+C 退出)\n');
});

// 优雅退出
process.on('SIGINT', () => {
  publisher.stop();
  server.close(() => process.exit(0));
});

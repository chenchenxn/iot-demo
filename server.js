'use strict';

const path = require('path');
const express = require('express');
const publisher = require('./publisher');
const db = require('./db'); // SQLite 历史数据库：提供全部历史记录查询

const app = express();
const PORT = 3000;

// 静态页面（index.html / app.js / style.css）
app.use(express.static(path.join(__dirname, 'public')));

// API：最新一条读数（尚无数据时返回 null，前端据此显示"等待数据"）
app.get('/api/data', (req, res) => {
  res.json(publisher.getLatest());
});

// API：历史数据，默认最近 200 条
app.get('/api/history', (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 200;
  res.json(publisher.getHistory(limit));
});

// API：读取 SQLite 中的全部历史传感记录（按入库顺序升序）
app.get('/api/history/all', (req, res) => {
  res.json(db.getAllReadings());
});

// 启动传感器发布器（静默模式，不刷屏）
publisher.start({ quiet: true });

app.listen(PORT, () => {
  console.log(`IoT Server 运行中: http://localhost:${PORT}`);
  console.log('(Ctrl+C 退出)');
});

process.on('SIGINT', () => {
  publisher.stop();
  db.closeDatabase(); // 确保退出前 SQLite 连接正常关闭
  process.exit(0);
});

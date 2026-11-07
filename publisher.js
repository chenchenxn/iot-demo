'use strict';

const db = require('./db'); // SQLite 历史数据库：每条传感器数据持久化

// 内存中保存的历史传感器数据
const history = [];
const MAX_HISTORY = 1000; // 最多保留 1000 条

let timer = null;

// 生成模拟传感器数据
function generateReading() {
  const temperature = +(Math.random() * 15 + 15).toFixed(2); // 15 ~ 30 °C
  const humidity = +(Math.random() * 40 + 40).toFixed(2);    // 40 ~ 80 %
  return {
    timestamp: new Date().toISOString(),
    temperature,
    humidity,
  };
}

// 将数据存入历史记录（滑动窗口），同时写入 SQLite 持久化
function storeReading(reading) {
  history.push(reading);
  if (history.length > MAX_HISTORY) {
    history.shift();
  }

  // 每条新生成的传感器数据自动落库
  db.insertReading(reading);
}

// 打印一条读取数据
function printReading(reading) {
  console.log(
    `[${reading.timestamp}] 温度: ${reading.temperature}°C  湿度: ${reading.humidity}%`
  );
}

/**
 * 启动发布器（每秒生成一条数据）
 * @param {Object} [options]
 * @param {boolean} [options.quiet=false]  静默模式，不打印到控制台
 * @returns {{ stop: Function }}
 */
function start({ quiet = false } = {}) {
  if (timer) return { stop };

  if (!quiet) {
    console.log('IoT Publisher 启动中 (Ctrl+C 退出)...');
    console.log('-----------------------------------');
  }

  timer = setInterval(() => {
    const reading = generateReading();
    storeReading(reading);
    if (!quiet) printReading(reading);
  }, 1000);

  return { stop };
}

function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function getHistory(limit = 200) {
  const n = Math.min(limit, history.length);
  return history.slice(-n);
}

function getLatest() {
  return history.length > 0 ? history[history.length - 1] : null;
}

// 只有直接 `node publisher.js` 时才作为 CLI 运行
if (require.main === module) {
  start();
  process.on('SIGINT', () => {
    stop();
    db.closeDatabase(); // CLI 模式同样落库，退出前需关闭 SQLite 连接
    console.log('\n-----------------------------------');
    console.log(`已停止，共生成 ${history.length} 条历史数据。`);
    process.exit(0);
  });
}

module.exports = { start, stop, getHistory, getLatest };

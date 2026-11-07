'use strict';

const path = require('path');
const { DatabaseSync } = require('node:sqlite');

// 数据库文件路径：项目根目录下的 iot.db（首次运行自动创建）
const DB_PATH = path.join(__dirname, 'iot.db');
const db = new DatabaseSync(DB_PATH);

// 初始化数据表：保存传感器采集时间、温度、湿度
db.exec(`
  CREATE TABLE IF NOT EXISTS sensor_readings (
    id          INTEGER PRIMARY KEY AUTOINCREMENT, -- 自增主键
    timestamp   TEXT    NOT NULL,                  -- 传感器采集时间（ISO 字符串）
    temperature REAL    NOT NULL,                  -- 温度（°C）
    humidity    REAL    NOT NULL,                  -- 湿度（%）
    created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')) -- 入库时间
  );
`);

// 预编译插入语句，避免每条数据重复解析 SQL
const insertStmt = db.prepare(
  'INSERT INTO sensor_readings (timestamp, temperature, humidity) VALUES (?, ?, ?)'
);

// 预编译全量查询语句，按入库顺序升序返回
const selectAllStmt = db.prepare(
  'SELECT id, timestamp, temperature, humidity FROM sensor_readings ORDER BY id ASC'
);

/**
 * 写入一条传感器读数到 SQLite
 * @param {{timestamp: string, temperature: number, humidity: number}} reading
 */
function insertReading(reading) {
  insertStmt.run(reading.timestamp, reading.temperature, reading.humidity);
}

/**
 * 读取数据库中的全部历史传感记录
 * @returns {Array<{id: number, timestamp: string, temperature: number, humidity: number}>}
 */
function getAllReadings() {
  return selectAllStmt.all();
}

// 关闭数据库连接（进程退出时可选调用）
function closeDatabase() {
  db.close();
}

module.exports = { insertReading, getAllReadings, closeDatabase };

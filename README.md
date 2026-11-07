# iot-demo

物联网基础课程 Demo 项目：用 Node.js 模拟温度/湿度传感器发布程序，基于 Express 提供网页可视化（最新数值 + 实时折线图），并通过 SQLite 持久化全部历史传感数据。

无需真实 MQTT 硬件，数据全部由程序模拟生成：每条数据保存到内存滑动窗口，同时自动写入本地 SQLite 数据库 `iot.db`。

## 项目结构

```
iot-demo/
├── package.json          # NPM 配置（依赖：express）
├── publisher.js          # 传感器数据发布模块（独立 CLI 也可被 server 引用，每条数据落库 SQLite）
├── db.js                 # SQLite 持久化层（node:sqlite 内置模块，自动建库建表）
├── server.js             # Express 服务：提供 API + 静态页面
├── README.md
└── public/
    ├── index.html                  # 实时监控页
    ├── app.js                      # 实时页逻辑（Chart.js 折线图）
    ├── visualization_history.html  # 历史数据页（展示 SQLite 全量记录）
    ├── history.js                  # 历史页逻辑
    └── style.css                   # 两页共享样式
```

## 快速开始

### 方式一：Web 可视化模式（推荐）

```bash
npm install        # 首次运行前安装依赖（express）
node server.js     # 或 npm start
```

启动后打开浏览器访问：

- 实时监控页：`http://localhost:3000`
- 历史数据页：`http://localhost:3000/visualization_history.html`

### 方式二：纯 CLI 模式

只在控制台每秒打印一条数据，不启动 HTTP 服务：

```bash
node publisher.js
# 或
npm run publisher
```

按 `Ctrl+C` 退出。

### 网页说明

- 界面为中文，展示**最新温度/湿度数值**和**随时间变化的折线图**，每秒自动更新。
- 服务刚启动、尚无数据时，页面显示"等待数据"，采集到第一条数据后自动变为数值。
- 网页展示的即为 publisher.js 实际发布的数据（内存历史记录），无额外模拟数据。

## API 接口

所有接口返回 JSON，无需鉴权。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/data`   | 最新一条传感器读数（尚无数据时返回 `null`） |
| GET  | `/api/history?limit=N` | 最近 N 条历史数据（内存滑动窗口），默认 200，上限 1000 |
| GET  | `/api/history/all` | SQLite 全量历史记录，按入库顺序升序 |

单条读数格式：

```json
{
  "timestamp": "2026-10-21T08:00:00.123Z",
  "temperature": 22.59,
  "humidity": 56.45
}
```

## 技术栈

- **Express 5** —— Web 服务框架（唯一 npm 依赖）
- **node:sqlite** —— Node 内置 SQLite 模块（需 Node ≥ 22.5），历史数据落库至项目根目录 `iot.db`（已被 .gitignore 忽略，不入库版本管理）
- **Chart.js 4**（jsdelivr CDN）—— 前端折线图，无前端框架

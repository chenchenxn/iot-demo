# iot-demo

物联网基础课程 Demo 项目：用 Node.js 模拟温度/湿度传感器发布程序，内置零依赖 HTTP 服务和网页可视化。

无需真实 MQTT 硬件，数据全部在内存中生成、存储。

## 项目结构

```
iot-demo/
├── package.json          # NPM 配置
├── publisher.js          # 传感器数据发布模块（独立 CLI 也可被 server 引用）
├── server.js             # HTTP 服务：提供 API + 静态页面
├── README.md
└── public/
    ├── index.html        # 可视化页面
    ├── app.js            # 前端逻辑（Chart.js 折线图）
    └── style.css         # 页面样式
```

## 快速开始

### 方式一：Web 可视化模式（推荐）

启动 HTTP 服务，同时自动启动传感器发布器：

```bash
node server.js
# 或
npm start
```

启动后打开浏览器访问：

```
http://localhost:3000
```

### 方式二：纯 CLI 模式

只在控制台每秒打印一条数据，不启动 HTTP 服务：

```bash
node publisher.js
# 或
npm run publisher
```

按 `Ctrl+C` 退出。

## API 接口

所有接口返回 JSON，无需鉴权。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET  | `/api/data`   | 最新一条传感器读数 |
| GET  | `/api/history?limit=N` | 最近 N 条历史数据，默认 200，上限 1000 |

单条读数格式：

```json
{
  "timestamp": "2026-10-21T08:00:00.123Z",
  "temperature": 22.59,
  "humidity": 56.45
}
```

## 技术栈

- **Node.js 内置模块**：`http`、`fs`、`url`、`path` —— 零 npm 依赖
- **Chart.js 4**（jsdelivr CDN）—— 前端折线图

'use strict';

const countEl = document.getElementById('record-count');
const hintEl = document.getElementById('hint');
const canvasEl = document.getElementById('history-chart');

let chart = null; // 图表实例，有数据时才创建

// 将 ISO 时间格式化为 MM-DD HH:mm:ss，便于作为分类轴标签
function formatTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}:${pad(d.getSeconds())}`;
}

// 显示提示信息（空数据 / 加载失败）
function showHint(text, isError = false) {
  hintEl.textContent = text;
  hintEl.classList.toggle('error', isError);
  hintEl.hidden = false;
}

// 用 SQLite 中的全部历史记录渲染折线图
function renderHistory(list) {
  countEl.textContent = String(list.length);

  if (list.length === 0) {
    canvasEl.hidden = true;
    showHint('暂无历史数据，请先运行 publisher 采集数据。');
    return;
  }

  const labels = list.map((item) => formatTime(item.timestamp));
  const temperatures = list.map((item) => item.temperature);
  const humidities = list.map((item) => item.humidity);

  chart = new Chart(canvasEl.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: '温度 (°C)',
          data: temperatures,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255,107,107,0.15)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
          fill: true,
        },
        {
          label: '湿度 (%)',
          data: humidities,
          borderColor: '#4dabf7',
          backgroundColor: 'rgba(77,171,247,0.15)',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      interaction: { intersect: false, mode: 'index' },
      animation: false,
      plugins: {
        legend: { labels: { color: '#e0e0e0' } },
        tooltip: {
          callbacks: {
            label: (item) => `${item.dataset.label}: ${item.parsed.y}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: '#888', maxTicksLimit: 12, autoSkip: true },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
        y: {
          ticks: { color: '#888' },
          grid: { color: 'rgba(255,255,255,0.05)' },
        },
      },
    },
  });
}

// 拉取全部历史记录（只加载一次，刷新页面即可看到最新数据）
fetch('/api/history/all')
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(renderHistory)
  .catch(() => {
    canvasEl.hidden = true;
    showHint('加载历史数据失败，请确认服务已启动后重试。', true);
  });

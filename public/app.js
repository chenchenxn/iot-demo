'use strict';

const MAX_POINTS = 200;

const tempEl = document.getElementById('temp-value');
const humiEl = document.getElementById('humi-value');

const ctx = document.getElementById('sensor-chart').getContext('2d');

const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {
        label: '温度 (°C)',
        data: [],
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255,107,107,0.15)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.25,
        fill: true,
      },
      {
        label: '湿度 (%)',
        data: [],
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
        ticks: { color: '#888', maxTicksLimit: 8 },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
      y: {
        ticks: { color: '#888' },
        grid: { color: 'rgba(255,255,255,0.05)' },
      },
    },
  },
});

function formatTime(iso) {
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function pushReading(reading) {
  if (!reading) {
    tempEl.textContent = '等待数据';
    humiEl.textContent = '等待数据';
    tempEl.classList.add('waiting');
    humiEl.classList.add('waiting');
    return;
  }

  tempEl.classList.remove('waiting');
  humiEl.classList.remove('waiting');
  tempEl.textContent = reading.temperature.toFixed(2);
  humiEl.textContent = reading.humidity.toFixed(2);

  chart.data.labels.push(formatTime(reading.timestamp));
  chart.data.datasets[0].data.push(reading.temperature);
  chart.data.datasets[1].data.push(reading.humidity);

  if (chart.data.labels.length > MAX_POINTS) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
    chart.data.datasets[1].data.shift();
  }

  chart.update('none');
}

// 初始化：拉取历史数据
fetch('/api/history?limit=' + MAX_POINTS)
  .then((r) => r.json())
  .then((list) => {
    list.forEach(pushReading);
  });

// 每秒轮询最新一条
setInterval(() => {
  fetch('/api/data')
    .then((r) => r.json())
    .then(pushReading)
    .catch(() => {}); // 静默失败，等下一轮
}, 1000);

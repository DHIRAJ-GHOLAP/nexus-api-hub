/* NEXUS API HUB - Real-Time Production Analytics & Service Health Engine */

class AnalyticsEngine {
  constructor() {
    this.totalRequests = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.latencies = [45, 62, 38, 55, 42, 78, 50, 40, 65, 48];

    this.chartCanvas = null;
    this.ctx = null;
  }

  init() {
    this.chartCanvas = document.getElementById('latencyChart');
    if (this.chartCanvas) {
      this.ctx = this.chartCanvas.getContext('2d');
      this.resizeChart();
      window.addEventListener('resize', () => this.resizeChart());
      this.renderChart();
    }
  }

  resizeChart() {
    if (!this.chartCanvas) return;
    const parent = this.chartCanvas.parentElement;
    this.chartCanvas.width = parent.clientWidth - 40;
    this.chartCanvas.height = 200;
  }

  recordRequest(latencyMs, status) {
    this.totalRequests++;
    if (status >= 200 && status < 400) {
      this.successCount++;
    } else {
      this.errorCount++;
    }

    this.latencies.push(latencyMs);
    if (this.latencies.length > 25) this.latencies.shift();

    this.updateStatsUI();
    this.renderChart();
  }

  updateStatsUI() {
    const totalEl = document.getElementById('stat-total-req');
    const avgLatEl = document.getElementById('stat-avg-lat');
    const successEl = document.getElementById('stat-success-rate');

    if (totalEl) totalEl.innerText = this.totalRequests;

    if (avgLatEl) {
      const avg = Math.round(this.latencies.reduce((a, b) => a + b, 0) / (this.latencies.length || 1));
      avgLatEl.innerText = `${avg} ms`;
    }

    if (successEl) {
      const rate = this.totalRequests === 0 ? '100%' : `${Math.round((this.successCount / this.totalRequests) * 100)}%`;
      successEl.innerText = rate;
    }
  }

  renderChart() {
    if (!this.ctx || !this.chartCanvas) return;
    const ctx = this.ctx;
    const w = this.chartCanvas.width;
    const h = this.chartCanvas.height;

    ctx.clearRect(0, 0, w, h);

    // Background Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 40; y < h; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    if (this.latencies.length < 2) return;

    // Line Chart Path
    const maxVal = Math.max(120, ...this.latencies);
    const stepX = w / (this.latencies.length - 1);

    const points = this.latencies.map((val, idx) => ({
      x: idx * stepX,
      y: h - (val / maxVal) * (h - 40) - 20
    }));

    // Area Fill Gradient
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, 'rgba(245, 197, 66, 0.35)');
    grad.addColorStop(1, 'rgba(245, 197, 66, 0.0)');

    ctx.beginPath();
    ctx.moveTo(points[0].x, h);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Glowing Stroke Line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    points.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.strokeStyle = '#f5c542';
    ctx.lineWidth = 3;
    ctx.shadowBlur = 14;
    ctx.shadowColor = '#f5c542';
    ctx.stroke();

    // Points
    ctx.shadowBlur = 0;
    points.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    });
  }

  async runHealthChecks() {
    const services = [
      { name: 'GitHub Public API', url: 'https://api.github.com/zen' },
      { name: 'JSONPlaceholder API', url: 'https://jsonplaceholder.typicode.com/posts/1' },
      { name: 'HTTPBin IP Echo', url: 'https://httpbin.org/ip' },
      { name: 'Open-Meteo Weather API', url: 'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.00&current_weather=true' }
    ];

    const container = document.getElementById('health-checks-list');
    if (!container) return;

    container.innerHTML = '';

    for (const s of services) {
      const startTime = performance.now();
      let status = 'ONLINE';
      let latency = 0;
      let badgeClass = 'method-get';

      try {
        const res = await fetch(s.url, { method: 'GET' });
        latency = Math.round(performance.now() - startTime);
        if (!res.ok) {
          status = 'DEGRADED';
          badgeClass = 'method-put';
        }
      } catch (e) {
        status = 'OFFLINE';
        badgeClass = 'method-delete';
        latency = 0;
      }

      const card = document.createElement('div');
      card.className = 'preset-item';
      card.style.justifyContent = 'space-between';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="method-badge ${badgeClass}">${status}</span>
          <span style="font-weight:600; font-size:0.9rem;">${s.name}</span>
        </div>
        <span style="font-family:var(--font-mono); font-size:0.85rem; color:var(--text-sub);">${latency ? latency + ' ms' : 'N/A'}</span>
      `;
      container.appendChild(card);
    }
  }
}

const analytics = new AnalyticsEngine();

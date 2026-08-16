/* NEXUS API HUB - Main Dashboard Application Controller */

class AppController {
  constructor() {
    this.currentMethod = 'GET';
    this.currentUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    this.activeTab = 'playground';
    this.activeSnippetLang = 'curl';

    this.bindEvents();
    this.renderPresets();
    this.renderMockEndpointsList();
    analytics.init();
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;
        this.switchTab(tab);
      });
    });

    // Method Select & URL Input
    const methodSelect = document.getElementById('req-method');
    if (methodSelect) {
      methodSelect.addEventListener('change', (e) => {
        this.currentMethod = e.target.value;
        this.updateSnippet();
      });
    }

    const urlInput = document.getElementById('req-url');
    if (urlInput) {
      urlInput.addEventListener('input', (e) => {
        this.currentUrl = e.target.value;
        this.updateSnippet();
      });
    }

    // Send Button
    const sendBtn = document.getElementById('btn-send-req');
    if (sendBtn) {
      sendBtn.addEventListener('click', () => this.sendRequest());
    }

    // Snippet Language Selector
    document.querySelectorAll('.snippet-lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.snippet-lang-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.activeSnippetLang = e.target.dataset.lang;
        this.updateSnippet();
      });
    });

    // Copy Response Button
    const copyBtn = document.getElementById('btn-copy-response');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const codeView = document.getElementById('response-viewer');
        if (codeView) {
          navigator.clipboard.writeText(codeView.innerText);
          copyBtn.innerText = 'COPIED! ✅';
          setTimeout(() => copyBtn.innerText = 'COPY JSON 📋', 2000);
        }
      });
    }

    // Mock Form submit
    const mockForm = document.getElementById('mock-endpoint-form');
    if (mockForm) {
      mockForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.createMockEndpoint();
      });
    }
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(`tab-${tabName}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');

    if (tabName === 'analytics') {
      analytics.renderChart();
      analytics.runHealthChecks();
    }
  }

  renderPresets() {
    const presets = [
      { name: 'Get Users List', method: 'GET', url: 'https://jsonplaceholder.typicode.com/users' },
      { name: 'Get Single Post', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1' },
      { name: 'Mock Users API', method: 'GET', url: '/api/v1/users' },
      { name: 'Mock Auth Login', method: 'POST', url: '/api/v1/login', body: '{\n  "username": "admin",\n  "password": "secret_password"\n}' },
      { name: 'Mock Analytics', method: 'GET', url: '/api/v1/analytics' },
      { name: 'Live Weather API', method: 'GET', url: 'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.00&current_weather=true' }
    ];

    const container = document.getElementById('presets-list');
    if (!container) return;

    container.innerHTML = '';
    presets.forEach(p => {
      const item = document.createElement('div');
      item.className = 'preset-item';
      item.innerHTML = `
        <span class="method-badge method-${p.method.toLowerCase()}">${p.method}</span>
        <span class="preset-name">${p.name}</span>
      `;
      item.addEventListener('click', () => {
        this.currentMethod = p.method;
        this.currentUrl = p.url;

        const methodEl = document.getElementById('req-method');
        const urlEl = document.getElementById('req-url');
        const bodyEl = document.getElementById('req-body');

        if (methodEl) methodEl.value = p.method;
        if (urlEl) urlEl.value = p.url;
        if (bodyEl && p.body) bodyEl.value = p.body;

        this.updateSnippet();
      });
      container.appendChild(item);
    });
  }

  async sendRequest() {
    const sendBtn = document.getElementById('btn-send-req');
    const statusBadge = document.getElementById('resp-status');
    const timeMetric = document.getElementById('resp-time');
    const sizeMetric = document.getElementById('resp-size');
    const viewer = document.getElementById('response-viewer');

    if (sendBtn) sendBtn.innerHTML = 'SENDING... ⏳';

    const startTime = performance.now();
    let status = 200;
    let statusText = 'OK';
    let data = null;
    let sizeBytes = 0;

    // Check if matching mock server endpoint
    const mockMatch = mockServer.match(this.currentUrl, this.currentMethod);

    try {
      if (mockMatch) {
        const mockRes = await mockServer.handleRequest(mockMatch);
        status = mockRes.status;
        statusText = mockRes.statusText;
        data = mockRes.data;
      } else {
        const reqBody = document.getElementById('req-body')?.value;
        const options = {
          method: this.currentMethod,
          headers: { 'Content-Type': 'application/json' }
        };
        if (this.currentMethod !== 'GET' && this.currentMethod !== 'HEAD' && reqBody) {
          options.body = reqBody;
        }

        const response = await fetch(this.currentUrl, options);
        status = response.status;
        statusText = response.statusText;
        data = await response.json();
      }
    } catch (err) {
      status = 500;
      statusText = 'Network Error / CORS Restriction';
      data = { error: err.message || 'Failed to fetch resource' };
    }

    const duration = Math.round(performance.now() - startTime);
    const jsonStr = JSON.stringify(data, null, 2);
    sizeBytes = new Blob([jsonStr]).size;

    // Record metrics
    analytics.recordRequest(duration, status);

    // Update Response UI
    if (sendBtn) sendBtn.innerHTML = 'SEND REQUEST 🚀';

    if (statusBadge) {
      statusBadge.innerText = `${status} ${statusText}`;
      statusBadge.className = `response-status ${status < 400 ? 'status-2xx' : status < 500 ? 'status-4xx' : 'status-5xx'}`;
    }

    if (timeMetric) timeMetric.innerText = `Time: ${duration} ms`;
    if (sizeMetric) sizeMetric.innerText = `Size: ${sizeBytes} B`;
    if (viewer) viewer.innerText = jsonStr;
  }

  updateSnippet() {
    const box = document.getElementById('snippet-code');
    if (!box) return;

    const method = this.currentMethod;
    const url = this.currentUrl;
    const body = document.getElementById('req-body')?.value || '';

    let code = '';

    if (this.activeSnippetLang === 'curl') {
      code = `curl -X ${method} "${url}" \\\n  -H "Content-Type: application/json"`;
      if (body && method !== 'GET') code += ` \\\n  -d '${body.replace(/\n/g, '')}'`;
    } else if (this.activeSnippetLang === 'javascript') {
      code = `fetch("${url}", {\n  method: "${method}",\n  headers: { "Content-Type": "application/json" }${body && method !== 'GET' ? `,\n  body: JSON.stringify(${body})` : ''}\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
    } else if (this.activeSnippetLang === 'python') {
      code = `import requests\n\nurl = "${url}"\nresponse = requests.${method.toLowerCase()}(url)\nprint(response.json())`;
    } else if (this.activeSnippetLang === 'go') {
      code = `package main\nimport ("fmt"; "net/http")\nfunc main() {\n  resp, _ := http.Get("${url}")\n  fmt.Println(resp.Status)\n}`;
    }

    box.innerText = code;
  }

  createMockEndpoint() {
    const path = document.getElementById('mock-path')?.value;
    const method = document.getElementById('mock-method')?.value;
    const status = document.getElementById('mock-status')?.value;
    const delay = document.getElementById('mock-delay')?.value;
    const jsonStr = document.getElementById('mock-json')?.value;

    let jsonParsed = {};
    try {
      jsonParsed = JSON.parse(jsonStr);
    } catch (e) {
      alert('Invalid JSON response body format!');
      return;
    }

    mockServer.addEndpoint(method, path, status, delay, jsonParsed);
    this.renderMockEndpointsList();
    alert(`Mock Endpoint ${method} ${path} created successfully!`);
  }

  renderMockEndpointsList() {
    const container = document.getElementById('mock-endpoints-list');
    if (!container) return;

    container.innerHTML = '';
    mockServer.endpoints.forEach(ep => {
      const card = document.createElement('div');
      card.className = 'preset-item';
      card.style.justifyContent = 'space-between';
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <span class="method-badge method-${ep.method.toLowerCase()}">${ep.method}</span>
          <span style="font-family:var(--font-mono); font-size:0.9rem; font-weight:600;">${ep.path}</span>
        </div>
        <div style="display:flex; align-items:center; gap:14px;">
          <span style="font-size:0.82rem; color:var(--accent-green);">${ep.status} OK</span>
          <span style="font-size:0.82rem; color:var(--text-sub);">${ep.delay}ms</span>
          <button class="icon-btn" style="color:var(--accent-red); padding:3px 8px;" onclick="window.app.deleteMock('${ep.id}')">✕</button>
        </div>
      `;
      container.appendChild(card);
    });
  }

  deleteMock(id) {
    mockServer.deleteEndpoint(id);
    this.renderMockEndpointsList();
  }
}

window.addEventListener('load', () => {
  window.app = new AppController();
});

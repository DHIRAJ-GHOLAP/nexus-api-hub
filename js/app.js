/* NEXUS API HUB - Main Production Application Controller */

class AppController {
  constructor() {
    this.currentMethod = 'GET';
    this.currentUrl = 'https://jsonplaceholder.typicode.com/posts/1';
    this.activeTab = 'playground';
    this.activeSnippetLang = 'curl';
    this.customHeaders = [
      { key: 'Content-Type', value: 'application/json', enabled: true },
      { key: 'Accept', value: 'application/json', enabled: true }
    ];

    this.bindEvents();
    this.renderPresets();
    this.renderHeadersEditor();
    this.renderCollectionsList();
    this.renderEnvironmentUI();
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
          copyBtn.innerText = 'COPIED';
          setTimeout(() => copyBtn.innerText = 'COPY JSON', 2000);
        }
      });
    }

    // Add Header Row Button
    const addHeaderBtn = document.getElementById('btn-add-header');
    if (addHeaderBtn) {
      addHeaderBtn.addEventListener('click', () => {
        this.customHeaders.push({ key: '', value: '', enabled: true });
        this.renderHeadersEditor();
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
      { name: 'GitHub Profile API', method: 'GET', url: 'https://api.github.com/users/DHIRAJ-GHOLAP' },
      { name: 'JSONPlaceholder Posts', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts' },
      { name: 'Create Post Request', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', body: '{\n  "title": "Production Test",\n  "body": "Live HTTP Request via NEXUS API HUB",\n  "userId": 101\n}' },
      { name: 'Open-Meteo Weather API', method: 'GET', url: 'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.00&current_weather=true' },
      { name: 'HTTPBin IP Echo', method: 'GET', url: 'https://httpbin.org/ip' }
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

  renderHeadersEditor() {
    const container = document.getElementById('headers-editor-container');
    if (!container) return;

    container.innerHTML = '';
    this.customHeaders.forEach((h, index) => {
      const row = document.createElement('div');
      row.className = 'key-value-row';
      row.innerHTML = `
        <input type="text" class="kv-input" placeholder="Header Key (e.g. Authorization)" value="${h.key}" onchange="window.app.updateHeader(${index}, 'key', this.value)">
        <input type="text" class="kv-input" placeholder="Header Value (e.g. Bearer token...)" value="${h.value}" onchange="window.app.updateHeader(${index}, 'value', this.value)">
        <button class="icon-btn" style="color:var(--accent-red);" onclick="window.app.removeHeader(${index})">✕</button>
      `;
      container.appendChild(row);
    });
  }

  updateHeader(index, field, val) {
    if (this.customHeaders[index]) {
      this.customHeaders[index][field] = val;
      this.updateSnippet();
    }
  }

  removeHeader(index) {
    this.customHeaders.splice(index, 1);
    this.renderHeadersEditor();
    this.updateSnippet();
  }

  async sendRequest() {
    const sendBtn = document.getElementById('btn-send-req');
    const statusBadge = document.getElementById('resp-status');
    const timeMetric = document.getElementById('resp-time');
    const sizeMetric = document.getElementById('resp-size');
    const viewer = document.getElementById('response-viewer');
    const headersViewer = document.getElementById('response-headers-viewer');

    if (sendBtn) sendBtn.innerText = 'EXECUTING REQUEST...';

    // Environment variable resolution
    const finalUrl = collectionsManager.replaceVariables(this.currentUrl);
    const rawBody = document.getElementById('req-body')?.value || '';
    const finalBody = collectionsManager.replaceVariables(rawBody);

    // Build headers dictionary
    const headersDict = {};
    this.customHeaders.forEach(h => {
      if (h.key && h.value && h.enabled !== false) {
        headersDict[h.key] = collectionsManager.replaceVariables(h.value);
      }
    });

    const startTime = performance.now();
    let status = 200;
    let statusText = 'OK';
    let data = null;
    let respHeadersObj = {};
    let sizeBytes = 0;

    try {
      const options = {
        method: this.currentMethod,
        headers: headersDict
      };
      if (this.currentMethod !== 'GET' && this.currentMethod !== 'HEAD' && finalBody) {
        options.body = finalBody;
      }

      const response = await fetch(finalUrl, options);
      status = response.status;
      statusText = response.statusText || (status === 200 ? 'OK' : 'Response Received');

      response.headers.forEach((val, key) => {
        respHeadersObj[key] = val;
      });

      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textData = await response.text();
        try {
          data = JSON.parse(textData);
        } catch (e) {
          data = { rawText: textData };
        }
      }
    } catch (err) {
      status = 500;
      statusText = 'Network Error / CORS Restrained';
      data = {
        error: err.message || 'Failed to fetch HTTP resource.',
        hint: 'If requesting an external server, ensure the target server enables CORS headers (Access-Control-Allow-Origin: *).'
      };
    }

    const duration = Math.round(performance.now() - startTime);
    const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    sizeBytes = new Blob([jsonStr]).size;

    analytics.recordRequest(duration, status);
    collectionsManager.addToHistory({
      method: this.currentMethod,
      url: finalUrl,
      status: status,
      duration: duration
    });

    if (sendBtn) sendBtn.innerText = 'EXECUTE REQUEST';

    if (statusBadge) {
      statusBadge.innerText = `${status} ${statusText}`;
      statusBadge.className = `response-status ${status < 400 ? 'status-2xx' : status < 500 ? 'status-4xx' : 'status-5xx'}`;
    }

    if (timeMetric) timeMetric.innerText = `Time: ${duration} ms`;
    if (sizeMetric) sizeMetric.innerText = `Size: ${sizeBytes} B`;
    if (viewer) viewer.innerText = jsonStr;
    if (headersViewer) headersViewer.innerText = JSON.stringify(respHeadersObj, null, 2);
  }

  updateSnippet() {
    const box = document.getElementById('snippet-code');
    if (!box) return;

    const method = this.currentMethod;
    const url = collectionsManager.replaceVariables(this.currentUrl);
    const body = collectionsManager.replaceVariables(document.getElementById('req-body')?.value || '');

    let headersStr = '';
    this.customHeaders.forEach(h => {
      if (h.key && h.value) {
        headersStr += `  -H "${h.key}: ${h.value}" \\\n`;
      }
    });

    let code = '';
    if (this.activeSnippetLang === 'curl') {
      code = `curl -X ${method} "${url}" \\\n${headersStr}`;
      if (body && method !== 'GET') code += `  -d '${body.replace(/\n/g, '')}'`;
    } else if (this.activeSnippetLang === 'javascript') {
      code = `fetch("${url}", {\n  method: "${method}",\n  headers: ${JSON.stringify(this.getHeadersObj(), null, 4)}${body && method !== 'GET' ? `,\n  body: JSON.stringify(${body})` : ''}\n})\n.then(res => res.json())\n.then(data => console.log(data));`;
    } else if (this.activeSnippetLang === 'python') {
      code = `import requests\n\nurl = "${url}"\nheaders = ${JSON.stringify(this.getHeadersObj(), null, 4)}\nresponse = requests.${method.toLowerCase()}(url, headers=headers)\nprint(response.json())`;
    } else if (this.activeSnippetLang === 'go') {
      code = `package main\nimport ("fmt"; "net/http")\nfunc main() {\n  req, _ := http.NewRequest("${method}", "${url}", nil)\n  resp, _ := http.DefaultClient.Do(req)\n  fmt.Println(resp.Status)\n}`;
    }

    box.innerText = code;
  }

  getHeadersObj() {
    const obj = {};
    this.customHeaders.forEach(h => {
      if (h.key && h.value) obj[h.key] = h.value;
    });
    return obj;
  }

  renderCollectionsList() {
    const container = document.getElementById('collections-list');
    if (!container) return;

    container.innerHTML = '';
    collectionsManager.collections.forEach(col => {
      const card = document.createElement('div');
      card.className = 'request-card';
      card.innerHTML = `
        <div class="section-title" style="color:var(--accent-gold); margin-bottom:12px;">${col.name}</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${col.requests.map(r => `
            <div class="preset-item" onclick="window.app.loadRequest('${r.method}', '${r.url}')">
              <span class="method-badge method-${r.method.toLowerCase()}">${r.method}</span>
              <span style="font-family:var(--font-mono); font-size:0.84rem;">${r.name}</span>
            </div>
          `).join('')}
        </div>
      `;
      container.appendChild(card);
    });
  }

  loadRequest(method, url) {
    this.currentMethod = method;
    this.currentUrl = url;

    const methodEl = document.getElementById('req-method');
    const urlEl = document.getElementById('req-url');

    if (methodEl) methodEl.value = method;
    if (urlEl) urlEl.value = url;

    this.switchTab('playground');
    this.updateSnippet();
  }

  renderEnvironmentUI() {
    const activeEnv = collectionsManager.getActiveEnv();
    const envBadge = document.getElementById('active-env-badge');
    if (envBadge) envBadge.innerText = activeEnv.name;
  }
}

window.addEventListener('load', () => {
  window.app = new AppController();
});

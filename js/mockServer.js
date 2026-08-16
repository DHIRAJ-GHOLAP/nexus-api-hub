/* NEXUS API HUB - Built-in Mock API Engine */

class MockServerEngine {
  constructor() {
    this.endpoints = [
      {
        id: 'mock-1',
        method: 'GET',
        path: '/api/v1/users',
        status: 200,
        delay: 140,
        response: [
          { id: 101, name: 'Elena Rostova', role: 'Lead Architect', email: 'elena@nexus.io', status: 'Active' },
          { id: 102, name: 'Marcus Vance', role: 'DevOps Specialist', email: 'marcus@nexus.io', status: 'Active' },
          { id: 103, name: 'Aria Chen', role: 'Frontend Engineer', email: 'aria@nexus.io', status: 'Away' }
        ]
      },
      {
        id: 'mock-2',
        method: 'POST',
        path: '/api/v1/login',
        status: 200,
        delay: 220,
        response: {
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRldmVsb3BlciIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
          expiresIn: 3600,
          user: { id: 'usr_882', email: 'dev@nexus.io' }
        }
      },
      {
        id: 'mock-3',
        method: 'GET',
        path: '/api/v1/analytics',
        status: 200,
        delay: 180,
        response: {
          requestsTotal: 142850,
          successRate: '99.84%',
          avgLatencyMs: 42.6,
          activeServices: 12
        }
      }
    ];

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem('nexus_mock_endpoints');
      if (saved) {
        this.endpoints = JSON.parse(saved);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('nexus_mock_endpoints', JSON.stringify(this.endpoints));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  addEndpoint(method, path, status, delay, responseObj) {
    const newEp = {
      id: 'mock-' + Date.now(),
      method: method.toUpperCase(),
      path: path.startsWith('/') ? path : '/' + path,
      status: parseInt(status, 10),
      delay: parseInt(delay, 10),
      response: responseObj
    };
    this.endpoints.push(newEp);
    this.saveToStorage();
    return newEp;
  }

  deleteEndpoint(id) {
    this.endpoints = this.endpoints.filter(e => e.id !== id);
    this.saveToStorage();
  }

  match(url, method) {
    const cleanUrl = url.replace(/^https?:\/\/[^\/]+/, ''); // Strip domain if any
    return this.endpoints.find(ep => ep.method === method.toUpperCase() && (ep.path === cleanUrl || cleanUrl.endsWith(ep.path)));
  }

  async handleRequest(mockEp) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: mockEp.status,
          statusText: mockEp.status === 200 ? 'OK' : mockEp.status === 201 ? 'Created' : 'Mock Response',
          headers: {
            'content-type': 'application/json',
            'x-mock-server': 'NEXUS-Engine-v1.0'
          },
          data: mockEp.response
        });
      }, mockEp.delay || 100);
    });
  }
}

const mockServer = new MockServerEngine();

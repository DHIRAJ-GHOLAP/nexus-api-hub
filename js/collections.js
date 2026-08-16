/* NEXUS API HUB - Production Collections & Environment Manager */

class CollectionsManager {
  constructor() {
    this.environments = [
      {
        id: 'env-prod',
        name: 'Production',
        variables: [
          { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com' },
          { key: 'apiKey', value: 'nx_live_9837498237492' }
        ]
      },
      {
        id: 'env-staging',
        name: 'Staging',
        variables: [
          { key: 'baseUrl', value: 'https://staging.api.nexus.io' },
          { key: 'apiKey', value: 'nx_test_1102938102938' }
        ]
      }
    ];

    this.activeEnvId = 'env-prod';

    this.collections = [
      {
        id: 'col-github',
        name: 'GitHub Public API',
        requests: [
          { name: 'Get Repository Details', method: 'GET', url: 'https://api.github.com/repos/DHIRAJ-GHOLAP/nexus-api-hub', headers: {}, body: '' },
          { name: 'Get User Profile', method: 'GET', url: 'https://api.github.com/users/DHIRAJ-GHOLAP', headers: {}, body: '' }
        ]
      },
      {
        id: 'col-jsonplaceholder',
        name: 'JSONPlaceholder API',
        requests: [
          { name: 'Fetch Posts List', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts', headers: {}, body: '' },
          { name: 'Fetch Single Post', method: 'GET', url: 'https://jsonplaceholder.typicode.com/posts/1', headers: {}, body: '' },
          { name: 'Create Post', method: 'POST', url: 'https://jsonplaceholder.typicode.com/posts', headers: { 'Content-Type': 'application/json' }, body: '{\n  "title": "Production Test Post",\n  "body": "NEXUS API HUB live request",\n  "userId": 1\n}' }
        ]
      },
      {
        id: 'col-weather',
        name: 'Open-Meteo Weather API',
        requests: [
          { name: 'Live Weather Forecast', method: 'GET', url: 'https://api.open-meteo.com/v1/forecast?latitude=40.71&longitude=-74.00&current_weather=true', headers: {}, body: '' }
        ]
      }
    ];

    this.history = [];

    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const savedCol = localStorage.getItem('nexus_collections');
      if (savedCol) this.collections = JSON.parse(savedCol);

      const savedEnv = localStorage.getItem('nexus_environments');
      if (savedEnv) this.environments = JSON.parse(savedEnv);

      const savedHist = localStorage.getItem('nexus_history');
      if (savedHist) this.history = JSON.parse(savedHist);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('nexus_collections', JSON.stringify(this.collections));
      localStorage.setItem('nexus_environments', JSON.stringify(this.environments));
      localStorage.setItem('nexus_history', JSON.stringify(this.history));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }

  getActiveEnv() {
    return this.environments.find(e => e.id === this.activeEnvId) || this.environments[0];
  }

  replaceVariables(text) {
    if (!text) return text;
    const env = this.getActiveEnv();
    let result = text;
    if (env && env.variables) {
      env.variables.forEach(v => {
        if (v.key && v.value) {
          const regex = new RegExp(`\\{\\{\\s*${v.key}\\s*\\}\\}`, 'g');
          result = result.replace(regex, v.value);
        }
      });
    }
    return result;
  }

  addCollection(name) {
    const col = {
      id: 'col-' + Date.now(),
      name: name,
      requests: []
    };
    this.collections.push(col);
    this.saveToStorage();
    return col;
  }

  saveRequestToCollection(collectionId, requestObj) {
    const col = this.collections.find(c => c.id === collectionId);
    if (col) {
      col.requests.push(requestObj);
      this.saveToStorage();
    }
  }

  addToHistory(item) {
    this.history.unshift({
      id: 'hist-' + Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      ...item
    });
    if (this.history.length > 50) this.history.pop();
    this.saveToStorage();
  }
}

const collectionsManager = new CollectionsManager();

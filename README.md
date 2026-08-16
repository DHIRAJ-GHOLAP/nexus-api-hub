<div align="center">

  ![NEXUS API HUB Banner](assets/banner.jpg)

  # 🌐 NEXUS API HUB 🌐
  ### *Production REST API Playground, Collections & Real-Time Performance Studio*

  [![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
  [![HTML5](https://img.shields.io/badge/HTML5-ES6+-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![CSS3](https://img.shields.io/badge/CSS3-Vanilla%20Design%20System-1572B6?logo=css3&logoColor=white)](#)
  [![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-f5c542)](#)

</div>

---

## 🚀 Overview

**NEXUS API HUB** is an open-source, production-ready, lightweight REST API testing playground and collections platform.

Designed for developers who need a sleek, high-performance web tool without complex setup or heavy desktop installs, NEXUS API HUB allows you to execute real HTTP API requests, inspect status codes, measure latency, manage custom headers, and organize request collections straight from your browser.

---

## 🔥 Production Features

- ⚡ **Real HTTP API Execution**: Support for real `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, and `OPTIONS` requests against any live CORS-enabled API.
- 🔑 **Custom Headers & Environment Variables**: Add custom HTTP headers (`Authorization: Bearer <token>`, `X-API-Key`, `Content-Type`) and environment variable interpolation (`{{baseUrl}}`, `{{apiKey}}`).
- 📁 **API Collections & Workspaces**: Organize API requests into structured collections (GitHub API, Payment Gateways, Weather APIs, Custom Backends) with `localStorage` persistence.
- 📊 **Real-Time Network Latency & Health Checks**: HTML5 Canvas latency monitoring graph, total request counters, success rate percentages, and automated ping checks for live production APIs.
- 💻 **Multi-Language Code Snippet Generator**: Instantly exports production-ready code snippets in **cURL**, **JavaScript (`fetch`)**, **Python (`requests`)**, and **Go**.
- 📋 **Response Inspector**: Formatted JSON viewer with status badges (`200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Error`), roundtrip latency timer (ms), payload byte size counter, and 1-click clipboard copy.

---

## 🕹️ Quick Start / How to Run Locally

NEXUS API HUB is built with pure web technologies — zero build steps or package managers required.

### Option 1: Python HTTP Server
```bash
# Clone the repository
git clone https://github.com/DHIRAJ-GHOLAP/nexus-api-hub.git
cd nexus-api-hub

# Start local server
python3 -m http.server 8080
```
Open your browser at `http://localhost:8080`.

### Option 2: Node.js npx
```bash
npx serve .
```

---

## 📄 License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

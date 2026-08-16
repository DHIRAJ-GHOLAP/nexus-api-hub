<div align="center">

  ![NEXUS API HUB Banner](assets/banner.jpg)

  # NEXUS API HUB
  ### *Production REST API Studio & Analytics Platform*

  [![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](LICENSE)
  [![HTML5](https://img.shields.io/badge/HTML5-ES6+-E34F26?logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![CSS3](https://img.shields.io/badge/CSS3-Vanilla%20Design%20System-1572B6?logo=css3&logoColor=white)](#)
  [![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero-f5c542)](#)

</div>

---

## Overview

**NEXUS API HUB** is a lightweight, zero-dependency REST API testing studio, collection workspace, and real-time performance monitor.

Designed for developers who want a fast, desktop-grade web client without bloated Electron overhead, NEXUS API HUB allows you to execute real HTTP API requests, manage custom headers, set environment variables, inspect status codes, and analyze network latency straight from your browser.

---

## Features

- **Real HTTP Execution**: Native browser `fetch` supporting `GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `HEAD`, and `OPTIONS` requests against any live API endpoint.
- **Custom Headers & Environments**: Configure HTTP request headers (`Authorization: Bearer <token>`, `X-API-Key`) and environment variable replacement (`{{baseUrl}}`, `{{apiKey}}`).
- **Collections & Workspaces**: Save request templates into structured workspaces with browser `localStorage` persistence.
- **Real-Time Network Monitoring**: HTML5 Canvas latency visualization, total request counting, success rates, and automated health checks for live production APIs.
- **Multi-Language Code Generator**: Export requests to **cURL**, **JavaScript (`fetch`)**, **Python (`requests`)**, and **Go**.
- **Response Inspector**: JSON view, status code badges (`200 OK`, `401 Unauthorized`, `404 Not Found`, `500 Error`), execution duration timing (ms), payload byte size metrics, and clipboard copy.

---

## Quick Start

NEXUS API HUB runs in any modern browser without build steps or package managers.

### Python HTTP Server
```bash
# Clone the repository
git clone https://github.com/DHIRAJ-GHOLAP/nexus-api-hub.git
cd nexus-api-hub

# Start local server
python3 -m http.server 8080
```
Open your browser at `http://localhost:8080`.

### Node.js npx
```bash
npx serve .
```

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

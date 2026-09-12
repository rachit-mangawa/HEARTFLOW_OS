---
title: HeartFlow OS Backend
emoji: 🫀
colorFrom: gray
colorTo: red
sdk: docker
pinned: false
---

<div align="center">
  <h1>HeartFlow OS</h1>
  <p><strong>Cardiovascular Telemetry & MLOps Engine</strong></p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-16+-black.svg?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-0.111.0+-009688.svg?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/Scikit--Learn-1.5.1+-F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white" alt="Scikit-Learn" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

HeartFlow OS takes real-time patient vitals via WebSockets, runs them through an scikit-learn ensemble, and outputs probability distributions for cardiovascular conditions. It also transpiles these models into standalone C headers you can flash directly to constrained edge devices like an ESP32.

## Components

| Domain | Tech | Details |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16, React 19 | Renders 60Hz telemetry streams using WebSockets and SVG |
| **Backend** | FastAPI, Python 3.10 | Handles WebSocket routing and MLOps API endpoints |
| **ML** | Scikit-Learn | Soft-voting ensemble (RF, SVM, KNN, LogReg, MLP) |
| **Database** | SQLite, `aiosqlite` | Non-blocking telemetry and prediction logging |
| **Compiler** | Custom AST Transpiler | Generates INT8 quantized, `malloc`-free C code |

## Features

- **Live Telemetry**: Streams data at 60Hz via WebSockets to a React 19 dashboard.
- **Edge Compilation**: Converts trained scikit-learn models into C headers. The generated code requires no dependencies and does not use dynamic memory allocation.
- **Quantization**: Scales 64-bit float weights down to 8-bit integers, reducing flash memory usage by ~75%.
- **Soft-Voting**: Combines predictions from 5 different models to output a probability distribution.
- **Background Retraining**: Upload new CSV data to `/retrain` and the backend will impute missing values, retrain the models in a background thread, and update the live ensemble without dropping active socket connections.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for data flow diagrams and the file map.

## Quickstart

### 1. Backend

Requires Python 3.10+.

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt

# Train initial models and seed the DB
python models.py

# Start the server
uvicorn main:app --reload --port 8000
```

### 2. Frontend

Requires Node.js 18+.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` to view the dashboard, upload new data, or export C headers.

## License

MIT License. See `LICENSE`.

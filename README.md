---
title: HeartFlow OS Backend
emoji: 🫀
colorFrom: gray
colorTo: red
sdk: docker
pinned: false
---

# HEARTFLOW_OS // Edge-Native Cardiovascular Telemetry

A production-grade, edge-optimized application for real-time cardiovascular telemetry and predictive diagnostics. HeartFlow OS bridges cloud-scale machine learning with low-level embedded constraints by transpiling soft-voting ensembles directly into zero-dependency, statically allocated C-code for microcontroller deployment.

![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0+-009688.svg?style=flat&logo=fastapi)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5.1+-F7931E.svg?style=flat&logo=scikit-learn)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 🚀 Overview

HeartFlow OS is engineered for high-frequency clinical telemetry. It ingests live patient vitals via WebSockets, evaluates telemetry against an ensemble of distributed classifiers to compute diagnostic probability distributions, and physically compresses these complex mathematical models into raw C-code headers ready to be flashed onto constrained edge silicon (e.g., ESP32, Cortex-M series).

### Key Engineering Features

- **High-Throughput Telemetry Interface:** A highly optimized Next.js 16 dashboard utilizing native WebSockets and React 19 to render 60fps SVG telemetry sweeps with near-zero latency or dropped frames.
- **Edge Inference & TinyML:** Transpiles sophisticated `scikit-learn` models into highly optimized, dependency-free C-code. Designed with strict spatial and temporal constraints in mind, bypassing dynamic memory allocation entirely (`malloc`-free).
- **INT8 Quantization Engine:** Algorithmically scales 64-bit floating-point weights and biases down to 8-bit integers, effectively shrinking the flashed payload memory footprint by ~75% without significant accuracy degradation.
- **Soft-Voting Ensemble:** Fuses predictions from five discrete model architectures (Random Forest, SVM, KNN, Logistic Regression, MLP Neural Network) to generate resilient probability distributions, mitigating the variance and biases of individual black-box models.
- **Zero-Downtime MLOps:** Integrated `/retrain` pipeline allowing for real-time schema validation, data imputation, and background ensemble retraining. Hot-swaps the underlying intelligence engine globally without interrupting active clinical WebSocket streams.

---

## 🏗 System Architecture

The architecture adheres to a strictly decoupled, service-oriented design pattern split across the Client (React), the Core (FastAPI), and the Edge (C-Compiler).

For a deep-dive into system topography, data flows, and design rationale, see [ARCHITECTURE.md](./ARCHITECTURE.md).

### Repository Topology

```text
HEARTFLOW_OS/
├── backend/               # FastAPI core, aiosqlite, async ML pipelines, C-compiler
│   ├── ensemble.py        # Core intelligence and soft-voting aggregations
│   ├── main.py            # Websocket ingress, REST APIs, and background routines
│   └── preprocessing.py   # State-preserving MLOps data imputation and scaling
├── frontend/              # Next.js 16 UI, React Context, Framer Motion
│   ├── src/app/           # Route segments (Dashboard, Simulator, Architecture)
│   └── src/components/    # Memoized, brutalist UI components for 60fps rendering
├── model/                 # Local LRU cache of serialized model states (.pkl)
└── data/                  # Immutable patient cohort datasets for MLOps
```

---

## 🛠 Quickstart Guide

### 1. Initialize the Core (Backend)
Requires Python 3.10+
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: `.\.venv\Scripts\activate`
pip install -r requirements.txt
python models.py           # Initialize database and train the baseline ensemble
uvicorn main:app --reload --port 8000
```

### 2. Initialize the Client (Frontend)
Requires Node.js 18+
```bash
cd frontend
npm install
npm run dev
```

The system will boot on `localhost:3000`. Navigate to the dashboard to monitor live telemetry streams, access MLOps pipelines, and export INT8 TinyML headers.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

# HEARTFLOW_OS // TinyML Heart Health Telemetry

A production-ready, edge-optimized application for real-time cardiovascular analytics. It bridges the gap between cloud-scale machine learning and low-level embedded hardware by deploying soft-voting ensembles and automated C-code transpilation for resource-constrained IoT systems.

![Next.js](https://img.shields.io/badge/Next.js-16+-black.svg?style=flat&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=flat&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0+-009688.svg?style=flat&logo=fastapi)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5.1+-F7931E.svg?style=flat&logo=scikit-learn)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## Overview

HEARTFLOW_OS is designed for clinical telemetry monitoring. It evaluates live patient vitals using an ensemble of classifiers, provides diagnostic probability distributions, and physically compresses these Python-trained models into raw C-code headers ready to be flashed directly onto edge silicon (e.g., ESP32, Arduino Nano).

### Key Engineering Features

- **Industrial Brutalist Frontend**: A high-performance, cockpit-dense Next.js 16 UI using native WebSockets and React 19 to render 60fps SVG telemetry sweeps without dropping frames.
- **Edge Computing & TinyML**: Transpiles complex Scikit-Learn models into highly optimized, dependency-free **C-code headers**. Bypasses dynamic memory allocation entirely.
- **INT8 Quantization Engine**: Mathematically scales 64-bit floating-point weights down to 8-bit integers, shrinking the flash memory payload by **~75%** for constrained microcontrollers.
- **Soft-Voting Ensemble**: Aggregates predictions across five independent models (Random Forest, SVM, KNN, Logistic Regression, MLP Neural Network) to output robust probability distributions rather than black-box binary answers.
- **Zero-Downtime MLOps Pipeline**: Features a dedicated `/retrain` pipeline allowing dynamic CSV uploads. It validates schemas, imputes missing data, retrains the entire ensemble in a background thread, and hot-swaps the intelligence engine globally without dropping active WebSocket connections.

## Architecture

The project follows a decoupled, modular design pattern split between a React Client, a FastAPI Core, and an Edge Compiler.

For a comprehensive deep-dive into the data flows and system topography, refer to the [ARCHITECTURE.md](./ARCHITECTURE.md) document.

### Repository Structure

```text
HEARTFLOW_OS/
├── backend/               # FastAPI server, ML pipelines, aiosqlite, Edge C-compiler
│   ├── ensemble.py        # Core intelligence and prediction aggregations
│   ├── main.py            # Websocket feeds, REST APIs, and background tasks
│   └── preprocessing.py   # MLOps data imputation, scaling, and state preservation
├── frontend/              # Next.js 16 UI, React Context, framer-motion components
│   ├── src/app/           # Dashboard, Simulator, MLOps, and Architecture routes
│   └── src/components/    # Reusable brutalist UI components (Vitals, Graphs)
├── model/                 # Local cache of serialized SciKit-Learn .pkl weights
└── data/                  # Base patient cohort CSVs for MLOps retraining pipelines
```

## Quickstart

### 1. Initialize Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Or `.\venv\Scripts\activate` on Windows
pip install -r requirements.txt
python models.py  # Initial train of the base ensemble
uvicorn main:app --reload --port 8000
```

### 2. Initialize Frontend
```bash
cd frontend
npm install
npm run dev
```

The system will boot on `localhost:3000`. Connect to view the live dashboard streams and access the MLOps retraining interfaces.

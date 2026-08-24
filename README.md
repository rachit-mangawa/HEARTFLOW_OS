# TinyML Heart Health Monitoring Dashboard

A production-ready application for real-time heart health analytics, ensemble prediction modeling, and automated C-code transpilation for resource-constrained embedded systems.

![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111.0+-009688.svg?style=flat&logo=fastapi)
![Streamlit](https://img.shields.io/badge/Streamlit-1.36.0+-FF4B4B.svg?style=flat&logo=streamlit)
![Scikit-Learn](https://img.shields.io/badge/scikit--learn-1.5.1+-F7931E.svg?style=flat&logo=scikit-learn)
![HuggingFace](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-yellow)
![License](https://img.shields.io/badge/license-MIT-green.svg)

**Live Environments:**
- 🖥️ **Full App (Dashboard + API):** [Hugging Face Spaces](https://huggingface.co/spaces/IDKHowToCodeFr/tinyml-backend)
- ⚙️ **Legacy Frontend UI:** [Streamlit Cloud](https://tinyml-heart-health-monitoring-dashboard-8xqogy2hibtlayt7popvs.streamlit.app/)

## Overview

This application bridges the gap between high-level cloud machine learning and low-level embedded hardware. It evaluates patient vitals using an ensemble of classifiers, provides strict clinical explainability, and compresses these Python-trained models into raw C-code ready to be flashed onto IoT devices.

### Key Engineering Features

- **Edge Computing & TinyML**: Transpiles complex Scikit-Learn models into highly optimized, dependency-free **C-code headers**. This allows predictive intelligence to be deployed directly to the edge, enabling offline, ultra-low latency, and privacy-preserving inference.
- **Centralized Data Synchronization**: Utilizing the Hugging Face Hub as a persistent storage backend, the application synchronizes its SQLite `patient_history.db` across all live instances. This ensures a unified patient history even when deployed in a distributed environment.
- **Localized Time Awareness**: Built-in support for multiple time zones. While the backend maintains a robust **UTC** standard for storage and synchronization, the dashboard automatically localizes all clinical telemetry and history logs to **IST (Indian Standard Time, UTC+5:30)** for healthcare professionals.
- **INT8 Quantization Engine**: Mathematically scales 64-bit floating-point weights down to 8-bit integers, effectively shrinking the flash memory payload by **~75%** for resource-constrained microcontrollers.
- **Interpretable AI (SHAP)**: Solves the medical "black box" concern by generating real-time SHAP feature impact analyses. This visualization proves exactly *why* the AI assigned a specific risk score based on individual patient variables.
- **Soft-Voting Ensemble**: Rather than relying on a single algorithm, the backend aggregates outputs across five independent models (Random Forest, SVM, KNN, Logistic Regression, Neural Network) to output the highest-confidence predictions.

## Architecture

The project follows a decoupled, modular design pattern optimized for cloud deployment.

```mermaid
flowchart TD
    %% Define styles
    classDef frontend fill:#ff4b4b,stroke:#a30000,stroke-width:2px,color:#fff;
    classDef backend fill:#009688,stroke:#004d40,stroke-width:2px,color:#fff;
    classDef ml_node fill:#f2c94c,stroke:#b28900,stroke-width:2px,color:#333;
    classDef edge_tech fill:#2d9cdb,stroke:#106093,stroke-width:2px,color:#fff;
    classDef hf fill:#ffcc00,stroke:#d4a017,stroke-width:2px,color:#333;

    %% Core Components
    UI[Streamlit UI - IST Display]:::frontend
    API[FastAPI Backend - UTC Storage]:::backend
    HUB[(HF Hub Dataset - tinyml-logs)]:::hf

    subgraph "Hugging Face Space Container"
        UI <-->|Internal localhost:8000| API
        DB_LOCAL[(SQLite DB - Local Cache)]:::backend
        API <--> DB_LOCAL
    end

    API <-->|HfApi Sync| HUB
    
    %% ML Subgraph
    subgraph ML [Ensemble & Inference Pipeline]
        ENS{Ensemble Engine}:::ml_node
        Models[Classifiers: RF, SVM, LogReg, NN, KNN]:::ml_node
        SHAP[SHAP Explainer]:::ml_node
    end

    %% Edge Quantization Subgraph
    subgraph Quantization [Hardware Export]
        TRANS[C-Code Transpiler]:::edge_tech
        HEADER((tinyml_model.h)):::edge_tech
        MCU[ESP32 / Cortex-M Node]:::edge_tech
    end

    API -->|Predict| ENS
    ENS --> Models
    API -->|Explain| SHAP
    SHAP -.-> Models
    API -->|Export| TRANS
    TRANS --> HEADER
    HEADER -->|Flash| MCU
```

### Modular Repository Structure

```text
TinyML-Dashboard/
├── backend/               # FastAPI server, ML pipelines, SQLite API, C-code logic
├── frontend/              # Streamlit UI mapping, Plotly charts, web routing
├── model/                 # Local cache of serialized SciKit-Learn .pkl weights
├── data/                  # Patient cohort CSVs for MLOps retraining pipelines
├── tests/                 # Full PyTest suite for backend continuous integration
├── .github/workflows/     # CI/CD actions for auto-syncing to Hugging Face
├── app.py                 # Multi-service entry point for Hugging Face Spaces
└── docker-compose.yml     # Orchestration spec for local containerized deployment
```

## Configuration

### Environment Variables
To enable the full feature set (Sync, Localized Time), configure the following:

| Variable | Description |
| :--- | :--- |
| `HF_TOKEN` | Hugging Face Read/Write token for dataset synchronization. |
| `SPACE_ID` | Automatically set by HF Spaces; used for IST time zone triggers. |
| `API_URL` | Internal/External URL for the FastAPI backend (Default: `http://localhost:8000`). |

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/predict` | Soft-voting ensemble inference on patient vitals. |
| `POST` | `/explain` | SHAP feature impact analysis for clinicial explainability. |
| `GET` | `/history` | Fetch live patient prediction history from centralized DB. |
| `GET` | `/export_tinyml` | Transpile Scikit-Learn models to dependency-free C headers. |
| `POST` | `/retrain` | MLOps pipeline for live model ensemble retraining. |

## Setup & Installation

### Requirements
- Python 3.9 or higher
- Git

### Installation Steps

1. **Clone the repository:**
```bash
git clone https://github.com/IDKHowToCodeFR/TinyML-Heart-Health-Monitoring-Dashboard.git
cd TinyML-Heart-Health-Monitoring-Dashboard
```

2. **Install global requirements:**
```bash
pip install -r requirements.txt
pip install -r backend/requirements.txt
pip install -r frontend/requirements.txt
```

3. **Train the baseline local `.pkl` models (Required on first run):**
```bash
cd backend
python models.py 
cd ..
```

## Usage

### 🚀 Quick Start (Windows)
We've bundled an automated startup script that boots both environments natively:
```bash
run.bat
```

### 🐳 Docker Deployment
To avoid local python pathing issues, you can spin up the application via Docker Compose:
```bash
docker-compose up --build
```
*The Streamlit interface will bind automatically to `http://localhost:8501`, connecting directly to the internal API.*

### 🛠️ Manual Startup
If you prefer running the stack manually in separate terminal instances:

**Start the Backend:**
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000
```
**Start the Frontend:**
```bash
cd frontend
streamlit run Home.py
```

## Development & Automation

### API Documentation
FastAPI serves auto-generated interactive documentation. While the backend is running, you can hit the endpoints directly at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

### CI/CD Pipelines
The project utilizes GitHub actions natively located in `.github/workflows/`:
1. **PyTest Validation**: Verifies endpoint data sanitization and schema parameters immediately on Push/Pull Requests.
2. **Hugging Face Sync**: Auto-deploys `main` branch updates precisely to the Hugging Face Space Docker container ensuring CI/CD alignment.

## Support & License
This project is licensed under the MIT License. Designed as a scalable, educational, and fully interpretable Edge-based Machine Learning architecture.

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
  <p><strong>Cardiovascular Telemetry & Edge MLOps Engine</strong></p>
  
  <p>
    <a href="https://idkhowtocodefr-tinyml-backend.hf.space/docs" target="_blank">
      <img src="https://img.shields.io/badge/🤗_HuggingFace-API_Docs-FFD21E.svg?style=for-the-badge" alt="Hugging Face API" />
    </a>
    <a href="https://idkhowtocodefr.github.io/HEARTFLOW_OS" target="_blank">
      <img src="https://img.shields.io/badge/🌐_Website-Live_App-black.svg?style=for-the-badge&logo=githubpages" alt="Live Website" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16+-black.svg?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/FastAPI-0.111.0+-009688.svg?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PlatformIO-Edge-orange.svg?style=for-the-badge&logo=platformio&logoColor=white" alt="PlatformIO" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

HeartFlow OS is an end-to-end telemetry and inference platform designed to stream cardiovascular vitals, predict anomalies using a soft-voting ensemble model, and export those models to highly-constrained edge devices (like ESP32/Arduino).

## System Architecture

| Domain | Tech | Details |
| :--- | :--- | :--- |
| **Frontend** | Next.js 16, Framer Motion | Industrial Brutalist UI with auto-healing WebSocket reconnections. |
| **Backend** | FastAPI, Python 3.10 | Real-time WebSocket routing, Telemetry simulator, and SHAP Explainability. |
| **MLOps Pipeline** | Scikit-Learn | Automated training pipelines with F1-Score evaluation and rollback protection. |
| **Edge Compiler** | Custom AST Transpiler | Exports trained ensembles to zero-dependency, INT8 quantized C headers. |
| **Firmware** | PlatformIO, C++ | Ready-to-deploy hardware wrapper for ESP32/Arduino execution. |

## Core Features

- **Fault-Tolerant Telemetry**: Streams data via WebSockets to the React dashboard with exponential backoff and UI-level auto-reconnection.
- **Automated MLOps Registry**: Upload batch CSV data to `/retrain`. The system evaluates the new models against a test set and will automatically roll back if performance (F1-score) degrades.
- **Edge Compilation (TinyML)**: Converts trained models into standalone C code (`model.h`). The generated code requires no dynamic memory allocation (`malloc`-free) and uses integer quantization to cut memory footprint by 75%.
- **Cross-Language Assurance**: Built-in test pipelines verify that the exported C logic perfectly matches the Python models before flashing to hardware.

## Quickstart

### Option 1: Docker Compose (Recommended)

Run the entire full-stack platform (Frontend + Backend) with a single command:

```bash
docker compose up --build
```
- UI available at: `http://localhost:3000`
- API Docs available at: `http://localhost:8000/docs`

### Option 2: Manual Local Setup

**Backend (Python)**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
python models.py           # Seed initial models
uvicorn main:app --reload --port 8000
```

**Frontend (Node)**
```bash
cd frontend
npm install
npm run dev
```

### Option 3: Hardware Firmware (Edge Deployment)

Once you export your `model.h` from the UI or API, deploy to your microcontroller:

```bash
cd firmware
# Copy your exported model.h to firmware/src/model.h
pio run -t upload
```

## License

MIT License. See `LICENSE`.

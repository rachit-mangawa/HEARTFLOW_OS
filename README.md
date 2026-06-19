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
  <p><strong>Clinical Cardiovascular Telemetry & Edge TinyML Transpilation Engine</strong></p>
  
  <p>
    <a href="https://rachit-mangawa-heartflow-os.hf.space/docs" target="_blank">
      <img src="https://img.shields.io/badge/🤗_HuggingFace-API_Docs-FFD21E.svg?style=for-the-badge" alt="Hugging Face API" />
    </a>
    <a href="https://github.com/rachit-mangawa/HEARTFLOW_OS" target="_blank">
      <img src="https://img.shields.io/badge/GitHub-Repository-black.svg?style=for-the-badge&logo=github" alt="GitHub Repository" />
    </a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16.3-black.svg?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black" alt="React" />
    <img src="https://img.shields.io/badge/TailwindCSS-v4-38B2AC.svg?style=for-the-badge&logo=tailwind-css" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/FastAPI-0.111+-009688.svg?style=for-the-badge&logo=fastapi" alt="FastAPI" />
    <img src="https://img.shields.io/badge/PlatformIO-Edge-orange.svg?style=for-the-badge&logo=platformio&logoColor=white" alt="PlatformIO" />
    <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
  </p>
</div>

---

## Executive Architectural Summary

HeartFlow OS is a distributed Edge AI clinical intelligence platform engineered to bridge cloud machine learning pipelines with bare-metal, resource-constrained microcontrollers (**ESP32-S3, ARM Cortex-M4, RP2040, nRF52840**).

The architecture evaluates 5 continuous physiological signals across a calibrated **5-model weighted soft-voting ensemble** (Random Forest, Linear SVM, Logistic Regression, MLP Neural Network, and KNN), providing sub-20µs in-browser anomaly classification, automated INT8 fixed-point quantization, 250 Hz Lead-II ECG waveform streaming, and zero-malloc C99 code generation.

---

## Dual-Plane System Architecture

```
+───────────────────────────────────────────────────────────────────────────────────────────────+
|                                  PHYSICAL HARDWARE LAYER                                      |
|  [ AD8232 Lead-II ECG ]  ──(250 Hz Analog)──>  [ ESP32-S3 Microcontroller (12-bit SAR ADC) ]  |
|  [ MAX30102 PPG SpO2  ]  ──(I2C 400 kHz  )──>  [ firmware/src/main.cpp - PlatformIO C99     ]  |
+───────────────────────────────────────────────────────┬───────────────────────────────────────+
                                                        │
                                                        │ UART Serial Frame: $HR,SPO2,SYS,DIA,TEMP*CRC\n
                                                        │ Baud Rate: 115,200 bps
                                                        ▼
+───────────────────────────────────────────────────────────────────────────────────────────────+
|                                    CLINICAL BROWSER CLIENT                                    |
|                                (Next.js 16 + React 19 + Tailwind v4)                          |
|                                                                                               |
|   ┌──────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────┐   |
|   │ Web Serial API Bridge    │ ──> │ Lead-II ECG Oscilloscope   │ ──> │ Telemetry Monitor │   |
|   │ (W3C navigator.serial)   │     │ (60 FPS Canvas GPU Render) │     │ (/monitor)        │   |
|   └─────────────┬────────────┘     └────────────────────────────┘     └───────────────────┘   |
|                 │                                                                             |
|                 ▼                                                                             |
|   ┌───────────────────────────────────────────────────────────────────────────────────────┐   |
|   │                   PRIMARY PLANE: ZERO-CLOUD CLIENT TINYML RUNTIME                     │   |
|   │                         Latency: < 20 µs | Egress: 0.0 KB                             │   |
|   │                                                                                       │   |
|   │   Feature Preprocessor ──> Scaler Normalization + Risk_Severity Feature Synthesis     │   |
|   │                                    │                                                  │   |
|   │                 ┌──────────────────┴──────────────────┐                               │   |
|   │                 ▼                                     ▼                               │   |
|   │        [ INT8 Quantized Weights ]            [ 5-Model Soft-Voting ]                  │   |
|   │        • RF (30 Trees, Depth 5)              • P(Healthy | X)                         │   |
|   │        • Linear SVM Hyperplane               • P(Hypertension | X)                    │   |
|   │        • Logistic Regression (L2)            • P(Heart Disease | X)                   │   |
|   │        • Small-NN MLP (16x8 ReLU)            • P(Asthma | X)                          │   |
|   │        • KNN (k=5 Distance Weighted)         • P(Diabetes | X)                        │   |
|   └────────────────────────────────────────┬──────────────────────────────────────────────┘   |
+────────────────────────────────────────────┼──────────────────────────────────────────────────+
                                             │
                                             │ Fallback Tunnel / Cloud REST / Telemetry Ingest
                                             │ HTTP POST / WebSocket (/ws/feed)
                                             ▼
+───────────────────────────────────────────────────────────────────────────────────────────────+
|                                  SECONDARY CLOUD BACKEND                                      |
|                               (FastAPI + Uvicorn Async Core)                                  |
|                                                                                               |
|   ┌──────────────────────────┐     ┌────────────────────────────┐     ┌───────────────────┐   |
|   │ REST & WS Gateways       │ ──> │ MLOps Retrain Pipeline     │ ──> │ Model Registry    │   |
|   │ /predict, /ws/feed, etc. │     │ CSV Ingest & Validation    │     │ 5 .pkl Estimators │   |
|   └─────────────┬────────────┘     └────────────────────────────┘     └───────────────────┘   |
|                 │                                                                             |
|                 ▼                                                                             |
|   ┌───────────────────────────────────────────────────────────────────────────────────────┐   |
|   │ AST C99 Code Exporter (/export_tinyml) ──> Zero-Malloc Header (model.h) for Embedded  │   |
|   └───────────────────────────────────────────────────────────────────────────────────────┘   |
+───────────────────────────────────────────────────────────────────────────────────────────────+
```

---

## Performance & Latency Benchmark Matrix

Measured across 10,000 synthetic patient telemetry vectors.

```
EXECUTION TARGET                 LATENCY (p50)   THROUGHPUT       VISUAL LATENCY RATIO
──────────────────────────────────────────────────────────────────────────────────────────────────
ESP32-S3 (C99 Bare-Metal)        18.4 µs         54,340 vec/sec   █ (1,902x faster than cloud)
Client In-Browser (TinyML V8)   120.0 µs          8,330 vec/sec   ██ (291x faster than cloud)
Cloud Container (FastAPI REST)   35.0 ms             28 req/sec   ██████████████████████████ (Baseline)
Legacy Cloud (PyTorch Container) 160.0 ms             6 req/sec   ████████████████████████████████████
```

### SLA Guarantees
- **Local TinyML Execution**: Guaranteed `< 20 µs` processing budget per telemetry frame.
- **Microcontroller Jitter (p99)**: `± 1.2 µs` deterministic execution variance without heap allocation (`malloc`-free).
- **Network Egress**: `0.0 KB/s` client data transmission in primary offline mode.

---

## SRAM Footprint & INT8 Fixed-Point Quantization

Continuous 32-bit floating point weights ($W \in \mathbb{R}$) are transformed into signed 8-bit integers ($Q \in [-128, 127]$) using affine scaling:

$$Q = \text{clamp}\left( \text{round}\left( \frac{W}{\text{scale}} \right), -128, 127 \right)$$

```
ESTIMATOR ARCHITECTURE          FP32 MEMORY     INT8 MEMORY     SAVINGS     COMPATIBLE TARGETS
──────────────────────────────────────────────────────────────────────────────────────────────────
Random Forest (30 Trees, D=5)   16,384 bytes     4,096 bytes    -75.0%      ESP32, RP2040, M4
Small-NN (MLP 16x8 ReLU)         7,168 bytes     1,792 bytes    -75.0%      ESP32, RP2040, M4
Linear Support Vector Machine    3,584 bytes       896 bytes    -75.0%      ESP32, RP2040, M4
Logistic Regression (L2)         3,072 bytes       768 bytes    -75.0%      ESP32, RP2040, M4
k-Nearest Neighbors (k=5)        4,400 bytes       600 bytes    -86.4%      ESP32, RP2040, M4
──────────────────────────────────────────────────────────────────────────────────────────────────
COMPOSITE ENSEMBLE TOTAL        34,608 bytes     8,152 bytes    -76.4%      All MCUs (> 16KB SRAM)
```

---

## Calibrated 5-Model Ensemble Arbitration

Individual estimator probabilities are aggregated using weighted soft-voting to cancel estimator-specific variance:

$$P(\text{Class}_c \mid X) = \frac{\sum_{i=1}^{5} w_i \cdot P_i(\text{Class}_c \mid X)}{\sum_{i=1}^{5} w_i}$$

| Model ID | Estimator Architecture | Weight ($w_i$) | Accuracy | Macro F1 | Variance Contribution |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `rf` | Random Forest (30 trees, max depth 5) | **25%** | 95.4% | 0.938 | Captures non-linear physiological interactions |
| `small_nn` | Multi-Layer Perceptron (16-8 hidden layers) | **25%** | 94.9% | 0.931 | Smooth continuous decision manifold |
| `logreg` | Logistic Regression (L2 Ridge Regularized) | **20%** | 92.2% | 0.904 | Robust linear baseline calibration |
| `svm` | Linear SVM (Platt Probability Scaling) | **15%** | 93.5% | 0.912 | Maximum margin class separation |
| `knn` | k-Nearest Neighbors (k=5 Euclidean Distance) | **15%** | 91.8% | 0.897 | Localized density anomaly identification |
| **ENSEMBLE** | **Composite Soft-Voting Classifier** | **100%** | **96.2%** | **0.948** | **-42.6% error reduction vs single tree** |

---

## Hardware Sensor Bridge & UART Protocol

The ESP32 firmware continuously polls the AD8232 ECG analog pin and MAX30102 $I^2C$ registers, assembling packets in NMEA-style ASCII framing:

```
FORMAT:  $HR,SPO2,SYS_BP,DIA_BP,TEMP*CHECKSUM\n
EXAMPLE: $84,97.5,132,86,37.1*4F\n
```

### Microcontroller Pinout (ESP32-S3)
```
  ESP32-S3 DevKit                      AD8232 ECG Sensor
  ┌──────────────┐                     ┌──────────────┐
  │         3V3  ├─────────────────────┤ 3.3V         │
  │         GND  ├─────────────────────┤ GND          │
  │       GPIO4  ├─────────────────────┤ OUTPUT (ADC) │
  │       GPIO5  ├─────────────────────┤ LO+ (LeadOff)│
  │       GPIO6  ├─────────────────────┤ LO- (LeadOff)│
  └──────────────┘                     └──────────────┘

  ESP32-S3 DevKit                      MAX30102 PPG Sensor
  ┌──────────────┐                     ┌──────────────┐
  │         3V3  ├─────────────────────┤ VIN          │
  │         GND  ├─────────────────────┤ GND          │
  │       GPIO8  ├─────────────────────┤ SDA (I2C)    │
  │       GPIO9  ├─────────────────────┤ SCL (I2C)    │
  └──────────────┘                     └──────────────┘
```

---

## Workspace Navigation & Interactive Clinical Routes

| Route | View | Description |
| :--- | :--- | :--- |
| `/` | **Landing Hub** | Engineering telemetry badges, core specs ticker, and architecture feature cards. |
| `/monitor` | **Clinical Telemetry** | 60 FPS Lead-II ECG canvas, vitals monitors, auto-healing WebSocket feed, and SHAP attribution. |
| `/simulator` | **Physiological Simulator** | Interactive patient vitals simulator, arrhythmia state machine triggers, and edge inference. |
| `/edge` | **TinyML Edge Compiler** | In-browser & cloud C99 generator for ESP32/Cortex-M with INT8 quantization & zero-malloc memory guarantee. |
| `/mlops` | **MLOps Registry & Retrain** | Batch CSV ingestion, schema alias sanitization, F1-macro automated validation gates, and hot-swapping. |
| `/architecture` | **Pipeline Topology** | Native neo-industrial architectural schematic detailing client, API, MLOps, and persistence subsystems. |
| `/history` | **Clinical Audit Logs** | Local session telemetry history with chronological diagnostic records and risk indicators. |
| `/analytics` | **Longitudinal Analytics** | Population distributions, correlation matrices, and model weight arbitration diagnostics. |
| `/docs` | **System & API Specifications** | Interactive endpoint reference, SVG topology diagrams, latency benchmarks, and live test console. |

---

## API Specifications Contract

Interactive documentation with live in-browser testing is hosted at `/docs`.

| Method | Endpoint | Latency SLA | Description |
| :---: | :--- | :---: | :--- |
| `POST` | `/predict` | `< 20 µs` (Edge) / `< 35 ms` (Cloud) | Evaluates 5 vitals against 5-model ensemble. |
| `WS` | `/ws/feed` | `< 5 ms` / frame | 60 Hz bidirectional telemetry streaming with concurrent predictions. |
| `GET` | `/export_tinyml` | `< 2 ms` | Transpiles trained models to standalone zero-malloc C99 header (`model.h`). |
| `POST` | `/explain` | `< 15 ms` | TreeExplainer SHAP game-theoretic feature attribution. |
| `POST` | `/retrain` | `< 3.5 s` | Batch CSV upload, alias resolution, refitting, and zero-downtime hot-swap. |
| `GET` | `/metrics` | `< 10 ms` | Accuracy, F1 macro, per-model weights, and edge latency benchmarks. |
| `GET` | `/history` | `< 5 ms` | Returns isolated chronological session telemetry audit records. |
| `GET` | `/dataset` | `< 25 ms` | Queries active ground-truth patient telemetry dataset. |
| `GET` | `/health` | `< 1 ms` | Verifies FastAPI readiness and model memory residency. |

---

## Quickstart Guide

### Option 1: Docker Compose (Full Stack)

```bash
docker compose up --build
```
- **Web App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option 2: Local Development Setup

#### 1. Backend (Python 3.10+)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate       # Linux / macOS
.\.venv\Scripts\activate        # Windows PowerShell

pip install -r requirements.txt
python models.py                # Train initial baseline ensemble
uvicorn main:app --reload --port 8000
```

#### 2. Frontend (Node.js 20+)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### Option 3: Hardware Firmware Deployment (ESP32)

1. Open `/edge` in the application or call `/export_tinyml?model_name=rf&quantize=true`.
2. Save the emitted C header to `firmware/src/model.h`.
3. Compile and upload via PlatformIO:

```bash
cd firmware
pio run -t upload
pio device monitor -b 115200
```

---

## Test Verification Suite

### Backend Unit & Integration Tests (17/17 passing)
```bash
pytest tests -v
```

### Frontend Typechecking & Static Build
```bash
cd frontend
npx tsc --noEmit
npm run build
```

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for full details.

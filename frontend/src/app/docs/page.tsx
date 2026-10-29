"use client";

import { API_BASE } from "@/config";

import { useState } from "react";
import {
  Cpu,
  Gauge,
  Terminal,
  Radio,
  ShieldCheck,
  Shield,
  Binary,
  Server,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import MermaidChart from "@/components/MermaidChart";

const MERMAID_API_ARCHITECTURE = `flowchart LR
    subgraph CLIENT["CLINICAL CONSUMERS"]
        direction TB
        BROWSER["In-Browser TinyML Client"]
        ESP["ESP32-S3 Firmware (UART)"]
        SCRIPT["External Automation (cURL/Python)"]
    end

    subgraph GATEWAY["API & TELEMETRY PROTOCOL GATEWAY"]
        direction TB
        REST["REST API Gateway (/predict, /explain, /dataset)"]
        WS["Real-Time WebSocket Feed (/ws/feed)"]
        EXPORT["TinyML C99 AST Exporter (/export_tinyml)"]
        RETRAIN["Async MLOps Pipeline (/retrain)"]
    end

    subgraph CORE["HEARTFLOW_OS CORE ENGINES"]
        direction TB
        ENS["5-Model Soft-Voting Ensemble (RF, SVM, MLP, LogReg, KNN)"]
        SHAP["SHAP Attribution Engine (TreeExplainer)"]
        REG["Model Registry & Hot-Swap Storage"]
        DATA["60k Observation Corpus & Analytics Profiler"]
    end

    BROWSER -->|"POST /predict"| REST
    BROWSER -->|"POST /explain"| REST
    BROWSER <-->|"WSS Stream"| WS
    ESP -->|"UART Serial Bus"| BROWSER
    SCRIPT -->|"GET /export_tinyml"| EXPORT
    SCRIPT -->|"POST /retrain"| RETRAIN

    REST --> ENS
    REST --> SHAP
    REST --> DATA
    EXPORT --> REG
    RETRAIN --> REG
    WS --> ENS

    classDef client fill:#EFF6FF,stroke:#2563EB,stroke-width:1.5px,color:#1E3A8A;
    classDef gateway fill:#FBFBFA,stroke:#141413,stroke-width:1.5px,color:#141413;
    classDef core fill:#F0FDF4,stroke:#16A34A,stroke-width:1.5px,color:#14532D;

    class BROWSER,ESP,SCRIPT client;
    class REST,WS,EXPORT,RETRAIN gateway;
    class ENS,SHAP,REG,DATA core;`;

interface EndpointDoc {
  id: string;
  method: "POST" | "GET" | "WS";
  path: string;
  title: string;
  description: string;
  latency: string;
  category: "Inference" | "MLOps" | "Hardware" | "System";
  curl: string;
  python: string;
  typescript: string;
  requestBody?: object;
  responseBody: object;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "predict",
    method: "POST",
    path: "/predict",
    title: "Cardiovascular Risk Ensemble Inference",
    description: "Evaluates vital signs against the 5-model ensemble to predict cardiovascular risk and class probabilities.",
    latency: "< 20µs (In-Browser / MCU) | < 35ms (Cloud REST)",
    category: "Inference",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "Heart_Rate": 84,
    "SpO2_Level": 97.5,
    "Systolic_BP": 132,
    "Diastolic_BP": 86,
    "Body_Temp": 37.1
  }'`,
    python: `import requests

payload = {
    "Heart_Rate": 84,
    "SpO2_Level": 97.5,
    "Systolic_BP": 132,
    "Diastolic_BP": 86,
    "Body_Temp": 37.1
}

res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/predict", json=payload)
data = res.json()
print("Diagnosis:", data["prediction_label"])
print("Confidence:", data["probability"])`,
    typescript: `import { evaluateEdge } from "@/lib/edge/inference";

const result = evaluateEdge({
  Heart_Rate: 84,
  SpO2_Level: 97.5,
  Systolic_BP: 132,
  Diastolic_BP: 86,
  Body_Temp: 37.1
});

console.log(result.label, result.confidence, result.disease_probs);`,
    requestBody: {
      Heart_Rate: 84,
      SpO2_Level: 97.5,
      Systolic_BP: 132,
      Diastolic_BP: 86,
      Body_Temp: 37.1
    },
    responseBody: {
      prediction: false,
      prediction_label: "Healthy",
      probability: 0.942,
      disease_probs: {
        Healthy: 0.942,
        Hypertension: 0.038,
        Diabetes: 0.012,
        Asthma: 0.005,
        "Heart Attack Risk": 0.003
      },
      model_outputs: {
        rf: "Healthy",
        svm: "Healthy",
        knn: "Healthy",
        logreg: "Healthy",
        small_nn: "Healthy"
      },
      weights: {
        rf: 0.25,
        small_nn: 0.25,
        logreg: 0.20,
        knn: 0.15,
        svm: 0.15
      }
    }
  },
  {
    id: "history",
    method: "GET",
    path: "/history",
    title: "Session Audit & Telemetry Log",
    description: "Returns recent evaluation records recorded during the active session from browser storage.",
    latency: "< 5ms",
    category: "System",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/history?limit=10" \\
  -H "Accept: application/json"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/history?limit=10")
records = res.json()
print(f"Retrieved {len(records)} audit entries")`,
    typescript: `import { getSessionHistory } from "@/lib/edge/history";

const sessionAudit = getSessionHistory();
console.log("Active records:", sessionAudit.length);`,
    responseBody: [
      {
        id: 1715423812000,
        timestamp: "2026-10-18 12:45:10",
        heart_rate: 84,
        spo2: 97.5,
        sys_bp: 132,
        dia_bp: 86,
        body_temp: 37.1,
        prediction_label: "Healthy",
        confidence: 0.942,
        is_at_risk: false
      }
    ]
  },
  {
    id: "export",
    method: "GET",
    path: "/export_tinyml?model_name={rf|svm|knn|logreg|small_nn}",
    title: "TinyML C99 Header Transpiler",
    description: "Generates a standalone C99 header (model.h) containing model weights and decision logic without dynamic memory allocation.",
    latency: "< 2ms (In-Browser transpiler)",
    category: "Hardware",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/export_tinyml?model_name=rf" \\
  -H "Accept: application/json"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/export_tinyml?model_name=rf")
c_source = res.json()["code"]

with open("model_rf.h", "w") as f:
    f.write(c_source)
print("Saved standalone C header model_rf.h")`,
    typescript: `import { generateCHeader } from "@/lib/edge/c_exporter";

const cCode = generateCHeader("rf", false);
console.log("C header size:", cCode.length, "bytes");`,
    responseBody: {
      model_name: "rf",
      architecture: "RandomForestClassifier",
      memory_footprint_bytes: 4096,
      quantization: "INT8",
      code: "#ifndef MODEL_RF_H\n#define MODEL_RF_H\n\n/* HeartFlow OS TinyML Transpiled Header */\nint predict(const float* features);\n\n#endif"
    }
  },
  {
    id: "metrics",
    method: "GET",
    path: "/metrics",
    title: "Ensemble Performance & Quantization Diagnostics",
    description: "Returns accuracy, F1 scores, and weights for each model in the ensemble.",
    latency: "< 10ms",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/metrics"`,
    python: `import requests

metrics = requests.get("https://idkhowtocodefr-hf-backend.hf.space/metrics").json()
print("Ensemble Accuracy:", metrics["ensemble_accuracy"])`,
    typescript: `// Client-side benchmarks available via MLOps metrics module`,
    responseBody: {
      ensemble_accuracy: 0.962,
      ensemble_f1_macro: 0.948,
      latency_microsec_edge: 18.4,
      models: {
        rf: { accuracy: 0.954, f1: 0.938, weight: 0.25 },
        small_nn: { accuracy: 0.949, f1: 0.931, weight: 0.25 },
        logreg: { accuracy: 0.922, f1: 0.904, weight: 0.20 },
        knn: { accuracy: 0.918, f1: 0.897, weight: 0.15 },
        svm: { accuracy: 0.935, f1: 0.912, weight: 0.15 }
      }
    }
  },
  {
    id: "retrain",
    method: "POST",
    path: "/retrain",
    title: "MLOps Batch Telemetry Retraining",
    description: "Accepts a CSV batch of patient records, maps headers to standard columns, re-fits the ensemble models, and saves updated weights.",
    latency: "< 3.5s (Full Ensemble Re-fitting)",
    category: "MLOps",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/retrain" \\
  -F "file=@patient_dataset_verified_batch.csv"`,
    python: `import requests

with open("patient_dataset_verified_batch.csv", "rb") as f:
    res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/retrain", files={"file": f})
print(res.json()["message"])`,
    typescript: `// Triggered via MLOps workspace in frontend/src/app/mlops/page.tsx
const formData = new FormData();
formData.append("file", csvFile);

const res = await fetch("https://idkhowtocodefr-hf-backend.hf.space/retrain", {
  method: "POST",
  body: formData,
});
const data = await res.json();
console.log(data.message);`,
    requestBody: {
      content_type: "multipart/form-data",
      file_field: "file (CSV batch <= 50MB)",
      required_vitals: [
        "Heart Rate",
        "SpO2 Level",
        "Systolic BP",
        "Diastolic BP",
        "Body Temperature"
      ],
      accepted_header_aliases: {
        Heart_Rate: "HR, hr, heart_rate, Heart Rate (bpm)",
        SpO2_Level: "SpO2, spo2, oxygen, SpO2 Level (%)",
        Systolic_BP: "sys, sys_bp, Systolic Blood Pressure (mmHg)",
        Diastolic_BP: "dia, dia_bp, Diastolic Blood Pressure (mmHg)",
        Body_Temp: "temp, temperature, Body Temperature (°C)"
      }
    },
    responseBody: {
      status: "success",
      message: "Dataset successfully updated (60010 total observations) and ensemble hot-swapped."
    }
  },
  {
    id: "retrain_status",
    method: "GET",
    path: "/retrain/status",
    title: "MLOps Ingestion Telemetry & Progress Polling",
    description: "Returns real-time progress percentage, current training stage, active model fitting status, per-model F1 scores, and hot-swap completion status.",
    latency: "< 5ms (In-Memory Atomic Status Read)",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/retrain/status" \\
  -H "Accept: application/json"`,
    python: `import requests
import time

while True:
    status = requests.get("https://idkhowtocodefr-hf-backend.hf.space/retrain/status").json()
    print(f"[{status['stage']}] {status['progress']}% - {status['current_step']}")
    if status["status"] in ("complete", "error"):
        break
    time.sleep(0.7)`,
    typescript: `// Polled every 700ms during retraining in /mlops
const res = await fetch("/heartflow/retrain/status");
const telemetry = await res.json();
console.log(\`Stage: \${telemetry.stage}, Progress: \${telemetry.progress}%\`);`,
    responseBody: {
      status: "training",
      progress: 68,
      stage: "training_mlp",
      current_step: "Fitting Multi-Layer Perceptron (16-8 ReLU) with early stopping...",
      current_model: "small_nn",
      models_trained: ["rf", "svm", "logreg"],
      total_models: 5,
      f1_scores: {
        rf: 0.941,
        svm: 0.928,
        logreg: 0.908
      },
      active_version: "v1",
      observations_count: 60250,
      message: "Retraining ensemble in progress",
      error: null,
      started_at: 1715423800.12,
      completed_at: null
    }
  },
  {
    id: "health",
    method: "GET",
    path: "/health",
    title: "System Health & Model Engine Readiness Status",
    description: "Reports backend operational status and whether ensemble models are loaded.",
    latency: "< 1ms",
    category: "System",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/health"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/health")
print("Engine Status:", res.json()["status"])`,
    typescript: `const res = await fetch("https://idkhowtocodefr-hf-backend.hf.space/health");
const data = await res.json();
console.log("Status:", data.status);`,
    responseBody: {
      status: "Healthy"
    }
  },
  {
    id: "dataset_summary",
    method: "GET",
    path: "/dataset/summary",
    title: "Statistical Profiling & Telemetry Summary",
    description: "Returns summary statistics, feature distributions, and correlation values for the 60,000-record dataset in a compact payload.",
    latency: "< 5ms (Cached Profiler)",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/dataset/summary"`,
    python: `import requests

profile = requests.get("https://idkhowtocodefr-hf-backend.hf.space/dataset/summary").json()
print("Total Records:", profile["summary"]["total_records"])
print("Pearson Matrix:", len(profile["correlation_matrix"]["matrix"]))`,
    typescript: `import { DATASET_PROFILE } from "@/lib/edge/dataset-profile";

// Available via zero-cloud edge or cloud summary API
console.log("Features:", DATASET_PROFILE.summary.total_features);`,
    responseBody: {
      summary: {
        total_records: 60000,
        total_features: 13,
        completeness_pct: 100.0
      },
      target_distribution: [
        { disease: "Healthy", count: 12000, percentage: 20.0 },
        { disease: "Heart Disease", count: 12000, percentage: 20.0 }
      ],
      alert_prevalence: [
        { name: "Heart Rate Alert", abnormal_count: 32665, abnormal_pct: 54.4 }
      ]
    }
  },
  {
    id: "dataset",
    method: "GET",
    path: "/dataset?page={page}&limit={limit}&disease={disease}&search={search}",
    title: "Paginated Clinical Telemetry Record Inspector",
    description: "Returns paginated rows from the 60,000-record telemetry dataset, with optional search and diagnosis filtering.",
    latency: "< 5ms (Server Windowed Query)",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/dataset?page=1&limit=25&disease=Heart%20Disease"`,
    python: `import requests

params = {"page": 1, "limit": 25, "disease": "Heart Disease"}
res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/dataset", params=params).json()
print(f"Page {res.get('page', 1)}: {len(res.get('rows', []))} rows")`,
    typescript: `const res = await fetch("https://idkhowtocodefr-hf-backend.hf.space/dataset?page=1&limit=25");
const data = await res.json();
console.log("Rows fetched:", data.rows?.length || data.length);`,
    responseBody: {
      page: 1,
      limit: 25,
      total: 60000,
      rows: [
        {
          "Patient Number": "1001",
          "Heart Rate (bpm)": 84,
          "SpO2 Level (%)": 97.5,
          "Systolic Blood Pressure (mmHg)": 132,
          "Diastolic Blood Pressure (mmHg)": 86,
          "Body Temperature (°C)": 37.1,
          "Predicted Disease": "Healthy",
          "Heart Rate Alert": "Normal",
          "Blood Pressure Alert": "Normal"
        }
      ]
    }
  },
  {
    id: "explain",
    method: "POST",
    path: "/explain",
    title: "SHAP Tree Feature Attribution & Explainability",
    description: "Calculates SHAP values for the random forest model to show how each vital sign influenced the prediction.",
    latency: "< 15ms",
    category: "Inference",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/explain" \\
  -H "Content-Type: application/json" \\
  -d '{
    "Heart_Rate": 115,
    "SpO2_Level": 88.0,
    "Systolic_BP": 165,
    "Diastolic_BP": 105,
    "Body_Temp": 38.5
  }'`,
    python: `import requests

payload = {
    "Heart_Rate": 115,
    "SpO2_Level": 88.0,
    "Systolic_BP": 165,
    "Diastolic_BP": 105,
    "Body_Temp": 38.5
}
res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/explain", json=payload)
print("SHAP Attribution:", res.json())`,
    typescript: `import { calculateShap } from "@/lib/edge/explain";

const attribution = calculateShap({
  Heart_Rate: 115,
  SpO2_Level: 88.0,
  Systolic_BP: 165,
  Diastolic_BP: 105,
  Body_Temp: 38.5
});
console.log(attribution);`,
    requestBody: {
      Heart_Rate: 115,
      SpO2_Level: 88.0,
      Systolic_BP: 165,
      Diastolic_BP: 105,
      Body_Temp: 38.5
    },
    responseBody: {
      shap_values: [0.38, 0.42, 0.35, 0.22, 0.18],
      feature_names: ["Heart_Rate", "SpO2_Level", "Systolic_BP", "Diastolic_BP", "Body_Temp"]
    }
  },
  {
    id: "ws_feed",
    method: "WS",
    path: "/ws/feed",
    title: "Live Physiological Telemetry WebSocket Stream",
    description: "Streams continuous patient vitals and real-time ensemble predictions over WebSocket.",
    latency: "< 5ms (Streaming WebSocket Frame)",
    category: "Hardware",
    curl: `wscat -c "wss://idkhowtocodefr-hf-backend.hf.space/ws/feed"`,
    python: `import asyncio
import websockets
import json

async def stream():
    async with websockets.connect("wss://idkhowtocodefr-hf-backend.hf.space/ws/feed") as ws:
        async for msg in ws:
            packet = json.loads(msg)
            print(packet["sensor_data"], packet["prediction"])

asyncio.run(stream())`,
    typescript: `const socket = new WebSocket("wss://idkhowtocodefr-hf-backend.hf.space/ws/feed");
socket.onmessage = (event) => {
  const packet = JSON.parse(event.data);
  console.log("Telemetry Frame:", packet);
};`,
    responseBody: {
      sensor_data: {
        Heart_Rate: 78.4,
        SpO2_Level: 98.2,
        Systolic_BP: 122.1,
        Diastolic_BP: 80.5,
        Body_Temp: 36.9
      },
      prediction: {
        is_at_risk: 0,
        label: "Healthy",
        confidence: 0.952,
        disease_probs: {
          Healthy: 0.952,
          Hypertension: 0.024,
          Diabetes: 0.012,
          Asthma: 0.008,
          "Heart Attack Risk": 0.004
        }
      }
    }
  }
];

export default function ApiDocs() {
  const [selectedLang, setSelectedLang] = useState<"curl" | "python" | "typescript">("curl");
  const [methodFilter, setMethodFilter] = useState<"ALL" | "POST" | "GET" | "WS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEndpoints = ENDPOINTS.filter((ep) => {
    const matchesMethod = methodFilter === "ALL" || ep.method === methodFilter;
    const matchesSearch =
      ep.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ep.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesSearch;
  });

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col animate-enter-subtle">
        {/* Monolithic Swiss Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
              API REFERENCE &amp; PROTOCOL SPECIFICATION
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9]">
              API REFERENCE<br />&amp; ENDPOINTS
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-800 bg-emerald-50 text-emerald-900 text-[11px] font-bold shadow-[1px_1px_0px_#065f46]">
                <ShieldCheck size={13} className="text-emerald-700" />
                <span>58/58 VERIFIED</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-800 bg-blue-50 text-blue-900 text-[11px] font-bold shadow-[1px_1px_0px_#1e3a8a]">
                <Shield size={13} className="text-blue-700" />
                <span>MISRA-C:2012 ABI</span>
              </span>
              {process.env.NODE_ENV === "development" && (
                <a
                  href={`${API_BASE}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1 rounded-full bg-white text-ink hover:bg-hazard hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Swagger Docs ↗</span>
                </a>
              )}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3.5 py-1.5 bg-ink text-white rounded-full flex items-center gap-2 shadow-[2px_2px_0px_#141413]">
              <ShieldCheck size={14} className="text-hazard" />
              <span>SPECIFICATION · REVISION 3.4</span>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              In-browser evaluation, C99 export, and cloud REST endpoints.
            </div>
          </div>
        </header>

        {/* Interactive Clinical Workspace Directory */}
        <div className="border-2 border-ink bg-white p-4 mb-8 shadow-[3px_3px_0px_#141413]">
          <div className="text-[11px] font-bold text-slate uppercase tracking-widest mb-3 flex items-center justify-between border-b border-ink/20 pb-2">
            <span className="flex items-center gap-2 text-ink">
              <ShieldCheck size={14} className="text-hazard" />
              <span>LIVE APPLICATION DIRECTORY &amp; INTERACTIVE WORKSPACES</span>
            </span>
            <span className="text-[10px] text-slate font-bold uppercase">8 Live Routes</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { name: "Simulator", href: "/simulator", desc: "Vitals & drift physics" },
              { name: "MLOps", href: "/mlops", desc: "Retrain & batch ingest" },
              { name: "Monitor", href: "/monitor", desc: "60 FPS ECG telemetry" },
              { name: "Dataset", href: "/dataset", desc: "60k cohort explorer" },
              { name: "Edge C99", href: "/edge", desc: "Bare-metal code exporter" },
              { name: "Analytics", href: "/analytics", desc: "Correlations & weights" },
              { name: "History", href: "/history", desc: "Local session audit log" },
              { name: "Topology", href: "/architecture", desc: "Dual-plane system map" },
            ].map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="btn-tactile p-2.5 border border-ink/40 hover:border-ink bg-canvas-cream hover:bg-hazard hover:text-white transition-colors group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider">{route.name}</span>
                  <ArrowRight size={11} className="text-slate group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </div>
                <div className="text-[9px] text-slate group-hover:text-white/80 font-bold uppercase truncate mt-1">
                  {route.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Global API Gateway KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink border-2 border-ink mb-8 shadow-[4px_4px_0px_0px_#141413]">
          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[10px] text-slate font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <Cpu size={13} className="text-hazard" />
              <span>PRIMARY EDGE SLA</span>
            </div>
            <div className="text-[26px] font-black text-ink tracking-tight tabular-nums">
              &lt; 20 <span className="text-[14px] font-bold text-hazard">µs</span>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase mt-2">
              In-Browser TinyML &amp; ESP32 C99
            </div>
          </div>

          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[10px] text-slate font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <Server size={13} className="text-hazard" />
              <span>CLOUD REST FALLBACK</span>
            </div>
            <div className="text-[26px] font-black text-ink tracking-tight tabular-nums">
              &lt; 35 <span className="text-[14px] font-bold text-hazard">ms</span>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase mt-2">
              FastAPI Uvicorn Async Gateway
            </div>
          </div>

          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[10px] text-slate font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <Gauge size={13} className="text-hazard" />
              <span>ACTIVE ENDPOINTS</span>
            </div>
            <div className="text-[26px] font-black text-ink tracking-tight tabular-nums">
              {ENDPOINTS.length} <span className="text-[14px] font-bold text-emerald-600">PRODUCTION</span>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase mt-2">
              REST, WebSocket, C99 Transpiler
            </div>
          </div>

          <div className="bg-white p-5 flex flex-col justify-between">
            <div className="text-[10px] text-slate font-bold tracking-widest uppercase mb-1 flex items-center gap-1.5">
              <Radio size={13} className="text-hazard" />
              <span>SERIAL SAMPLING</span>
            </div>
            <div className="text-[26px] font-black text-ink tracking-tight tabular-nums">
              250 <span className="text-[14px] font-bold text-hazard">HZ</span>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase mt-2">
              115.2 kBaud UART Binary Frame
            </div>
          </div>
        </div>

        {/* API REFERENCE CONTENT */}
        <div className="flex flex-col gap-8">
            {/* Base URLs & Protocols Specification */}
            <div className="crosshair-corner border-2 border-ink bg-white p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink/20 pb-6 md:pb-0 md:pr-6">
                <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Server size={14} />
                  <span>01 // SERVICE ARCHITECTURE</span>
                </div>
                <p className="text-[12px] text-slate leading-relaxed mb-3">
                  Inference runs in the browser by default, with an optional remote service for cloud and batch evaluation.
                </p>
                <div className="bg-canvas-cream border border-ink p-2 text-[11px] font-bold break-all text-ink">
                  https://idkhowtocodefr-hf-backend.hf.space
                </div>
                <div className="mt-2 text-[11px] text-slate font-bold flex flex-col gap-1">
                  <div>
                    REMOTE SERVICE: Cloud REST &amp; WebSocket gateway
                  </div>
                  <div>
                    LOCAL ENGINE: In-Browser TinyML evaluator
                  </div>
                </div>
              </div>

              <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink/20 pb-6 md:pb-0 md:pr-6">
                <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>02 // PRIVACY &amp; SESSIONS</span>
                </div>
                <p className="text-[12px] text-slate leading-relaxed mb-3">
                  Telemetry stays on the client during normal use. Session logs are kept in browser memory and are not sent to any database without a manual retrain upload.
                </p>
                <div className="bg-canvas-cream border border-ink p-2 text-[11px] font-bold text-slate">
                  OPTIONAL: X-HeartFlow-Client header
                </div>
                <div className="mt-2 text-[11px] text-slate font-bold">
                  CORS: Allowed for web clients and hardware bridges
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Binary size={14} />
                  <span>03 // CONTRACTS &amp; CODE GENERATION</span>
                </div>
                <p className="text-[12px] text-slate leading-relaxed mb-3">
                  Endpoints accept and return JSON. Generated C files use standard C99 without malloc calls, making them suitable for microcontrollers.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">INT8_QUANT</span>
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">FLOAT32</span>
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">ZERO_MALLOC</span>
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">C99_ABI</span>
                </div>
              </div>
            </div>

            {/* Architectural Pipeline Topology Flowchart */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-black uppercase tracking-wider text-ink flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-hazard inline-block" />
                  <span>SERVICE &amp; TELEMETRY PROTOCOL ARCHITECTURE</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate bg-white border border-ink/40 px-2 py-0.5">
                  VECTOR FLOWCHART (SVG)
                </span>
              </div>
              <MermaidChart
                chart={MERMAID_API_ARCHITECTURE}
                title="HEARTFLOW_OS TELEMETRY &amp; API SERVICE TOPOLOGY"
              />
            </div>

            {/* Filter & Syntax Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-2 border-ink bg-white p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate">FILTER:</span>
                {(["ALL", "POST", "GET", "WS"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethodFilter(m)}
                    className={`px-3 py-1 text-[11px] font-bold border-2 transition-colors ${
                      methodFilter === m
                        ? "bg-ink text-white border-ink"
                        : "bg-canvas-cream text-ink border-ink/30 hover:border-ink"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="SEARCH ENDPOINTS (/predict, C99, etc.)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 border-2 border-ink text-[11px] font-bold bg-canvas-cream uppercase tracking-wider focus:outline-none focus:bg-white w-full sm:w-64"
                />

                <div className="flex gap-1 border-l-2 border-ink/20 pl-3">
                  {(["curl", "python", "typescript"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`border-2 px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-colors ${
                        selectedLang === lang
                          ? "bg-hazard text-white border-hazard"
                          : "bg-white text-ink border-ink/40 hover:border-ink"
                      }`}
                    >
                      {lang === "curl" ? "cURL" : lang === "python" ? "Python" : "TS"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Endpoints Feed */}
            <div className="flex flex-col gap-8">
              {filteredEndpoints.map((endpoint) => (
                <section
                  key={endpoint.id}
                  id={endpoint.id}
                  className="crosshair-corner border-2 border-ink bg-white flex flex-col"
                >
                  {/* Endpoint Header Bar */}
                  <div className="border-b-2 border-ink p-4 md:p-5 bg-canvas-cream flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`px-3 py-1 text-[12px] font-black uppercase tracking-wider border-2 border-ink ${
                          endpoint.method === "POST"
                            ? "bg-hazard text-white"
                            : endpoint.method === "WS"
                            ? "bg-[#1E3A8A] text-white"
                            : "bg-ink text-white"
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="text-[15px] md:text-[17px] font-black text-ink">
                        {endpoint.path}
                      </code>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-ink px-2 py-0.5 text-slate">
                        {endpoint.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-bold text-slate uppercase tracking-wider border border-ink/40 px-3 py-1 bg-white">
                        LATENCY: <span className="text-ink font-black">{endpoint.latency}</span>
                      </span>
                    </div>
                  </div>

                  {/* Endpoint Details */}
                  <div className="p-6 md:p-8 flex flex-col gap-6">
                    <div>
                      <h3 className="text-[18px] font-black uppercase tracking-tight text-ink mb-2">
                        {endpoint.title}
                      </h3>
                      <p className="text-[13px] text-slate leading-relaxed">
                        {endpoint.description}
                      </p>
                    </div>

                    {/* Interactive Code Snippet */}
                    <div className="border-2 border-ink bg-ink text-white">
                      <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-white/20">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-hazard flex items-center gap-1.5">
                          <Terminal size={12} />
                          <span>REQUEST_SNIPPET // {selectedLang.toUpperCase()}</span>
                        </span>
                        <button
                          onClick={() => handleCopy(endpoint.id, endpoint[selectedLang])}
                          className="text-[11px] font-bold uppercase tracking-wider text-canvas-cream hover:text-hazard transition-colors cursor-pointer"
                        >
                          {copiedId === endpoint.id ? "[✓ COPIED TO CLIPBOARD]" : "[COPY_CODE]"}
                        </button>
                      </div>
                      <pre className="p-4 text-[12px] md:text-[13px] font-mono leading-relaxed selection:bg-hazard selection:text-white whitespace-pre-wrap wrap-break-word">
                        <code>{endpoint[selectedLang]}</code>
                      </pre>
                    </div>

                    {/* Linear Stack: Request Payload Contract first, then Response Contract (Zero Horizontal Scrolling) */}
                    <div className="flex flex-col gap-4 mt-1">
                      {endpoint.requestBody && (
                        <div className="flex flex-col border-2 border-ink bg-canvas-cream shadow-[2px_2px_0px_#141413]">
                          <div className="border-b-2 border-ink p-3 bg-white text-[12px] font-bold uppercase tracking-widest text-ink flex items-center justify-between">
                            <span>Request Payload Contract</span>
                            <span className="text-slate font-bold text-[10px] bg-canvas-cream border border-ink/30 px-2 py-0.5">
                              {endpoint.id === "retrain" ? "multipart/form-data" : "application/json"}
                            </span>
                          </div>
                          <pre className="p-4 text-[12px] text-ink font-mono font-bold leading-relaxed whitespace-pre-wrap wrap-break-word">
                            <code>{JSON.stringify(endpoint.requestBody, null, 2)}</code>
                          </pre>
                        </div>
                      )}

                      <div className="flex flex-col border-2 border-ink bg-canvas-cream shadow-[2px_2px_0px_#141413]">
                        <div className="border-b-2 border-ink p-3 bg-white text-[12px] font-bold uppercase tracking-widest text-ink flex justify-between items-center">
                          <span>Response Contract (200 OK)</span>
                          <span className="text-hazard font-bold text-[11px]">application/json</span>
                        </div>
                        <pre className="p-4 text-[12px] text-ink font-mono font-bold leading-relaxed whitespace-pre-wrap wrap-break-word">
                          <code>{JSON.stringify(endpoint.responseBody, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

          </div>
        </div>
      </main>
    );
}

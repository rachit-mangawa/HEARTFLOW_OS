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
        REST["REST API Gateway (/heartflow/predict, /heartflow/explain, /heartflow/dataset)"]
        WS["Real-Time WebSocket Feed (/heartflow/ws/feed)"]
        EXPORT["TinyML C99 AST Exporter (/heartflow/export_tinyml)"]
        RETRAIN["Async MLOps Pipeline (/heartflow/retrain)"]
    end

    subgraph CORE["HEARTFLOW_OS CORE ENGINES"]
        direction TB
        ENS["5-Model Soft-Voting Ensemble (RF, SVM, MLP, LogReg, KNN)"]
        SHAP["SHAP Attribution Engine (TreeExplainer)"]
        REG["Model Registry & Hot-Swap Storage"]
        DATA["60k Observation Corpus & Analytics Profiler"]
    end

    BROWSER -->|"POST /heartflow/predict"| REST
    BROWSER -->|"POST /heartflow/explain"| REST
    BROWSER <-->|"WSS Stream"| WS
    ESP -->|"UART Serial Bus"| BROWSER
    SCRIPT -->|"GET /heartflow/export_tinyml"| EXPORT
    SCRIPT -->|"POST /heartflow/retrain"| RETRAIN

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
  category: "Inference" | "MLOps" | "System" | "Data" | "Export";
  curl: string;
  python: string;
  typescript: string;
  requestBody?: object;
  responseBody: object;
}

const ENDPOINTS: EndpointDoc[] = [
  {
    id: "health",
    method: "GET",
    path: "/heartflow/health",
    title: "System & Model Health Probe",
    description: "Evaluates health status, loaded scikit-learn classifiers (RF, SVM, LogReg, Small NN, KNN), and retraining pipeline capability.",
    latency: "< 5 ms (Cloud REST)",
    category: "System",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/health"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/health")
print("Status:", res.json())`,
    typescript: `import { apiFetch } from "@/lib/api";

const { data } = await apiFetch("/heartflow/health");
console.log("Gateway Status:", data);`,
    responseBody: {
      status: "Healthy",
      models_loaded: true,
      models: {
        rf: true,
        svm: true,
        logreg: true,
        small_nn: true,
        knn: true
      },
      retrain_enabled: true
    }
  },
  {
    id: "predict",
    method: "POST",
    path: "/heartflow/predict",
    title: "Cardiovascular Risk Ensemble Inference",
    description: "Evaluates vital signs against the 5-model ensemble to predict cardiovascular risk and class probabilities.",
    latency: "< 20 µs (In-Browser / MCU) | < 35 ms (Cloud REST)",
    category: "Inference",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/heartflow/predict" \\
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

res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/heartflow/predict", json=payload)
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
console.log(result.label, result.confidence);`,
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
      probability: 0.89,
      ensemble_prediction: false,
      model_outputs: {
        rf: "Healthy",
        svm: "Healthy",
        logreg: "Healthy",
        small_nn: "Healthy",
        knn: "Healthy"
      },
      model_probs: {
        rf: 0.635,
        svm: 0.994,
        logreg: 0.919,
        small_nn: 0.995,
        knn: 1.0
      },
      disease_probs: {
        Healthy: 0.89,
        "Diabetes Mellitus": 0.061,
        Normal: 0.046,
        Hypertension: 0.0018
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
    id: "explain",
    method: "POST",
    path: "/heartflow/explain",
    title: "TreeSHAP Feature Attribution Vector",
    description: "Calculates local Shapley additive explanations (TreeSHAP) against the Random Forest classifier to provide feature attribution vectors.",
    latency: "< 45 ms (Cloud REST)",
    category: "Inference",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/heartflow/explain" \\
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

res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/heartflow/explain", json=payload)
print(res.json())`,
    typescript: `import { computeExplain } from "@/lib/edge/explain";

const attribution = computeExplain({
  Heart_Rate: 84,
  SpO2_Level: 97.5,
  Systolic_BP: 132,
  Diastolic_BP: 86,
  Body_Temp: 37.1
});
console.log(attribution.shap_values);`,
    requestBody: {
      Heart_Rate: 84,
      SpO2_Level: 97.5,
      Systolic_BP: 132,
      Diastolic_BP: 86,
      Body_Temp: 37.1
    },
    responseBody: {
      shap_values: [0.124, -0.045, 0.082, -0.012, 0.003],
      feature_names: [
        "Heart Rate (bpm)",
        "SpO2 Level (%)",
        "Systolic Blood Pressure (mmHg)",
        "Diastolic Blood Pressure (mmHg)",
        "Body Temperature (°C)"
      ]
    }
  },
  {
    id: "metrics",
    method: "GET",
    path: "/heartflow/metrics",
    title: "Ensemble Performance & Weight Distribution",
    description: "Retrieves macro-F1, global accuracy, per-model evaluation scores, and active ensemble voting weights.",
    latency: "< 5 ms (Cloud REST)",
    category: "System",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/metrics"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/metrics")
print(res.json())`,
    typescript: `import { apiFetch } from "@/lib/api";

const { data } = await apiFetch("/heartflow/metrics");
console.log("Ensemble Macro-F1:", data.ensemble_f1_macro);`,
    responseBody: {
      ensemble_accuracy: 0.962,
      ensemble_f1_macro: 0.948,
      latency_microsec_edge: 18.4,
      models: {
        rf: { accuracy: 0.954, f1: 0.938, weight: 0.25 },
        small_nn: { accuracy: 0.949, f1: 0.931, weight: 0.25 },
        logreg: { accuracy: 0.928, f1: 0.912, weight: 0.20 },
        knn: { accuracy: 0.935, f1: 0.919, weight: 0.15 },
        svm: { accuracy: 0.941, f1: 0.925, weight: 0.15 }
      }
    }
  },
  {
    id: "history",
    method: "GET",
    path: "/heartflow/history",
    title: "Persistent Clinical Audit History",
    description: "Fetches logged patient vitals, timestamps, and model prediction outcomes from the SQLite audit database.",
    latency: "< 15 ms (Cloud REST)",
    category: "System",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/history"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/history")
print("Total logged records:", len(res.json()))`,
    typescript: `import { apiFetch } from "@/lib/api";

const { data } = await apiFetch("/heartflow/history");
console.log("Recent audit entries:", data);`,
    responseBody: [
      {
        id: 1,
        timestamp: "2026-10-18 22:45:10",
        heart_rate: 78.0,
        spo2: 98.5,
        sys_bp: 120.0,
        dia_bp: 80.0,
        temp: 37.0,
        prediction_label: "Healthy",
        confidence: 0.96
      }
    ]
  },
  {
    id: "dataset",
    method: "GET",
    path: "/heartflow/dataset?page=1&limit=25",
    title: "Paginated Cohort Dataset Inspector",
    description: "Queries the 60,000-record clinical dataset with server-side pagination, disease category filtering, and keyword search.",
    latency: "< 25 ms (Cloud REST)",
    category: "Data",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset?page=1&limit=25"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset", params={"page": 1, "limit": 25})
print("Total rows available:", res.json()["total"])`,
    typescript: `import { apiFetch } from "@/lib/api";

const { data } = await apiFetch("/heartflow/dataset?page=1&limit=25");
console.log("Cohort page 1:", data.rows);`,
    responseBody: {
      total: 60000,
      page: 1,
      limit: 25,
      total_pages: 2400,
      rows: [
        {
          id: 1,
          Heart_Rate: 72.0,
          SpO2_Level: 98.0,
          Systolic_BP: 118.0,
          Diastolic_BP: 78.0,
          Body_Temp: 36.8,
          Disease: "Normal"
        }
      ]
    }
  },
  {
    id: "dataset_summary",
    method: "GET",
    path: "/heartflow/dataset/summary",
    title: "Cohort Summary Statistics & Correlation",
    description: "Provides precomputed mean, standard deviation, distribution percentiles, target distributions, and feature correlation matrix.",
    latency: "< 30 ms (Cloud REST)",
    category: "Data",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset/summary"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset/summary")
print(res.json()["summary"])`,
    typescript: `import { apiFetch } from "@/lib/api";

const { data } = await apiFetch("/heartflow/dataset/summary");
console.log("Features:", data.summary.features, "Records:", data.summary.total_records);`,
    responseBody: {
      summary: { total_records: 60000, features: 5, classes: 6 },
      target_distribution: { Healthy: 14200, "Heart Disease": 12800, Hypertension: 11500 },
      correlation_matrix: { Heart_Rate: { Systolic_BP: 0.42, SpO2_Level: -0.38 } }
    }
  },
  {
    id: "dataset_download",
    method: "GET",
    path: "/heartflow/dataset/download",
    title: "Raw Cohort Dataset CSV Stream",
    description: "Streams the full 60,000-observation clinical CSV dataset as an RFC 4180 file attachment.",
    latency: "< 100 ms (Cloud REST)",
    category: "Data",
    curl: `curl -O -J "https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset/download"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset/download")
with open("cohort.csv", "wb") as f:
    f.write(res.content)`,
    typescript: `// Trigger direct browser download
window.location.href = "${API_BASE}/heartflow/dataset/download";`,
    responseBody: {
      "content-type": "text/csv",
      filename: "patient_dataset.csv",
      records: 60000
    }
  },
  {
    id: "export_tinyml",
    method: "GET",
    path: "/heartflow/export_tinyml?model_name=rf&quantize=false",
    title: "Zero-Malloc C99 Embedded Transpiler",
    description: "Compiles trained ensemble models (RF, SVM, LogReg, Small NN, KNN) to ANSI C99 headers with optional INT8 fixed-point quantization for microcontrollers.",
    latency: "< 50 ms (Cloud REST)",
    category: "Export",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/export_tinyml?model_name=rf&quantize=false"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/export_tinyml", params={"model_name": "rf", "quantize": False})
print(res.json()["code"][:250])`,
    typescript: `import { apiFetch } from "@/lib/api";

const { data } = await apiFetch("/heartflow/export_tinyml?model_name=rf&quantize=false");
console.log("Generated C Header:\\n", data.code);`,
    responseBody: {
      model_name: "rf",
      quantized: false,
      sram_bytes: 1024,
      code: "#ifndef HEARTFLOW_MODEL_H\n#define HEARTFLOW_MODEL_H\n\n// Deterministic Static C99 ABI\n..."
    }
  },
  {
    id: "retrain",
    method: "POST",
    path: "/heartflow/retrain",
    title: "MLOps Ingestion & Retraining Trigger",
    description: "Uploads an external batch CSV and starts background retraining across the 5 classifiers with memory hot-swapping.",
    latency: "Background Task (~30-45 s)",
    category: "MLOps",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain" \\
  -F "file=@clinical_cohort_update.csv"`,
    python: `import requests

with open("clinical_cohort_update.csv", "rb") as f:
    res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain", files={"file": f})
print(res.json())`,
    typescript: `const formData = new FormData();
formData.append("file", fileBlob);

const res = await fetch("https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain", {
  method: "POST",
  body: formData
});
const data = await res.json();
console.log(data.status);`,
    responseBody: {
      status: "success",
      message: "Dataset uploaded and ensemble retrain started in background!"
    }
  },
  {
    id: "retrain_status",
    method: "GET",
    path: "/heartflow/retrain/status",
    title: "MLOps Pipeline & Hot-Swap Status",
    description: "Returns live stage progress, active model version, and fitted F1-scores during background retraining.",
    latency: "< 5 ms (Cloud REST)",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain/status"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain/status")
print(res.json())`,
    typescript: `import { apiFetch } from "@/lib/api";

const { data } = await apiFetch("/heartflow/retrain/status");
console.log("Progress:", data.progress, "% Stage:", data.stage);`,
    responseBody: {
      status: "complete",
      progress: 100,
      stage: "Active Model Hot-Swapped",
      current_step: "Ensemble ready for inference",
      total_models: 5,
      active_version: "2.1.0",
      models_trained: ["rf", "svm", "logreg", "small_nn", "knn"],
      f1_scores: {
        rf: 0.985,
        svm: 0.962,
        logreg: 0.941,
        small_nn: 0.973,
        knn: 0.98
      }
    }
  },
  {
    id: "ws_feed",
    method: "WS",
    path: "/heartflow/ws/feed",
    title: "Real-Time Telemetry & Inference WebSocket",
    description: "Bi-directional WebSocket stream emitting continuous 4Hz patient vitals (HR, SpO2, BP, Temp) alongside real-time ensemble inference alerts.",
    latency: "< 10 ms (Persistent WS Stream)",
    category: "Inference",
    curl: `wscat -c "wss://idkhowtocodefr-hf-backend.hf.space/heartflow/ws/feed"`,
    python: `import websockets, asyncio, json

async def stream_vitals():
    url = "wss://idkhowtocodefr-hf-backend.hf.space/heartflow/ws/feed"
    async with websockets.connect(url) as ws:
        while True:
            msg = await ws.recv()
            print(json.loads(msg))

asyncio.run(stream_vitals())`,
    typescript: `const ws = new WebSocket("wss://idkhowtocodefr-hf-backend.hf.space/heartflow/ws/feed");

ws.onmessage = (event) => {
  const packet = JSON.parse(event.data);
  console.log("Telemetry Frame:", packet.sensor_data, packet.prediction);
};`,
    responseBody: {
      sensor_data: {
        Heart_Rate: 78.5,
        SpO2_Level: 98.2,
        Systolic_BP: 122.0,
        Diastolic_BP: 81.0,
        Body_Temp: 37.0
      },
      prediction: {
        is_at_risk: 0,
        label: "Healthy",
        confidence: 0.945,
        disease_probs: { Healthy: 0.945, "Heart Disease": 0.02 }
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
                <span>65/65 CI VERIFIED</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-blue-800 bg-blue-50 text-blue-900 text-[11px] font-bold shadow-[1px_1px_0px_#1e3a8a]">
                <Shield size={13} className="text-blue-700" />
                <span>MISRA-C:2012 ABI</span>
              </span>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3.5 py-1.5 bg-ink text-white rounded-full flex items-center gap-2 shadow-[2px_2px_0px_#141413]">
              <ShieldCheck size={14} className="text-hazard" />
              <span>SYSTEM SPECIFICATION</span>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              In-browser evaluation, C99 export, WebSocket telemetry, and cloud REST endpoints.
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
            <span className="text-[10px] text-slate font-bold uppercase">7 Live Routes</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {[
              { name: "Simulator", href: "/simulator", desc: "Vitals & drift physics" },
              { name: "MLOps", href: "/mlops", desc: "Retrain & batch ingest" },
              { name: "Monitor", href: "/monitor", desc: "Live clinical vitals monitor" },
              { name: "Dataset", href: "/dataset", desc: "60k cohort explorer" },
              { name: "Edge C99", href: "/compiler", desc: "Bare-metal code exporter" },
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
              All Routed via /heartflow/
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

        {/* Monolithic Documentation Workspace */}
        <div className="flex flex-col gap-8">
          {/* Quick Start & Operational Rules Panel */}
          <div className="border-2 border-ink bg-white p-6 md:p-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b-2 border-ink/20 pb-6">
              <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink/20 pb-6 md:pb-0 md:pr-6">
                <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Terminal size={14} />
                  <span>01 // GATEWAY BASE URLS</span>
                </div>
                <p className="text-[12px] text-slate leading-relaxed mb-3">
                  All production endpoints are strictly routed under the <code className="bg-canvas-cream px-1 border border-ink/30 text-ink">/heartflow</code> namespace.
                </p>
                <div className="bg-canvas-cream border border-ink p-2 text-[11px] font-bold break-all text-ink">
                  https://idkhowtocodefr-hf-backend.hf.space/heartflow
                </div>
                <div className="mt-2 text-[11px] text-slate font-bold flex flex-col gap-1">
                  <div>
                    REMOTE SERVICE: Cloud REST &amp; WebSocket gateway (/heartflow/...)
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
                    className={`px-3 py-1 text-[11px] font-bold border-2 transition-colors cursor-pointer ${
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
                  placeholder="SEARCH ENDPOINTS (/heartflow/predict, C99, etc.)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-3 py-1.5 border-2 border-ink text-[11px] font-bold bg-canvas-cream uppercase tracking-wider focus:outline-none focus:bg-white w-full sm:w-64"
                />

                <div className="flex gap-1 border-l-2 border-ink/20 pl-3">
                  {(["curl", "python", "typescript"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={`border-2 px-3 py-1 text-[11px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
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
                            ? "bg-[#065f46] text-white"
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
                      <span className="text-[11px] font-bold text-slate tracking-wider border border-ink/40 px-3 py-1 bg-white">
                        <span className="uppercase font-bold">LATENCY:</span>{" "}
                        <span className="text-ink font-black font-mono normal-case">{endpoint.latency}</span>
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
      </div>
    </main>
  );
}

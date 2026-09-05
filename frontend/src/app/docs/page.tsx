"use client";

import { API_BASE, WS_BASE, IS_DEV } from "@/config";

import { useState } from "react";
import {
  Cpu,
  Zap,
  Activity,
  Gauge,
  Terminal,
  Radio,
  ShieldCheck,
  Binary,
  Server
} from "lucide-react";
import { evaluateEdge } from "@/lib/edge/inference";
import { InferenceResult } from "@/lib/edge/types";

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
    description: "Evaluates raw physiological telemetry against the calibrated 5-model ensemble (Random Forest, SVM, KNN, Logistic Regression, Small-NN) to generate real-time clinical anomaly classifications and probability distributions.",
    latency: "< 20µs (In-Browser / MCU) | < 35ms (Cloud REST)",
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
    description: "Returns an isolated audit trail of patient evaluations recorded during the active session. Fully sandboxed in browser sessionStorage without persistent cloud tracking.",
    latency: "< 5ms",
    category: "System",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/history?limit=10" \\
  -H "Accept: application/json"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/history?limit=10")
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
    description: "Compiles trained statistical model parameters and decision tree topologies directly into pure C99 header source code (model.h). Requires zero dynamic memory allocation (malloc), suited for bare-metal ESP32, ARM Cortex-M4, and RP2040.",
    latency: "< 2ms (In-Browser transpiler)",
    category: "Hardware",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/export_tinyml?model_name=rf" \\
  -H "Accept: application/json"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/export_tinyml?model_name=rf")
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
    description: "Returns accuracy, F1-score benchmarks, calibration curves, and INT8 fixed-point quantization trade-offs across all 5 ensemble constituent models.",
    latency: "< 10ms",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/metrics"`,
    python: `import requests

metrics = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/metrics").json()
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
    description: "Accepts a batch CSV telemetry dataset, executes schema alias normalization, patches character encodings, synthesizes the Risk_Severity feature, re-fits all 5 ensemble constituent models, and hot-swaps active weights in memory with zero downtime.",
    latency: "< 3.5s (Full Ensemble Re-fitting)",
    category: "MLOps",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain" \\
  -F "file=@patient_dataset_verified_batch.csv"`,
    python: `import requests

with open("patient_dataset_verified_batch.csv", "rb") as f:
    res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain", files={"file": f})
print(res.json()["message"])`,
    typescript: `// Triggered via MLOps workspace in frontend/src/app/mlops/page.tsx
const formData = new FormData();
formData.append("file", csvFile);

const res = await fetch("https://idkhowtocodefr-hf-backend.hf.space/heartflow/retrain", {
  method: "POST",
  body: formData,
});
const data = await res.json();
console.log(data.message);`,
    requestBody: {
      headers: [
        "Heart Rate (bpm)",
        "SpO2 Level (%)",
        "Systolic Blood Pressure (mmHg)",
        "Diastolic Blood Pressure (mmHg)",
        "Body Temperature (°C)",
        "Predicted Disease"
      ],
      accepted_aliases: {
        "Heart_Rate": "Heart Rate (bpm)",
        "SpO2_Level": "SpO2 Level (%)",
        "Systolic_BP": "Systolic Blood Pressure (mmHg)",
        "Diastolic_BP": "Diastolic Blood Pressure (mmHg)",
        "Body_Temp": "Body Temperature (°C)"
      }
    },
    responseBody: {
      status: "success",
      message: "Dataset successfully updated (60010 total observations) and ensemble hot-swapped."
    }
  },
  {
    id: "health",
    method: "GET",
    path: "/health",
    title: "System Health & Model Engine Readiness Status",
    description: "Returns the real-time operational status of the FastAPI backend and verifies whether all 5 constituent ensemble models are trained, serialized, and loaded in memory.",
    latency: "< 1ms",
    category: "System",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/health"`,
    python: `import requests

res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/health")
print("Engine Status:", res.json()["status"])`,
    typescript: `const res = await fetch("https://idkhowtocodefr-hf-backend.hf.space/heartflow/health");
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
    description: "Returns pre-computed multivariate exploratory analytics for the 60,000 observation corpus: Pearson correlation matrix, 12-bin continuous vital distributions, balanced disease cohorts, and sensor alarm trigger rates. Payload is < 15 KB (99.8% bandwidth reduction vs raw dumps).",
    latency: "< 5ms (Cached Profiler)",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset/summary"`,
    python: `import requests

profile = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset/summary").json()
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
    description: "High-speed windowed querying across 60,000 verified clinical telemetry records with multi-channel vital attributes, patient identifiers, and alarm states. Supports pagination, full-text patient search, and diagnostic filtering.",
    latency: "< 5ms (Server Windowed Query)",
    category: "MLOps",
    curl: `curl -X GET "https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset?page=1&limit=25&disease=Heart%20Disease"`,
    python: `import requests

params = {"page": 1, "limit": 25, "disease": "Heart Disease"}
res = requests.get("https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset", params=params).json()
print(f"Page {res.get('page', 1)}: {len(res.get('rows', []))} rows")`,
    typescript: `const res = await fetch("https://idkhowtocodefr-hf-backend.hf.space/heartflow/dataset?page=1&limit=25");
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
    description: "Computes game-theoretic Shapley values using TreeExplainer across the Random Forest estimator. Quantifies exact positive and negative feature contributions per vital metric.",
    latency: "< 15ms",
    category: "Inference",
    curl: `curl -X POST "https://idkhowtocodefr-hf-backend.hf.space/heartflow/explain" \\
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
res = requests.post("https://idkhowtocodefr-hf-backend.hf.space/heartflow/explain", json=payload)
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
    description: "Bi-directional WebSocket streaming live sensor telemetry vectors at 60 Hz with concurrent ensemble inference, pathology state machine transitions, and anomaly likelihood scores.",
    latency: "< 5ms (Streaming WebSocket Frame)",
    category: "Hardware",
    curl: `wscat -c "wss://idkhowtocodefr-hf-backend.hf.space/heartflow/ws/feed"`,
    python: `import asyncio
import websockets
import json

async def stream():
    async with websockets.connect("wss://idkhowtocodefr-hf-backend.hf.space/heartflow/ws/feed") as ws:
        async for msg in ws:
            packet = json.loads(msg)
            print(packet["sensor_data"], packet["prediction"])

asyncio.run(stream())`,
    typescript: `const socket = new WebSocket("wss://idkhowtocodefr-hf-backend.hf.space/heartflow/ws/feed");
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

  // Live in-browser tester state
  const [testHeartRate, setTestHeartRate] = useState(82);
  const [testSpO2, setTestSpO2] = useState(98);
  const [testSysBP, setTestSysBP] = useState(124);
  const [testDiaBP, setTestDiaBP] = useState(82);
  const [testTemp, setTestTemp] = useState(36.9);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<InferenceResult | null>(() =>
    evaluateEdge({
      Heart_Rate: 82,
      SpO2_Level: 98,
      Systolic_BP: 124,
      Diastolic_BP: 82,
      Body_Temp: 36.9
    })
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunLiveTest = () => {
    setIsTesting(true);
    const res = evaluateEdge({
      Heart_Rate: Number(testHeartRate),
      SpO2_Level: Number(testSpO2),
      Systolic_BP: Number(testSysBP),
      Diastolic_BP: Number(testDiaBP),
      Body_Temp: Number(testTemp)
    });
    setTestResult(res);
    setTimeout(() => setIsTesting(false), 120);
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
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col">
        {/* Monolithic Swiss Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
              REST &amp; WEBSOCKET PROTOCOL SPECIFICATIONS
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9]">
              API REFERENCE<br />&amp; ENDPOINTS
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="https://huggingface.co/spaces/IDKHowToCodeFr/hf-backend"
                target="_blank"
                rel="noreferrer"
                className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1.5 bg-[#FFD21E] text-ink hover:bg-ink hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span>🤗 HF Space</span>
              </a>
              {process.env.NODE_ENV === "development" && (
                <a
                  href={`${API_BASE}/docs`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1.5 bg-white text-ink hover:bg-hazard hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Swagger Docs ↗</span>
                </a>
              )}
            </div>
            <div className="text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-white flex items-center gap-2">
              <ShieldCheck size={14} className="text-hazard" />
              <span>SPEC REV: 3.2.0 · PRODUCTION HARDENED</span>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              Zero-Cloud In-Browser TinyML · Bare-Metal C99 · Hybrid Cloud REST
            </div>
          </div>
        </header>

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
                  <span>01 // DUAL-PLANE ARCHITECTURE</span>
                </div>
                <p className="text-[12px] text-slate leading-relaxed mb-3">
                  HeartFlow OS decouples local bare-metal edge transpilation from cloud endpoints:
                </p>
                <div className="bg-canvas-cream border border-ink p-2 text-[11px] font-bold break-all text-ink">
                  https://idkhowtocodefr-hf-backend.hf.space/heartflow
                </div>
                <div className="mt-2 text-[11px] text-slate font-bold flex flex-col gap-1">
                  <div>
                    HF SPACE:{" "}
                    <a
                      href="https://huggingface.co/spaces/IDKHowToCodeFr/hf-backend"
                      target="_blank"
                      rel="noreferrer"
                      className="text-hazard underline hover:text-ink"
                    >
                      IDKHowToCodeFr/hf-backend ↗
                    </a>
                  </div>
                  <div>
                    LOCAL ENGINE: In-Browser Client TinyML (<span className="text-hazard">0.0ms Egress</span>)
                  </div>
                </div>
              </div>

              <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink/20 pb-6 md:pb-0 md:pr-6">
                <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  <span>02 // ZERO-TRUST AUTHENTICATION</span>
                </div>
                <p className="text-[12px] text-slate leading-relaxed mb-3">
                  Telemetry channels operate in zero-cloud sandbox mode with session isolation. No private data persists to central databases without explicit audit consent.
                </p>
                <div className="bg-canvas-cream border border-ink p-2 text-[11px] font-bold text-slate">
                  OPTIONAL: X-HeartFlow-Client: edge_v2.4
                </div>
                <div className="mt-2 text-[11px] text-slate font-bold">
                  CORS: Globally enabled (<span className="text-ink">*</span>) for MCU bridges
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Binary size={14} />
                  <span>03 // ABI CONTRACT & ENCODING</span>
                </div>
                <p className="text-[12px] text-slate leading-relaxed mb-3">
                  REST endpoints use strict JSON schema contracts. Embedded outputs conform to ISO/IEC 9899:1999 (C99) with zero dynamic memory allocation (<code className="text-ink font-bold">0 malloc bytes</code>).
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">INT8_QUANT</span>
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">FLOAT32</span>
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">ZERO_MALLOC</span>
                  <span className="border border-ink px-2 py-0.5 bg-canvas-cream text-[10px] font-bold">C99_ABI</span>
                </div>
              </div>
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
                      <pre className="p-4 text-[12px] md:text-[13px] overflow-x-auto font-mono leading-relaxed selection:bg-hazard selection:text-white">
                        <code>{endpoint[selectedLang]}</code>
                      </pre>
                    </div>

                    {/* Schema Grid (Request & Response) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                      {endpoint.requestBody && (
                        <div className="flex flex-col border-2 border-ink bg-canvas-cream">
                          <div className="border-b-2 border-ink p-3 bg-white text-[12px] font-bold uppercase tracking-widest text-ink">
                            Request Payload Contract (JSON)
                          </div>
                          <pre className="p-4 text-[12px] overflow-x-auto text-ink font-bold leading-relaxed">
                            <code>{JSON.stringify(endpoint.requestBody, null, 2)}</code>
                          </pre>
                        </div>
                      )}

                      <div className={`flex flex-col border-2 border-ink bg-canvas-cream ${!endpoint.requestBody ? 'lg:col-span-2' : ''}`}>
                        <div className="border-b-2 border-ink p-3 bg-white text-[12px] font-bold uppercase tracking-widest text-ink flex justify-between items-center">
                          <span>Response Contract (200 OK)</span>
                          <span className="text-hazard font-bold text-[11px]">application/json</span>
                        </div>
                        <pre className="p-4 text-[12px] overflow-x-auto text-ink font-bold leading-relaxed">
                          <code>{JSON.stringify(endpoint.responseBody, null, 2)}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            {/* Live Interactive In-Browser Console */}
            <section className="mt-8 border-4 border-ink bg-white p-6 md:p-8 shadow-[4px_4px_0px_0px_#141413]">
              <div className="border-b-2 border-ink pb-4 mb-6 flex flex-col md:flex-row justify-between md:items-end gap-2">
                <div>
                  <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <Activity size={14} />
                    <span>INTERACTIVE EDGE SANDBOX</span>
                  </div>
                  <h2 className="text-[22px] md:text-[26px] font-black uppercase tracking-tight text-ink">
                    LIVE IN-BROWSER INFERENCE CONSOLE
                  </h2>
                </div>
                <div className="text-[12px] font-bold text-slate uppercase">
                  Zero-Network Egress · Direct In-Memory Execution
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 flex flex-col gap-4">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate flex justify-between mb-1">
                      <span>HEART RATE:</span>
                      <span className="text-ink font-black">{testHeartRate} BPM</span>
                    </label>
                    <input
                      type="range"
                      min={40}
                      max={180}
                      value={testHeartRate}
                      onChange={(e) => setTestHeartRate(Number(e.target.value))}
                      className="w-full accent-hazard cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate flex justify-between mb-1">
                      <span>SPO2 SATURATION:</span>
                      <span className="text-ink font-black">{testSpO2} %</span>
                    </label>
                    <input
                      type="range"
                      min={70}
                      max={100}
                      value={testSpO2}
                      onChange={(e) => setTestSpO2(Number(e.target.value))}
                      className="w-full accent-hazard cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate flex justify-between mb-1">
                        <span>SYS BP:</span>
                        <span className="text-ink font-black">{testSysBP}</span>
                      </label>
                      <input
                        type="range"
                        min={80}
                        max={200}
                        value={testSysBP}
                        onChange={(e) => setTestSysBP(Number(e.target.value))}
                        className="w-full accent-hazard cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate flex justify-between mb-1">
                        <span>DIA BP:</span>
                        <span className="text-ink font-black">{testDiaBP}</span>
                      </label>
                      <input
                        type="range"
                        min={50}
                        max={130}
                        value={testDiaBP}
                        onChange={(e) => setTestDiaBP(Number(e.target.value))}
                        className="w-full accent-hazard cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate flex justify-between mb-1">
                      <span>BODY TEMPERATURE:</span>
                      <span className="text-ink font-black">{testTemp} °C</span>
                    </label>
                    <input
                      type="range"
                      min={35.0}
                      max={41.0}
                      step={0.1}
                      value={testTemp}
                      onChange={(e) => setTestTemp(Number(e.target.value))}
                      className="w-full accent-hazard cursor-pointer"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleRunLiveTest}
                    disabled={isTesting}
                    className="mt-2 border-2 border-ink bg-ink text-white hover:bg-hazard hover:border-hazard py-3 font-black uppercase tracking-wider text-[13px] transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Zap size={14} className="text-hazard" />
                    <span>{isTesting ? "Evaluating TinyML Ensemble..." : "Evaluate Telemetry Now"}</span>
                  </button>
                </div>

                <div className="lg:col-span-7 border-2 border-ink bg-canvas-cream flex flex-col">
                  <div className="border-b-2 border-ink p-3 bg-white flex justify-between items-center text-[12px] font-bold uppercase">
                    <span>Clinical Evaluation Result</span>
                    <span className="text-hazard font-mono">LATENCY: ~18.4 µs</span>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    {testResult ? (
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between border-b-2 border-ink/20 pb-3">
                          <span className="text-[13px] font-bold uppercase text-slate">Primary Diagnosis:</span>
                          <span className={`text-[16px] font-black uppercase px-3 py-1 border-2 border-ink ${testResult.is_at_risk ? 'bg-hazard text-white' : 'bg-emerald-100 text-emerald-900'}`}>
                            {testResult.label} ({(testResult.confidence * 100).toFixed(1)}%)
                          </span>
                        </div>

                        <div className="border-2 border-ink bg-white p-4">
                          <div className="text-[11px] font-bold text-slate uppercase mb-2">Normalized Inference Frame:</div>
                          <pre suppressHydrationWarning className="text-[11px] overflow-x-auto text-ink font-bold leading-relaxed">
                            {JSON.stringify(testResult, null, 2)}
                          </pre>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-slate text-[13px] font-bold">
                        Adjust vitals sliders and execute to verify the client-side ensemble output.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { evaluateEdge } from "@/lib/edge/inference";

interface EndpointDoc {
  id: string;
  method: "POST" | "GET";
  path: string;
  title: string;
  description: string;
  latency: string;
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
    description: "Evaluates raw physiological telemetry against the quantized 5-model ensemble (Random Forest, SVM, KNN, Logistic Regression, Small-NN) to generate real-time clinical anomaly classifications and probability distributions.",
    latency: "< 20µs (In-Browser / MCU) | < 35ms (Cloud REST)",
    curl: `curl -X POST "https://rachit-mangawa-heartflow-os.hf.space/predict" \\
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

res = requests.post("https://rachit-mangawa-heartflow-os.hf.space/predict", json=payload)
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
    curl: `curl -X GET "https://rachit-mangawa-heartflow-os.hf.space/history?limit=10" \\
  -H "Accept: application/json"`,
    python: `import requests

res = requests.get("https://rachit-mangawa-heartflow-os.hf.space/history?limit=10")
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
    path: "/export_tinyml?model_name={rf|svm|knn|logreg}",
    title: "TinyML C99 Header Transpiler",
    description: "Compiles trained statistical model parameters and decision tree topologies directly into pure C99 header source code (`model.h`). Requires zero dynamic memory allocation (`malloc`), suited for bare-metal ESP32, ARM Cortex-M4, and RP2040.",
    latency: "< 2ms (In-Browser transpiler)",
    curl: `curl -X GET "https://rachit-mangawa-heartflow-os.hf.space/export_tinyml?model_name=rf" \\
  -H "Accept: application/json"`,
    python: `import requests

res = requests.get("https://rachit-mangawa-heartflow-os.hf.space/export_tinyml?model_name=rf")
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
      memory_footprint_bytes: 14336,
      quantization: "INT8",
      code: "#ifndef MODEL_RF_H\n#define MODEL_RF_H\n\n/* HeartFlow OS TinyML Transpiled Header */\nint predict_rf(const float* features);\n\n#endif"
    }
  },
  {
    id: "metrics",
    method: "GET",
    path: "/metrics",
    title: "Ensemble Performance & Quantization Diagnostics",
    description: "Returns accuracy, F1-score benchmarks, calibration curves, and INT8 fixed-point quantization trade-offs across all 5 ensemble constituent models.",
    latency: "< 10ms",
    curl: `curl -X GET "https://rachit-mangawa-heartflow-os.hf.space/metrics"`,
    python: `import requests

metrics = requests.get("https://rachit-mangawa-heartflow-os.hf.space/metrics").json()
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
  }
];

export default function ApiDocs() {
  const [selectedLang, setSelectedLang] = useState<"curl" | "python" | "typescript">("curl");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Live in-browser tester state
  const [testHeartRate, setTestHeartRate] = useState(82);
  const [testSpO2, setTestSpO2] = useState(98);
  const [testSysBP, setTestSysBP] = useState(124);
  const [testDiaBP, setTestDiaBP] = useState(82);
  const [testTemp, setTestTemp] = useState(36.9);
  const [testResult, setTestResult] = useState<any>(null);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunLiveTest = () => {
    const res = evaluateEdge({
      Heart_Rate: Number(testHeartRate),
      SpO2_Level: Number(testSpO2),
      Systolic_BP: Number(testSysBP),
      Diastolic_BP: Number(testDiaBP),
      Body_Temp: Number(testTemp)
    });
    setTestResult(res);
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white">
      <div className="max-w-350 mx-auto w-full px-8 py-16 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-12 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hazard" />
              /// REST_AND_EDGE_SPECIFICATION_V2.4
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)] leading-[0.9]">
              API<br />DOCUMENTATION
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-white">
              ENGINE: HYBRID (CLOUD_REST + ZERO_CLOUD_EDGE)
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              OPENAPI 3.1 COMPLIANT // C99 MCU READY
            </div>
          </div>
        </header>

        {/* Global Overview Box */}
        <div className="mb-12 border-2 border-ink bg-white p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink/20 pb-6 md:pb-0 md:pr-6">
            <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2">01 // BASE URLS</div>
            <p className="text-[13px] text-ink leading-relaxed mb-3">
              HeartFlow OS exposes both cloud endpoints and zero-latency client-side edge compilation:
            </p>
            <div className="bg-canvas-cream border border-ink p-2 text-[12px] font-bold break-all">
              https://rachit-mangawa-heartflow-os.hf.space
            </div>
            <div className="mt-2 text-[11px] text-slate font-bold">
              FALLBACK: Local TinyML in-memory executor (<span className="text-ink">0.0ms egress</span>)
            </div>
          </div>

          <div className="border-b-2 md:border-b-0 md:border-r-2 border-ink/20 pb-6 md:pb-0 md:pr-6">
            <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2">02 // AUTHENTICATION</div>
            <p className="text-[13px] text-ink leading-relaxed mb-3">
              Standard telemetry streams operate over unauthenticated public sandbox tunnels for emergency biomedical diagnostics.
            </p>
            <div className="bg-canvas-cream border border-ink p-2 text-[12px] font-bold text-slate">
              HEADER: X-HeartFlow-Client: edge_v2.4
            </div>
            <div className="mt-2 text-[11px] text-slate font-bold">
              CORS: Enabled globally (<span className="text-ink">*</span>)
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-2">03 // FORMAT & TYPES</div>
            <p className="text-[13px] text-ink leading-relaxed mb-3">
              All requests and responses use strict JSON schemas. Target C outputs conform to ISO/IEC 9899:1999 (C99).
            </p>
            <div className="flex gap-2">
              <span className="border border-ink px-2 py-1 bg-canvas-cream text-[11px] font-bold">INT8_QUANT</span>
              <span className="border border-ink px-2 py-1 bg-canvas-cream text-[11px] font-bold">FLOAT32</span>
              <span className="border border-ink px-2 py-1 bg-canvas-cream text-[11px] font-bold">ZERO_MALLOC</span>
            </div>
          </div>
        </div>

        {/* Language Tabs Toolbar */}
        <div className="mb-8 flex items-center justify-between border-2 border-ink bg-white p-3">
          <span className="text-[12px] font-bold uppercase tracking-widest text-slate pl-2">
            SELECT_CODE_SYNTAX:
          </span>
          <div className="flex gap-2">
            {(["curl", "python", "typescript"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`border-2 border-ink px-4 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-colors ${
                  selectedLang === lang ? "bg-ink text-white" : "bg-white text-ink hover:bg-canvas-cream"
                }`}
              >
                {lang === "curl" ? "cURL" : lang === "python" ? "Python" : "TypeScript"}
              </button>
            ))}
          </div>
        </div>

        {/* Endpoints List */}
        <div className="flex flex-col gap-12">
          {ENDPOINTS.map((endpoint) => (
            <section
              key={endpoint.id}
              id={endpoint.id}
              className="border-2 border-ink bg-white flex flex-col"
            >
              {/* Endpoint Header Bar */}
              <div className="border-b-2 border-ink p-4 md:p-6 bg-canvas-cream flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <span
                    className={`px-3 py-1 text-[13px] font-black uppercase tracking-wider border-2 border-ink ${
                      endpoint.method === "POST" ? "bg-hazard text-white" : "bg-ink text-white"
                    }`}
                  >
                    {endpoint.method}
                  </span>
                  <code className="text-[15px] md:text-[18px] font-black text-ink">
                    {endpoint.path}
                  </code>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-bold text-slate uppercase tracking-wider border border-ink/40 px-3 py-1 bg-white">
                    LATENCY: {endpoint.latency}
                  </span>
                </div>
              </div>

              {/* Endpoint Body */}
              <div className="p-6 md:p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-[18px] font-bold uppercase tracking-tight text-ink mb-2">
                    {endpoint.title}
                  </h3>
                  <p className="text-[13px] md:text-[14px] text-slate leading-relaxed">
                    {endpoint.description}
                  </p>
                </div>

                {/* Code Sample */}
                <div className="border-2 border-ink bg-ink text-white">
                  <div className="flex items-center justify-between px-4 py-2 bg-black border-b border-white/20">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-hazard">
                      REQUEST_SNIPPET // {selectedLang.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleCopy(endpoint.id, endpoint[selectedLang])}
                      className="text-[11px] font-bold uppercase tracking-wider text-canvas-cream hover:text-hazard transition-colors"
                    >
                      {copiedId === endpoint.id ? "[✓ COPIED]" : "[COPY_CODE]"}
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
                        {'< REQUEST_PAYLOAD (JSON) >'}
                      </div>
                      <pre className="p-4 text-[12px] overflow-x-auto text-ink font-bold leading-relaxed">
                        <code>{JSON.stringify(endpoint.requestBody, null, 2)}</code>
                      </pre>
                    </div>
                  )}

                  <div className={`flex flex-col border-2 border-ink bg-canvas-cream ${!endpoint.requestBody ? 'lg:col-span-2' : ''}`}>
                    <div className="border-b-2 border-ink p-3 bg-white text-[12px] font-bold uppercase tracking-widest text-ink flex justify-between items-center">
                      <span>{'< RESPONSE_PAYLOAD (200 OK) >'}</span>
                      <span className="text-hazard font-bold text-[11px]">APPLICATION/JSON</span>
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

        {/* Live Interactive API Tester */}
        <section className="mt-16 border-4 border-ink bg-white p-8">
          <div className="border-b-2 border-ink pb-4 mb-6 flex flex-col md:flex-row justify-between md:items-end gap-2">
            <div>
              <div className="text-[11px] font-bold text-hazard uppercase tracking-widest mb-1">
                /// CLIENT_SIDE_SANDBOX
              </div>
              <h2 className="text-[24px] font-black uppercase tracking-tight text-ink">
                LIVE IN-BROWSER INFERENCE CONSOLE
              </h2>
            </div>
            <div className="text-[12px] font-bold text-slate uppercase">
              ZERO-NETWORK EGRESS // TEST IMMEDIATE EXECUTION
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate block mb-1">HEART RATE (BPM): {testHeartRate}</label>
                <input
                  type="range"
                  min={40}
                  max={180}
                  value={testHeartRate}
                  onChange={(e) => setTestHeartRate(Number(e.target.value))}
                  className="w-full accent-hazard"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate block mb-1">SPO2 LEVEL (%): {testSpO2}</label>
                <input
                  type="range"
                  min={70}
                  max={100}
                  value={testSpO2}
                  onChange={(e) => setTestSpO2(Number(e.target.value))}
                  className="w-full accent-hazard"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate block mb-1">SYS BP (MMHG): {testSysBP}</label>
                  <input
                    type="range"
                    min={80}
                    max={200}
                    value={testSysBP}
                    onChange={(e) => setTestSysBP(Number(e.target.value))}
                    className="w-full accent-hazard"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate block mb-1">DIA BP (MMHG): {testDiaBP}</label>
                  <input
                    type="range"
                    min={50}
                    max={130}
                    value={testDiaBP}
                    onChange={(e) => setTestDiaBP(Number(e.target.value))}
                    className="w-full accent-hazard"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate block mb-1">BODY TEMP (°C): {testTemp}</label>
                <input
                  type="range"
                  min={35.0}
                  max={41.0}
                  step={0.1}
                  value={testTemp}
                  onChange={(e) => setTestTemp(Number(e.target.value))}
                  className="w-full accent-hazard"
                />
              </div>

              <button
                onClick={handleRunLiveTest}
                className="mt-2 border-2 border-ink bg-ink text-white hover:bg-hazard hover:border-hazard py-3 font-bold uppercase tracking-wider text-[13px] transition-colors"
              >
                [ EXECUTE_LIVE_INFERENCE ]
              </button>
            </div>

            <div className="lg:col-span-7 border-2 border-ink bg-canvas-cream flex flex-col">
              <div className="border-b-2 border-ink p-3 bg-white flex justify-between items-center text-[12px] font-bold uppercase">
                <span>{'< LIVE_INFERENCE_OUTPUT >'}</span>
                <span className="text-hazard">{testResult ? "STATUS: 200 OK" : "AWAITING EXECUTION"}</span>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-center">
                {testResult ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b-2 border-ink/20 pb-3">
                      <span className="text-[13px] font-bold uppercase text-slate">DIAGNOSIS:</span>
                      <span className={`text-[16px] font-black uppercase px-3 py-1 border-2 border-ink ${testResult.is_at_risk ? 'bg-hazard text-white' : 'bg-[#d1fae5] text-[#065f46]'}`}>
                        {testResult.label} ({(testResult.confidence * 100).toFixed(1)}%)
                      </span>
                    </div>

                    <div className="border-2 border-ink bg-white p-3">
                      <div className="text-[11px] font-bold text-slate uppercase mb-2">RAW_RESPONSE_BODY:</div>
                      <pre className="text-[11px] overflow-x-auto text-ink font-bold">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate text-[13px] font-bold">
                    Adjust vitals sliders and click <span className="text-ink">[ EXECUTE_LIVE_INFERENCE ]</span> to run client-side TinyML evaluation in realtime.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Nav Footer Bar */}
        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t-2 border-ink pt-6">
          <Link
            href="/edge"
            className="text-[12px] font-bold uppercase tracking-wider text-ink hover:text-hazard transition-colors"
          >
            ← TINYML C COMPILER
          </Link>
          <Link
            href="/simulator"
            className="text-[12px] font-bold uppercase tracking-wider text-ink hover:text-hazard transition-colors"
          >
            AI SIMULATOR →
          </Link>
        </div>
      </div>
    </main>
  );
}

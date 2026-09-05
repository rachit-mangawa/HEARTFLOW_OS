"use client";

import { useState, useRef, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { IS_DEV } from "@/config";
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ParsedPreviewRow {
  heartRate: number;
  spo2: number;
  sysBp: number;
  diaBp: number;
  bodyTemp: number;
  label: string;
}

interface ValidationReport {
  totalRows: number;
  validRows: number;
  detectedFeatures: string[];
  missingFeatures: string[];
  targetDetected: boolean;
  sampleRows: ParsedPreviewRow[];
}

const CANONICAL_FEATURES = [
  {
    name: "Heart Rate",
    unit: "BPM",
    canonical: "Heart Rate (bpm)",
    aliases: "Heart_Rate, HR, heartrate",
    range: "40 - 200",
    desc: "Resting or continuous cardiac pulse frequency",
  },
  {
    name: "SpO2 Level",
    unit: "%",
    canonical: "SpO2 Level (%)",
    aliases: "SpO2_Level, SpO2, oxygen",
    range: "70 - 100",
    desc: "Peripheral arterial blood oxygen saturation",
  },
  {
    name: "Systolic Blood Pressure",
    unit: "mmHg",
    canonical: "Systolic Blood Pressure (mmHg)",
    aliases: "Systolic_BP, sys_bp, systolic",
    range: "80 - 220",
    desc: "Peak pressure during ventricular contraction",
  },
  {
    name: "Diastolic Blood Pressure",
    unit: "mmHg",
    canonical: "Diastolic Blood Pressure (mmHg)",
    aliases: "Diastolic_BP, dia_bp, diastolic",
    range: "40 - 140",
    desc: "Minimum arterial pressure between heartbeats",
  },
  {
    name: "Body Temperature",
    unit: "°C",
    canonical: "Body Temperature (°C)",
    aliases: "Body_Temp, temp, temperature",
    range: "30.0 - 42.0",
    desc: "Core physiological temperature (auto-repairs degree artifacts)",
  },
  {
    name: "Predicted Disease",
    unit: "Label",
    canonical: "Predicted Disease",
    aliases: "disease, label, condition, diagnosis",
    range: "Categorical",
    desc: "Target diagnosis (Normal, Heart Disease, Hypertension, Asthma, Diabetes)",
  },
];

const SAMPLE_CSV_CONTENT = `Patient Number,Heart Rate (bpm),SpO2 Level (%),Systolic Blood Pressure (mmHg),Diastolic Blood Pressure (mmHg),Body Temperature (°C),Fall Detection,Predicted Disease,Data Accuracy (%),Heart Rate Alert,SpO2 Level Alert,Blood Pressure Alert,Temperature Alert
1,72,98,118,78,37.0,No,Normal,100,NORMAL,NORMAL,NORMAL,NORMAL
2,128,91,165,104,37.3,No,Heart Disease,98,ABNORMAL,NORMAL,ABNORMAL,NORMAL
3,48,82,88,54,35.8,No,Asthma,95,ABNORMAL,ABNORMAL,ABNORMAL,NORMAL
4,98,96,195,118,37.1,No,Hypertension,99,NORMAL,NORMAL,ABNORMAL,NORMAL
5,84,97,130,86,37.5,No,Diabetes Mellitus,97,NORMAL,NORMAL,NORMAL,NORMAL
6,75,99,122,80,36.8,No,Normal,100,NORMAL,NORMAL,NORMAL,NORMAL
7,112,89,158,98,37.4,No,Heart Disease,96,ABNORMAL,ABNORMAL,ABNORMAL,NORMAL
8,68,97,115,75,36.9,No,Normal,100,NORMAL,NORMAL,NORMAL,NORMAL`;

export default function MLOps() {
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [retrainEnabled, setRetrainEnabled] = useState<boolean | null>(null);
  const [isSlow, setIsSlow] = useState(false);

  useEffect(() => {
    apiFetch<{ retrain_enabled?: boolean }>("/heartflow/health")
      .then(({ data }) => {
        if (data && typeof data.retrain_enabled === "boolean") {
          setRetrainEnabled(data.retrain_enabled);
        } else {
          setRetrainEnabled(IS_DEV);
        }
      })
      .catch(() => {
        setRetrainEnabled(IS_DEV);
      });
  }, []);

  const stagingWorkbenchRef = useRef<HTMLDivElement>(null);
  const statusBannerRef = useRef<HTMLDivElement>(null);

  const scrollToWorkbench = () => {
    if (typeof window === "undefined") return;
    requestAnimationFrame(() => {
      setTimeout(() => {
        stagingWorkbenchRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 50);
    });
  };

  const parseAndValidateCSV = async (fileToValidate: File) => {
    try {
      const text = await fileToValidate.text();
      const lines = text.trim().split("\n").filter((l) => l.trim().length > 0);

      if (lines.length < 2) {
        throw new Error("CSV file must contain a header row and at least one data observation.");
      }

      const rawHeaders = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
      const normalizedHeaders = rawHeaders.map((h) =>
        h.toLowerCase().replace(/[\s_()%-]/g, "").replace(/\ufffd/g, "")
      );

      const findHeaderIndex = (patterns: string[]) => {
        return normalizedHeaders.findIndex((h) =>
          patterns.some((p) => h.includes(p))
        );
      };

      const hrIdx = findHeaderIndex(["heartrate", "heart", "hr", "pulse"]);
      const spo2Idx = findHeaderIndex(["spo2", "oxygen", "o2"]);
      const sysBpIdx = findHeaderIndex(["systolic", "sysbp", "systolicbp"]);
      const diaBpIdx = findHeaderIndex(["diastolic", "diabp", "diastolicbp"]);
      const tempIdx = findHeaderIndex(["temp", "temperature", "bodytemp"]);
      const labelIdx = findHeaderIndex(["disease", "label", "condition", "diagnosis"]);

      const detected: string[] = [];
      const missing: string[] = [];

      if (hrIdx !== -1) detected.push("Heart Rate");
      else missing.push("Heart Rate");

      if (spo2Idx !== -1) detected.push("SpO2 Level");
      else missing.push("SpO2 Level");

      if (sysBpIdx !== -1) detected.push("Systolic BP");
      else missing.push("Systolic BP");

      if (diaBpIdx !== -1) detected.push("Diastolic BP");
      else missing.push("Diastolic BP");

      if (tempIdx !== -1) detected.push("Body Temp");
      else missing.push("Body Temp");

      const targetDetected = labelIdx !== -1;

      if (missing.length > 0) {
        throw new Error(`Missing required physiological features: ${missing.join(", ")}`);
      }

      const sampleRows: ParsedPreviewRow[] = [];
      let validRowCount = 0;

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(",").map((p) => p.trim().replace(/^["']|["']$/g, ""));
        const hr = parseFloat(parts[hrIdx]);
        const spo2 = parseFloat(parts[spo2Idx]);
        const sys = parseFloat(parts[sysBpIdx]);
        const dia = parseFloat(parts[diaBpIdx]);
        const temp = parseFloat(parts[tempIdx]);
        const label = targetDetected && parts[labelIdx] ? parts[labelIdx] : "Healthy";

        if (!isNaN(hr) && !isNaN(spo2) && !isNaN(sys) && !isNaN(dia) && !isNaN(temp)) {
          validRowCount++;
          if (sampleRows.length < 5) {
            sampleRows.push({
              heartRate: Math.round(hr),
              spo2: Math.round(spo2),
              sysBp: Math.round(sys),
              diaBp: Math.round(dia),
              bodyTemp: parseFloat(temp.toFixed(1)),
              label,
            });
          }
        }
      }

      const report: ValidationReport = {
        totalRows: lines.length - 1,
        validRows: validRowCount,
        detectedFeatures: detected,
        missingFeatures: missing,
        targetDetected,
        sampleRows,
      };

      setValidation(report);
      setStatus("idle");
      setMessage("");
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setValidation(null);
      setStatus("error");
      setMessage(errMsg);
    }
  };

  const handleFileChange = (newFile: File | null) => {
    setFile(newFile);
    if (newFile) {
      parseAndValidateCSV(newFile);
      scrollToWorkbench();
    } else {
      setValidation(null);
      setStatus("idle");
      setMessage("");
    }
  };

  const handleLoadSample = () => {
    const sampleBlob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv" });
    const sampleFile = new File([sampleBlob], "patient_dataset_verified_batch.csv", { type: "text/csv" });
    handleFileChange(sampleFile);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "heartflow_telemetry_batch_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;
    if (retrainEnabled === false) {
      setStatus("error");
      setMessage("Retraining is disabled on the hosted demo");
      setTimeout(() => {
        statusBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
      return;
    }

    setStatus("uploading");
    setTimeout(() => {
      statusBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 60);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const { data, error: fetchErr, status: httpStatus } = await apiFetch<{ status?: string; message?: string; error?: string }>(
        "/heartflow/retrain",
        {
          method: "POST",
          body: formData,
          onSlow: (slow) => setIsSlow(slow),
        }
      );

      if (httpStatus === 403) {
        setStatus("error");
        setMessage("Retraining is disabled on the hosted demo (HTTP 403)");
        setTimeout(() => {
          statusBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 80);
        return;
      }

      if (data && (data.status === "success" || !data.error)) {
        setStatus("success");
        setMessage(data.message || "Dataset merged and ensemble models successfully retrained!");
        setTimeout(() => {
          statusBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 80);
        return;
      }

      if (fetchErr) {
        setStatus("error");
        setMessage(fetchErr);
        setTimeout(() => {
          statusBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 80);
        return;
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      setStatus("error");
      setMessage(`Retraining error: ${errMsg}`);
      setTimeout(() => {
        statusBannerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 80);
      return;
    }
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col space-y-8">
        {/* Header */}
        <header className="border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
              PIPELINE CONTROL MATRIX
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9]">
              MODEL<br />OPERATIONS
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-white">
              ENSEMBLE: 5 MODELS (RF: 0.25, MLP: 0.25, LOGREG: 0.20, KNN: 0.15, SVM: 0.15)
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadTemplate}
                className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3.5 py-1.5 bg-white hover:bg-canvas-cream transition-colors flex items-center gap-1.5"
                title="Download verified CSV template with exact schema"
              >
                <Download size={13} />
                Download CSV Template
              </button>
              <button
                onClick={handleLoadSample}
                className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3.5 py-1.5 bg-white hover:bg-hazard hover:text-white transition-colors flex items-center gap-1.5"
                title="Load verified sample dataset from active records"
              >
                <FileSpreadsheet size={13} />
                Load Sample Dataset
              </button>
            </div>
          </div>
        </header>

        {/* Feature Schema Contract Guide */}
        <section className="crosshair-corner border-2 border-ink bg-white p-6 sm:p-8 shadow-[4px_4px_0px_0px_#141413]">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b-2 border-ink pb-4 mb-6 gap-2">
            <div>
              <h2 className="text-[18px] font-black uppercase tracking-tight text-ink flex items-center gap-2">
                <ShieldCheck size={18} className="text-hazard" />
                Required Dataset Schema Contract
              </h2>
              <p className="text-[12px] text-slate uppercase mt-1">
                Uploads are verified against this schema. Column aliases are resolved automatically to prevent failure.
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate bg-canvas-cream border border-ink/30 px-3 py-1 self-start sm:self-auto">
              Zero-Failure Ingestion
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {CANONICAL_FEATURES.map((feat) => (
              <div key={feat.name} className="border-2 border-ink bg-canvas-cream p-4 flex flex-col justify-between group hover:bg-white transition-colors">
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-bold text-[13px] text-ink uppercase tracking-wider">{feat.name}</span>
                    <span className="text-[11px] font-bold text-hazard font-mono">{feat.unit}</span>
                  </div>
                  <div className="text-[10px] text-slate uppercase font-bold tracking-wider mb-2">
                    Valid: {feat.range}
                  </div>
                  <p className="text-[11px] text-slate leading-relaxed normal-case font-mono mb-3">
                    {feat.desc}
                  </p>
                </div>
                <div className="border-t border-ink/20 pt-2 text-[10px] text-slate font-bold uppercase tracking-wider">
                  <span className="text-ink">Aliases:</span> {feat.aliases}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-2 border-ink bg-canvas-cream p-4 text-[12px] leading-relaxed text-slate flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="font-bold uppercase text-ink">Automatic Leakage Protection: </span>
              Metadata and alert columns (<code className="bg-white border border-ink/30 px-1 font-bold">Heart Rate Alert</code>, <code className="bg-white border border-ink/30 px-1 font-bold">Patient Number</code>, <code className="bg-white border border-ink/30 px-1 font-bold">Fall Detection</code>) are cleaned during ingestion and will not fail training if omitted.
            </div>
            <a
              href="/docs"
              className="text-[11px] font-bold uppercase text-hazard hover:underline whitespace-nowrap flex items-center gap-1"
            >
              Full API Specs <ArrowRight size={12} />
            </a>
          </div>
        </section>

        {/* Upload & Staging Workspace - Unified Monolithic Workbench */}
        <div
          ref={stagingWorkbenchRef}
          id="staging-workbench"
          className="scroll-mt-24 border-2 border-ink bg-white grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x-2 divide-ink shadow-[4px_4px_0px_0px_#141413]"
        >
          {/* Dropzone Panel */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="border-b-2 border-ink pb-3 mb-6">
                <h2 className="text-[16px] font-bold tracking-wider uppercase text-ink flex items-center gap-2">
                  <Database size={16} />
                  Batch Upload Workspace
                </h2>
                <p className="text-[12px] text-slate uppercase mt-1">
                  Select a CSV dataset or click Load Sample Dataset above.
                </p>
              </div>

              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full min-h-56 border-2 border-dashed border-ink bg-canvas-cream hover:bg-ink hover:text-white transition-colors cursor-pointer group relative overflow-hidden p-6"
              >
                <div className="flex flex-col items-center justify-center relative z-10 text-center">
                  <div className="mb-3 text-ink group-hover:text-white">
                    {file ? (
                      <CheckCircle2 size={36} className="text-emerald-600 group-hover:text-white" />
                    ) : (
                      <FileSpreadsheet size={36} />
                    )}
                  </div>

                  <p className="text-[14px] font-black uppercase tracking-wider mb-1">
                    {file ? file.name : "Choose CSV File"}
                  </p>
                  <p className="text-[11px] uppercase opacity-75">
                    {file ? `${(file.size / 1024).toFixed(1)} KB · Ready for Retraining` : "Drag file here or click to browse"}
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="sr-only"
                  accept=".csv"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  aria-label="Upload CSV Dataset"
                />
              </label>
            </div>

            <div className="pt-6 border-t-2 border-ink mt-6 flex flex-col gap-3">
              {retrainEnabled === false && (
                <div className="p-3 border-2 border-hazard bg-hazard/10 text-hazard text-[12px] font-bold uppercase tracking-wider">
                  Retraining is disabled on the hosted demo
                </div>
              )}
              {isSlow && (
                <div className="p-3 border-2 border-hazard bg-hazard/10 text-hazard text-[12px] font-bold uppercase tracking-wider">
                  Waking up the server, first request can take a minute
                </div>
              )}
              <button
                onClick={handleUpload}
                disabled={!file || status === "uploading" || retrainEnabled === false || (validation !== null && validation.validRows === 0)}
                className="btn-tactile-hazard py-4 text-[15px] font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {status === "uploading" ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    Retraining Ensemble...
                  </>
                ) : (
                  "Retrain Ensemble"
                )}
              </button>

              {status !== "idle" && (
                <div
                  ref={statusBannerRef}
                  className={`p-3 border-2 text-[12px] font-bold uppercase tracking-wider scroll-mt-24 ${
                    status === "success"
                      ? "bg-[#d1fae5] border-[#065f46] text-[#065f46]"
                      : status === "error"
                      ? "bg-rose-100 border-hazard text-hazard"
                      : "bg-canvas-cream border-ink text-slate"
                  }`}
                >
                  {status === "uploading" ? "Executing ingestion and model re-fitting pipeline..." : message}
                </div>
              )}
            </div>
          </div>

          {/* Validation Inspector & Staging Preview */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
            <div className="border-b-2 border-ink pb-3 mb-6 flex justify-between items-center flex-wrap gap-2">
              <div>
                <h2 className="text-[16px] font-bold tracking-wider uppercase text-ink flex items-center gap-2">
                  <ShieldCheck size={16} />
                  Pre-flight Schema Inspector
                </h2>
                <p className="text-[12px] text-slate uppercase mt-1">
                  Automatic alias detection and feature integrity check.
                </p>
              </div>

              {validation && (
                <span className="text-[11px] font-bold uppercase tracking-wider bg-ink text-white px-3 py-1">
                  {validation.validRows} / {validation.totalRows} Rows Valid
                </span>
              )}
            </div>

            {validation ? (
              <div className="flex flex-col gap-6 grow">
                {/* Feature Detection Badges */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CANONICAL_FEATURES.slice(0, 5).map((f) => {
                    const isDetected = validation.detectedFeatures.some((d) =>
                      d.toLowerCase().includes(f.name.toLowerCase())
                    );
                    return (
                      <div
                        key={f.name}
                        className={`p-2.5 border-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
                          isDetected
                            ? "bg-[#d1fae5] border-[#065f46] text-[#065f46]"
                            : "bg-rose-100 border-hazard text-hazard"
                        }`}
                      >
                        <span>{f.name}</span>
                        {isDetected ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
                      </div>
                    );
                  })}
                  <div
                    className={`p-2.5 border-2 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between ${
                      validation.targetDetected
                        ? "bg-[#d1fae5] border-[#065f46] text-[#065f46]"
                        : "bg-canvas-cream border-ink/40 text-slate"
                    }`}
                  >
                    <span>Target Label</span>
                    <span className="text-[9px]">{validation.targetDetected ? "Found" : "Default: Normal"}</span>
                  </div>
                </div>

                {/* Staging Data Preview Table */}
                <div className="border-2 border-ink overflow-x-auto">
                  <table className="w-full text-left text-[11px] font-mono tabular-nums">
                    <thead className="bg-ink text-white uppercase tracking-wider font-bold">
                      <tr>
                        <th className="px-3 py-2 border-r border-white/20">HR</th>
                        <th className="px-3 py-2 border-r border-white/20">SpO2</th>
                        <th className="px-3 py-2 border-r border-white/20">BP (Sys/Dia)</th>
                        <th className="px-3 py-2 border-r border-white/20">Temp</th>
                        <th className="px-3 py-2">Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y border-t border-ink text-ink font-bold">
                      {validation.sampleRows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-canvas-cream transition-colors">
                          <td className="px-3 py-2 border-r border-ink/20">{r.heartRate} BPM</td>
                          <td className="px-3 py-2 border-r border-ink/20">{r.spo2}%</td>
                          <td className="px-3 py-2 border-r border-ink/20">{r.sysBp}/{r.diaBp}</td>
                          <td className="px-3 py-2 border-r border-ink/20">{r.bodyTemp}°C</td>
                          <td className="px-3 py-2 text-hazard">{r.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[11px] font-bold text-slate uppercase flex justify-between items-center">
                  <span>Displaying first {validation.sampleRows.length} staged rows</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Ready for Ingestion
                  </span>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-75 border-2 border-dashed border-ink/30 bg-canvas-cream flex flex-col items-center justify-center p-8 text-center text-slate">
                <FileSpreadsheet size={32} className="mb-2 text-slate/60" />
                <div className="text-[13px] font-bold uppercase tracking-wider text-ink mb-1">
                  No Telemetry Staged
                </div>
                <p className="text-[11px] max-w-sm normal-case font-mono leading-relaxed mb-4">
                  Select a CSV dataset or click &quot;Load Sample Dataset&quot; to inspect columns, verify data bounds, and run pre-flight checks.
                </p>
                <button
                  onClick={handleLoadSample}
                  className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-white hover:bg-ink hover:text-white transition-colors"
                >
                  Load 8 Verified Sample Observations
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4-Stage MLOps Pipeline Flow Architecture */}
        <section className="crosshair-corner border-2 border-ink bg-white p-6 sm:p-8 shadow-[4px_4px_0px_0px_#141413]">
          <div className="border-b-2 border-ink pb-3 mb-6">
            <h2 className="text-[16px] font-bold tracking-wider uppercase text-ink flex items-center gap-2">
              <Layers size={16} />
              Automated Pipeline Architecture
            </h2>
            <p className="text-[12px] text-slate uppercase mt-1">
              How HEARTFLOW_OS processes data from raw CSV to deployed edge models.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border-2 border-ink bg-canvas-cream p-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-hazard tracking-widest uppercase mb-1">STAGE 01</div>
                <h3 className="text-[14px] font-black uppercase tracking-tight text-ink mb-2">Ingestion & Aliases</h3>
                <p className="text-[11px] text-slate normal-case font-mono leading-relaxed">
                  Resolves case-insensitive headers, converts degree symbols, and purges alert columns to eliminate target leakage.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-ink/20 text-[10px] font-bold text-ink uppercase">
                Zero Schema Drops
              </div>
            </div>

            <div className="border-2 border-ink bg-canvas-cream p-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-hazard tracking-widest uppercase mb-1">STAGE 02</div>
                <h3 className="text-[14px] font-black uppercase tracking-tight text-ink mb-2">Feature Synthesis</h3>
                <p className="text-[11px] text-slate normal-case font-mono leading-relaxed">
                  Derives synthetic feature <code className="font-bold text-ink">Risk_Severity = (HR &gt; 105) + (SpO2 &lt; 94)</code>, applies median imputation, and standardizes continuous vitals via StandardScaler.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-ink/20 text-[10px] font-bold text-ink uppercase">
                Imputer + Scaler Fit
              </div>
            </div>

            <div className="border-2 border-ink bg-canvas-cream p-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-hazard tracking-widest uppercase mb-1">STAGE 03</div>
                <h3 className="text-[14px] font-black uppercase tracking-tight text-ink mb-2">5-Model Re-fitting</h3>
                <p className="text-[11px] text-slate normal-case font-mono leading-relaxed">
                  Fits Random Forest (30 trees), Linear SVM, Logistic Regression, KNN (5-NN), and Small Neural Net (MLP 16-8 hidden ReLU) in parallel.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-ink/20 text-[10px] font-bold text-ink uppercase">
                Weighted Soft Voting
              </div>
            </div>

            <div className="border-2 border-ink bg-canvas-cream p-4 flex flex-col justify-between">
              <div>
                <div className="text-[11px] font-bold text-hazard tracking-widest uppercase mb-1">STAGE 04</div>
                <h3 className="text-[14px] font-black uppercase tracking-tight text-ink mb-2">Live Hot-Swap</h3>
                <p className="text-[11px] text-slate normal-case font-mono leading-relaxed">
                  Atomically swaps in-memory ensemble instance protected by threading locks without downtime, instantly updating C99 transpiler coefficients.
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-ink/20 text-[10px] font-bold text-ink uppercase flex items-center gap-1">
                <Zap size={11} className="text-hazard" /> Ready for C Transpiler
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

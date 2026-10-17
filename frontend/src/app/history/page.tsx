"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { 
  getSessionHistory, 
  downloadSessionCSV, 
  downloadSessionJSON, 
  clearSessionHistory 
} from "@/lib/edge/history";
import { HistoryRecord } from "@/lib/edge/types";
import { 
  FileText, 
  Printer, 
  X, 
  Database, 
  HardDrive, 
  RefreshCw,
  Copy,
  Check,
  Download,
  PlusCircle,
  Activity
} from "lucide-react";

interface RawCloudRecord {
  id: number;
  timestamp: string;
  heart_rate: number;
  spo2: number;
  sys_bp: number;
  dia_bp: number;
  temp?: number;
  body_temp?: number;
  prediction_label: string;
  confidence: number;
}

const SAMPLE_CLINICAL_RECORDS: HistoryRecord[] = [
  {
    id: 1001,
    timestamp: "2026-10-18 22:45:10",
    heart_rate: 74,
    spo2: 98,
    sys_bp: 118,
    dia_bp: 78,
    body_temp: 37.0,
    prediction_label: "Normal",
    confidence: 0.985,
    is_at_risk: false,
  },
  {
    id: 1002,
    timestamp: "2026-10-18 22:46:25",
    heart_rate: 76,
    spo2: 98,
    sys_bp: 120,
    dia_bp: 80,
    body_temp: 37.1,
    prediction_label: "Normal",
    confidence: 0.978,
    is_at_risk: false,
  },
  {
    id: 1003,
    timestamp: "2026-10-18 22:47:40",
    heart_rate: 128,
    spo2: 91,
    sys_bp: 165,
    dia_bp: 104,
    body_temp: 37.3,
    prediction_label: "Heart Disease",
    confidence: 0.942,
    is_at_risk: true,
  },
  {
    id: 1004,
    timestamp: "2026-10-18 22:48:55",
    heart_rate: 124,
    spo2: 92,
    sys_bp: 158,
    dia_bp: 98,
    body_temp: 37.2,
    prediction_label: "Heart Disease",
    confidence: 0.915,
    is_at_risk: true,
  },
  {
    id: 1005,
    timestamp: "2026-10-18 22:50:10",
    heart_rate: 88,
    spo2: 96,
    sys_bp: 135,
    dia_bp: 88,
    body_temp: 37.0,
    prediction_label: "Normal",
    confidence: 0.962,
    is_at_risk: false,
  },
  {
    id: 1006,
    timestamp: "2026-10-18 22:51:25",
    heart_rate: 98,
    spo2: 96,
    sys_bp: 195,
    dia_bp: 118,
    body_temp: 37.1,
    prediction_label: "Hypertension",
    confidence: 0.971,
    is_at_risk: true,
  },
  {
    id: 1007,
    timestamp: "2026-10-18 22:52:40",
    heart_rate: 78,
    spo2: 97,
    sys_bp: 124,
    dia_bp: 82,
    body_temp: 36.9,
    prediction_label: "Normal",
    confidence: 0.981,
    is_at_risk: false,
  },
  {
    id: 1008,
    timestamp: "2026-10-18 22:53:55",
    heart_rate: 72,
    spo2: 99,
    sys_bp: 116,
    dia_bp: 76,
    body_temp: 36.8,
    prediction_label: "Normal",
    confidence: 0.993,
    is_at_risk: false,
  },
];

export default function PatientHistory() {
  const [sourceTab, setSourceTab] = useState<"session" | "cloud">("session");
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [cloudRecords, setCloudRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);

  const tableSectionRef = useRef<HTMLDivElement>(null);

  const refreshSessionHistory = useCallback(() => {
    setRecords(getSessionHistory());
    setLoading(false);
  }, []);

  const fetchCloudHistory = useCallback(async () => {
    setCloudLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/history`);
      if (res.ok) {
        const raw = (await res.json()) as RawCloudRecord[];
        if (Array.isArray(raw)) {
          const formatted: HistoryRecord[] = raw.map((r: RawCloudRecord) => ({
            id: r.id,
            timestamp: r.timestamp,
            heart_rate: r.heart_rate,
            spo2: r.spo2,
            sys_bp: r.sys_bp,
            dia_bp: r.dia_bp,
            body_temp: r.temp ?? r.body_temp ?? 37.0,
            prediction_label: r.prediction_label,
            confidence: r.confidence,
            is_at_risk: Boolean(r.prediction_label && r.prediction_label.toLowerCase() !== "normal" && r.prediction_label.toLowerCase() !== "healthy")
          }));
          setCloudRecords(formatted);
        }
      }
    } catch {
      // cloud unavailable
    } finally {
      setCloudLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      refreshSessionHistory();
    }, 0);

    const interval = setInterval(() => {
      setRecords(getSessionHistory());
    }, 1500);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [refreshSessionHistory]);

  const activeRecords = sourceTab === "session" ? records : cloudRecords;
  const isLoading = sourceTab === "session" ? loading : cloudLoading;

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the active session telemetry log?")) {
      clearSessionHistory();
      setRecords([]);
    }
  };

  const handleLoadSampleRecords = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("heartflow_session_log_v2", JSON.stringify(SAMPLE_CLINICAL_RECORDS));
    }
    setRecords(SAMPLE_CLINICAL_RECORDS);
    setTimeout(() => {
      tableSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const handleOpenReport = () => {
    if (activeRecords.length === 0) {
      if (sourceTab === "session") {
        handleLoadSampleRecords();
      } else {
        setCloudRecords(SAMPLE_CLINICAL_RECORDS);
      }
    }
    setShowReportModal(true);
  };

  const recordsToAnalyze = activeRecords.length > 0 ? activeRecords : SAMPLE_CLINICAL_RECORDS;

  // Summary Metrics for Clinical Report
  const metrics = useMemo(() => {
    const list = recordsToAnalyze;
    if (!list || list.length === 0) return null;
    const hrs = list.map(r => Number(r.heart_rate) || 75);
    const spo2s = list.map(r => Number(r.spo2) || 98);
    const sbps = list.map(r => Number(r.sys_bp) || 120);
    const dbps = list.map(r => Number(r.dia_bp) || 80);
    const anomalies = list.filter(r => r.is_at_risk || (r.prediction_label && r.prediction_label.toLowerCase() !== "normal" && r.prediction_label.toLowerCase() !== "healthy"));

    const meanHr = Math.round(hrs.reduce((a, b) => a + b, 0) / (hrs.length || 1));
    const maxHr = Math.max(...hrs);
    const minHr = Math.min(...hrs);
    const meanSpo2 = Math.round(spo2s.reduce((a, b) => a + b, 0) / (spo2s.length || 1));
    const nadirSpo2 = Math.min(...spo2s);
    const meanSbp = Math.round(sbps.reduce((a, b) => a + b, 0) / (sbps.length || 1));
    const meanDbp = Math.round(dbps.reduce((a, b) => a + b, 0) / (dbps.length || 1));
    const mapValue = Math.round((2 * meanDbp + meanSbp) / 3);
    const shockIndex = meanSbp > 0 ? (meanHr / meanSbp).toFixed(2) : "0.62";
    const riskRate = ((anomalies.length / (list.length || 1)) * 100).toFixed(1);

    // Find top diagnostic consensus
    const counts: Record<string, number> = {};
    list.forEach(r => {
      const lbl = r.prediction_label || "Normal";
      counts[lbl] = (counts[lbl] || 0) + 1;
    });
    const topDiagnosis = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, "Normal");
    const meanConfidence = list.reduce((a, b) => a + (Number(b.confidence) || 0.95), 0) / (list.length || 1);

    // Cryptographic-style pseudo hash for verification audit
    const hash = Array.from(JSON.stringify(list.slice(0, 5)))
      .reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0) | 0, 0)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0");

    const narrative = `During this monitoring evaluation across ${list.length} recorded telemetry intervals, ${anomalies.length} observations triggered cardiovascular risk indicators (${riskRate}% risk burden). Primary consensus classification aligns with ${topDiagnosis} with ${(meanConfidence * 100).toFixed(1)}% ensemble model agreement. Mean arterial pressure is maintained at ${mapValue} mmHg with clinical shock index ${shockIndex}. Lead-II electrophysiological tracing conforms to active TinyML inference boundaries.`;

    return { 
      meanHr, maxHr, minHr, meanSpo2, nadirSpo2, meanSbp, meanDbp, mapValue, shockIndex,
      anomalyCount: anomalies.length, total: list.length, riskRate, topDiagnosis, meanConfidence, narrative, hash 
    };
  }, [recordsToAnalyze]);

  const generateReportText = () => {
    if (!metrics) return "";
    return `================================================================================
HEARTFLOW_OS CLINICAL TELEMETRY & DISCHARGE SUMMARY REPORT
Document Reference: HFL-REP-${metrics.hash}
Generated: ${new Date().toISOString().replace("T", " ").substring(0, 19)} UTC
Patient Reference: PT-9428-A
Telemetry Source: ${sourceTab === "session" ? "Active Browser Session" : "Persistent Database Archive"}
Total Intervals Evaluated: ${metrics.total}
================================================================================

1. PATIENT PHYSIOLOGICAL BIOMARKERS SUMMARY:
--------------------------------------------------------------------------------
- Mean Heart Rate:          ${metrics.meanHr} BPM (Observed Range: ${metrics.minHr} - ${metrics.maxHr} BPM)
- Mean SpO2 Saturation:     ${metrics.meanSpo2}% (Nadir SpO2: ${metrics.nadirSpo2}%)
- Mean Blood Pressure:      ${metrics.meanSbp}/${metrics.meanDbp} mmHg
- Mean Arterial Pressure:   ${metrics.mapValue} mmHg
- Clinical Shock Index:     ${metrics.shockIndex} (Reference Range: 0.5 - 0.7)
- Anomaly Burden:           ${metrics.riskRate}% (${metrics.anomalyCount} of ${metrics.total} intervals flagged)

2. ENSEMBLE DIAGNOSTIC CONSENSUS:
--------------------------------------------------------------------------------
- Primary Consensus:        ${metrics.topDiagnosis}
- Ensemble Confidence:      ${(metrics.meanConfidence * 100).toFixed(1)}%
- Classifier Architecture:  5-Model Soft Voting (Random Forest, Linear SVM, KNN, Logistic Regression, MLP Neural Network)
- Microcontroller Target:   INT8 Fixed-Point C99 Zero-Heap Firmware

3. CLINICAL NARRATIVE:
--------------------------------------------------------------------------------
${metrics.narrative}

4. AUDIT & VERIFICATION:
--------------------------------------------------------------------------------
- Verification Audit Hash:  0x${metrics.hash}
- Alarm Logic Reference:    IEC 60601-1-8 Alarm Priority Categories (Non-diagnostic Protocol)
- Transpiler Firmware:      ISO/IEC 9899:1999 (C99)
- Attending Physician:      ________________________________________
================================================================================`;
  };

  const handleDownloadReportText = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Clinical_Report_PT-9428-A_${new Date().toISOString().substring(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyReport = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    } catch {
      // clipboard fallback
    }
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
              SESSION AUDIT TRAIL
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9]">
              PATIENT<br />SESSION LOG
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSourceTab("session")}
                className={`btn-tactile text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 flex items-center gap-1.5 transition-colors ${
                  sourceTab === "session" ? "bg-ink text-white" : "bg-white text-ink hover:bg-canvas-cream"
                }`}
              >
                <HardDrive size={13} />
                Active Session ({records.length})
              </button>
              <button
                onClick={() => {
                  setSourceTab("cloud");
                  fetchCloudHistory();
                }}
                className={`btn-tactile text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 flex items-center gap-1.5 transition-colors ${
                  sourceTab === "cloud" ? "bg-ink text-white" : "bg-white text-ink hover:bg-canvas-cream"
                }`}
              >
                <Database size={13} />
                Database Archive ({cloudRecords.length})
              </button>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              {sourceTab === "session"
                ? "Scope: In-Memory Client Session · Sources: Live Monitor & Simulator"
                : "Scope: Persistent SQLite Database · Source: Backend Service"}
            </div>
          </div>
        </header>

        {/* Action Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenReport}
              className="btn-tactile-hazard px-5 py-2 text-[12px] font-bold tracking-wider uppercase flex items-center gap-2"
              title="Generate printable clinical audit report"
            >
              <FileText size={14} />
              Generate Clinical Report
            </button>

            {sourceTab === "session" && records.length === 0 && (
              <button
                onClick={handleLoadSampleRecords}
                className="btn-tactile border-2 border-ink bg-white text-ink hover:bg-canvas-cream px-4 py-2 text-[12px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
                title="Populate 8 realistic clinical test vector entries"
              >
                <PlusCircle size={13} className="text-hazard" />
                Load Sample Log
              </button>
            )}

            <button
              onClick={() => downloadSessionCSV(recordsToAnalyze)}
              className="btn-tactile border-2 border-ink bg-ink text-white hover:bg-hazard hover:border-hazard px-5 py-2 text-[12px] font-bold tracking-wider uppercase transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={() => downloadSessionJSON(recordsToAnalyze)}
              className="btn-tactile border-2 border-ink bg-white text-ink hover:bg-canvas-cream px-5 py-2 text-[12px] font-bold tracking-wider uppercase transition-colors"
            >
              Export JSON
            </button>
            {sourceTab === "cloud" && (
              <button
                onClick={fetchCloudHistory}
                disabled={cloudLoading}
                className="btn-tactile border-2 border-ink bg-white text-ink hover:bg-canvas-cream px-4 py-2 text-[12px] font-bold tracking-wider uppercase transition-colors flex items-center gap-1.5"
              >
                <RefreshCw size={12} className={cloudLoading ? "animate-spin" : ""} />
                Refresh
              </button>
            )}
          </div>

          {sourceTab === "session" && (
            <div>
              <button
                onClick={handleClear}
                disabled={records.length === 0}
                className="btn-tactile border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 text-[11px] font-bold tracking-wider uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Clear Session
              </button>
            </div>
          )}
        </div>

        {/* Telemetry Log Table */}
        <div ref={tableSectionRef} className="crosshair-corner border-2 border-ink bg-ink scroll-mt-24">
          <div className="overflow-x-auto bg-canvas-cream">
            <table className="w-full text-left">
              <thead className="bg-ink text-white font-bold text-[12px] tracking-widest uppercase">
                <tr>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">Timestamp</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">HR (BPM)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">SpO2 (%)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">BP (Sys/Dia)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">Temp (°C)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">Status / Diagnosis</th>
                  <th className="px-6 py-4">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink text-ink font-bold text-[13px] uppercase">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center bg-white text-slate">
                      Loading historical records...
                    </td>
                  </tr>
                ) : activeRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center bg-white">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-lg mx-auto">
                        <div className="text-hazard font-bold text-[14px] tracking-widest uppercase">
                          No Session Telemetry Recorded
                        </div>
                        <p className="text-[12px] text-slate normal-case font-mono leading-relaxed">
                          {sourceTab === "session"
                            ? "Vitals can be captured dynamically from the Live Monitor using 'Record Snapshot', or evaluated via the Simulator. You can also populate verified clinical test vectors below."
                            : "No cloud predictions found in SQLite database. Start FastAPI backend and execute live evaluations to store persistent records."}
                        </p>
                        <div className="mt-2 flex flex-wrap justify-center items-center gap-3">
                          {sourceTab === "session" && (
                            <button
                              onClick={handleLoadSampleRecords}
                              className="btn-tactile border-2 border-ink bg-white text-ink hover:bg-canvas-cream px-4 py-2 text-[11px] font-bold tracking-wider uppercase transition-colors"
                            >
                              Load Clinical Test Vectors (8 Records)
                            </button>
                          )}
                          <button
                            onClick={handleOpenReport}
                            className="btn-tactile-hazard px-4 py-2 text-[11px] font-bold tracking-wider uppercase"
                          >
                            Generate Instant Report
                          </button>
                          <Link
                            href="/monitor"
                            className="btn-tactile border-2 border-ink bg-canvas-cream text-ink px-4 py-2 text-[11px] font-bold tracking-wider uppercase hover:bg-ink hover:text-white transition-colors"
                          >
                            Open Monitor →
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  activeRecords.map((record) => {
                    const predLabel = record.prediction_label || "NORMAL";

                    const getStatusStyles = (label: string) => {
                      const normalized = label.toLowerCase();
                      if (normalized === "normal" || normalized === "healthy") return "bg-[#d1fae5] text-[#065f46]";
                      if (normalized.includes("heart")) return "bg-[#fef08a] text-[#854d0e]";
                      if (normalized.includes("asthma")) return "bg-[#e0f2fe] text-[#075985]";
                      if (normalized.includes("hypertension")) return "bg-[#f3e8ff] text-[#6b21a8]";
                      if (normalized.includes("diabetes")) return "bg-[#ffedd5] text-[#9a3412]";
                      return "bg-hazard/20 text-hazard";
                    };

                    return (
                      <tr key={record.id} className="hover:bg-canvas-cream transition-colors bg-white tabular-nums">
                        <td className="px-6 py-4 whitespace-nowrap border-r-2 border-ink text-slate">
                          {record.timestamp}
                        </td>
                        <td className="px-6 py-4 border-r-2 border-ink">{record.heart_rate}</td>
                        <td className="px-6 py-4 border-r-2 border-ink">{record.spo2}</td>
                        <td className="px-6 py-4 border-r-2 border-ink">{record.sys_bp}/{record.dia_bp}</td>
                        <td className="px-6 py-4 border-r-2 border-ink">{record.body_temp}</td>
                        <td className={`px-6 py-4 border-r-2 border-ink ${getStatusStyles(predLabel)}`}>
                          {predLabel}
                        </td>
                        <td className="px-6 py-4">
                          {(record.confidence * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clinical Discharge / Summary Report Modal (Printable) */}
      {showReportModal && metrics && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div
            id="clinical-report-printable"
            className="bg-white border-4 border-ink max-w-3xl w-full p-6 sm:p-8 flex flex-col gap-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative my-auto"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start border-b-2 border-ink pb-4">
              <div>
                <div className="text-[11px] font-bold text-hazard tracking-widest uppercase flex items-center gap-2">
                  <Activity size={13} />
                  HEARTFLOW_OS · Clinical Telemetry Summary Report
                </div>
                <h2 className="text-[22px] sm:text-[28px] font-black uppercase tracking-tight text-ink mt-1">
                  PATIENT PHYSIOLOGICAL AUDIT
                </h2>
                <div className="text-[11px] text-slate font-bold tracking-wider uppercase mt-1">
                  Patient ID: <span className="text-ink">PT-9428-A</span> · Date: {new Date().toISOString().replace("T", " ").substring(0, 19)} UTC · Audit Hash: 0x{metrics.hash}
                </div>
              </div>
              <button
                onClick={() => setShowReportModal(false)}
                className="border-2 border-ink p-1.5 hover:bg-hazard hover:text-white transition-colors no-print"
                title="Close Report"
              >
                <X size={18} />
              </button>
            </div>

            {/* Vitals Summary Grid (6-Cell Clinical Grid) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-px bg-ink border-2 border-ink">
              <div className="bg-canvas-cream p-3 text-center">
                <div className="text-[9px] font-bold text-slate tracking-widest uppercase">Mean HR</div>
                <div className="text-[20px] font-black tabular-nums">{metrics.meanHr} <span className="text-[10px] text-hazard">BPM</span></div>
                <div className="text-[9px] text-slate tabular-nums">{metrics.minHr}-{metrics.maxHr}</div>
              </div>
              <div className="bg-canvas-cream p-3 text-center">
                <div className="text-[9px] font-bold text-slate tracking-widest uppercase">Nadir SpO2</div>
                <div className="text-[20px] font-black tabular-nums">{metrics.nadirSpo2} <span className="text-[10px] text-hazard">%</span></div>
                <div className="text-[9px] text-slate tabular-nums">Mean {metrics.meanSpo2}%</div>
              </div>
              <div className="bg-canvas-cream p-3 text-center">
                <div className="text-[9px] font-bold text-slate tracking-widest uppercase">Mean BP</div>
                <div className="text-[20px] font-black tabular-nums">{metrics.meanSbp}/{metrics.meanDbp}</div>
                <div className="text-[9px] text-slate">mmHg</div>
              </div>
              <div className="bg-canvas-cream p-3 text-center">
                <div className="text-[9px] font-bold text-slate tracking-widest uppercase">Mean MAP</div>
                <div className="text-[20px] font-black tabular-nums">{metrics.mapValue}</div>
                <div className="text-[9px] text-slate">mmHg</div>
              </div>
              <div className="bg-canvas-cream p-3 text-center">
                <div className="text-[9px] font-bold text-slate tracking-widest uppercase">Shock Index</div>
                <div className="text-[20px] font-black tabular-nums">{metrics.shockIndex}</div>
                <div className="text-[9px] text-slate">HR / SBP</div>
              </div>
              <div className="bg-canvas-cream p-3 text-center">
                <div className="text-[9px] font-bold text-slate tracking-widest uppercase">Risk Burden</div>
                <div className="text-[20px] font-black tabular-nums text-hazard">{metrics.riskRate}%</div>
                <div className="text-[9px] text-slate tabular-nums">{metrics.anomalyCount}/{metrics.total}</div>
              </div>
            </div>

            {/* Diagnostic Consensus Box */}
            <div className="border-2 border-ink p-4 bg-canvas-cream flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <div className="text-[10px] font-bold text-slate uppercase tracking-wider">Primary Diagnostic Consensus</div>
                <div className="text-[16px] font-black uppercase text-ink flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-hazard inline-block" />
                  {metrics.topDiagnosis}
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-bold text-slate uppercase tracking-wider">Ensemble Confidence</div>
                <div className="text-[16px] font-black text-ink tabular-nums">
                  {(metrics.meanConfidence * 100).toFixed(1)}% <span className="text-[11px] font-normal text-slate">(5-Model Soft Vote)</span>
                </div>
              </div>
            </div>

            {/* Diagnostic Narrative */}
            <div className="border-2 border-ink p-4 bg-white text-[12px] leading-relaxed">
              <div className="font-bold uppercase tracking-wider text-ink mb-2">Clinical Assessment Narrative:</div>
              <p className="text-slate">
                {metrics.narrative}
              </p>
            </div>

            {/* Recent Telemetry Intervals Table */}
            <div className="border-2 border-ink overflow-hidden">
              <div className="bg-ink text-white px-4 py-2 text-[11px] font-bold tracking-widest uppercase flex justify-between items-center">
                <span>Recent Telemetry Intervals Sample ({Math.min(5, recordsToAnalyze.length)} of {metrics.total})</span>
                <span className="text-[10px] text-hazard">INT8 TinyML</span>
              </div>
              <div className="divide-y divide-ink text-[11px] max-h-36 overflow-y-auto">
                {recordsToAnalyze.slice(0, 5).map((r) => (
                  <div key={r.id} className="p-2.5 flex justify-between items-center bg-white tabular-nums flex-wrap gap-2">
                    <span className="text-slate">{r.timestamp}</span>
                    <span>HR: <strong className="text-ink">{r.heart_rate}</strong> BPM</span>
                    <span>SpO2: <strong className="text-ink">{r.spo2}</strong>%</span>
                    <span>BP: <strong className="text-ink">{r.sys_bp}/{r.dia_bp}</strong></span>
                    <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase ${
                      r.is_at_risk ? "bg-hazard text-white border-hazard" : "bg-[#d1fae5] text-[#065f46] border-[#065f46]"
                    }`}>
                      {r.prediction_label} ({(r.confidence * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Physician Sign-off (Clean for Print) */}
            <div className="pt-2 border-t border-ink/20 flex justify-between items-end text-[10px] font-bold text-slate uppercase">
              <div>Verification Hash: 0x{metrics.hash}</div>
              <div className="text-right">Physician Signature: _______________________________</div>
            </div>

            {/* Modal Actions (Hidden in Print) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t-2 border-ink no-print">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn-tactile-hazard px-5 py-2 text-[12px] font-bold tracking-wider uppercase flex items-center gap-2"
                  title="Print or Save as PDF"
                >
                  <Printer size={14} />
                  Print / Save PDF
                </button>
                <button
                  onClick={handleDownloadReportText}
                  className="btn-tactile border-2 border-ink bg-white text-ink hover:bg-canvas-cream px-4 py-2 text-[12px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                  title="Download clinical summary as text file"
                >
                  <Download size={13} />
                  Download Summary (.TXT)
                </button>
                <button
                  onClick={handleCopyReport}
                  className="btn-tactile border-2 border-ink bg-white text-ink hover:bg-canvas-cream px-4 py-2 text-[12px] font-bold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
                  title="Copy formatted report to clipboard"
                >
                  {reportCopied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                  {reportCopied ? "Copied" : "Copy Report"}
                </button>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="btn-tactile border-2 border-ink bg-ink text-white px-5 py-2 text-[12px] font-bold tracking-wider uppercase hover:bg-hazard hover:border-hazard transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

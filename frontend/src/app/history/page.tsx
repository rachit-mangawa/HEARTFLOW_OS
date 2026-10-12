"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { 
  getSessionHistory, 
  downloadSessionCSV, 
  downloadSessionJSON, 
  clearSessionHistory 
} from "@/lib/edge/history";
import { HistoryRecord } from "@/lib/edge/types";

export default function PatientHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = () => {
    setRecords(getSessionHistory());
    setLoading(false);
  };

  useEffect(() => {
    refreshHistory();

    // Auto-refresh when active session records update from /simulator
    const interval = setInterval(refreshHistory, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleClear = () => {
    if (confirm("Are you sure you want to clear the current session telemetry log?")) {
      clearSessionHistory();
      setRecords([]);
    }
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white">
      <div className="max-w-350 mx-auto w-full px-8 py-16 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-hazard animate-pulse" />
              /// SESSION_AUDIT_LOG
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)] leading-[0.9]">
              PATIENT<br />DATA.LOG
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-canvas-cream tabular-nums">
              SESSION_RECORDS: {records.length}
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              SCOPE: ACTIVE_SESSION_ONLY // SOURCE: AI.SIMULATOR & SYS.MONITOR
            </div>
          </div>
        </header>

        {/* Action Toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-2 border-ink bg-white p-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => downloadSessionCSV(records)}
              disabled={records.length === 0}
              className="border-2 border-ink bg-ink text-white hover:bg-hazard hover:border-hazard px-5 py-2 text-[12px] font-bold tracking-wider uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              [ DOWNLOAD_SESSION_CSV ]
            </button>
            <button
              onClick={() => downloadSessionJSON(records)}
              disabled={records.length === 0}
              className="border-2 border-ink bg-white text-ink hover:bg-canvas-cream px-5 py-2 text-[12px] font-bold tracking-wider uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              [ EXPORT_JSON ]
            </button>
          </div>

          <div>
            <button
              onClick={handleClear}
              disabled={records.length === 0}
              className="border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white px-4 py-2 text-[11px] font-bold tracking-wider uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              [ CLEAR_SESSION ]
            </button>
          </div>
        </div>

        {/* Telemetry Log Table */}
        <div className="border-2 border-ink bg-ink">
          <div className="overflow-x-auto bg-canvas-cream">
            <table className="w-full text-left">
              <thead className="bg-ink text-white font-bold text-[12px] tracking-widest uppercase">
                <tr>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">TIMESTAMP</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">HR (BPM)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">SPO2 (%)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">BP (SYS/DIA)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">TEMP (°C)</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">STATUS / DIAGNOSIS</th>
                  <th className="px-6 py-4">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink text-ink font-bold text-[13px] uppercase">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center bg-white text-slate">
                      INITIALIZING_SESSION_STREAM...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center bg-white">
                      <div className="flex flex-col items-center justify-center gap-3 max-w-md mx-auto">
                        <div className="text-hazard font-bold text-[14px] tracking-widest">
                          {'< ACTIVE_SESSION_EMPTY >'}
                        </div>
                        <p className="text-[12px] text-slate normal-case font-mono leading-relaxed">
                          No simulator runs logged in current session. Data is captured dynamically when evaluated through the AI.SIMULATOR interface (or when snapshotted from SYS.MONITOR).
                        </p>
                        <div className="mt-2 flex gap-3">
                          <Link
                            href="/simulator"
                            className="border-2 border-ink bg-ink text-white px-4 py-2 text-[11px] font-bold tracking-wider uppercase hover:bg-hazard hover:border-hazard transition-colors"
                          >
                            Open AI.SIMULATOR →
                          </Link>
                          <Link
                            href="/monitor"
                            className="border-2 border-ink bg-canvas-cream text-ink px-4 py-2 text-[11px] font-bold tracking-wider uppercase hover:bg-ink hover:text-white transition-colors"
                          >
                            Open SYS.MONITOR →
                          </Link>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const isRisk = record.is_at_risk || (record.prediction_label && record.prediction_label.toLowerCase() !== "normal" && record.prediction_label.toLowerCase() !== "healthy");
                    const predLabel = record.prediction_label || "NORMAL";

                    const getStatusStyles = (label: string) => {
                      const normalized = label.toLowerCase();
                      if (normalized === 'normal' || normalized === 'healthy') return "bg-[#d1fae5] text-[#065f46]";
                      if (normalized.includes('heart')) return "bg-[#fef08a] text-[#854d0e]";
                      if (normalized.includes('asthma')) return "bg-[#e0f2fe] text-[#075985]";
                      if (normalized.includes('hypertension')) return "bg-[#f3e8ff] text-[#6b21a8]";
                      if (normalized.includes('diabetes')) return "bg-[#ffedd5] text-[#9a3412]";
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
                          {isRisk ? '[!] ' : '[OK] '}{predLabel}
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
    </main>
  );
}

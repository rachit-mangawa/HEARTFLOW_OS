"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface HistoryRecord {
  id: number;
  timestamp: string;
  heart_rate: number;
  spo2: number;
  sys_bp: number;
  dia_bp: number;
  body_temp?: number;
  temp?: number;
  prediction?: string;
  prediction_label?: string;
  confidence: number;
}

export default function PatientHistory() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/history")
      .then((res) => res.json())
      .then((data) => {
        setRecords(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-[100dvh] bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white">
      {/* Top Nav (Mechanical) */}
      <nav className="h-16 flex items-center px-8 border-b-2 border-ink bg-canvas-cream sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
          <Link href="/" className="font-sans text-[18px] font-black tracking-[-0.04em] uppercase">
            [ HEARTFLOW_OS ]
          </Link>
          <div className="flex gap-8 items-center text-[13px] font-bold tracking-[0.05em] uppercase">
            <Link href="/dashboard" className="text-ink hover:text-hazard transition-colors">SYS.MONITOR</Link>
            <Link href="/simulator" className="text-ink hover:text-hazard transition-colors">AI.SIMULATOR</Link>
            <Link href="/history" className="text-hazard border-b-2 border-hazard pb-1">DATA.LOG</Link>
            <Link href="/mlops" className="text-ink hover:text-hazard transition-colors">ML.OPS</Link>
            <Link href="/edge" className="text-ink hover:text-hazard transition-colors">EDGE.COMPILER</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto w-full px-8 py-16 flex-1 flex flex-col">
        <header className="mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-4">
              /// HISTORICAL_RECORDS
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)]">
              PREDICTION<br />LOG
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-[14px] font-bold uppercase tracking-[0.05em] border-2 border-ink px-4 py-2 bg-ink text-canvas-cream tabular-nums">
              ROWS: {records.length}
            </div>
          </div>
        </header>

        <div className="border-2 border-ink bg-ink">
          <div className="overflow-x-auto bg-canvas-cream">
            <table className="w-full text-left">
              <thead className="bg-ink text-white font-bold text-[12px] tracking-[0.1em] uppercase">
                <tr>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">TIMESTAMP</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">HR</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">SPO2</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">BP</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">TEMP</th>
                  <th className="px-6 py-4 border-r-2 border-canvas-cream/20">STATUS</th>
                  <th className="px-6 py-4">CONFIDENCE</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink text-ink font-bold text-[13px] uppercase">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center bg-white text-slate">
                      QUERYING_DATABASE...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center bg-white text-slate">
                      NO_RECORDS_FOUND.
                    </td>
                  </tr>
                ) : (
                  records.map((record) => {
                    const date = new Date(record.timestamp);
                    const predLabel = record.prediction_label || record.prediction || "UNKNOWN";
                    const isRisk = predLabel.toLowerCase().includes("risk") || predLabel.toLowerCase() !== "healthy";
                    const temperature = record.temp || record.body_temp || "—";
                    
                    const getStatusStyles = (label: string) => {
                      const normalized = label.toLowerCase();
                      if (normalized === 'healthy') return "bg-[#d1fae5] text-[#065f46]"; // Light green
                      if (normalized.includes('heart')) return "bg-[#fef08a] text-[#854d0e]"; // Light yellow
                      if (normalized.includes('asthma')) return "bg-[#e0f2fe] text-[#075985]"; // Light blue
                      if (normalized.includes('hypertension')) return "bg-[#f3e8ff] text-[#6b21a8]"; // Light purple
                      if (normalized.includes('diabetes')) return "bg-[#ffedd5] text-[#9a3412]"; // Light orange
                      return "bg-hazard/20 text-hazard"; // Default risk red
                    };

                    return (
                      <tr key={record.id} className="hover:bg-canvas-cream transition-colors bg-white tabular-nums">
                        <td className="px-6 py-4 whitespace-nowrap border-r-2 border-ink">
                          {date.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 border-r-2 border-ink">{record.heart_rate}</td>
                        <td className="px-6 py-4 border-r-2 border-ink">{record.spo2}</td>
                        <td className="px-6 py-4 border-r-2 border-ink">{record.sys_bp}/{record.dia_bp}</td>
                        <td className="px-6 py-4 border-r-2 border-ink">{temperature}</td>
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

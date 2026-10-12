"use client";

import { Database, Table2, Layers, Download } from "lucide-react";
import { useEffect, useState } from "react";

export default function Analytics() {
  const [dataset, setDataset] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDataset = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          const res = await fetch(apiUrl + "/dataset");
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
              setDataset(data as Record<string, unknown>[]);
              setLoading(false);
              return;
            }
          }
        }
      } catch {
        // Fall through to local dataset
      }

      // Zero-cloud embedded ground truth dataset
      try {
        const { SAMPLE_DATASET } = await import("@/lib/edge/dataset");
        setDataset(SAMPLE_DATASET as unknown as Record<string, unknown>[]);
      } catch (e) {
        console.error("Local dataset error", e);
      } finally {
        setLoading(false);
      }
    };

    loadDataset();
  }, []);

  const columns = dataset.length > 0 ? Object.keys(dataset[0]) : [];

  const handleExportCSV = () => {
    if (!dataset.length) return;
    const headers = columns.join(",");
    const rows = dataset.map((row) =>
      columns.map((c) => JSON.stringify(row[c] ?? "")).join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ground_truth_patient_dataset.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <Database size={14} />
              TELEMETRY GROUND TRUTH
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9]">
              DATASET<br />EXPLORER
            </h1>
          </div>

          <div className="flex flex-col sm:items-end gap-3">
            <div className="flex gap-2">
              <div className="px-3 py-1.5 bg-white border-2 border-ink flex items-center text-[12px] font-bold uppercase tracking-wider text-ink">
                <Layers className="w-3.5 h-3.5 mr-2 text-hazard" />
                {columns.length} Features
              </div>
              <div className="px-3 py-1.5 bg-ink border-2 border-ink text-white flex items-center text-[12px] font-bold uppercase tracking-wider">
                <Database className="w-3.5 h-3.5 mr-2 text-white" />
                {dataset.length} Observations
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={!dataset.length}
              className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-1.5 bg-white hover:bg-hazard hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Download size={13} />
              Download Training CSV
            </button>
          </div>
        </header>

        {/* Tabular Matrix View */}
        <div className="crosshair-corner border-2 border-ink bg-white flex flex-col h-160 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 border-b-2 border-ink flex items-center justify-between bg-canvas-cream">
            <h2 className="text-[13px] font-bold tracking-widest uppercase text-ink flex items-center gap-2">
              <Table2 size={16} />
              Training Telemetry Records
            </h2>
            <div className="text-[11px] font-bold text-slate uppercase tracking-wider">
              {loading ? "Loading..." : `${dataset.length} Total Records`}
            </div>
          </div>

          <div className="grow overflow-auto relative bg-white">
            <table className="w-full text-left text-[12px] tabular-nums font-mono">
              <thead className="bg-ink text-white sticky top-0 z-10 border-b-2 border-ink uppercase tracking-widest text-[11px] font-bold">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-6 py-3.5 border-r border-white/20 whitespace-nowrap">
                      {col.replace("_", " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-ink/10 text-ink uppercase font-bold">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length || 1} className="px-6 py-16 text-center text-slate">
                      Loading dataset...
                    </td>
                  </tr>
                ) : dataset.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length || 1} className="px-6 py-16 text-center text-slate">
                      No dataset records available. Upload a CSV in Model Operations.
                    </td>
                  </tr>
                ) : (
                  dataset.slice(0, 100).map((row, i) => (
                    <tr key={i} className="hover:bg-canvas-cream transition-colors">
                      {columns.map((col) => {
                        const val = row[col];
                        const isRiskCol = col.toLowerCase().includes("risk") || col.toLowerCase().includes("label");
                        const isRiskVal = String(val).toLowerCase() === "1" || String(val).toLowerCase() === "heart disease";
                        return (
                          <td
                            key={col}
                            className={`px-6 py-3 whitespace-nowrap border-r border-ink/10 ${
                              isRiskCol && isRiskVal ? "text-hazard" : ""
                            }`}
                          >
                            {typeof val === "number" && !Number.isInteger(val)
                              ? val.toFixed(2)
                              : String(val ?? "---")}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && dataset.length > 100 && (
            <div className="p-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate border-t-2 border-ink bg-canvas-cream">
              Showing first 100 rows · Download training CSV for full dataset
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

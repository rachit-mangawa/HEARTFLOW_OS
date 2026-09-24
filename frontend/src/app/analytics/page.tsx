"use client";

import { motion } from "framer-motion";
import { Database, LineChart, Table2, Layers } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Analytics() {
  const [dataset, setDataset] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/dataset")
      .then((res) => res.json())
      .then((data) => {
        setDataset(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const spring = {
    type: "spring" as const,
    stiffness: 100,
    damping: 20,
  };

  const columns = dataset.length > 0 ? Object.keys(dataset[0]) : [];

  return (
    <main className="min-h-[100dvh] relative overflow-hidden bg-canvas">

      <div className="max-w-[1200px] mx-auto px-8 py-24 relative">
        <div className="absolute top-0 right-1/4 w-[30vw] h-[30vw] rounded-full bg-gradient-sky opacity-20 blur-[80px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="mb-12 flex justify-between items-end"
        >
          <div>
            <h1 className="font-display text-[48px] font-light tracking-[-0.02em] text-ink leading-[1.08] mb-4">
              Dataset Explorer
            </h1>
            <p className="font-sans text-[16px] text-body max-w-2xl leading-relaxed tracking-[0.01em]">
              Preview the current ground-truth telemetry used for training the TinyML models.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="px-4 py-2 bg-canvas-soft border border-hairline-soft rounded-full flex items-center text-sm font-medium text-ink">
              <Layers className="w-4 h-4 mr-2 text-muted" />
              {columns.length} Features
            </div>
            <div className="px-4 py-2 bg-surface-card border border-hairline rounded-full flex items-center text-sm font-medium text-ink shadow-[0_4px_16px_rgba(0,0,0,0.02)]">
              <Database className="w-4 h-4 mr-2 text-muted" />
              {dataset.length} Rows
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="bg-surface-card rounded-xl border border-hairline shadow-[0_4px_16px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col h-[600px]"
        >
          <div className="p-4 border-b border-hairline-soft flex items-center justify-between bg-canvas-soft">
            <h2 className="font-sans text-[14px] font-medium text-ink flex items-center gap-2">
              <Table2 size={16} className="text-muted" /> Raw Tabular View
            </h2>
          </div>
          <div className="flex-grow overflow-auto relative bg-surface-card">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-canvas-soft sticky top-0 z-10 border-b border-hairline text-muted font-medium text-[12px] uppercase tracking-[0.06em]">
                <tr>
                  {columns.map(col => (
                    <th key={col} className="px-6 py-4 font-medium whitespace-nowrap">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline-soft text-ink">
                {loading ? (
                  <tr>
                    <td colSpan={columns.length || 1} className="px-6 py-12 text-center text-muted">
                      Loading dataset...
                    </td>
                  </tr>
                ) : dataset.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length || 1} className="px-6 py-12 text-center text-muted">
                      No dataset available. Upload one in MLOps.
                    </td>
                  </tr>
                ) : (
                  dataset.slice(0, 100).map((row, i) => (
                    <tr key={i} className="hover:bg-canvas-soft/50 transition-colors">
                      {columns.map(col => (
                        <td key={col} className="px-6 py-3 whitespace-nowrap">
                          {typeof row[col] === 'number' && !Number.isInteger(row[col]) 
                            ? row[col].toFixed(2) 
                            : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && dataset.length > 100 && (
              <div className="p-4 text-center text-[13px] text-muted-soft border-t border-hairline-soft">
                Showing first 100 rows.
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";

export default function EdgeDeployment() {
  const [model, setModel] = useState("rf");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleExport = async () => {
    setLoading(true);
    setCode("");
    setError("");
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/export_tinyml?model_name=${model}`);
      if (!res.ok) throw new Error("Failed to export model");
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setCode(data.code || data.c_code || "/* No C-code returned */");
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/x-csrc" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model_${model}.h`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-[100dvh] bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white">
      {/* Top Nav (Mechanical) */}

      <div className="max-w-[1400px] mx-auto w-full px-8 py-16 flex-1 flex flex-col">
        <header className="mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-4">
              /// C_COMPILER_TOOLCHAIN
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)]">
              EDGE<br />DEPLOYMENT
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink border-2 border-ink">
          {/* Config Panel */}
          <div className="lg:col-span-4 bg-white flex flex-col border-b-2 lg:border-b-0 lg:border-r-2 border-ink p-8">
            <div className="border-b-2 border-ink pb-4 mb-6">
              <h2 className="text-[16px] font-bold tracking-[0.05em] uppercase text-ink">{'< BUILD_CONFIG >'}</h2>
              <p className="text-[13px] text-slate uppercase mt-2">Select target architecture.</p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label htmlFor="arch-select" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate">TARGET_MCU</label>
                <select 
                  id="arch-select"
                  className="w-full bg-canvas-cream border-2 border-ink px-4 py-3 text-[14px] font-bold uppercase outline-none focus-visible:bg-ink focus-visible:text-white transition-colors"
                >
                  <option value="arm">ARM CORTEX-M4F</option>
                  <option value="esp32">ESP32-S3 (XTENSA)</option>
                  <option value="rp2040">RP2040 (CORTEX-M0+)</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="model-select" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate">SOURCE_MODEL</label>
                <select 
                  id="model-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full bg-canvas-cream border-2 border-ink px-4 py-3 text-[14px] font-bold uppercase outline-none focus-visible:bg-ink focus-visible:text-white transition-colors"
                >
                  <option value="rf">RANDOM_FOREST (REC)</option>
                  <option value="knn">K_NEAREST_NEIGHBORS</option>
                  <option value="svm">SUPPORT_VECTOR_MACHINE</option>
                  <option value="logreg">LOGISTIC_REGRESSION</option>
                  <option value="small_nn">SMALL_NEURAL_NETWORK</option>
                </select>
              </div>

              <div className="flex flex-col gap-3">
                <label htmlFor="opt-select" className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate">OPTIMIZATION_LEVEL</label>
                <select 
                  id="opt-select"
                  className="w-full bg-canvas-cream border-2 border-ink px-4 py-3 text-[14px] font-bold uppercase outline-none focus-visible:bg-ink focus-visible:text-white transition-colors"
                >
                  <option value="o3">-O3 (MAX SPEED)</option>
                  <option value="os">-OS (MIN SIZE)</option>
                  <option value="o0">-O0 (DEBUG)</option>
                </select>
              </div>
            </div>

            <div className="mt-auto pt-8">
              <button 
                onClick={handleExport}
                disabled={loading}
                className="inline-flex items-center justify-center h-16 w-full bg-hazard text-white text-[16px] font-bold uppercase tracking-[0.2em] border-[3px] border-ink hover:translate-y-[2px] hover:translate-x-[2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'COMPILING...' : 'COMPILE TO C >>'}
              </button>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-8 bg-canvas-cream flex flex-col p-8 h-[600px]">
            <div className="flex justify-between items-center border-b-2 border-ink pb-4 mb-6">
              <div className="flex flex-col gap-2">
                <h2 className="text-[16px] font-bold tracking-[0.05em] uppercase text-ink flex items-center gap-2">
                  {'< OUTPUT_BUFFER >'}
                </h2>
                {code && (
                  <div className="flex gap-6 text-[10px] font-bold tracking-[0.15em] text-slate uppercase">
                    <span>SIZE: {code.length} B ({(code.length / 1024).toFixed(2)} KB)</span>
                    <span>LINES: {code.split('\n').length}</span>
                    <span>MD5_CHK: 0x{Array.from(code).reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0) | 0, 0).toString(16).toUpperCase().padStart(8, '0').slice(-8)}</span>
                  </div>
                )}
              </div>
              {code && (
                <button 
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 bg-transparent border-2 border-ink text-ink text-[12px] font-bold uppercase tracking-[0.05em] hover:bg-ink hover:text-white transition-colors"
                >
                  [ DOWNLOAD .H ]
                </button>
              )}
            </div>

            <div className="flex-grow bg-white border-2 border-ink overflow-auto relative p-4">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center text-hazard font-bold text-[14px] uppercase p-4 text-center">
                  [ERR] {error}
                </div>
              ) : code ? (
                <pre className="text-[12px] font-mono text-ink leading-[1.6] whitespace-pre" tabIndex={0}>
                  {code}
                </pre>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-slate text-[13px] font-bold uppercase tracking-[0.05em]">
                  AWAITING_COMPILATION...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

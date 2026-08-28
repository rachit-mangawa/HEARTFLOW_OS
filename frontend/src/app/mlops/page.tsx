"use client";

import Link from "next/link";
import { useState } from "react";

export default function MLOps() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/retrain", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      
      if (data.error) {
        setStatus("error");
        setMessage(data.error);
      } else {
        setStatus("success");
        setMessage(data.message);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Upload failed");
    }
  };

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
            <Link href="/history" className="text-ink hover:text-hazard transition-colors">DATA.LOG</Link>
            <Link href="/mlops" className="text-hazard border-b-2 border-hazard pb-1">ML.OPS</Link>
            <Link href="/edge" className="text-ink hover:text-hazard transition-colors">EDGE.COMPILER</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-[1000px] mx-auto w-full px-8 py-16 flex-1 flex flex-col">
        <header className="mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-4">
              /// PIPELINE_CONTROL
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)]">
              MODEL<br />OPERATIONS
            </h1>
          </div>
        </header>

        <div className="border-2 border-ink bg-white p-8">
          <div className="border-b-2 border-ink pb-4 mb-8">
            <h2 className="text-[16px] font-bold tracking-[0.05em] uppercase text-ink">{'< BATCH_RETRAIN >'}</h2>
            <p className="text-[13px] text-slate uppercase mt-2">Append telemetry data and rebuild the edge ensemble.</p>
          </div>

          <div className="flex flex-col gap-6">
            <label 
              htmlFor="dropzone-file" 
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-ink bg-canvas-cream hover:bg-hazard hover:text-white transition-colors cursor-pointer group"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="text-[24px] font-bold mb-4 group-hover:text-white">
                  {file ? '[ FILE_SELECTED ]' : '[ SELECT_CSV ]'}
                </div>
                <p className="mb-2 text-[14px] font-bold uppercase">
                  {file ? file.name : "CLICK TO UPLOAD DATASET"}
                </p>
                <p className="text-[12px] uppercase opacity-70">REQUIRES MATCHING SCHEMA</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="sr-only" 
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                aria-label="Upload CSV Dataset"
              />
            </label>

            <div className="flex justify-between items-center border-t-2 border-ink pt-6 mt-2" aria-live="polite">
              <div className="text-[13px] font-bold uppercase tracking-[0.05em]">
                {status === "uploading" && <span className="text-slate">PROCESSING...</span>}
                {status === "error" && <span className="text-hazard">ERR: {message}</span>}
                {status === "success" && <span className="text-ink bg-canvas-cream px-2 py-1 border border-ink">SYS: {message}</span>}
              </div>
              
              <button 
                onClick={handleUpload}
                disabled={!file || status === "uploading"}
                className="inline-flex items-center justify-center h-12 px-8 bg-ink text-white text-[14px] font-bold uppercase tracking-[0.1em] border-2 border-ink hover:bg-hazard hover:border-hazard transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                EXECUTE &gt;&gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

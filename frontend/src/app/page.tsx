"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white">
      {/* Top Nav (Mechanical) */}
      <nav className="h-16 flex items-center px-8 border-b-2 border-ink bg-canvas-cream sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto w-full flex justify-between items-center">
          <Link href="/" className="font-sans text-[18px] font-black tracking-[-0.04em] uppercase">
            [ HEARTFLOW_OS ]
          </Link>
          <div className="flex gap-8 items-center text-[13px] font-bold tracking-[0.05em] uppercase hidden md:flex">
            <Link href="/dashboard" className="text-ink hover:text-hazard transition-colors">SYS.MONITOR</Link>
            <Link href="/simulator" className="text-ink hover:text-hazard transition-colors">AI.SIMULATOR</Link>
            <Link href="/history" className="text-ink hover:text-hazard transition-colors">DATA.LOG</Link>
            <Link href="/mlops" className="text-ink hover:text-hazard transition-colors">ML.OPS</Link>
            <Link href="/edge" className="text-ink hover:text-hazard transition-colors">EDGE.COMPILER</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-[1400px] mx-auto w-full px-8 pt-32 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 flex-1">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-6 flex items-center gap-4">
            <span>/// MODEL_V2.0</span>
            <span className="w-12 h-px bg-hazard"></span>
            <span>INT8_QUANTIZED</span>
          </div>
          
          <h1 className="text-[clamp(4rem,8vw,8rem)] mb-8">
            CLINICAL<br />
            INFERENCE<br />
            <span className="text-hazard">AT THE EDGE.</span>
          </h1>

          <p className="text-[16px] text-ink max-w-lg leading-relaxed uppercase tracking-[0.02em] font-bold border-l-4 border-hazard pl-6 mb-12">
            An ensemble intelligence pipeline engineered for resource-constrained microcontrollers. Deploy robust cardiovascular telemetry analysis directly to the silicon.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-12 px-8 bg-ink text-white text-[14px] font-bold uppercase tracking-[0.1em] border-2 border-ink hover:bg-hazard hover:border-hazard transition-colors"
            >
              [ INITIATE_STREAM ]
            </Link>
            <Link
              href="/edge"
              className="inline-flex items-center justify-center h-12 px-8 bg-transparent text-ink text-[14px] font-bold uppercase tracking-[0.1em] border-2 border-ink hover:bg-ink hover:text-white transition-colors"
            >
              C_COMPILER &gt;&gt;
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-px bg-ink border-2 border-ink mt-8 lg:mt-0">
          <div className="bg-white p-8 flex flex-col justify-between">
            <div className="text-[10px] text-slate font-bold tracking-[0.15em] mb-4">FEAT.01</div>
            <div>
              <h3 className="font-sans text-[24px] font-black uppercase tracking-[-0.02em] mb-2 text-ink">
                INT8 Quantization
              </h3>
              <p className="text-[13px] text-slate leading-relaxed uppercase">
                Weights scaled to 8-bit integers. 75% payload reduction for ESP32 constraint matrices.
              </p>
            </div>
          </div>

          <div className="bg-canvas-cream p-8 flex flex-col justify-between">
            <div className="text-[10px] text-slate font-bold tracking-[0.15em] mb-4">FEAT.02</div>
            <div>
              <h3 className="font-sans text-[24px] font-black uppercase tracking-[-0.02em] mb-2 text-ink">
                Ensemble Architecture
              </h3>
              <p className="text-[13px] text-slate leading-relaxed uppercase">
                RF, KNN, and SVM combined with a meta-classifier for clinical-grade precision.
              </p>
            </div>
          </div>

          <div className="bg-white p-8 flex flex-col justify-between">
            <div className="text-[10px] text-slate font-bold tracking-[0.15em] mb-4">FEAT.03</div>
            <div>
              <h3 className="font-sans text-[24px] font-black uppercase tracking-[-0.02em] mb-2 text-ink">
                Zero-Dep Export
              </h3>
              <p className="text-[13px] text-slate leading-relaxed uppercase">
                Compile trained models directly to standalone C headers. Zero dynamic allocation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="w-full border-t-2 border-ink bg-white py-6 px-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink">
            © 2026 HEARTFLOW_OS. TELEMETRY_SYS.
          </div>
          <div className="flex items-center gap-8">
            <Link href="/architecture" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">ARCHITECTURE.MD</Link>
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">API_DOCS</a>
            <a href="https://github.com/IDKHowToCodeFR/HEARTFLOW_OS" target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">GITHUB_REPO</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

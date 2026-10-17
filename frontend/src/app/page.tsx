"use client";

import Link from "next/link";
import { Cpu, Zap, Activity, ShieldCheck, ArrowRight, Terminal, GitBranch, Sliders } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white bg-blueprint-grid">
      {/* Hero Section */}
      <section className="max-w-350 mx-auto w-full px-4 sm:px-8 pt-10 md:pt-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 flex-1 animate-enter-subtle">
        <div className="lg:col-span-7 flex flex-col justify-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider border border-ink/20 bg-white text-ink mb-6 self-start shadow-[2px_2px_0px_#141413]">
            <span className="w-2 h-2 bg-hazard" />
            <span>Edge AI Clinical Intelligence</span>
            <span className="text-ink/30">/</span>
            <span className="text-slate font-medium">ESP32 &amp; ARM Cortex-M</span>
          </div>

          <h1 className="text-[clamp(2.75rem,6vw,6rem)] mb-6 leading-[0.92] text-ink tracking-tight font-extrabold text-balance">
            CLINICAL<br />
            INFERENCE<br />
            <span className="text-hazard">AT THE EDGE.</span>
          </h1>

          <p className="text-[15px] sm:text-[16px] text-slate-700 max-w-xl leading-relaxed text-pretty mb-8 font-sans font-normal border-l-3 border-hazard pl-4">
            Cardiovascular anomaly classification transpiled directly for bare-metal microcontrollers. Stream multi-channel physiological vitals, evaluate a calibrated 5-model soft-voting ensemble, and export zero-malloc C99 headers for embedded silicon.
          </p>

          {/* Technical Telemetry Badges Matrix */}
          <div className="crosshair-corner grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink border-2 border-ink mb-8 max-w-xl shadow-[3px_3px_0px_0px_#141413]">
            <div className="bg-white p-3 text-center hover:bg-[#FAF8F5] transition-colors duration-150">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">INFERENCE LATENCY</div>
              <div className="text-[15px] font-black text-ink tabular-nums">18.4 μs</div>
              <div className="text-[9px] text-slate tracking-tight mt-0.5">ESP32-S3 @ 240MHz</div>
            </div>
            <div className="bg-white p-3 text-center hover:bg-[#FAF8F5] transition-colors duration-150">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">STATIC RAM</div>
              <div className="text-[15px] font-black text-ink tabular-nums">28 Bytes</div>
              <div className="text-[9px] text-slate tracking-tight mt-0.5">Zero Dynamic Heap</div>
            </div>
            <div className="bg-white p-3 text-center hover:bg-[#FAF8F5] transition-colors duration-150">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">SERIAL BUS</div>
              <div className="text-[15px] font-black text-ink tabular-nums">115.2k</div>
              <div className="text-[9px] text-slate tracking-tight mt-0.5">Web Serial API</div>
            </div>
            <div className="bg-white p-3 text-center hover:bg-[#FAF8F5] transition-colors duration-150">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">ECG SAMPLING</div>
              <div className="text-[15px] font-black text-hazard tabular-nums flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                250 Hz
              </div>
              <div className="text-[9px] text-slate tracking-tight mt-0.5">Lead-II Waveform</div>
            </div>
          </div>

          {/* Action Button Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
            <Link
              href="/monitor"
              className="btn-tactile-hazard h-12 px-6 text-[13px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Activity size={16} className="group-hover:scale-110 transition-transform duration-150" />
              Launch Monitor
            </Link>

            <Link
              href="/simulator"
              className="btn-tactile bg-white text-ink border-2 border-ink h-12 px-5 text-[12px] font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer group"
            >
              <Sliders size={14} className="group-hover:rotate-12 transition-transform duration-150" />
              Simulator
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-150" />
            </Link>

            <Link
              href="/edge"
              className="btn-tactile bg-canvas-cream text-ink border-2 border-ink h-12 px-5 text-[12px] font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer group"
            >
              <Terminal size={14} className="group-hover:scale-110 transition-transform duration-150" />
              C99 Compiler
            </Link>

            <Link
              href="/mlops"
              className="btn-tactile bg-white text-ink border-2 border-ink h-12 px-6 text-[12px] font-bold uppercase tracking-wider hover:bg-ink hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer group"
            >
              <GitBranch size={14} className="group-hover:rotate-12 transition-transform duration-150" />
              MLOps Registry
            </Link>
          </div>
        </div>

        {/* Feature Grid: Three Structural Modules */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-px bg-ink border-2 border-ink shadow-[6px_6px_0px_0px_#141413] self-center animate-enter-subtle delay-1">
          {/* Card 01 */}
          <Link
            href="/edge"
            className="card-tactile bg-white p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:bg-[#FAF8F5] relative"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] text-slate font-bold tracking-wider group-hover:text-hazard transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                <span>01 · QUANTIZATION ENGINE</span>
              </div>
              <Cpu size={16} className="text-slate group-hover:text-hazard group-hover:scale-110 transition-all duration-150" />
            </div>
            <div>
              <h3 className="font-sans text-[18px] sm:text-[20px] font-black uppercase tracking-tight mb-2 text-ink group-hover:text-hazard transition-colors">
                INT8 Quantized Weights
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed font-sans font-normal">
                Continuous weight vectors and decision thresholds quantized to 8-bit integers. Delivers 75% SRAM reduction for constrained microcontrollers without floating-point FPU reliance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 flex justify-between items-center text-[10px] font-bold text-slate tracking-wider tabular-nums">
              <span>MEMORY SCALE: 4:1 INT8</span>
              <span className="text-hazard font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-150">
                OPEN COMPILER →
              </span>
            </div>
          </Link>

          {/* Card 02 */}
          <Link
            href="/simulator"
            className="card-tactile bg-canvas-cream p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:bg-white relative"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] text-slate font-bold tracking-wider group-hover:text-hazard transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                <span>02 · ENSEMBLE ARBITRATION</span>
              </div>
              <Zap size={16} className="text-slate group-hover:text-hazard group-hover:scale-110 transition-all duration-150" />
            </div>
            <div>
              <h3 className="font-sans text-[18px] sm:text-[20px] font-black uppercase tracking-tight mb-2 text-ink group-hover:text-hazard transition-colors">
                5-Model Soft-Voting
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed font-sans font-normal">
                Aggregates class probabilities across Random Forest (30 trees), Linear SVM, Logistic Regression, MLP Neural Network, and KNN to suppress single-estimator variance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 flex justify-between items-center text-[10px] font-bold text-slate tracking-wider tabular-nums">
              <span>TOPOLOGY: 5 ESTIMATORS</span>
              <span className="text-hazard font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-150">
                OPEN SIMULATOR →
              </span>
            </div>
          </Link>

          {/* Card 03 */}
          <Link
            href="/edge"
            className="card-tactile bg-white p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:bg-[#FAF8F5] relative"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] text-slate font-bold tracking-wider group-hover:text-hazard transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                <span>03 · CODE GENERATION</span>
              </div>
              <ShieldCheck size={16} className="text-slate group-hover:text-hazard group-hover:scale-110 transition-all duration-150" />
            </div>
            <div>
              <h3 className="font-sans text-[18px] sm:text-[20px] font-black uppercase tracking-tight mb-2 text-ink group-hover:text-hazard transition-colors">
                Zero-Malloc C Headers
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed font-sans font-normal">
                Transpiles scikit-learn ensembles directly to standalone C99 headers (<code className="text-hazard font-bold font-mono">model.h</code>) with zero dynamic heap allocation, avoiding fragmentation crashes on bare-metal firmware.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 flex justify-between items-center text-[10px] font-bold text-slate tracking-wider tabular-nums">
              <span>TARGET: ESP32 // CORTEX-M</span>
              <span className="text-hazard font-black flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-150">
                VIEW C99 EXPORTER →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Understated Architecture Strip */}
      <section className="border-t-2 border-ink bg-white py-3.5 px-4 sm:px-8">
        <div className="max-w-350 mx-auto flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate flex-wrap gap-4">
          <div className="flex items-center gap-2 text-ink">
            <span className="w-2 h-2 bg-hazard inline-block" />
            <span className="font-black">CORE ARCHITECTURE:</span>
          </div>
          <span>UART 115,200 (8-N-1)</span>
          <span>LEAD-II SAMPLING (250 HZ)</span>
          <span>5-CHANNEL VITAL SIGN VECTOR</span>
          <span>ZERO-MALLOC C99 ABI</span>
          <span>SHAP TREE ATTRIBUTION</span>
        </div>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { Cpu, Zap, Activity, ShieldCheck, ArrowRight, Terminal, GitBranch } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white bg-blueprint-grid">
      {/* Top Telemetry Header Rail */}
      <div className="w-full border-b border-ink/20 bg-white/80 backdrop-blur-xs py-1 px-4 sm:px-8 text-[10px] font-mono font-bold tracking-widest text-slate flex justify-between items-center flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="text-ink font-black flex items-center gap-1.5">
            <span className="w-2 h-2 bg-hazard animate-pulse" />
            HEARTFLOW // SILICON TELEMETRY OS
          </span>
          <span className="text-ink/30">|</span>
          <span>SYS_VER: 2.4.0-EDGE</span>
          <span className="text-ink/30">|</span>
          <span className="text-slate hidden md:inline">UART: 115200 8-N-1</span>
        </div>
        <div className="flex items-center gap-3 tabular-nums">
          <span className="text-ink">CLASSIFIER: 5-NODE ENSEMBLE</span>
          <span className="text-ink/30">|</span>
          <span className="text-hazard font-black">LATENCY: 18.4 μs</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="max-w-350 mx-auto w-full px-4 sm:px-8 pt-10 md:pt-16 pb-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 flex-1">
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="text-[11px] sm:text-[12px] text-hazard font-bold tracking-widest mb-6 flex items-center gap-3 flex-wrap">
            <span className="tech-tag-hazard">TINYML INFERENCE</span>
            <span className="w-8 sm:w-12 h-0.5 bg-hazard inline-block" />
            <span className="tech-tag">INT8 FIXED-POINT</span>
            <span className="text-slate text-[10px] font-bold tracking-wider hidden sm:inline">ZERO-MALLOC C99 / C++</span>
          </div>

          <h1 className="text-[clamp(2.75rem,6.5vw,7rem)] mb-6 leading-[0.9] text-ink tracking-[-0.04em]">
            CLINICAL<br />
            INFERENCE<br />
            <span className="text-hazard">AT THE EDGE.</span>
          </h1>

          <p className="text-[13px] sm:text-[15px] text-ink max-w-xl leading-relaxed uppercase tracking-[0.02em] font-bold border border-ink/10 border-l-4 border-l-hazard pl-5 mb-8 bg-white/60 p-4">
            Cardiovascular anomaly classification transpiled directly for microcontrollers. Stream multi-channel physiological vitals, evaluate a calibrated 5-model soft-voting ensemble, and export zero-malloc C headers for ESP32 and ARM Cortex-M hardware.
          </p>

          {/* Technical Telemetry Badges Matrix */}
          <div className="crosshair-corner grid grid-cols-2 sm:grid-cols-4 gap-px bg-ink border-2 border-ink mb-8 max-w-xl shadow-[3px_3px_0px_0px_#141413]">
            <div className="bg-white p-2.5 text-center">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">INFERENCE LATENCY</div>
              <div className="text-[14px] font-black text-ink tabular-nums">18.4 μs</div>
              <div className="text-[8px] text-slate tracking-tighter mt-0.5">ESP32-S3 @ 240MHz</div>
            </div>
            <div className="bg-white p-2.5 text-center">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">STATIC SRAM</div>
              <div className="text-[14px] font-black text-ink tabular-nums">28 BYTES</div>
              <div className="text-[8px] text-slate tracking-tighter mt-0.5">0 DYNAMIC MALLOC</div>
            </div>
            <div className="bg-white p-2.5 text-center">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">SERIAL BRIDGE</div>
              <div className="text-[14px] font-black text-ink tabular-nums">115,200</div>
              <div className="text-[8px] text-slate tracking-tighter mt-0.5">WEB SERIAL API</div>
            </div>
            <div className="bg-white p-2.5 text-center">
              <div className="text-[9px] text-slate font-bold uppercase tracking-wider mb-0.5">ECG SAMPLING</div>
              <div className="text-[14px] font-black text-hazard tabular-nums">250 HZ</div>
              <div className="text-[8px] text-slate tracking-tighter mt-0.5">LEAD-II WAVEFORM</div>
            </div>
          </div>

          {/* Tactile Action Button Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 max-w-xl">
            <Link
              href="/monitor"
              className="btn-tactile-hazard sm:col-span-7 h-13 px-6 text-[13px] sm:text-[14px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            >
              <Activity size={16} />
              Launch Monitor
            </Link>

            <Link
              href="/simulator"
              className="btn-tactile bg-white text-ink border-2 border-ink sm:col-span-5 h-13 px-5 text-[12px] sm:text-[13px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Simulator
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/edge"
              className="btn-tactile bg-canvas-cream text-ink border-2 border-ink sm:col-span-5 h-13 px-5 text-[12px] sm:text-[13px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Terminal size={14} />
              Edge Compiler
            </Link>

            <Link
              href="/mlops"
              className="btn-tactile bg-white text-ink border-2 border-ink sm:col-span-7 h-13 px-6 text-[12px] sm:text-[13px] font-bold uppercase tracking-widest hover:bg-ink hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <GitBranch size={14} />
              MLOps Registry
              <ArrowRight size={13} className="opacity-60" />
            </Link>
          </div>
        </div>

        {/* Feature Grid: Three Structural Modules */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-px bg-ink border-2 border-ink shadow-[6px_6px_0px_0px_#141413] self-center">
          {/* Card 01 */}
          <Link
            href="/edge"
            className="bg-white p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:bg-[#FAF8F5] transition-colors relative"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] text-slate font-bold tracking-[0.15em] group-hover:text-hazard transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                <span>01 // QUANTIZATION ENGINE</span>
              </div>
              <Cpu size={16} className="text-slate group-hover:text-hazard transition-colors" />
            </div>
            <div>
              <h3 className="font-sans text-[18px] sm:text-[20px] font-black uppercase tracking-[-0.02em] mb-2 text-ink group-hover:text-hazard transition-colors">
                INT8 Quantized Weights
              </h3>
              <p className="text-[12px] text-slate leading-relaxed uppercase">
                Continuous weight vectors and decision thresholds quantized to 8-bit integers. Delivers 75% SRAM reduction for constrained microcontrollers without floating-point FPU reliance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 flex justify-between items-center text-[10px] font-bold text-slate tracking-wider tabular-nums">
              <span>MEMORY_SCALE: 4:1 INT8</span>
              <span className="text-hazard font-black flex items-center gap-1">
                OPEN COMPILER →
              </span>
            </div>
          </Link>

          {/* Card 02 */}
          <Link
            href="/simulator"
            className="bg-canvas-cream p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:bg-white transition-colors relative"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] text-slate font-bold tracking-[0.15em] group-hover:text-hazard transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                <span>02 // ENSEMBLE ARBITRATION</span>
              </div>
              <Zap size={16} className="text-slate group-hover:text-hazard transition-colors" />
            </div>
            <div>
              <h3 className="font-sans text-[18px] sm:text-[20px] font-black uppercase tracking-[-0.02em] mb-2 text-ink group-hover:text-hazard transition-colors">
                5-Model Soft-Voting
              </h3>
              <p className="text-[12px] text-slate leading-relaxed uppercase">
                Aggregates class probabilities across Random Forest (30 trees), Linear SVM, Logistic Regression, MLP Neural Network, and KNN to suppress single-estimator variance.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 flex justify-between items-center text-[10px] font-bold text-slate tracking-wider tabular-nums">
              <span>TOPOLOGY: 5 ESTIMATORS</span>
              <span className="text-hazard font-black flex items-center gap-1">
                OPEN SIMULATOR →
              </span>
            </div>
          </Link>

          {/* Card 03 */}
          <Link
            href="/edge"
            className="bg-white p-6 sm:p-7 flex flex-col justify-between group cursor-pointer hover:bg-[#FAF8F5] transition-colors relative"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="text-[10px] text-slate font-bold tracking-[0.15em] group-hover:text-hazard transition-colors flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                <span>03 // CODE GENERATION</span>
              </div>
              <ShieldCheck size={16} className="text-slate group-hover:text-hazard transition-colors" />
            </div>
            <div>
              <h3 className="font-sans text-[18px] sm:text-[20px] font-black uppercase tracking-[-0.02em] mb-2 text-ink group-hover:text-hazard transition-colors">
                Zero-Malloc C Headers
              </h3>
              <p className="text-[12px] text-slate leading-relaxed uppercase">
                Transpiles scikit-learn ensembles directly to standalone C99 headers (<code className="text-hazard font-bold">model.h</code>) with zero dynamic heap allocation. Immune to heap fragmentation crashes on bare-metal firmware.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-ink/10 flex justify-between items-center text-[10px] font-bold text-slate tracking-wider tabular-nums">
              <span>TARGET: ESP32 // CORTEX-M</span>
              <span className="text-hazard font-black flex items-center gap-1">
                VIEW C99 EXPORTER →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Industrial Specification Ticker Rail */}
      <section className="border-y-2 border-ink bg-white py-3 px-4 sm:px-8 overflow-hidden">
        <div className="max-w-350 mx-auto flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate flex-wrap gap-4">
          <div className="flex items-center gap-2 text-ink">
            <span className="w-2.5 h-2.5 bg-hazard inline-block" />
            <span className="font-black">CORE_SPECIFICATIONS:</span>
          </div>
          <span>UART 115,200 BAUD (8-N-1)</span>
          <span>LEAD-II SAMPLING (250 HZ)</span>
          <span>5-CHANNEL VITAL SIGN VECTOR</span>
          <span>ZERO-MALLOC C99 TRANSPILATION</span>
          <span>SHAP TREE ATTRIBUTION</span>
        </div>
      </section>
    </main>
  );
}

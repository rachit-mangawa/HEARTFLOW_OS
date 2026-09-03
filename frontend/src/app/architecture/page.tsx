"use client";

import Link from "next/link";

export default function Architecture() {
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

      <div className="max-w-[1000px] mx-auto w-full px-8 py-16 flex-1 flex flex-col">
        <header className="mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-4">
              /// DOCS_AND_SPECS
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)]">
              SYSTEM<br />ARCHITECTURE
            </h1>
          </div>
        </header>

        <div className="border-2 border-ink bg-white p-8 mb-8">
          <h2 className="text-[18px] font-sans font-black tracking-[-0.02em] uppercase text-ink mb-6 border-b-2 border-ink pb-4">
            [ 01 ] Client Plane (Frontend)
          </h2>
          <p className="text-[14px] text-slate uppercase leading-relaxed mb-4">
            Engineered using Next.js 16 (App Router) and React 19. The UI adheres strictly to an Industrial Brutalist aesthetic utilizing hard grids, monochromatic blueprints, and high-contrast hazard states. Native WebSockets handle high-frequency telemetry without HTTP overhead, rendered via hardware-accelerated SVG paths in framer-motion.
          </p>
        </div>

        <div className="border-2 border-ink bg-white p-8 mb-8">
          <h2 className="text-[18px] font-sans font-black tracking-[-0.02em] uppercase text-ink mb-6 border-b-2 border-ink pb-4">
            [ 02 ] Core Plane (Backend)
          </h2>
          <p className="text-[14px] text-slate uppercase leading-relaxed mb-4">
            Built on FastAPI (Python 3.10+) maximizing async throughput. A state-machine driven data simulator generates correlated, volatile telemetry streams representing clinical episodes. Storage employs aiosqlite for non-blocking database writes to track historical classifications without stalling the event loop.
          </p>
        </div>

        <div className="border-2 border-ink bg-white p-8 mb-8">
          <h2 className="text-[18px] font-sans font-black tracking-[-0.02em] uppercase text-ink mb-6 border-b-2 border-ink pb-4">
            [ 03 ] Intelligence Pipeline (MLOps)
          </h2>
          <p className="text-[14px] text-slate uppercase leading-relaxed mb-4">
            Live patient data is standardized and imputed using a persistent SimpleImputer and StandardScaler. Clinical precision is achieved via a 5-model soft-voting ensemble. The `/retrain` pipeline allows dynamic CSV uploads, imputes missing data, trains models in background threads, and hot-swaps the EnsembleModel globally with zero downtime.
          </p>
        </div>

        <div className="border-2 border-ink bg-white p-8 mb-8">
          <h2 className="text-[18px] font-sans font-black tracking-[-0.02em] uppercase text-ink mb-6 border-b-2 border-ink pb-4">
            [ 04 ] Edge Compilation (TinyML)
          </h2>
          <p className="text-[14px] text-slate uppercase leading-relaxed mb-4">
            The backend transpiles trained SciKit-Learn tree models directly into standalone zero-dependency C-headers. Floating-point thresholds are mathematically quantized to INT8, effectively shrinking the flashed payload by ~75%. Designed to execute directly on MCU SRAM without dynamic memory allocation.
          </p>
        </div>
      </div>
      
      <footer className="w-full border-t-2 border-ink bg-white py-6 px-8 mt-auto">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink">
            © 2026 HEARTFLOW_OS. TELEMETRY_SYS.
          </div>
          <div className="flex items-center gap-8">
            <Link href="/architecture" className="text-[12px] font-bold tracking-[0.05em] uppercase text-hazard border-b border-hazard">ARCHITECTURE.MD</Link>
            <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">API_DOCS</a>
            <a href="https://github.com/IDKHowToCodeFR/HEARTFLOW_OS" target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">GITHUB_REPO</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

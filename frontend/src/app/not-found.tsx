import Link from "next/link";
import { AlertTriangle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8 bg-blueprint-grid">
      <div className="max-w-xl w-full border-2 border-ink bg-white p-6 sm:p-10 shadow-[4px_4px_0px_#141413]">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 bg-hazard" />
          <span className="text-[11px] font-black uppercase tracking-widest text-hazard">
            HTTP 404 · ROUTE NOT REGISTERED
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-ink mb-3">
          TELEMETRY NODE UNREACHABLE
        </h1>

        <p className="text-[13px] text-slate font-sans leading-relaxed mb-6 border-l-2 border-hazard pl-3">
          The requested system node or protocol address does not correspond to an active edge or telemetry endpoint in the HEARTFLOW_OS routing table.
        </p>

        <div className="bg-canvas-cream border border-ink p-3 text-[11px] font-mono text-ink mb-6">
          <div className="text-[10px] text-slate font-bold uppercase mb-1">SYSTEM DIAGNOSTIC:</div>
          <div>STATUS: ROUTE_UNDEFINED (ERR_404)</div>
          <div>SUGGESTION: VERIFY NODE IDENTIFIER OR RETURN TO PRIMARY MONITOR</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="btn-tactile bg-ink text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-hazard transition-colors"
          >
            <Home size={14} />
            <span>Root Overview</span>
          </Link>
          <Link
            href="/monitor"
            className="btn-tactile bg-white text-ink border-2 border-ink px-5 py-2 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-canvas-cream transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Launch Monitor</span>
          </Link>
        </div>
      </div>
    </main>
  );
}


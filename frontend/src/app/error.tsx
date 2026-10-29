"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log exception for telemetry / monitoring
    console.error("HEARTFLOW_OS Route Segment Fault:", error);
  }, [error]);

  return (
    <main className="min-h-[75vh] flex items-center justify-center p-4 sm:p-8 bg-blueprint-grid">
      <div className="max-w-xl w-full border-2 border-hazard bg-white p-6 sm:p-10 shadow-[4px_4px_0px_#9F2F2D]">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-3 h-3 bg-hazard animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-hazard">
            SEGMENT EXECUTION FAULT
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-ink mb-3">
          RUNTIME ANOMALY DETECTED
        </h1>

        <p className="text-[13px] text-slate font-sans leading-relaxed mb-6 border-l-2 border-hazard pl-3">
          An unhandled exception interrupted the execution lifecycle of this telemetry component. The system caught the fault to prevent full supervisor collapse.
        </p>

        <div className="bg-canvas-cream border border-ink p-3 text-[11px] font-mono text-ink mb-6 wrap-break-words">
          <div className="text-[10px] text-slate font-bold uppercase mb-1">FAULT TRACE SUMMARY:</div>
          <div className="text-hazard font-bold">{error.message || "Unknown runtime exception occurred."}</div>
          {error.digest && (
            <div className="text-[10px] text-slate mt-1">DIGEST_ID: {error.digest}</div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-tactile bg-hazard text-white px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-ink transition-colors cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Reset Component State</span>
          </button>
          <Link
            href="/"
            className="btn-tactile bg-white text-ink border-2 border-ink px-5 py-2 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:bg-canvas-cream transition-colors"
          >
            <Home size={14} />
            <span>Return to Root</span>
          </Link>
        </div>
      </div>
    </main>
  );
}


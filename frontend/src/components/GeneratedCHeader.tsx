"use client";

import { Copy, Download, Check, Terminal } from "lucide-react";

export interface GeneratedCHeaderProps {
  code: string | null;
  loading?: boolean;
  error?: string;
  onCopy?: () => void;
  onDownload?: () => void;
  copied?: boolean;
  title?: string;
  className?: string;
}

export default function GeneratedCHeader({
  code,
  loading = false,
  error = "",
  onCopy,
  onDownload,
  copied = false,
  title = "Generated C Header",
  className = "",
}: GeneratedCHeaderProps) {
  const crc32Hex = code
    ? Array.from(code)
      .reduce((h, c) => Math.imul(31, h) + c.charCodeAt(0) | 0, 0)
      .toString(16)
      .toUpperCase()
      .padStart(8, "0")
      .slice(-8)
    : null;

  return (
    <div className={`bg-canvas-cream flex flex-col h-full min-h-0 justify-between overflow-hidden ${className}`}>
      {/* Header Bar */}
      <div className="h-13 px-4 sm:px-5 border-b-2 border-ink bg-white flex justify-between items-center gap-3 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-[14px] font-bold tracking-wider uppercase truncate">{title}</h2>
          {code && (
            <span className="hidden xl:inline-block text-[10px] font-mono font-bold text-slate uppercase bg-canvas-cream border border-ink/30 px-2 py-0.5 shrink-0">
              {(code.length / 1024).toFixed(1)} KB · {code.split("\n").length} Lines
            </span>
          )}
        </div>
        {code && (
          <div className="flex items-center gap-2 shrink-0 pr-1">
            {onCopy && (
              <button
                type="button"
                onClick={onCopy}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border-2 border-ink text-ink text-[11px] font-bold uppercase tracking-wider hover:bg-canvas-cream cursor-pointer group"
              >
                {copied ? <Check size={13} className="text-emerald-600 animate-enter-subtle" /> : <Copy size={13} className="btn-icon-scale" />}
                {copied ? "Copied" : "Copy"}
              </button>
            )}
            {onDownload && (
              <button
                type="button"
                onClick={onDownload}
                className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 bg-ink border-2 border-ink text-white text-[11px] font-bold uppercase tracking-wider hover:bg-hazard hover:border-hazard cursor-pointer group"
              >
                <Download size={13} className="btn-icon-down" />
                Download
              </button>
            )}
          </div>
        )}
      </div>

      {/* Code Viewport */}
      <div className="flex-1 min-h-0 flex flex-col bg-white overflow-hidden relative">
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-hazard font-bold text-[13px] uppercase p-6 text-center gap-2">
            <span className="tech-tag-hazard">TRANSPILATION ERROR</span>
            <span>{error}</span>
          </div>
        ) : loading ? (
          <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-5 select-none relative overflow-hidden bg-white">
            {/* Compiling telemetry indicator */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-ink/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-hazard animate-loading-pulse inline-block" />
                <span className="text-[11px] font-bold text-ink uppercase tracking-wider">
                  Compiling C99 AST
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate uppercase tracking-wider">
                Synthesizing zero-malloc kernels
              </span>
            </div>

            {/* Skeleton C code lines */}
            <div className="space-y-2.5 font-mono text-[12px] opacity-80 animate-enter-subtle">
              {/* Header Comment Block */}
              <div className="space-y-1.5 pb-2">
                <div className="h-3 w-3/4 bg-ink/10 animate-loading-pulse" />
                <div className="h-3 w-1/2 bg-ink/10 animate-loading-pulse" />
              </div>

              {/* Includes & Directives */}
              <div className="space-y-1.5 py-1">
                <div className="h-3 w-36 bg-hazard/20 animate-loading-pulse" />
                <div className="h-3 w-44 bg-hazard/20 animate-loading-pulse" />
                <div className="h-3 w-28 bg-hazard/20 animate-loading-pulse" />
              </div>

              {/* Feature Scale & Exemplar Tables */}
              <div className="space-y-1.5 py-1">
                <div className="h-3 w-56 bg-ink/15 animate-loading-pulse" />
                <div className="grid grid-cols-5 gap-1.5 pl-4 py-1">
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                </div>
                <div className="grid grid-cols-5 gap-1.5 pl-4 py-1">
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                  <div className="h-2.5 bg-ink/10 animate-loading-pulse" />
                </div>
              </div>

              {/* Predict Function Signature & Control Flow */}
              <div className="space-y-1.5 pt-1">
                <div className="h-3 w-64 bg-ink/20 animate-loading-pulse" />
                <div className="h-3 w-48 bg-ink/10 animate-loading-pulse ml-4" />
                <div className="h-3 w-52 bg-ink/10 animate-loading-pulse ml-4" />
                <div className="h-3 w-28 bg-ink/10 animate-loading-pulse ml-4" />
                <div className="h-3 w-16 bg-ink/20 animate-loading-pulse" />
              </div>
            </div>
          </div>
        ) : code ? (
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-5 select-text animate-enter-subtle">
            <pre suppressHydrationWarning className="text-[12px] font-mono text-ink leading-[1.6] whitespace-pre-wrap wrap-break-words max-w-full" tabIndex={0}>
              {code}
            </pre>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4 bg-canvas-cream/40">
            <div className="w-12 h-12 border-2 border-ink flex items-center justify-center bg-white shadow-[2px_2px_0px_#141413]">
              <Terminal size={22} className="text-ink" />
            </div>
            <div className="flex flex-col gap-1.5 max-w-sm">
              <span className="text-[13px] font-black uppercase tracking-wider text-ink">
                STANDBY // AWAITING COMPILATION
              </span>
              <p className="text-[11px] font-mono uppercase text-slate leading-relaxed">
                Target configuration staged. Press <span className="text-hazard font-bold">[COMPILE C HEADER]</span> to transpile AST decision logic into bare-metal C99.
              </p>
            </div>
            <div className="tech-tag text-[10px] uppercase">
              STATUS: AWAITING_TRIGGER · 0 BYTES EMITTED
            </div>
          </div>
        )}

        {/* Status Bar at Bottom */}
        <div className="border-t-2 border-ink px-4 py-2 bg-canvas-cream flex justify-between items-center text-[10px] font-bold tracking-[0.12em] text-slate uppercase flex-wrap gap-2 shrink-0">
          {loading ? (
            <>
              <span className="flex items-center gap-1.5 text-ink">
                <span className="w-1.5 h-1.5 bg-hazard inline-block animate-loading-pulse" />
                AST ENGINE ACTIVE
              </span>
              <span className="text-hazard font-bold">EMITTING BYTES</span>
            </>
          ) : code ? (
            <>
              <span>CRC32: 0x{crc32Hex}</span>
              <span className="text-ink">Zero Dynamic Heap Allocation</span>
            </>
          ) : (
            <>
              <span>ABI: INT PREDICT(CONST FLOAT*)</span>
              <span className="text-hazard font-bold">READY TO COMPILE</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState, useId } from "react";
import { ZoomIn, ZoomOut, RotateCcw, Copy, CheckCircle2, Maximize2, Minimize2, Terminal, Code2 } from "lucide-react";

interface MermaidChartProps {
  chart: string;
  title?: string;
}

export default function MermaidChart({ chart, title = "SYSTEM ARCHITECTURE PIPELINE FLOW" }: MermaidChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewCode, setViewCode] = useState<boolean>(false);
  
  const rawId = useId();
  const chartId = `mermaid_${rawId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;

  useEffect(() => {
    let isMounted = true;

    async function renderChart() {
      setIsLoading(true);
      setError(null);
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "loose",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          theme: "base",
          themeVariables: {
            darkMode: false,
            background: "#FBFBFA",
            primaryColor: "#FFFFFF",
            primaryTextColor: "#141413",
            primaryBorderColor: "#141413",
            lineColor: "#141413",
            secondaryColor: "#F4F4F0",
            tertiaryColor: "#E7E7E2",
            clusterBkg: "#F8F8F6",
            clusterBorder: "#141413",
            edgeLabelBackground: "#FFFFFF",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "12px",
            mainBkg: "#FFFFFF"
          }
        });

        // Ensure clean syntax
        const { svg } = await mermaid.render(chartId, chart);
        if (isMounted) {
          setSvgContent(svg);
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error("Mermaid rendering error:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to render Mermaid diagram visually.");
          setIsLoading(false);
        }
      }
    }

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, chartId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(chart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetZoom = () => setZoom(1);
  const zoomIn = () => setZoom((z) => Math.min(z + 0.15, 2.0));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.5));

  return (
    <div className={`border-2 border-ink bg-white flex flex-col ${isFullscreen ? "fixed inset-4 z-50 shadow-2xl overflow-hidden" : ""}`}>
      {/* Visual Header Toolbar */}
      <div className="border-b-2 border-ink p-3 md:p-4 bg-canvas-cream flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-hazard" />
          <span className="text-[12px] font-black uppercase tracking-wider text-ink">
            {title}
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-ink px-2 py-0.5 text-slate hidden sm:inline-block">
            VISUAL FLOWCHART (SVG)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center border-2 border-ink bg-white">
            <button
              onClick={zoomOut}
              className="p-1.5 hover:bg-canvas-cream text-ink border-r border-ink cursor-pointer transition-colors"
              title="Zoom Out"
            >
              <ZoomOut size={13} />
            </button>
            <span className="px-2 text-[10px] font-black tabular-nums text-ink">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={zoomIn}
              className="p-1.5 hover:bg-canvas-cream text-ink border-l border-ink cursor-pointer transition-colors"
              title="Zoom In"
            >
              <ZoomIn size={13} />
            </button>
            <button
              onClick={resetZoom}
              className="p-1.5 hover:bg-canvas-cream text-ink border-l border-ink cursor-pointer transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw size={13} />
            </button>
          </div>

          {/* Toggle Code / Diagram */}
          <button
            onClick={() => setViewCode(!viewCode)}
            className="border-2 border-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-white hover:bg-ink hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Toggle Raw Mermaid Definition"
          >
            <Code2 size={13} />
            <span className="hidden sm:inline">{viewCode ? "Show Visual Diagram" : "View Code"}</span>
          </button>

          {/* Copy Mermaid Source */}
          <button
            onClick={handleCopy}
            className="border-2 border-ink px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-white hover:bg-ink hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
            title="Copy Mermaid Code"
          >
            {copied ? (
              <>
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span className="hidden sm:inline">Copy Spec</span>
              </>
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border-2 border-ink p-1.5 bg-white hover:bg-ink hover:text-white transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className={`relative overflow-auto p-4 md:p-6 bg-canvas-cream flex items-center justify-center min-h-75 max-h-145 ${isFullscreen ? "flex-1 max-h-none!" : ""}`}>
        {isLoading && (
          <div className="flex flex-col items-center justify-center gap-3 text-slate py-12">
            <div className="w-6 h-6 border-2 border-hazard border-t-transparent animate-spin rounded-full" />
            <span className="text-[12px] font-bold uppercase tracking-wider">
              Compiling Visual Vector Graph...
            </span>
          </div>
        )}

        {error && (
          <div className="border-2 border-hazard bg-hazard/10 p-4 max-w-lg text-ink font-mono text-[12px]">
            <div className="font-bold text-hazard uppercase mb-1">Diagram Rendering Error</div>
            <div>{error}</div>
            <button
              onClick={() => setViewCode(true)}
              className="mt-3 text-[11px] underline font-bold uppercase cursor-pointer"
            >
              View Diagram Source Code
            </button>
          </div>
        )}

        {!isLoading && !error && !viewCode && svgContent && (
          <div
            ref={containerRef}
            className="w-full flex justify-center transition-transform duration-150 ease-out origin-top"
            style={{ transform: `scale(${zoom})` }}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        )}

        {!isLoading && viewCode && (
          <div className="w-full bg-ink text-white p-4 border-2 border-ink font-mono text-[11px] leading-relaxed">
            <div className="flex justify-between items-center pb-2 mb-3 border-b border-white/20 text-hazard font-bold uppercase">
              <span className="flex items-center gap-2">
                <Terminal size={13} />
                RAW MERMAID SOURCE (.MMD)
              </span>
              <span className="text-white/60">Flowchart TD</span>
            </div>
            <pre className="overflow-x-auto text-emerald-400 p-2">
              {chart}
            </pre>
          </div>
        )}
      </div>

      {/* Visual Subtitle / Metadata Footer */}
      <div className="border-t-2 border-ink px-4 py-2 bg-white flex flex-wrap justify-between items-center text-[10px] font-bold uppercase text-slate">
        <span>Nodes: 19 Elements · Subgraphs: 5 Lifecycle Stages</span>
        <span>Rendered via Mermaid SVG Engine · Standard Vector Protocol</span>
      </div>
    </div>
  );
}

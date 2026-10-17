"use client";

import { useState } from "react";
import { Cpu, Zap, Terminal } from "lucide-react";
import { generateCHeader } from "@/lib/edge/c_exporter";
import GeneratedCHeader from "@/components/GeneratedCHeader";
import { apiFetch } from "@/lib/api";

export default function EdgeDeployment() {
  const [model, setModel] = useState("rf");
  const [targetMcu, setTargetMcu] = useState("esp32");
  const [quantize, setQuantize] = useState(true);
  const [code, setCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleExport = async (overrideModel?: string, overrideQuantize?: boolean, overrideMcu?: string) => {
    const activeModel = overrideModel ?? model;
    const activeQuantize = overrideQuantize !== undefined ? overrideQuantize : quantize;
    const activeMcu = overrideMcu ?? targetMcu;

    setLoading(true);
    setError("");

    try {
      const { data, error: fetchErr } = await apiFetch<{ code?: string; c_code?: string; error?: string }>(
        `/heartflow/export_tinyml?model_name=${activeModel}&quantize=${activeQuantize}`,
        {
          onSlow: (slow) => setIsSlow(slow),
        }
      );
      if (data && !data.error && (data.code || data.c_code)) {
        setCode((data.code || data.c_code) ?? null);
        setLoading(false);
        return;
      }
      if (fetchErr) {
        setError(fetchErr);
      }
    } catch {
      // Cloud API unreachable, seamlessly compile on the client
    }

    // Client-side Zero-Cloud TinyML Transpiler
    try {
      const cCode = generateCHeader(activeModel, activeQuantize, activeMcu);
      setCode(cCode);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg || "Failed to generate C header");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (val: string) => {
    setModel(val);
  };

  const handleSelectMcu = (val: string) => {
    setTargetMcu(val);
  };

  const handleToggleQuantize = () => {
    setQuantize((prev) => !prev);
  };

  const handleCopy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!code) return;
    const blob = new Blob([code], { type: "text/x-csrc" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model_${model}_${quantize ? "int8" : "fp32"}.h`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Dynamic hardware budget estimates based on selected topology
  const getSramEstimate = () => {
    if (model === "rf") return quantize ? "28 Bytes" : "112 Bytes";
    if (model === "svm") return quantize ? "32 Bytes" : "200 Bytes";
    if (model === "small_nn") return quantize ? "48 Bytes" : "168 Bytes";
    if (model === "knn") return quantize ? "64 Bytes" : "240 Bytes";
    return quantize ? "24 Bytes" : "96 Bytes";
  };

  const getFlashEstimate = () => {
    if (model === "rf") return quantize ? "~ 1.6 KB" : "~ 4.2 KB";
    if (model === "svm") return quantize ? "~ 0.9 KB" : "~ 2.1 KB";
    if (model === "small_nn") return quantize ? "~ 1.2 KB" : "~ 2.8 KB";
    if (model === "knn") return quantize ? "~ 1.8 KB" : "~ 3.4 KB";
    return quantize ? "~ 0.6 KB" : "~ 1.5 KB";
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-12">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-6 md:py-8 flex-1 flex flex-col animate-enter-subtle">
        {/* Header */}
        <header className="mb-6 border-b-4 border-ink pb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-3 flex items-center gap-2 uppercase">
              <Terminal size={14} />
              C99 EMBEDDED TRANSPILER · ZERO-MALLOC ABI
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5rem)] leading-[0.9]">
              EDGE<br />COMPILER
            </h1>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 text-right">
            <div className="text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-white">
              {`TARGET: ${targetMcu.toUpperCase()} · ${quantize ? "INT8 FIXED-POINT" : "FP32 SINGLE-PRECISION"}`}
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              ABI: int predict(const float *features) · Zero-Malloc
            </div>
          </div>
        </header>

        {/* 2-Column Responsive Workspace Grid (Fixed Size on Desktop: lg:h-145) */}
        <div className="crosshair-corner grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink border-2 border-ink lg:h-145">
          {/* Config Panel - 6 Columns (Fixed Size, Zero Scroll) */}
          <div className="lg:col-span-6 bg-canvas-cream flex flex-col h-full min-h-0 justify-between overflow-hidden">
            {/* Header */}
            <div className="h-13 px-4 sm:px-5 border-b-2 border-ink bg-white flex justify-between items-center shrink-0">
              <h2 className="text-[13px] sm:text-[14px] font-bold tracking-wider uppercase flex items-center gap-2">
                <Cpu size={15} />
                Target Configuration
              </h2>
              <span className="tech-tag text-[9px]">TINYML C99</span>
            </div>

            {/* Target Architecture Selection (2x2 Silicon Grid) */}
            <div className="p-3 sm:p-3.5 bg-canvas-cream border-b-2 border-ink flex flex-col gap-1.5 shrink-0">
              <div className="text-[10px] font-bold tracking-widest text-slate uppercase flex justify-between items-center">
                <span className="text-ink">Target Silicon Profile</span>
                <span className="text-hazard text-[9px] font-bold uppercase">{targetMcu} active</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "esp32", name: "ESP32-S3", clock: "240 MHz", arch: "Xtensa LX7 · SIMD", mem: "512 KB" },
                  { id: "arm", name: "Cortex-M4F", clock: "168 MHz", arch: "ARMv7E-M · CMSIS", mem: "FPU Unit" },
                  { id: "rp2040", name: "RP2040", clock: "133 MHz", arch: "Dual M0+ · ALU", mem: "264 KB" },
                  { id: "nrf52", name: "nRF52840", clock: "64 MHz", arch: "Cortex-M4 · BLE", mem: "256 KB" },
                ].map((chip) => {
                  const isSelected = targetMcu === chip.id;
                  return (
                    <button
                      key={chip.id}
                      type="button"
                      onClick={() => handleSelectMcu(chip.id)}
                      className={`btn-tactile border-2 border-ink p-2 text-left transition-colors flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "bg-ink text-white font-bold"
                          : "bg-white text-ink hover:bg-canvas-cream"
                      }`}
                    >
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider mb-0.5">
                        <span>{chip.name}</span>
                        <span
                          className={`text-[8px] font-bold px-1.5 py-0.2 border ${
                            isSelected
                              ? "bg-hazard text-white border-hazard"
                              : "bg-whisper text-ink border-ink/40"
                          }`}
                        >
                          {chip.clock}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono tabular-nums">
                        <span className={`truncate max-w-27.5 ${isSelected ? "text-white/75" : "text-slate"}`}>{chip.arch}</span>
                        <span className={`font-bold shrink-0 ${isSelected ? "text-hazard" : "text-slate"}`}>{chip.mem}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Config Controls (Middle Section, Flex-1, Fits with zero scroll) */}
            <div className="p-3 sm:p-3.5 flex flex-col gap-2.5 bg-white flex-1 min-h-0 justify-between">
              {/* Model Architecture Selector - 5 Ensemble Models */}
              <div className="flex flex-col gap-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate flex justify-between items-center">
                  <span className="text-ink">Ensemble Classifier Topology</span>
                  <span className="text-[9px] text-slate/80">5 Estimators</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: "rf", label: "RF", sub: "30 Trees" },
                    { id: "svm", label: "SVM", sub: "Linear" },
                    { id: "logreg", label: "LogReg", sub: "Logits" },
                    { id: "small_nn", label: "MLP", sub: "16-8 Net" },
                    { id: "knn", label: "KNN", sub: "5-NN" },
                  ].map((m) => {
                    const isSelected = model === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectModel(m.id)}
                        className={`btn-tactile border-2 border-ink py-1.5 px-0.5 text-center transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-ink text-white font-bold"
                            : "bg-canvas-cream text-ink hover:bg-white"
                        }`}
                      >
                        <div className="text-[10px] font-black uppercase tracking-wider leading-tight">{m.label}</div>
                        <div className={`text-[7.5px] uppercase tracking-wider mt-0.5 ${isSelected ? "text-white/75" : "text-slate"}`}>
                          {m.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantization Toggle */}
              <div className="border-2 border-ink p-2.5 bg-canvas-cream flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <Zap size={12} className="text-hazard shrink-0" />
                    INT8 Fixed-Point Quantization
                  </div>
                  <div className="text-[8.5px] text-slate uppercase mt-0.5">
                    {quantize ? "75% SRAM reduction · Integer ALU bitshifts · 0 FPU cycles" : "Standard FP32 IEEE floating point representation"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleToggleQuantize}
                  className={`btn-tactile border-2 border-ink px-2.5 py-1 text-[8.5px] font-bold uppercase tracking-wider transition-colors shrink-0 ml-2 cursor-pointer ${
                    quantize ? "bg-hazard text-white" : "bg-white text-ink hover:bg-canvas-cream"
                  }`}
                >
                  {quantize ? "Enabled" : "Disabled"}
                </button>
              </div>

              {/* Hardware Budget 3-Cell Telemetry Strip */}
              <div className="border-2 border-ink bg-canvas-cream p-2 text-[9px] font-bold tracking-wider uppercase grid grid-cols-3 gap-2 text-center divide-x-2 divide-ink/20">
                <div>
                  <div className="text-[8px] text-slate">STATIC SRAM</div>
                  <div className="tabular-nums text-ink text-[10.5px] font-black">{getSramEstimate()}</div>
                </div>
                <div>
                  <div className="text-[8px] text-slate">FLASH ROM</div>
                  <div className="tabular-nums text-ink text-[10.5px] font-black">{getFlashEstimate()}</div>
                </div>
                <div>
                  <div className="text-[8px] text-slate">HEAP ALLOC</div>
                  <div className="text-hazard tabular-nums text-[10.5px] font-black">0 BYTES</div>
                </div>
              </div>
            </div>

            {/* Compile CTA - Directly connected with no gap */}
            <div className="p-3.5 sm:p-4 bg-white border-t-2 border-ink shrink-0">
              <button
                type="button"
                onClick={() => handleExport()}
                disabled={loading}
                className="btn-tactile-hazard py-2.5 font-bold text-[13px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 w-full cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "Compiling C99 Header..." : code ? "Recompile C Header" : "Compile C Header"}
              </button>
            </div>
          </div>

          {/* Reusable Generated C Header Section - 6 Columns */}
          <GeneratedCHeader
            code={code}
            loading={loading}
            error={error}
            onCopy={handleCopy}
            onDownload={handleDownload}
            copied={copied}
            className="lg:col-span-6 h-full min-h-0"
          />
        </div>
      </div>
    </main>
  );
}

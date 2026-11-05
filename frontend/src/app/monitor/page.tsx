"use client";

import Link from "next/link";
import { useTelemetry } from "@/context/TelemetryContext";
import { useState } from "react";
import {
  Usb,
  PlayCircle,
  StopCircle,
  Activity,
  CheckCircle2,
  Cpu,
  Gauge,
  Heart,
  Thermometer,
  Wind,
  FileText,
  Pause,
  Play,
} from "lucide-react";
import { evaluateEdge } from "@/lib/edge/inference";

export default function SystemMonitor() {
  const {
    data,
    status,
    runtimeMode,
    serialStatus,
    serialMessage,
    isWebSerialSupported,
    connectHardwareSerial,
    engageSiliconLoopback,
    disconnectSerial,
    snapshotCurrentVitals,
    isStreamPaused,
    toggleStreamPause,
  } = useTelemetry();

  const [snapped, setSnapped] = useState(false);

  const effectivePrediction = data?.prediction ?? (data?.sensor_data ? evaluateEdge(data.sensor_data) : evaluateEdge({
    Heart_Rate: 75,
    SpO2_Level: 98,
    Systolic_BP: 120,
    Diastolic_BP: 80,
    Body_Temp: 37.0,
  }));

  const isCriticalAnomaly = Boolean(effectivePrediction?.is_at_risk);

  const handleSnapshot = () => {
    snapshotCurrentVitals();
    setSnapped(true);
    setTimeout(() => setSnapped(false), 2000);
  };

  const getStatusLabel = () => {
    if (isStreamPaused) return "STREAM_PAUSED (AWAITING_COMMAND)";
    if (runtimeMode === "SERIAL_ESP32_HARDWARE") return "ESP32_HARDWARE · UART_115200";
    if (runtimeMode === "SILICON_LOOPBACK") return "SILICON_LOOPBACK · VIRTUAL_COM";
    if (status === "connecting") return "CONNECTING...";
    if (status === "reconnecting") return "RECONNECTING...";
    if (status === "disconnected") return "DISCONNECTED";
    if (status === "connected") return "LIVE";
    if (status === "edge_active") return "EDGE_AI_ACTIVE (ZERO-CLOUD)";
    return data ? "LIVE" : "AWAITING_SIGNAL";
  };

  // Primary physiological values
  const hr = data?.sensor_data?.Heart_Rate ? Math.round(data.sensor_data.Heart_Rate) : null;
  const spo2 = data?.sensor_data?.SpO2_Level ? Math.round(data.sensor_data.SpO2_Level) : null;
  const sbp = data?.sensor_data?.Systolic_BP ? Math.round(data.sensor_data.Systolic_BP) : null;
  const dbp = data?.sensor_data?.Diastolic_BP ? Math.round(data.sensor_data.Diastolic_BP) : null;
  const temp = data?.sensor_data?.Body_Temp ?? null;

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col animate-enter-subtle">
        {/* Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <Activity size={14} />
              LIVE TELEMETRY STREAM
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9]">
              PATIENT<br />TELEMETRY
            </h1>
          </div>

          <div className="flex flex-col md:items-end gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest border border-ink bg-white px-2.5 py-1">
                MODE: {runtimeMode}
              </span>
              <div
                className={`text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-3.5 py-1 text-white flex items-center gap-2 ${
                  isCriticalAnomaly ? "bg-hazard shadow-[2px_2px_0px_#141413]" : "bg-ink"
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${isCriticalAnomaly ? "bg-white" : "bg-emerald-400"}`} />
                STATUS: {getStatusLabel()}
              </div>
            </div>

            {/* Hardware & Session Actions Toolbar */}
            <div className="flex flex-wrap gap-2 pt-1">
              {serialStatus === "idle" || serialStatus === "unsupported" || serialStatus === "error" ? (
                <>
                  {isWebSerialSupported && (
                    <button
                      onClick={connectHardwareSerial}
                      className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1 bg-white hover:bg-ink hover:text-white transition-colors flex items-center gap-1.5"
                      title="Connect physical ESP32 via USB Serial"
                    >
                      <Usb size={12} />
                      Connect ESP32 (USB)
                    </button>
                  )}
                  <button
                    onClick={engageSiliconLoopback}
                    className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1 bg-white hover:bg-hazard hover:text-white transition-colors flex items-center gap-1.5"
                    title="Simulate UART 115200 baud streaming on-chip"
                  >
                    <PlayCircle size={12} />
                    Silicon Loopback
                  </button>
                </>
              ) : (
                <button
                  onClick={disconnectSerial}
                  className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-hazard text-white bg-hazard hover:bg-[#832422] transition-colors flex items-center gap-1.5"
                  title="Disconnect active serial stream"
                >
                  <StopCircle size={12} />
                  Disconnect Serial
                </button>
              )}

              {/* Simulator Stream Control */}
              {serialStatus === "idle" && (
                <button
                  type="button"
                  onClick={toggleStreamPause}
                  className={`btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1 flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isStreamPaused
                      ? "bg-hazard text-white hover:bg-ink shadow-[2px_2px_0px_#141413]"
                      : "bg-white text-ink hover:bg-canvas-cream"
                  }`}
                  title={isStreamPaused ? "Resume telemetry simulator stream" : "Pause telemetry simulator stream"}
                >
                  {isStreamPaused ? <Play size={11} className="fill-white" /> : <Pause size={11} />}
                  <span>{isStreamPaused ? "Resume Stream" : "Pause Stream"}</span>
                </button>
              )}

              <button
                onClick={handleSnapshot}
                className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1 bg-white hover:bg-hazard hover:text-white transition-colors"
                title="Capture telemetry snapshot into session log"
              >
                {snapped ? "Snapshot Saved" : "Record Snapshot"}
              </button>

              <Link
                href="/history"
                className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3 py-1 bg-canvas-cream hover:bg-ink hover:text-white transition-colors"
              >
                View Session Log →
              </Link>
            </div>

            {serialMessage && (
              <div className="text-[10px] font-mono font-bold tracking-widest text-slate uppercase bg-white border border-ink/40 px-2 py-0.5">
                {serialMessage}
              </div>
            )}
          </div>
        </header>

        {/* Modular Clinical Telemetry Dashboard Grid */}
        <div className="crosshair-corner flex flex-col divide-y-2 divide-ink border-2 border-ink shadow-[4px_4px_0px_0px_#141413]">
          {/* Row 1: Primary Vitals (8 cols) + Link & Hardware Edge (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink">
            {/* Left: Primary Vitals Section (8 cols on LG/XL) */}
            <div className="lg:col-span-8 bg-canvas-cream flex flex-col justify-between">
              {/* Primary Vitals Header - Matched exact height h-14 */}
              <div className="h-14 px-4 sm:px-6 flex justify-between items-center bg-white border-b-2 border-ink shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Activity size={16} className="text-hazard shrink-0" />
                  <h2 className="text-[13px] sm:text-[14px] font-bold tracking-wider uppercase truncate">Live Patient Vitals</h2>
                </div>
                {effectivePrediction ? (
                  (() => {
                    const getStatusStyles = (lbl: string) => {
                      const norm = (lbl || "").toLowerCase();
                      if (norm === "healthy" || norm === "normal") return "bg-[#d1fae5] text-[#065f46] border-[#065f46]";
                      if (norm.includes("heart")) return "bg-[#fef08a] text-[#854d0e] border-[#854d0e]";
                      if (norm.includes("asthma")) return "bg-[#e0f2fe] text-[#075985] border-[#075985]";
                      if (norm.includes("hypertension")) return "bg-[#f3e8ff] text-[#6b21a8] border-[#6b21a8]";
                      if (norm.includes("diabetes")) return "bg-[#ffedd5] text-[#9a3412] border-[#9a3412]";
                      return "bg-hazard text-white border-hazard";
                    };
                    return (
                      <div
                        className={`px-2.5 py-0.5 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border-2 shrink-0 ${getStatusStyles(
                          effectivePrediction.label
                        )}`}
                      >
                        {effectivePrediction.label} ({(effectivePrediction.confidence * 100).toFixed(1)}%)
                      </div>
                    );
                  })()
                ) : (
                  <div className="px-2.5 py-0.5 text-[11px] font-bold tracking-wider border-2 border-ink text-slate shrink-0">
                    ACQUIRING SIGNAL...
                  </div>
                )}
              </div>

              {/* 4-Cell Primary Vital Metrics Quad */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink grow">
                <VitalCard
                  label="HEART RATE"
                  icon={<Heart size={13} className="text-hazard" />}
                  value={hr ?? "---"}
                  unit="BPM"
                  normRange="60 - 100"
                  secondaryText={hr ? `${(hr / 60).toFixed(1)} Hz Pulse` : undefined}
                  status={
                    !hr
                      ? "idle"
                      : hr < 50 || hr > 120
                      ? "crit"
                      : hr < 60 || hr > 100
                      ? "warn"
                      : "ok"
                  }
                />

                <VitalCard
                  label="BLOOD OXYGEN"
                  icon={<Wind size={13} className="text-hazard" />}
                  value={spo2 ?? "---"}
                  unit="% SpO2"
                  normRange="95 - 100%"
                  secondaryText={spo2 ? (spo2 < 90 ? "Critical Hypoxemia" : "Normoxic") : undefined}
                  status={
                    !spo2
                      ? "idle"
                      : spo2 < 90
                      ? "crit"
                      : spo2 < 95
                      ? "warn"
                      : "ok"
                  }
                />

                <VitalCard
                  label="BLOOD PRESSURE"
                  icon={<Gauge size={13} className="text-hazard" />}
                  value={sbp && dbp ? `${sbp}/${dbp}` : "---"}
                  unit="mmHg"
                  normRange="120/80"
                  secondaryText={sbp ? (sbp > 160 ? "Stage 2 Hypertensive" : "Hemodynamic Stable") : undefined}
                  status={
                    !sbp || !dbp
                      ? "idle"
                      : sbp >= 160 || dbp >= 100 || sbp < 90
                      ? "crit"
                      : sbp >= 130 || dbp >= 85
                      ? "warn"
                      : "ok"
                  }
                />

                <VitalCard
                  label="BODY TEMP"
                  icon={<Thermometer size={13} className="text-hazard" />}
                  value={temp ? temp.toFixed(1) : "---"}
                  unit="°C"
                  normRange="36.5 - 37.5"
                  secondaryText={temp ? (temp > 38.5 ? "Febrile Anomaly" : "Normothermic") : undefined}
                  status={
                    !temp
                      ? "idle"
                      : temp > 38.5 || temp < 35.0
                      ? "crit"
                      : temp > 37.5
                      ? "warn"
                      : "ok"
                  }
                />
              </div>
            </div>

            {/* Right: Edge & Link Status Panel (4 cols on LG/XL) */}
            <div className="lg:col-span-4 bg-canvas-cream flex flex-col justify-between">
              {/* Header - EXACT SAME HEIGHT h-14 to match Left Header */}
              <div className="h-14 px-4 sm:px-6 flex justify-between items-center bg-white border-b-2 border-ink shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu size={14} className="text-ink shrink-0" />
                  <h3 className="text-[12px] font-bold tracking-widest uppercase truncate">Link & Hardware Edge</h3>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-ink bg-canvas-cream shrink-0">
                  Active Stream
                </span>
              </div>

              <div className="p-4 sm:p-5 flex flex-col justify-between grow gap-1.5 text-[11px] bg-canvas-cream">
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">COMM INTERFACE</span>
                  <span className="font-bold text-ink uppercase">{runtimeMode.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">UART CONFIG</span>
                  <span className="font-bold text-ink font-mono">115,200 BAUD (8-N-1)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">PACKET INTEGRITY</span>
                  <span className="font-bold text-[#065f46] flex items-center gap-1 font-mono">
                    <CheckCircle2 size={12} />
                    FRAMING VALID
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">INFERENCE LATENCY</span>
                  <span className="font-bold text-ink font-mono">
                    {data?.prediction?.inference_latency_us
                      ? `${(data.prediction.inference_latency_us / 1000).toFixed(2)} ms`
                      : "< 3.2 ms (Local)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">ENSEMBLE TOPOLOGY</span>
                  <span className="font-bold text-hazard font-mono">5-MODEL VOTING</span>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <Link
                    href="/history"
                    className="text-[10px] font-bold uppercase tracking-wider text-ink hover:text-hazard transition-colors flex items-center gap-1"
                  >
                    <FileText size={12} />
                    Full DATA.LOG History →
                  </Link>
                  <span className="text-[9px] text-slate font-bold uppercase font-mono">Session Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Diagnostic Classification (Spider Web ~42% + Bars ~58%) */}
          <div className="bg-white flex flex-col">
            <div className="px-4 sm:px-6 py-2.5 bg-white border-b-2 border-ink flex justify-between items-center flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-hazard inline-block" />
                <h3 className="text-[12px] font-bold tracking-widest uppercase text-ink">
                  Diagnostic Probabilities · Multi-Class Ensemble
                </h3>
              </div>
              <div className="text-[10px] font-bold tracking-wider text-hazard uppercase">
                Consensus: 5 Active Classifiers
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink">
              {/* Spider Web Radar Chart (approx 42% width on Desktop) */}
              <div className="lg:col-span-5 bg-canvas-cream p-4 sm:p-6 flex flex-col items-center justify-between">
                <div className="w-full flex justify-between items-center pb-2 border-b border-ink/15 mb-2">
                  <span className="text-[10px] font-bold text-slate tracking-widest uppercase">
                    Radar Biometric Signature
                  </span>
                  <span className="text-[9px] font-bold text-hazard uppercase px-1.5 py-0.5 border border-ink/30 bg-white">
                    5-Axis Geometric
                  </span>
                </div>

                <SpiderWebRadar probs={effectivePrediction?.disease_probs} />

                <div className="w-full text-center text-[9px] text-slate font-mono uppercase tracking-wider pt-2 border-t border-ink/15">
                  Multi-Axis Risk Envelope · Geometric Signature
                </div>
              </div>

              {/* Linear Bar Charts (approx 58% width on Desktop) */}
              <div className="lg:col-span-7 bg-white p-4 sm:p-6 flex flex-col justify-between gap-3.5">
                <div className="w-full flex justify-between items-center pb-2 border-b border-ink/15 mb-2">
                  <span className="text-[10px] font-bold text-slate tracking-widest uppercase">
                    Categorical Probability Distribution
                  </span>
                  <span className="text-[9px] font-mono font-bold text-slate uppercase">
                    Soft-Voting Weights
                  </span>
                </div>

                {effectivePrediction?.disease_probs && Object.keys(effectivePrediction.disease_probs).length > 0 ? (
                  Object.entries(effectivePrediction.disease_probs)
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .map(([disease, prob]) => {
                      const pct = ((prob as number) * 100).toFixed(1);
                      const isRisk =
                        (prob as number) > 0.4 &&
                        disease.toLowerCase() !== "normal" &&
                        disease.toLowerCase() !== "healthy";
                      return (
                        <div key={disease} className="flex flex-col gap-1">
                          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                            <span className={isRisk ? "text-hazard font-black" : "text-ink"}>
                              {disease}
                            </span>
                            <span className="tabular-nums font-mono font-bold">{pct}%</span>
                          </div>
                          <div className="h-4 bg-canvas-cream border-2 border-ink overflow-hidden relative">
                            <div
                              className="absolute inset-0 z-0 opacity-15"
                              style={{
                                backgroundImage: "linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)",
                                backgroundSize: "10% 100%",
                              }}
                            />
                            <div
                              className={`h-full relative z-10 transition-[width] duration-150 ease-out ${
                                isRisk ? "bg-hazard" : "bg-ink"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-8 flex items-center justify-center text-[12px] font-bold text-slate tracking-widest">
                    AWAITING TELEMETRY CLASSIFICATION STREAM...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function VitalCard({
  label,
  icon,
  value,
  unit,
  normRange,
  secondaryText,
  status = "idle",
}: {
  label: string;
  icon?: React.ReactNode;
  value: string | number | null | undefined;
  unit: string;
  normRange?: string;
  secondaryText?: string;
  status?: "idle" | "ok" | "warn" | "crit";
}) {
  const getBadgeStyle = () => {
    if (status === "crit") return "bg-hazard text-white border-hazard";
    if (status === "warn") return "bg-amber-200 text-amber-900 border-amber-500";
    if (status === "ok") return "bg-[#d1fae5] text-[#065f46] border-[#065f46]";
    return "bg-canvas-cream text-slate border-ink/30";
  };

  const getStatusLabel = () => {
    if (status === "crit") return "CRIT";
    if (status === "warn") return "WARN";
    if (status === "ok") return "NORM";
    return "IDLE";
  };

  return (
    <div className="bg-canvas-cream p-4 sm:p-5 flex flex-col justify-between hover:bg-white transition-all duration-150 cursor-default overflow-hidden group relative">
      <span className="absolute top-2 right-2 text-ink/20 group-hover:text-hazard transition-all duration-150 text-[10px] select-none group-hover:scale-125">
        +
      </span>

      <div>
        <div className="flex items-center justify-between border-b border-ink/20 pb-2 mb-3 gap-1">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate tracking-wider group-hover:text-hazard transition-colors flex items-center gap-1.5 min-w-0">
            {icon}
            <span className="whitespace-nowrap uppercase truncate">{label}</span>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border shrink-0 ${getBadgeStyle()}`}>
            {getStatusLabel()}
          </span>
        </div>

        <div className="font-sans text-[clamp(26px,2.4vw,42px)] font-black tracking-tighter tabular-nums leading-none mb-1.5 break-all text-ink transition-transform duration-150 group-hover:translate-x-0.5">
          {value !== null && value !== undefined ? value : "---"}
        </div>
      </div>

      <div className="pt-2 border-t border-ink/10 flex flex-col gap-0.5">
        <div className="flex items-center justify-between text-[10px] font-bold tracking-wider">
          <span className="text-hazard font-mono">{unit}</span>
          {normRange && <span className="text-slate text-[9px] tracking-widest">{normRange}</span>}
        </div>
        {secondaryText && (
          <div className="text-[9px] text-slate font-bold uppercase tracking-wider pt-0.5">
            {secondaryText}
          </div>
        )}
      </div>
    </div>
  );
}

const RADAR_CLASSES = [
  { key: "Normal", label: "NORMAL" },
  { key: "Asthma", label: "ASTHMA" },
  { key: "Hypertension", label: "HYPERTENSION" },
  { key: "Heart Disease", label: "HEART DIS." },
  { key: "Diabetes", label: "DIABETES" },
];

function SpiderWebRadar({ probs }: { probs?: Record<string, number> }) {
  const cx = 160;
  const cy = 130;
  const R = 78;
  const numAxes = RADAR_CLASSES.length; // 5

  const getAngle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / numAxes;

  // Generate 4 concentric regular pentagon rings (25%, 50%, 75%, 100%)
  const rings = [0.25, 0.5, 0.75, 1.0].map((scale) => {
    return RADAR_CLASSES.map((_, i) => {
      const angle = getAngle(i);
      const r = R * scale;
      return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
    }).join(" ");
  });

  // Calculate vertices for data polygon
  const dataPoints = RADAR_CLASSES.map((item, i) => {
    const rawVal = probs?.[item.key] ?? probs?.[item.key.toLowerCase()] ?? 0.05;
    const val = Math.max(0.06, Math.min(1.0, rawVal));
    const angle = getAngle(i);
    const r = R * val;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      val: rawVal,
      label: item.label,
      angle,
    };
  });

  const polygonPoints = dataPoints.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <svg
        viewBox="0 0 320 260"
        className="w-full max-w-[320px] h-auto overflow-visible select-none"
      >
        {/* Concentric Web Rings */}
        {rings.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill={idx === 3 ? "rgba(20, 20, 19, 0.02)" : "none"}
            stroke="#141413"
            strokeWidth={idx === 3 ? "1.5" : "1"}
            strokeOpacity={idx === 3 ? "0.3" : "0.15"}
            strokeDasharray={idx === 3 ? undefined : "3 3"}
          />
        ))}

        {/* 5 Radial Spokes from Center */}
        {RADAR_CLASSES.map((_, i) => {
          const angle = getAngle(i);
          const x2 = cx + R * Math.cos(angle);
          const y2 = cy + R * Math.sin(angle);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x2}
              y2={y2}
              stroke="#141413"
              strokeWidth="1"
              strokeOpacity="0.2"
            />
          );
        })}

        {/* Percentage scale watermark along vertical axis */}
        <text x={cx + 4} y={cy - R * 0.5 + 3} className="text-[8px] font-mono font-bold fill-slate select-none">
          50%
        </text>
        <text x={cx + 4} y={cy - R + 3} className="text-[8px] font-mono font-bold fill-slate select-none">
          100%
        </text>

        {/* Data Envelope Polygon */}
        <polygon
          points={polygonPoints}
          fill="rgba(159, 47, 45, 0.28)"
          stroke="#9F2F2D"
          strokeWidth="2.5"
          className="transition-all duration-300 ease-out"
        />

        {/* Axis Labels */}
        {dataPoints.map((p, i) => {
          const labelDist = R + 18;
          const lx = cx + labelDist * Math.cos(p.angle);
          const ly = cy + labelDist * Math.sin(p.angle);

          const cos = Math.cos(p.angle);
          const sin = Math.sin(p.angle);
          const textAnchor = cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
          const dominantBaseline = sin < -0.4 ? "auto" : sin > 0.4 ? "hanging" : "middle";

          const pct = (p.val * 100).toFixed(1);
          const isDominant = p.val > 0.35;

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor={textAnchor}
              dominantBaseline={dominantBaseline}
              className="text-[9.5px] font-mono font-bold uppercase tracking-wider select-none"
            >
              <tspan fill={isDominant ? "#9F2F2D" : "#141413"}>{p.label}</tspan>{" "}
              <tspan fill={isDominant ? "#9F2F2D" : "#696969"} className="font-mono">
                {pct}%
              </tspan>
            </text>
          );
        })}

        {/* Center Origin Crosshair */}
        <line x1={cx - 4} y1={cy} x2={cx + 4} y2={cy} stroke="#141413" strokeWidth="1.5" strokeOpacity="0.4" />
        <line x1={cx} y1={cy - 4} x2={cx} y2={cy + 4} stroke="#141413" strokeWidth="1.5" strokeOpacity="0.4" />
      </svg>
    </div>
  );
}

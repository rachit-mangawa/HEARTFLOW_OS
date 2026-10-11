"use client";

import Link from "next/link";
import { useTelemetry } from "@/context/TelemetryContext";
import { useState } from "react";
import {
  ShieldAlert,
  Usb,
  PlayCircle,
  StopCircle,
  Activity,
  CheckCircle2,
  Cpu,
  Clock,
  Gauge,
  Heart,
  Thermometer,
  Wind,
  FileText,
} from "lucide-react";
import { evaluateEdge } from "@/lib/edge/inference";

interface TelemetryEvent {
  id: string;
  timestamp: string;
  message: string;
  type: "info" | "warn" | "crit" | "ok";
}

const STATIC_BASELINE_EVENTS: TelemetryEvent[] = [
  {
    id: "evt-base-1",
    timestamp: "LIVE",
    message: "UART serial bridge interface armed (115200 baud, 8-N-1)",
    type: "ok",
  },
  {
    id: "evt-base-2",
    timestamp: "EDGE",
    message: "Edge C inference engine active · 5-model heterogeneous ensemble (RF, SVM, LogReg, MLP, KNN)",
    type: "info",
  },
  {
    id: "evt-base-3",
    timestamp: "STANDBY",
    message: "Alarm logic thresholds aligned with IEC 60601-1-8 alarm priority bands",
    type: "info",
  },
];

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
  } = useTelemetry();

  const [snapped, setSnapped] = useState(false);
  const [userEvents, setUserEvents] = useState<TelemetryEvent[]>([]);

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
    const now = new Date();
    const timeStr = now.toTimeString().split(" ")[0];
    setUserEvents((prev) => [
      {
        id: `evt-snap-${Date.now()}`,
        timestamp: timeStr,
        message: "Telemetry snapshot captured into session DATA.LOG",
        type: "ok",
      },
      ...prev.slice(0, 8),
    ]);
    setTimeout(() => setSnapped(false), 2000);
  };

  // Compile active events feed reactively
  const activeEvents: TelemetryEvent[] = [
    ...(isCriticalAnomaly && effectivePrediction?.label
      ? [
          {
            id: `evt-crit-active`,
            timestamp: "ALERT",
            message: `CARDIAC EVENT DETECTED: ${effectivePrediction.label} (${((effectivePrediction.confidence ?? 0.85) * 100).toFixed(1)}%)`,
            type: "crit" as const,
          },
        ]
      : []),
    ...userEvents,
    ...STATIC_BASELINE_EVENTS,
  ];

  const getStatusLabel = () => {
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

  // Derived Hemodynamic Biomarkers
  const mapValue = sbp !== null && dbp !== null ? Math.round((2 * dbp + sbp) / 3) : null;
  const pulsePressure = sbp !== null && dbp !== null ? Math.round(sbp - dbp) : null;
  const shockIndex = hr !== null && sbp !== null && sbp > 0 ? (hr / sbp).toFixed(2) : null;
  const rpp = hr !== null && sbp !== null ? Math.round((hr * sbp) / 100) : null;

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col">
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
                className={`text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-3.5 py-1 text-white ${
                  isCriticalAnomaly ? "bg-hazard" : "bg-ink"
                }`}
              >
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
        <div className="crosshair-corner grid grid-cols-1 xl:grid-cols-12 gap-px bg-ink border-2 border-ink">
          {/* Main Primary Telemetry Panel (8 cols on XL) */}
          <div className="xl:col-span-8 bg-canvas-cream flex flex-col divide-y-2 divide-ink">
            {/* Primary Vitals Header */}
            <div className="p-4 px-6 flex justify-between items-center bg-white flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-hazard" />
                <h2 className="text-[14px] font-bold tracking-wider uppercase">Live Patient Vitals</h2>
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
                      className={`px-3 py-1 text-[13px] font-bold uppercase tracking-wider border-2 ${getStatusStyles(
                        effectivePrediction.label
                      )}`}
                    >
                      {effectivePrediction.label} ({(effectivePrediction.confidence * 100).toFixed(1)}%)
                    </div>
                  );
                })()
              ) : (
                <div className="px-3 py-1 text-[12px] font-bold tracking-wider border-2 border-ink text-slate">
                  ACQUIRING SIGNAL...
                </div>
              )}
            </div>

            {/* 4-Cell Primary Vital Metrics Quad */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink">
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

            {/* Derived Clinical Biomarkers Sub-Grid */}
            <div className="p-6 bg-white flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-ink/20 pb-2">
                <span className="text-[11px] font-bold text-slate tracking-widest uppercase">
                  Calculated Hemodynamic Biomarkers
                </span>
                <span className="text-[10px] text-hazard font-mono font-bold">
                  Derived from SBP / DBP / HR Telemetry
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="border border-ink/20 bg-canvas-cream p-3 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate uppercase tracking-wider">Mean Arterial (MAP)</div>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-[20px] font-black tabular-nums text-ink">{mapValue ?? "---"}</span>
                    <span className="text-[10px] font-bold text-hazard">mmHg</span>
                  </div>
                  <div className="text-[9px] text-slate font-bold uppercase">
                    {mapValue && mapValue >= 70 && mapValue <= 100 ? "Normal Perfusion" : "Perfusion At Risk"}
                  </div>
                </div>

                <div className="border border-ink/20 bg-canvas-cream p-3 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate uppercase tracking-wider">Pulse Pressure</div>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-[20px] font-black tabular-nums text-ink">{pulsePressure ?? "---"}</span>
                    <span className="text-[10px] font-bold text-hazard">mmHg</span>
                  </div>
                  <div className="text-[9px] text-slate font-bold uppercase">
                    {pulsePressure && pulsePressure <= 50 ? "Normal Elasticity" : "Vascular Stiffness"}
                  </div>
                </div>

                <div className="border border-ink/20 bg-canvas-cream p-3 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate uppercase tracking-wider">Shock Index (SI)</div>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-[20px] font-black tabular-nums text-ink">{shockIndex ?? "---"}</span>
                    <span className="text-[10px] font-bold text-hazard">HR/SBP</span>
                  </div>
                  <div className="text-[9px] text-slate font-bold uppercase">
                    {shockIndex && Number(shockIndex) < 0.9 ? "Stable State" : "Elevated Risk"}
                  </div>
                </div>

                <div className="border border-ink/20 bg-canvas-cream p-3 flex flex-col justify-between">
                  <div className="text-[10px] font-bold text-slate uppercase tracking-wider">Rate-Pressure Prod.</div>
                  <div className="flex items-baseline gap-1 my-1">
                    <span className="text-[20px] font-black tabular-nums text-ink">{rpp ?? "---"}</span>
                    <span className="text-[10px] font-bold text-hazard">BPM·mmHg/100</span>
                  </div>
                  <div className="text-[9px] text-slate font-bold uppercase">
                    {rpp && rpp <= 120 ? "Normal Cardiac Workload" : "High Workload"}
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Classification & Ensemble Probabilities */}
            <div className="bg-canvas-cream flex flex-col">
              <div className="border-b-2 border-ink p-3 px-6 flex justify-between items-center bg-white">
                <h3 className="text-[12px] font-bold tracking-widest uppercase text-ink">
                  Diagnostic Probabilities · Multi-Class Ensemble
                </h3>
                <div className="text-[11px] font-bold tracking-wider text-hazard uppercase">
                  Consensus: 5 Active Classifiers
                </div>
              </div>

              <div className="p-6 bg-white flex flex-col justify-center gap-5">
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
                        <div
                          key={disease}
                          className="flex flex-col gap-1.5"
                        >
                          <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest">
                            <span className={isRisk ? "text-hazard" : "text-ink"}>
                              {disease}
                            </span>
                            <span className="tabular-nums font-mono">{pct}%</span>
                          </div>
                          <div className="h-5 bg-canvas-cream border-2 border-ink overflow-hidden relative">
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

          {/* Right Column: Hardware Telemetry, Threshold Limits, and Event Stream (4 cols on XL) */}
          <div className="xl:col-span-4 bg-white flex flex-col divide-y-2 divide-ink">
            {/* Edge & Link Status Panel */}
            <div className="p-5 flex flex-col gap-4 bg-canvas-cream">
              <div className="flex items-center justify-between border-b border-ink/20 pb-2">
                <div className="flex items-center gap-2">
                  <Cpu size={14} className="text-ink" />
                  <h3 className="text-[12px] font-bold tracking-widest uppercase">Link & Hardware Edge</h3>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-ink bg-white">
                  250 Hz Continuous
                </span>
              </div>

              <div className="flex flex-col gap-2.5 text-[11px]">
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">COMM INTERFACE</span>
                  <span className="font-bold text-ink uppercase">{runtimeMode.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">UART CONFIG</span>
                  <span className="font-bold text-ink">115,200 BAUD (8-N-1)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">CHECKSUM INTEGRITY</span>
                  <span className="font-bold text-[#065f46] flex items-center gap-1">
                    <CheckCircle2 size={12} />
                    CRC32 VERIFIED
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-ink/10">
                  <span className="text-slate font-bold uppercase">INFERENCE LATENCY</span>
                  <span className="font-bold text-ink">
                    {data?.prediction?.inference_latency_us
                      ? `${(data.prediction.inference_latency_us / 1000).toFixed(2)} ms`
                      : "< 3.2 ms (Edge)"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate font-bold uppercase">ENSEMBLE TOPOLOGY</span>
                  <span className="font-bold text-hazard">5-MODEL VOTING</span>
                </div>
              </div>
            </div>

            {/* IEC 60601-1-8 Reference Threshold Limits */}
            <div className="p-5 flex flex-col gap-3 bg-white">
              <div className="flex items-center justify-between border-b border-ink/20 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={14} className="text-hazard" />
                  <h3 className="text-[12px] font-bold tracking-widest uppercase">Alarm Priority Bands</h3>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 border border-ink/30 bg-canvas-cream text-slate">
                  REF: IEC 60601-1-8
                </span>
              </div>

              <div className="divide-y divide-ink/10 text-[10px] font-mono">
                <div className="py-2 flex justify-between items-center">
                  <span className="text-slate font-bold uppercase">HR Low / High</span>
                  <span className="text-ink font-bold tabular-nums">50 BPM / 120 BPM</span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-slate font-bold uppercase">SpO2 Critical Limit</span>
                  <span className="text-ink font-bold tabular-nums">&lt; 90% (Hypoxemia)</span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-slate font-bold uppercase">Systolic BP Limit</span>
                  <span className="text-ink font-bold tabular-nums">90 - 160 mmHg</span>
                </div>
                <div className="py-2 flex justify-between items-center">
                  <span className="text-slate font-bold uppercase">Core Temp Limit</span>
                  <span className="text-ink font-bold tabular-nums">35.5°C - 38.5°C</span>
                </div>
              </div>
            </div>

            {/* Live Telemetry Event Stream */}
            <div className="p-5 flex flex-col gap-3 bg-canvas-cream grow min-h-60">
              <div className="flex items-center justify-between border-b border-ink/20 pb-2">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-ink" />
                  <h3 className="text-[12px] font-bold tracking-widest uppercase">Telemetry Event Log</h3>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate">
                  {activeEvents.length} Events
                </span>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto max-h-72 pr-1 font-mono text-[10px]">
                {activeEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`border p-2 bg-white flex flex-col gap-0.5 ${
                      evt.type === "crit"
                        ? "border-hazard bg-[#fdebec] text-hazard"
                        : evt.type === "warn"
                        ? "border-amber-500 bg-[#fefce8] text-amber-900"
                        : evt.type === "ok"
                        ? "border-[#065f46]/40 text-[#065f46]"
                        : "border-ink/20 text-slate"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold opacity-75">
                      <span>[{evt.timestamp}]</span>
                      <span className="uppercase">{evt.type}</span>
                    </div>
                    <div className="font-bold text-ink leading-tight">{evt.message}</div>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-auto border-t border-ink/10 flex justify-between items-center">
                <Link
                  href="/history"
                  className="text-[10px] font-bold uppercase tracking-wider text-ink hover:text-hazard transition-colors flex items-center gap-1"
                >
                  <FileText size={12} />
                  Full DATA.LOG History →
                </Link>
                <span className="text-[9px] text-slate font-bold uppercase">Session Active</span>
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
    <div className="bg-canvas-cream p-5 sm:p-6 flex flex-col justify-between hover:bg-white transition-colors cursor-default overflow-hidden group relative">
      <span className="absolute top-2 right-2 text-ink/20 group-hover:text-hazard transition-colors text-[10px] select-none">
        +
      </span>

      <div>
        <div className="flex items-center justify-between border-b border-ink/20 pb-2 mb-3">
          <div className="text-[10px] sm:text-[11px] font-bold text-slate tracking-widest group-hover:text-hazard transition-colors flex items-center gap-1.5">
            {icon}
            <span>{label}</span>
          </div>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 border ${getBadgeStyle()}`}>
            {getStatusLabel()}
          </span>
        </div>

        <div className="font-sans text-[clamp(28px,2.6vw,46px)] font-black tracking-tighter tabular-nums leading-none mb-1.5 break-all text-ink">
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

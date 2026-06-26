"use client";

import { useMemo } from "react";
import { PatientVitals } from "@/lib/edge/types";
import { computeEdgeShap } from "@/lib/edge/explain";
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from "lucide-react";

interface ShapChartProps {
  patientData: PatientVitals | null;
}

export default function ShapChart({ patientData }: ShapChartProps) {
  // Synchronous client-side edge SHAP computation - instant 0ms latency
  const shapData = useMemo(() => {
    if (!patientData) return null;
    return computeEdgeShap(patientData);
  }, [patientData]);

  if (!shapData || !patientData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center text-slate">
        <span className="text-[12px] font-bold uppercase tracking-widest border border-ink/20 px-4 py-2 bg-canvas-cream">
          Awaiting Patient Telemetry...
        </span>
      </div>
    );
  }

  // Feature clinical units mapping
  const units: Record<string, string> = {
    Heart_Rate: "BPM",
    SpO2_Level: "%",
    Systolic_BP: "mmHg",
    Diastolic_BP: "mmHg",
    Body_Temp: "°C",
  };

  const featureLabels: Record<string, string> = {
    Heart_Rate: "HEART RATE",
    SpO2_Level: "SPO2 SATURATION",
    Systolic_BP: "SYSTOLIC BP",
    Diastolic_BP: "DIASTOLIC BP",
    Body_Temp: "BODY TEMPERATURE",
  };

  // Prepare sorted attribution items
  const items = shapData.feature_names
    .map((rawName, i) => {
      const val = shapData.shap_values[i];
      const patientVal = patientData[rawName as keyof PatientVitals];
      return {
        key: rawName,
        name: featureLabels[rawName] || rawName.toUpperCase(),
        value: val,
        abs: Math.abs(val),
        isPositive: val > 0,
        patientVal: patientVal,
        unit: units[rawName] || "",
      };
    })
    .sort((a, b) => b.abs - a.abs);

  const maxAbs = Math.max(...items.map((i) => i.abs), 0.3);
  const netShap = items.reduce((acc, curr) => acc + curr.value, 0);
  const riskCount = items.filter((i) => i.isPositive).length;
  const safeCount = items.filter((i) => !i.isPositive).length;

  return (
    <div className="flex flex-col gap-5 w-full h-full justify-between font-mono">
      {/* SHAP Sign & Polarity Summary Card */}
      <div className="border-2 border-ink bg-canvas-cream p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          {netShap > 0 ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-black uppercase bg-hazard text-white border border-ink">
              <AlertTriangle size={13} />
              <span>[+] NET RISK IMPACT: +{netShap.toFixed(3)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-black uppercase bg-emerald-700 text-white border border-ink">
              <ShieldCheck size={13} />
              <span>[-] NET PROTECTIVE IMPACT: {netShap.toFixed(3)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider">
          <span className="text-hazard flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-hazard" />
            <span>{riskCount} RISK SIGN (+)</span>
          </span>
          <span className="text-emerald-700 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-emerald-600" />
            <span>{safeCount} PROTECTIVE SIGN (-)</span>
          </span>
        </div>
      </div>

      {/* Axis Polarity Legend */}
      <div className="grid grid-cols-2 text-[10px] font-black tracking-widest uppercase border-b-2 border-ink pb-2">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <TrendingDown size={14} className="text-emerald-700" />
          <span>(-) PROTECTIVE EFFECT (SUPPRESSES RISK)</span>
        </div>
        <div className="flex items-center justify-end gap-1.5 text-hazard">
          <span>(+) RISK FACTOR (DRIVES ANOMALY)</span>
          <TrendingUp size={14} className="text-hazard" />
        </div>
      </div>

      {/* Feature Attributions with Prominent Signs */}
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const widthPercent = Math.min((item.abs / maxAbs) * 50, 48);

          return (
            <div key={item.key} className="flex flex-col gap-1.5">
              {/* Header row: Name + Telemetry + SHAP Sign Badge */}
              <div className="flex justify-between items-baseline text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-ink font-black">{item.name}</span>
                  <span className="text-slate text-[10px] bg-white border border-ink/30 px-1.5 py-0.2">
                    {item.patientVal} {item.unit}
                  </span>
                </div>

                {/* Prominent Sign Pill */}
                <div className="flex items-center gap-1">
                  {item.isPositive ? (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-hazard text-white border border-ink flex items-center gap-1">
                      <span>+</span>
                      <span>{item.value.toFixed(3)}</span>
                      <span>[RISK DRIVER ↑]</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-700 flex items-center gap-1">
                      <span>{item.value.toFixed(3)}</span>
                      <span>[PROTECTIVE ↓]</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Dual-Polarity Divergent Chart Bar with Centered 0.00 Midline */}
              <div className="relative h-6 w-full bg-canvas-cream border-2 border-ink flex items-center overflow-hidden">
                {/* Background Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-15 pointer-events-none"
                  style={{
                    backgroundImage: "linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)",
                    backgroundSize: "20% 100%",
                  }}
                />

                {/* Left/Right Polarity Background Shading */}
                <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-emerald-500/5 pointer-events-none" />
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-hazard/5 pointer-events-none" />

                {/* Midline (0.00 Zero-Axis) */}
                <div className="absolute left-1/2 -top-1 -bottom-1 w-0.5 bg-ink z-20" />

                {/* Center Zero Marker */}
                <span className="absolute left-1/2 -translate-x-1/2 text-[8px] font-black text-slate bg-white px-1 border border-ink/40 z-30 pointer-events-none">
                  0.00
                </span>

                {/* Responsive Dual-Polarity Bar */}
                {item.isPositive ? (
                  // Positive (+) bar grows to the right
                  <div
                    className="absolute top-0 bottom-0 left-1/2 bg-hazard z-10 flex items-center justify-end pr-1 transition-all duration-150 border-r border-ink"
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-[9px] font-black text-white pl-1 select-none">
                      +
                    </span>
                  </div>
                ) : (
                  // Negative (-) bar grows to the left
                  <div
                    className="absolute top-0 bottom-0 right-1/2 bg-emerald-700 z-10 flex items-center justify-start pl-1 transition-all duration-150 border-l border-ink"
                    style={{ width: `${widthPercent}%` }}
                  >
                    <span className="text-[9px] font-black text-white pr-1 select-none">
                      -
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mathematical Reference Note */}
      <div className="pt-2 border-t border-ink/20 flex flex-wrap justify-between items-center text-[9px] text-slate font-bold uppercase gap-2">
        <span>Base Reference Value E[f(x)] = 0.50</span>
        <span>Local Linear Attribution Model: f(x) = E[f(x)] + ∑ φ_i</span>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { PatientVitals } from "@/lib/edge/types";
import { computeEdgeShap } from "@/lib/edge/explain";
import { TrendingUp, TrendingDown, ShieldCheck, AlertTriangle } from "lucide-react";

import { apiFetch } from "@/lib/api";

interface ShapChartProps {
  patientData: PatientVitals | null;
}

interface ShapData {
  feature_names: string[];
  shap_values: number[];
  base_value?: number;
}

export default function ShapChart({ patientData }: ShapChartProps) {
  const [cloudShap, setCloudShap] = useState<ShapData | null>(null);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compute zero-cloud edge attributions synchronously whenever patientData changes
  const localShap = useMemo(() => {
    if (!patientData) return null;
    return computeEdgeShap(patientData);
  }, [patientData]);

  // Attempt backend TreeSHAP API enhancement
  useEffect(() => {
    if (!patientData) return;

    let isCancelled = false;

    apiFetch<ShapData>("/heartflow/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patientData),
      onSlow: (slow) => {
        if (!isCancelled) setIsSlow(slow);
      },
    }).then(({ data, error: err }) => {
      if (isCancelled) return;
      if (err) {
        setError(err);
      } else if (data?.shap_values) {
        setCloudShap(data);
        setError(null);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [patientData]);

  const shapData = cloudShap || localShap;

  if (!patientData || !shapData) {
    return (
      <div className="h-full min-h-60 w-full flex flex-col items-center justify-center p-8 text-center text-slate">
        <span className="text-[12px] font-bold uppercase tracking-widest border border-ink/20 px-4 py-2 bg-canvas-cream">
          Awaiting Input · Run Inference to Generate Attributions
        </span>
      </div>
    );
  }

  const units: Record<string, string> = {
    Heart_Rate: "BPM",
    SpO2_Level: "%",
    Systolic_BP: "mmHg",
    Diastolic_BP: "mmHg",
    Body_Temp: "°C",
  };

  const featureLabels: Record<string, string> = {
    Heart_Rate: "HEART RATE",
    SpO2_Level: "SPO2 LEVEL",
    Systolic_BP: "SYSTOLIC BP",
    Diastolic_BP: "DIASTOLIC BP",
    Body_Temp: "BODY TEMP",
  };

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
      {/* SHAP Sign & Polarity Summary */}
      <div className="border-2 border-ink bg-canvas-cream p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div className="flex items-center gap-2">
          {netShap > 0 ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase bg-hazard text-white border border-ink">
              <AlertTriangle size={13} />
              <span>NET RISK ATTRIBUTION: +{netShap.toFixed(3)}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black uppercase bg-emerald-800 text-white border border-ink">
              <ShieldCheck size={13} />
              <span>NET PROTECTIVE ATTRIBUTION: {netShap.toFixed(3)}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="text-hazard flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-hazard" />
            <span>{riskCount} RISK FACTORS</span>
          </span>
          <span className="text-emerald-800 flex items-center gap-1">
            <span className="inline-block w-2 h-2 bg-emerald-700" />
            <span>{safeCount} PROTECTIVE</span>
          </span>
        </div>
      </div>

      {/* Axis Polarity Legend */}
      <div className="grid grid-cols-2 text-[10px] font-bold tracking-widest uppercase border-b-2 border-ink pb-2">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <TrendingDown size={14} className="text-emerald-700" />
          <span>PROTECTIVE (SUPPRESSES RISK)</span>
        </div>
        <div className="flex items-center justify-end gap-1.5 text-hazard">
          <span>RISK FACTOR (DRIVES ANOMALY)</span>
          <TrendingUp size={14} className="text-hazard" />
        </div>
      </div>

      {/* Feature Attributions with Calibrated Midline Bars */}
      <div className="flex flex-col gap-4">
        {items.map((item) => {
          const widthPercent = Math.min((item.abs / maxAbs) * 50, 48);

          return (
            <div key={item.key} className="flex flex-col gap-1.5">
              {/* Header row: Feature Name + Patient Vitals + Signed Attribution */}
              <div className="flex justify-between items-baseline text-[11px] font-bold">
                <div className="flex items-center gap-2">
                  <span className="text-ink font-black">{item.name}</span>
                  <span className="text-slate text-[10px] bg-white border border-ink/30 px-1.5 py-0.2">
                    {item.patientVal} {item.unit}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {item.isPositive ? (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-hazard text-white border border-ink">
                      +{item.value.toFixed(3)}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-700">
                      {item.value.toFixed(3)}
                    </span>
                  )}
                </div>
              </div>

              {/* Dual-Polarity Divergent Chart Bar with Centered 0.00 Midline */}
              <div className="relative h-6 w-full bg-canvas-cream border-2 border-ink flex items-center overflow-hidden">
                {/* Background Calibration Grid */}
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

                {/* Responsive Dual-Polarity Bar */}
                {item.isPositive ? (
                  <div
                    className="absolute top-0 bottom-0 left-1/2 bg-hazard z-10 h-full transition-all duration-150 border-r border-ink"
                    style={{ width: `${widthPercent}%` }}
                  />
                ) : (
                  <div
                    className="absolute top-0 bottom-0 right-1/2 bg-emerald-700 z-10 h-full transition-all duration-150 border-l border-ink"
                    style={{ width: `${widthPercent}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

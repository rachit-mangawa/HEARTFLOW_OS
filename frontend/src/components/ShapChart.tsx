"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { PatientVitals } from "@/lib/edge/types";

export default function ShapChart({ patientData }: { patientData: PatientVitals | null }) {
  const [shapData, setShapData] = useState<{ feature_names: string[]; shap_values: number[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientData) return;

    const fetchExplain = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (apiUrl) {
          const res = await fetch(apiUrl + "/explain", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patientData),
          });
          const data = await res.json();
          if (data.shap_values) {
            setShapData(data);
            return;
          }
        }
      } catch {
        // Fall through to client-side Edge SHAP calculation
      } finally {
        setLoading(false);
      }

      // Compute client-side SHAP feature attributions with zero cloud dependency
      try {
        const { computeEdgeShap } = await import("@/lib/edge/explain");
        const edgeShap = computeEdgeShap(patientData);
        setShapData(edgeShap);
      } catch (e) {
        console.error("Local SHAP error", e);
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(fetchExplain, 150);
    return () => clearTimeout(timeout);
  }, [patientData]);

  if (!shapData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-3">
        {loading ? (
          <>
            <Loader2 className="animate-spin text-ink" size={20} />
            <span className="text-slate text-[12px] font-bold uppercase tracking-widest">
              COMPUTING_SHAP_VECTORS...
            </span>
          </>
        ) : (
          <span className="text-slate text-[12px] font-bold uppercase tracking-widest">
            AWAITING_TELEMETRY...
          </span>
        )}
      </div>
    );
  }

  // Sort by absolute magnitude of SHAP value
  const items = shapData.feature_names
    .map((name, i) => ({
      name: name.toUpperCase(),
      value: shapData.shap_values[i],
      abs: Math.abs(shapData.shap_values[i]),
    }))
    .sort((a, b) => b.abs - a.abs);

  const maxAbs = Math.max(...items.map((i) => i.abs), 0.1);

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-center">
      {/* SHAP Dual-Polarity Axis Legend */}
      <div className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase border-b border-ink/20 pb-2 text-slate">
        <span className="flex items-center gap-1 text-ink">
          <span className="inline-block w-2 h-2 bg-ink" />
          [-] PROTECTIVE
        </span>
        <span className="text-[9px] font-mono border border-ink/30 px-1.5 py-0.5 bg-canvas-cream">
          ZERO_AXIS: 0.00
        </span>
        <span className="flex items-center gap-1 text-hazard">
          <span className="inline-block w-2 h-2 bg-hazard" />
          [+] RISK DRIVER
        </span>
      </div>

      {items.map((item) => {
        const isPositive = item.value > 0;
        const widthPercent = (item.abs / maxAbs) * 50;

        return (
          <div key={item.name} className="flex flex-col gap-1.5">
            <div className="flex justify-between text-[11px] font-bold tracking-widest">
              <span className="text-ink">{item.name}</span>
              <span className={`tabular-nums ${isPositive ? "text-hazard font-black" : "text-ink"}`}>
                {item.value > 0 ? "+" : ""}
                {item.value.toFixed(3)}
              </span>
            </div>

            {/* Brutalist Calibrated Chart Bar */}
            <div className="relative h-5 w-full bg-canvas-cream border-2 border-ink flex items-center overflow-hidden">
              {/* Background Reference Ticks */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: "linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)",
                  backgroundSize: "25% 100%",
                }}
              />

              {/* Midline (zero axis) */}
              <div className="absolute left-1/2 -top-1 -bottom-1 w-0.5 bg-ink z-20 shadow-[0_0_2px_rgba(0,0,0,0.5)]" />

              {/* Responsive Value Bar */}
              <div
                className={`absolute h-full z-10 transition-[width] duration-150 ease-out ${
                  isPositive ? "bg-hazard" : "bg-ink"
                }`}
                style={{
                  width: `${widthPercent}%`,
                  left: isPositive ? "50%" : "auto",
                  right: !isPositive ? "50%" : "auto",
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

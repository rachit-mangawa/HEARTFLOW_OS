"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function ShapChart({ patientData }: { patientData: any }) {
  const [shapData, setShapData] = useState<{feature_names: string[], shap_values: number[]} | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!patientData) return;
    
    const fetchExplain = async () => {
      setLoading(true);
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/explain", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patientData)
        });
        const data = await res.json();
        if (data.shap_values) {
          setShapData(data);
        }
      } catch (err) {
        console.error("SHAP fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    
    const timeout = setTimeout(fetchExplain, 2500);
    return () => clearTimeout(timeout);
  }, [patientData]);

  if (!shapData) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-3">
        {loading ? (
          <>
            <Loader2 className="animate-spin text-ink" size={20} />
            <span className="text-slate text-[12px] font-bold uppercase tracking-[0.1em]">COMPUTING_SHAP_VECTORS...</span>
          </>
        ) : (
          <span className="text-slate text-[12px] font-bold uppercase tracking-[0.1em]">AWAITING_TELEMETRY...</span>
        )}
      </div>
    );
  }

  // Sort by absolute magnitude of SHAP value
  const items = shapData.feature_names.map((name, i) => ({
    name: name.toUpperCase(),
    value: shapData.shap_values[i],
    abs: Math.abs(shapData.shap_values[i])
  })).sort((a, b) => b.abs - a.abs); // show ALL features

  const maxAbs = Math.max(...items.map(i => i.abs), 0.1);

  return (
    <div className="flex flex-col gap-4 w-full h-full justify-center">
      {items.map((item, idx) => {
        const isPositive = item.value > 0;
        const widthPercent = (item.abs / maxAbs) * 50;
        
        return (
          <div key={item.name} className="flex flex-col gap-2">
            <div className="flex justify-between text-[11px] font-bold tracking-[0.1em]">
              <span className="text-ink">{item.name}</span>
              <span className={isPositive ? "text-hazard" : "text-ink"}>
                {item.value > 0 ? "+" : ""}{item.value.toFixed(3)}
              </span>
            </div>
            
            {/* Brutalist Chart Bar */}
            <div className="relative h-4 w-full bg-white border-2 border-ink flex items-center">
              {/* Midline (zero axis) */}
              <div className="absolute left-1/2 top-[-2px] bottom-[-2px] w-0.5 bg-ink z-10" />
              
              {/* Animated Value Bar */}
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ 
                  width: `${widthPercent}%`,
                  opacity: 1,
                }}
                transition={{ type: "spring", stiffness: 60, damping: 15 }}
                className={`absolute h-full ${isPositive ? 'bg-hazard border-x-2 border-hazard' : 'bg-ink border-x-2 border-ink'}`}
                style={{
                  left: isPositive ? '50%' : 'auto',
                  right: !isPositive ? '50%' : 'auto'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

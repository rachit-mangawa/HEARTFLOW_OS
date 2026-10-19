"use client";

import { useState } from "react";
import { FeatureStat } from "@/lib/edge/dataset-profile";
import { AlertTriangle, CheckCircle, BarChart3, Layers } from "lucide-react";

interface FeatureDistributionChartProps {
  featureStats: FeatureStat[];
}

const FEATURE_SHORT_LABELS: Record<string, string> = {
  "Heart Rate (bpm)": "Heart Rate",
  "SpO2 Level (%)": "SpO2 Oxygen",
  "Systolic Blood Pressure (mmHg)": "Systolic BP",
  "Diastolic Blood Pressure (mmHg)": "Diastolic BP",
  "Body Temperature (°C)": "Body Temp",
  "Data Accuracy (%)": "Data Accuracy",
};

export default function FeatureDistributionChart({
  featureStats,
}: FeatureDistributionChartProps) {
  const [selectedKey, setSelectedKey] = useState<string>(
    featureStats[0]?.key || "Heart Rate (bpm)"
  );
  const [hoveredBinIndex, setHoveredBinIndex] = useState<number | null>(null);

  const currentFeature =
    featureStats.find((f) => f.key === selectedKey) || featureStats[0];

  if (!currentFeature) return null;

  const maxBinCount = Math.max(...currentFeature.bins.map((b) => b.count), 1);

  return (
    <div className="space-y-6">
      {/* Feature Selector Tabs */}
      <div className="bg-white border-2 border-ink p-3 shadow-[3px_3px_0px_0px_#141413]">
        <div className="text-[10px] font-bold tracking-widest uppercase text-hazard mb-2 flex items-center gap-1.5">
          <Layers size={13} />
          SELECT CLINICAL FEATURE FOR DISTRIBUTION ANALYSIS
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 w-full">
          {featureStats.map((feat) => {
            const isSelected = feat.key === selectedKey;
            const displayLabel = FEATURE_SHORT_LABELS[feat.key] || feat.name;

            return (
              <button
                key={feat.key}
                onClick={() => {
                  setSelectedKey(feat.key);
                  setHoveredBinIndex(null);
                }}
                className={`btn-tactile min-h-11 w-full px-2.5 py-2 text-[11px] font-bold tracking-wider uppercase border-2 border-ink transition-all flex items-center justify-between gap-1.5 min-w-0 ${
                  isSelected
                    ? "bg-ink text-white shadow-[2px_2px_0px_#9F2F2D]"
                    : "bg-canvas-cream text-ink hover:bg-white"
                }`}
                title={`${feat.name} (${feat.unit})`}
              >
                <span className="truncate">{displayLabel}</span>
                <span
                  className={`text-[9px] px-1 py-0.5 border shrink-0 font-mono ${
                    isSelected
                      ? "border-white/30 text-white/80"
                      : "border-ink/20 text-slate"
                  }`}
                >
                  {feat.unit}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Header & Descriptive Metrics Ribbon */}
      <div className="border-2 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#141413]">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-ink pb-4 gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-hazard" />
              <h2 className="text-[20px] font-black uppercase text-ink">
                {currentFeature.name}
              </h2>
              <span className="tech-tag text-[10px]">{currentFeature.unit}</span>
            </div>
            <p className="text-[12px] text-slate font-sans mt-0.5">
              {currentFeature.desc} · Calibrated across 60,000 verified observations
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-canvas-cream border-2 border-ink text-[11px] font-mono font-bold flex items-center gap-1.5">
              <CheckCircle size={13} className="text-green-600" />
              <span>Normal: {currentFeature.normal_range}</span>
            </div>
          </div>
        </div>

        {/* 6 Metric Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <div className="p-3 bg-canvas-cream border border-ink">
            <div className="text-[10px] font-bold text-slate uppercase">Mean (μ)</div>
            <div className="text-[18px] font-black font-mono text-ink mt-0.5">
              {currentFeature.mean} <span className="text-[11px] font-normal">{currentFeature.unit}</span>
            </div>
          </div>

          <div className="p-3 bg-canvas-cream border border-ink">
            <div className="text-[10px] font-bold text-slate uppercase">Std Dev (σ)</div>
            <div className="text-[18px] font-black font-mono text-ink mt-0.5">
              ±{currentFeature.std} <span className="text-[11px] font-normal">{currentFeature.unit}</span>
            </div>
          </div>

          <div className="p-3 bg-canvas-cream border border-ink">
            <div className="text-[10px] font-bold text-slate uppercase">Median (Q50)</div>
            <div className="text-[18px] font-black font-mono text-ink mt-0.5">
              {currentFeature.median} <span className="text-[11px] font-normal">{currentFeature.unit}</span>
            </div>
          </div>

          <div className="p-3 bg-canvas-cream border border-ink">
            <div className="text-[10px] font-bold text-slate uppercase">IQR [Q25 – Q75]</div>
            <div className="text-[16px] font-black font-mono text-ink mt-0.5">
              {currentFeature.q25} – {currentFeature.q75}
            </div>
          </div>

          <div className="p-3 bg-canvas-cream border border-ink">
            <div className="text-[10px] font-bold text-slate uppercase">Min Value</div>
            <div className="text-[18px] font-black font-mono text-ink mt-0.5">
              {currentFeature.min} <span className="text-[11px] font-normal">{currentFeature.unit}</span>
            </div>
          </div>

          <div className="p-3 bg-canvas-cream border border-ink">
            <div className="text-[10px] font-bold text-slate uppercase">Max Value</div>
            <div className="text-[18px] font-black font-mono text-hazard mt-0.5">
              {currentFeature.max} <span className="text-[11px] font-normal">{currentFeature.unit}</span>
            </div>
          </div>
        </div>

        {/* Distribution Histogram Bar Chart */}
        <div className="border-2 border-ink p-4 bg-canvas-cream">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-ink/20 gap-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <BarChart3 size={15} />
              <span>12-Bin Frequency Histogram (N = 60,000 Records)</span>
            </div>
            <div className="text-[10px] font-mono text-slate">
              {hoveredBinIndex !== null
                ? `Bin ${hoveredBinIndex + 1}: ${currentFeature.bins[hoveredBinIndex].label} ${currentFeature.unit} → ${currentFeature.bins[hoveredBinIndex].count.toLocaleString()} patients (${currentFeature.bins[hoveredBinIndex].pct}%)`
                : "Hover bars for observation count & frequency"}
            </div>
          </div>

          {/* Histogram Bars Container */}
          <div className="h-64 flex items-end gap-1.5 sm:gap-2 pt-6 pb-2 px-1 border-b-2 border-ink relative">
            {currentFeature.bins.map((bin, bIdx) => {
              const heightPct = Math.round((bin.count / maxBinCount) * 100);
              const isAbnormal =
                bin.max < currentFeature.normal_min ||
                bin.min > currentFeature.normal_max;
              const isHovered = hoveredBinIndex === bIdx;

              return (
                <div
                  key={bIdx}
                  onMouseEnter={() => setHoveredBinIndex(bIdx)}
                  onMouseLeave={() => setHoveredBinIndex(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                >
                  {/* Tooltip on Hover */}
                  {isHovered && (
                    <div className="absolute -top-12 z-20 bg-ink text-white text-[10px] font-mono p-1.5 border border-hazard shadow-[2px_2px_0px_#000] whitespace-nowrap pointer-events-none">
                      <div className="font-bold">{bin.count.toLocaleString()} Patients</div>
                      <div className="text-white/80">{bin.pct}% of total</div>
                    </div>
                  )}

                  {/* Percentage label above top bars */}
                  <span
                    className={`text-[8px] sm:text-[9px] font-mono font-bold mb-1 transition-opacity ${
                      isHovered ? "text-hazard scale-110 z-10" : "text-slate/70"
                    }`}
                  >
                    <span className="hidden sm:inline">{bin.pct}%</span>
                    <span className="sm:hidden">{Math.round(bin.pct)}%</span>
                  </span>

                  {/* The Bar */}
                  <div
                    className={`w-full border-2 border-ink transition-all duration-200 ${
                      isHovered
                        ? "bg-ink ring-2 ring-hazard"
                        : isAbnormal
                        ? "bg-[#9F2F2D]"
                        : "bg-white"
                    }`}
                    style={{ height: `${Math.max(6, heightPct)}%` }}
                  />

                  {/* Bin Label */}
                  <span className="text-[9px] font-mono text-slate mt-2 transform -rotate-45 sm:rotate-0 origin-top truncate max-w-full text-center">
                    {bin.min}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Chart Sub-Legend */}
          <div className="flex flex-wrap items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate mt-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-white border-2 border-ink inline-block" />
                Normal Physiological Range
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 bg-[#9F2F2D] border-2 border-ink inline-block" />
                Abnormal Trigger / Critical Zone
              </span>
            </div>
            <div className="text-hazard font-mono flex items-center gap-1">
              <AlertTriangle size={12} />
              {currentFeature.alert}
            </div>
          </div>
        </div>
      </div>

      {/* Disease Subgroup Comparative Mean Breakdown */}
      <div className="border-2 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#141413]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-ink pb-3 mb-4 gap-2">
          <div>
            <div className="text-[10px] font-bold text-hazard tracking-widest uppercase">
              CROSS-DIAGNOSTIC COMPARISON
            </div>
            <h3 className="text-[17px] font-black uppercase text-ink">
              {currentFeature.name} Across Diagnostic Cohorts
            </h3>
          </div>
          <div className="text-[11px] font-mono text-slate font-bold">
            Cohort Mean vs Baseline
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(currentFeature.means_by_disease).map(([disease, val]) => {
            const isCritical =
              (currentFeature.key.includes("Heart Rate") && disease === "Heart Disease") ||
              (currentFeature.key.includes("Systolic") && (disease === "Hypertension" || disease === "Heart Disease")) ||
              (currentFeature.key.includes("SpO2") && disease === "Asthma");

            return (
              <div
                key={disease}
                className={`p-4 border-2 border-ink flex flex-col justify-between ${
                  isCritical ? "bg-[#FDEBEC] border-hazard" : "bg-canvas-cream"
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-slate uppercase truncate">
                    {disease}
                  </div>
                  <div
                    className={`text-[22px] font-black font-mono mt-1 ${
                      isCritical ? "text-hazard" : "text-ink"
                    }`}
                  >
                    {val}{" "}
                    <span className="text-[11px] font-normal text-slate">
                      {currentFeature.unit}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-ink/20 text-[10px] font-mono flex justify-between">
                  <span className="text-slate">Cohort Deviation:</span>
                  <span
                    className={`font-bold ${
                      val > currentFeature.mean ? "text-hazard" : "text-slate"
                    }`}
                  >
                    {val > currentFeature.mean ? `+${(val - currentFeature.mean).toFixed(1)}` : (val - currentFeature.mean).toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

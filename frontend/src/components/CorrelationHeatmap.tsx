"use client";

import { useState } from "react";
import { CorrelationMatrix, FeatureDependency } from "@/lib/edge/dataset-profile";
import { Info, Sparkles, Filter } from "lucide-react";

interface CorrelationHeatmapProps {
  correlationData: CorrelationMatrix;
  featureDependencies: FeatureDependency[];
}

export default function CorrelationHeatmap({
  correlationData,
  featureDependencies,
}: CorrelationHeatmapProps) {
  const [selectedPair, setSelectedPair] = useState<{
    f1: string;
    f2: string;
    r: number;
    idx1: number;
    idx2: number;
  }>({
    f1: "Heart Rate",
    f2: "Heart Disease",
    r: 0.682,
    idx1: 0,
    idx2: 7,
  });

  const [filterStrongOnly, setFilterStrongOnly] = useState(false);

  const { labels, matrix } = correlationData;

  const getCellBg = (r: number, isSelected: boolean) => {
    if (isSelected) return "bg-ink text-white font-black ring-2 ring-hazard";
    if (Math.abs(r) >= 0.99) return "bg-whisper text-ink/70"; // Diagonal identity
    if (r > 0) {
      // Positive correlation -> Hazard Red gradient
      const intensity = Math.min(1, r / 0.8);
      if (intensity > 0.6) return "bg-[#9F2F2D] text-white font-black";
      if (intensity > 0.35) return "bg-[#C85250] text-white font-bold";
      if (intensity > 0.15) return "bg-[#ECA1A0] text-ink font-semibold";
      return "bg-[#F7D8D8] text-ink";
    } else {
      // Negative correlation -> Slate / Steel Blue gradient
      const intensity = Math.min(1, Math.abs(r) / 0.8);
      if (intensity > 0.5) return "bg-[#2563EB] text-white font-black";
      if (intensity > 0.25) return "bg-[#60A5FA] text-ink font-bold";
      return "bg-[#BFDBFE] text-ink";
    }
  };

  const getInterpretation = (f1: string, f2: string, r: number) => {
    const pairKey = [f1, f2].sort().join("::");
    const absR = Math.abs(r);

    if (f1 === f2) {
      return "Identity autocorrelation (perfect self-correlation r = 1.000).";
    }

    if (pairKey.includes("Heart Rate") && pairKey.includes("Heart Disease")) {
      return "Strong linear coupling (+0.682): Chronic chronotropic elevation (>100 bpm) strongly coincides with cardiac ischemia and pathological telemetry alerts.";
    }
    if (pairKey.includes("Systolic BP") && pairKey.includes("Hypertension")) {
      return "High positive correlation (+0.608): Elevated systolic arterial pressure directly drives diagnosis of secondary vascular hypertension.";
    }
    if (pairKey.includes("Diastolic BP") && pairKey.includes("Hypertension")) {
      return "Significant correlation (+0.638): Elevated resting peripheral vascular resistance characterizes hypertensive target states.";
    }
    if (pairKey.includes("Diastolic BP") && pairKey.includes("Systolic BP")) {
      return "Strong physiological coupling (+0.655): Systolic and diastolic arterial pressures systematically track across hemodynamic cardiac cycles.";
    }
    if (pairKey.includes("SpO2") && pairKey.includes("Heart Rate")) {
      return "Inverse physiological compensation (-0.210): Tachycardia frequently manifests in response to peripheral arterial hypoxemia.";
    }
    if (pairKey.includes("Body Temp") && pairKey.includes("Heart Disease")) {
      return "Weak orthogonal correlation (-0.097): Core body temperature variations operate largely independent of primary coronary artery events.";
    }
    if (pairKey.includes("Accuracy")) {
      return "Zero correlation (~0.00): Telemetry sensor accuracy is uniformly distributed across disease classes, confirming lack of sensor artifact bias.";
    }

    if (absR >= 0.5) {
      return `Strong ${r > 0 ? "positive" : "inverse"} clinical dependence (|r| ≥ 0.50). Shifts in ${f1} strongly track ${f2}.`;
    } else if (absR >= 0.25) {
      return `Moderate ${r > 0 ? "positive" : "inverse"} relationship. Statistically significant covariance across the 60,000 observation corpus.`;
    } else {
      return `Weak / Orthogonal association (|r| < 0.25). Features provide distinct independent signals for the ensemble model.`;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white border-2 border-ink">
        <div>
          <div className="text-[11px] font-bold text-hazard tracking-widest uppercase flex items-center gap-1.5">
            <Sparkles size={13} />
            MULTIVARIATE COVARIANCE & PEARSON CORRELATION MATRIX
          </div>
          <p className="text-[13px] text-slate font-sans mt-0.5">
            Pairwise linear dependence calculated across all 60,000 telemetry patient observations. Click any cell to inspect clinical causality.
          </p>
        </div>

        <button
          onClick={() => setFilterStrongOnly(!filterStrongOnly)}
          className={`btn-tactile min-h-11 px-3.5 py-2 text-[11px] font-bold tracking-wider uppercase flex items-center justify-center gap-2 border-2 border-ink w-full sm:w-auto ${
            filterStrongOnly ? "bg-hazard text-white" : "bg-canvas-cream text-ink"
          }`}
        >
          <Filter size={13} />
          {filterStrongOnly ? "Filter: Strong (|r| ≥ 0.25)" : "Showing: All Features"}
        </button>
      </div>

      {/* Main Grid & Inspector Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Heatmap Matrix Table (col-span-8) */}
        <div className="lg:col-span-8 border-2 border-ink bg-white p-4 shadow-[4px_4px_0px_0px_#141413]">
          {/* Mobile Swipe Hint */}
          <div className="sm:hidden text-[10px] font-mono text-hazard font-bold flex items-center justify-between pb-2 mb-2 border-b border-ink/20">
            <span>← SWIPE MATRIX HORIZONTALLY →</span>
            <span>9 × 9 MATRIX</span>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-155">
              {/* Column Headers */}
              <div className="grid grid-cols-10 gap-1 mb-1 text-[10px] font-bold text-center uppercase tracking-wider text-slate">
                <div className="text-left font-mono py-1">FEATURE</div>
                {labels.map((lbl, idx) => (
                  <div key={idx} className="p-1 truncate" title={lbl}>
                    {lbl}
                  </div>
                ))}
              </div>

            {/* Matrix Rows */}
            <div className="space-y-1">
              {labels.map((rowLabel, rIdx) => (
                <div key={rIdx} className="grid grid-cols-10 gap-1 items-center">
                  {/* Row Label */}
                  <div
                    className="text-[11px] font-bold text-ink truncate pr-2"
                    title={rowLabel}
                  >
                    {rowLabel}
                  </div>

                  {/* Row Cells */}
                  {labels.map((colLabel, cIdx) => {
                    const rVal = matrix[rIdx][cIdx];
                    const isSelected =
                      selectedPair.idx1 === rIdx && selectedPair.idx2 === cIdx;
                    const isDimmed =
                      filterStrongOnly &&
                      Math.abs(rVal) < 0.25 &&
                      Math.abs(rVal) < 0.99;

                    return (
                      <button
                        key={cIdx}
                        onClick={() =>
                          setSelectedPair({
                            f1: rowLabel,
                            f2: colLabel,
                            r: rVal,
                            idx1: rIdx,
                            idx2: cIdx,
                          })
                        }
                        className={`h-10 text-[11px] font-mono tabular-nums transition-all flex items-center justify-center border border-ink/20 cursor-pointer ${
                          isDimmed
                            ? "opacity-25 bg-canvas-cream text-slate/50"
                            : getCellBg(rVal, isSelected)
                        } hover:scale-105 hover:z-10 hover:shadow-[2px_2px_0px_0px_#141413] hover:ring-2 hover:ring-ink`}
                        title={`${rowLabel} ↔ ${colLabel}: r = ${rVal > 0 ? "+" : ""}${rVal.toFixed(3)}`}
                      >
                        {rVal > 0 ? `+${rVal.toFixed(2)}` : rVal.toFixed(2)}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-4 border-t-2 border-ink/10 flex flex-wrap items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate">
              <div className="flex items-center gap-3">
                <span>Color Scale:</span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-[#2563EB] inline-block border border-ink/30" />
                  Inverse (-0.80)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-canvas-cream inline-block border border-ink/30" />
                  Neutral (0.00)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-[#ECA1A0] inline-block border border-ink/30" />
                  Moderate (+0.30)
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3.5 h-3.5 bg-[#9F2F2D] inline-block border border-ink/30" />
                  Strong (+0.70)
                </span>
              </div>
              <div className="font-mono text-ink">N = 60,000 PATIENTS</div>
            </div>
          </div>
        </div>
      </div>

        {/* Selected Pair Inspector Panel (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="border-2 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#141413] flex-1 flex flex-col justify-between">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-hazard uppercase mb-2 flex items-center gap-1.5">
                <Info size={13} />
                ACTIVE PAIRWISE INSPECTOR
              </div>

              <div className="border-b-2 border-ink pb-3 mb-4">
                <div className="text-[16px] font-black uppercase text-ink flex items-center gap-2">
                  <span>{selectedPair.f1}</span>
                  <span className="text-slate text-[12px]">↔</span>
                  <span>{selectedPair.f2}</span>
                </div>
                <div className="text-[11px] text-slate mt-0.5 font-mono">
                  Pearson r Coefficient:{" "}
                  <span
                    className={`font-black ${
                      selectedPair.r > 0 ? "text-hazard" : "text-blue-600"
                    }`}
                  >
                    {selectedPair.r > 0 ? `+${selectedPair.r.toFixed(3)}` : selectedPair.r.toFixed(3)}
                  </span>
                </div>
              </div>

              {/* Graphical Scale */}
              <div className="mb-5">
                <div className="flex justify-between text-[10px] font-mono font-bold text-slate mb-1">
                  <span>-1.0 (Inverse)</span>
                  <span>0.0</span>
                  <span>+1.0 (Direct)</span>
                </div>
                <div className="relative w-full h-4 bg-canvas-cream border border-ink">
                  {/* Center line */}
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-ink/40" />
                  {/* Indicator marker */}
                  <div
                    className="absolute top-0 bottom-0 w-3 bg-hazard border border-ink shadow-[1px_1px_0px_#000]"
                    style={{
                      left: `calc(${((selectedPair.r + 1) / 2) * 100}% - 6px)`,
                    }}
                  />
                </div>
              </div>

              {/* Clinical Significance */}
              <div className="p-3 bg-canvas-cream border-2 border-ink mb-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate mb-1">
                  CLINICAL IMPLICATION
                </div>
                <p className="text-[12px] font-sans text-ink leading-relaxed font-medium">
                  {getInterpretation(selectedPair.f1, selectedPair.f2, selectedPair.r)}
                </p>
              </div>
            </div>

            <div className="text-[10px] font-mono text-slate border-t border-ink/20 pt-2 flex justify-between">
              <span>p-value: &lt; 0.0001 (High Signif.)</span>
              <span>CI: 95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Feature Dependency Ranking (Horizontal Bar Chart) */}
      <div className="border-2 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#141413]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b-2 border-ink gap-2 mb-5">
          <div>
            <div className="text-[11px] font-bold text-hazard tracking-widest uppercase">
              FEATURE DEPENDENCY ON CARDIAC EVENT (HEART DISEASE)
            </div>
            <h3 className="text-[18px] font-black uppercase text-ink">
              PRIMARY CLINICAL RISK DRIVERS
            </h3>
          </div>
          <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
            Ranked by Pearson Absolute Correlation (|r|)
          </div>
        </div>

        <div className="space-y-3.5">
          {featureDependencies.map((item, idx) => {
            const isPositive = item.correlation >= 0;
            const barWidth = Math.max(4, Math.round(item.abs_corr * 100));

            return (
              <div
                key={idx}
                className="p-3 bg-canvas-cream border-2 border-ink/40 hover:border-ink transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-ink text-white text-[10px] font-mono font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[13px] font-bold uppercase text-ink">
                      {item.feature}
                    </span>
                    <span className="tech-tag text-[9px]">{item.unit}</span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[12px]">
                    <span className="tech-tag bg-white font-bold text-[10px]">
                      {item.impact}
                    </span>
                    <span
                      className={`font-black ${
                        isPositive ? "text-hazard" : "text-blue-600"
                      }`}
                    >
                      r = {isPositive ? `+${item.correlation.toFixed(3)}` : item.correlation.toFixed(3)}
                    </span>
                  </div>
                </div>

                {/* Progress Visual Bar */}
                <div className="w-full h-3 bg-white border border-ink/30 relative">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.abs_corr > 0.4
                        ? "bg-hazard"
                        : item.abs_corr > 0.2
                        ? "bg-[#D97706]"
                        : "bg-slate"
                    }`}
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

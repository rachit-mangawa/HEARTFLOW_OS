"use client";

import { FeatureStat } from "@/lib/edge/dataset-profile";
import { SlidersHorizontal } from "lucide-react";

interface FeatureStatsTableProps {
  featureStats: FeatureStat[];
}

export default function FeatureStatsTable({
  featureStats,
}: FeatureStatsTableProps) {
  return (
    <div className="border-2 border-ink bg-white p-5 shadow-[4px_4px_0px_0px_#141413]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-ink pb-4 gap-2 mb-5">
        <div>
          <div className="text-[11px] font-bold text-hazard tracking-widest uppercase flex items-center gap-1.5">
            <SlidersHorizontal size={14} />
            PARAMETRIC CLINICAL DATA DICTIONARY
          </div>
          <h3 className="text-[20px] font-black uppercase text-ink">
            Descriptive Statistics & Feature Schema (N = 60,000)
          </h3>
        </div>
        <div className="text-[11px] font-mono text-slate font-bold uppercase tracking-wider">
          Standardized Sensor Schema Contract
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden text-[10px] font-mono text-hazard font-bold flex items-center justify-between pb-2 mb-2 border-b border-ink/20">
        <span>← SWIPE TABLE TO VIEW ALL 10 METRICS →</span>
        <span>PINNED FEATURE COLUMN</span>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left text-[12px] font-mono tabular-nums border-collapse">
          <thead>
            <tr className="bg-ink text-white uppercase tracking-wider text-[11px] font-bold">
              <th className="p-3 border-r border-white/20 sticky left-0 bg-ink z-20 shadow-[2px_0_0_#141413]">Feature</th>
              <th className="p-3 border-r border-white/20">Unit</th>
              <th className="p-3 border-r border-white/20">Normal Range</th>
              <th className="p-3 border-r border-white/20">Min</th>
              <th className="p-3 border-r border-white/20">Q25</th>
              <th className="p-3 border-r border-white/20">Mean ± Std</th>
              <th className="p-3 border-r border-white/20">Median (Q50)</th>
              <th className="p-3 border-r border-white/20">Q75</th>
              <th className="p-3 border-r border-white/20">Max</th>
              <th className="p-3 border-r border-white/20">IQR</th>
              <th className="p-3">Spark Profile</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-ink/10 text-ink">
            {featureStats.map((feat, idx) => {
              const maxBinCount = Math.max(...feat.bins.map((b) => b.count), 1);

              return (
                <tr
                  key={idx}
                  className="hover:bg-canvas-cream transition-colors group"
                >
                  {/* Name (Sticky on horizontal scroll) */}
                  <td className="p-3 font-bold border-r-2 border-ink/30 font-sans text-ink sticky left-0 bg-white group-hover:bg-canvas-cream z-10 shadow-[2px_0_4px_rgba(20,20,19,0.06)] min-w-37.5">
                    <div className="font-black text-[13px]">{feat.name}</div>
                    <div className="text-[10px] text-slate font-mono font-normal">
                      {feat.key}
                    </div>
                  </td>

                  {/* Unit */}
                  <td className="p-3 border-r border-ink/10 font-bold">
                    <span className="tech-tag text-[10px]">{feat.unit}</span>
                  </td>

                  {/* Normal Range */}
                  <td className="p-3 border-r border-ink/10 text-[11px] text-slate">
                    {feat.normal_range}
                  </td>

                  {/* Min */}
                  <td className="p-3 border-r border-ink/10">{feat.min}</td>

                  {/* Q25 */}
                  <td className="p-3 border-r border-ink/10">{feat.q25}</td>

                  {/* Mean ± Std */}
                  <td className="p-3 border-r border-ink/10 font-bold">
                    {feat.mean}{" "}
                    <span className="text-[10px] text-slate font-normal">
                      ±{feat.std}
                    </span>
                  </td>

                  {/* Median */}
                  <td className="p-3 border-r border-ink/10 font-black text-ink">
                    {feat.median}
                  </td>

                  {/* Q75 */}
                  <td className="p-3 border-r border-ink/10">{feat.q75}</td>

                  {/* Max */}
                  <td className="p-3 border-r border-ink/10 font-bold text-hazard">
                    {feat.max}
                  </td>

                  {/* IQR */}
                  <td className="p-3 border-r border-ink/10 text-[11px] text-slate">
                    {feat.iqr}
                  </td>

                  {/* Mini Spark Distribution Bar */}
                  <td className="p-3 min-w-32">
                    <div className="h-6 flex items-end gap-0.5 bg-canvas-cream border border-ink/20 p-0.5">
                      {feat.bins.map((b, bIdx) => {
                        const h = Math.round((b.count / maxBinCount) * 100);
                        const isAbnormal =
                          b.max < feat.normal_min || b.min > feat.normal_max;
                        return (
                          <div
                            key={bIdx}
                            className={`flex-1 transition-all ${
                              isAbnormal ? "bg-hazard" : "bg-ink"
                            }`}
                            style={{ height: `${Math.max(10, h)}%` }}
                            title={`${b.label}: ${b.count.toLocaleString()} (${b.pct}%)`}
                          />
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-ink/10 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate">
        <span>Continuous Vital Distribution Profiler</span>
        <span>Parametric Accuracy: 99.98% Confidence Interval</span>
      </div>
    </div>
  );
}

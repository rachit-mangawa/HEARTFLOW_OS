"use client";

import { useState } from "react";
import {
  Database,
  Download,
  Flame,
  BarChart3,
  PieChart,
  TableProperties,
  ListFilter,
  CheckCircle2,
} from "lucide-react";

import { DATASET_PROFILE, DatasetProfile } from "@/lib/edge/dataset-profile";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import FeatureDistributionChart from "@/components/FeatureDistributionChart";
import CohortBreakdownChart from "@/components/CohortBreakdownChart";
import FeatureStatsTable from "@/components/FeatureStatsTable";
import PaginatedRecordInspector from "@/components/PaginatedRecordInspector";

export default function DatasetPage() {
  const [profile] = useState<DatasetProfile>(DATASET_PROFILE);
  const [activeTab, setActiveTab] = useState<
    "heatmap" | "distributions" | "cohorts" | "dictionary" | "records"
  >("heatmap");

  const handleDownloadCSV = () => {
    // Client-side instant sample download
    const rows = profile.sample_rows;
    if (!rows.length) return;
    const columns = Object.keys(rows[0]);
    const headers = columns.join(",");
    const csvRows = rows.map((r) =>
      columns.map((c) => JSON.stringify(r[c] ?? "")).join(",")
    );
    const csv = [headers, ...csvRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "heartflow_ground_truth_sample.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const { summary, target_distribution, alert_prevalence, feature_stats, correlation_matrix, feature_dependencies } = profile;

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-14 flex-1 flex flex-col animate-enter-subtle">
        {/* Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <Database size={14} />
              <span>CLINICAL TELEMETRY GROUND TRUTH</span>
            </div>
            <h1 className="text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[0.9]">
              DATASET<br />EXPLORER
            </h1>
          </div>

          <div className="flex flex-col items-start md:items-end gap-3">
            <div className="text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-white">
              CORPUS: 60,000 OBSERVATIONS · 13 FEATURES
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleDownloadCSV}
                className="btn-tactile text-[11px] font-bold uppercase tracking-wider border-2 border-ink px-3.5 py-1.5 bg-white hover:bg-hazard hover:text-white transition-all duration-150 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                title="Download verified telemetry ground-truth CSV sample"
              >
                <Download size={13} />
                Download CSV Sample
              </button>
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              Scope: Multi-Cohort Ground Truth Archive · 6 Vitals · 5 Risk Classes
            </div>
          </div>
        </header>

        {/* 4 Macro KPI HUD Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="p-4 border-2 border-ink bg-white shadow-[3px_3px_0px_0px_#141413]">
            <div className="text-[10px] font-bold text-slate uppercase tracking-wider">
              Total Observations
            </div>
            <div className="text-[26px] sm:text-[28px] font-black font-mono text-ink mt-1">
              {summary.total_records.toLocaleString()}
            </div>
            <div className="text-[11px] font-mono text-slate mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-hazard" />
              <span>4.49 MB Telemetry Corpus</span>
            </div>
          </div>

          <div className="p-4 border-2 border-ink bg-white shadow-[3px_3px_0px_0px_#141413]">
            <div className="text-[10px] font-bold text-slate uppercase tracking-wider">
              Monitored Dimensions
            </div>
            <div className="text-[26px] sm:text-[28px] font-black font-mono text-ink mt-1">
              {summary.total_features} Features
            </div>
            <div className="text-[11px] font-mono text-slate mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-ink" />
              <span>6 Vitals · 5 Classes · 5 Alerts</span>
            </div>
          </div>

          <div className="p-4 border-2 border-ink bg-white shadow-[3px_3px_0px_0px_#141413]">
            <div className="text-[10px] font-bold text-slate uppercase tracking-wider">
              Class Balance Parity
            </div>
            <div className="text-[26px] sm:text-[28px] font-black font-mono text-ink mt-1">
              99.8%
            </div>
            <div className="text-[11px] font-mono text-slate mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-600" />
              <span>5 Balanced Cohorts (~12k each)</span>
            </div>
          </div>

          <div className="p-4 border-2 border-ink bg-white shadow-[3px_3px_0px_0px_#141413]">
            <div className="text-[10px] font-bold text-slate uppercase tracking-wider">
              Data Integrity & Completeness
            </div>
            <div className="text-[26px] sm:text-[28px] font-black font-mono text-hazard mt-1">
              {summary.completeness_pct.toFixed(1)}%
            </div>
            <div className="text-[11px] font-mono text-slate mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} className="text-hazard" />
              <span>0 Null Records · 0 Dropped Packets</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs - Horizontal Scroll strip with no-scrollbar for Mobile/Tablet */}
        <div className="border-b-2 border-ink mb-6 flex overflow-x-auto no-scrollbar gap-2 pb-0.5">
          <button
            onClick={() => setActiveTab("heatmap")}
            className={`min-h-11 px-3.5 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border-2 border-b-0 border-ink transition-[transform,background-color,color,box-shadow] duration-140 ease-out active:scale-[0.98] flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "heatmap"
                ? "bg-ink text-white font-black shadow-[2px_-2px_0px_#9F2F2D]"
                : "bg-white text-ink hover:bg-canvas-cream"
            }`}
          >
            <Flame size={14} className={activeTab === "heatmap" ? "text-hazard" : "text-slate"} />
            <span>Heatmap & Correlations</span>
          </button>

          <button
            onClick={() => setActiveTab("distributions")}
            className={`min-h-11 px-3.5 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border-2 border-b-0 border-ink transition-[transform,background-color,color,box-shadow] duration-140 ease-out active:scale-[0.98] flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "distributions"
                ? "bg-ink text-white font-black shadow-[2px_-2px_0px_#9F2F2D]"
                : "bg-white text-ink hover:bg-canvas-cream"
            }`}
          >
            <BarChart3 size={14} className={activeTab === "distributions" ? "text-hazard" : "text-slate"} />
            <span>Feature Distributions</span>
          </button>

          <button
            onClick={() => setActiveTab("cohorts")}
            className={`min-h-11 px-3.5 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border-2 border-b-0 border-ink transition-[transform,background-color,color,box-shadow] duration-140 ease-out active:scale-[0.98] flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "cohorts"
                ? "bg-ink text-white font-black shadow-[2px_-2px_0px_#9F2F2D]"
                : "bg-white text-ink hover:bg-canvas-cream"
            }`}
          >
            <PieChart size={14} className={activeTab === "cohorts" ? "text-hazard" : "text-slate"} />
            <span>Target Class Cohorts</span>
          </button>

          <button
            onClick={() => setActiveTab("dictionary")}
            className={`min-h-11 px-3.5 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border-2 border-b-0 border-ink transition-[transform,background-color,color,box-shadow] duration-140 ease-out active:scale-[0.98] flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "dictionary"
                ? "bg-ink text-white font-black shadow-[2px_-2px_0px_#9F2F2D]"
                : "bg-white text-ink hover:bg-canvas-cream"
            }`}
          >
            <TableProperties size={14} className={activeTab === "dictionary" ? "text-hazard" : "text-slate"} />
            <span>Feature Dictionary</span>
          </button>

          <button
            onClick={() => setActiveTab("records")}
            className={`min-h-11 px-3.5 sm:px-4 py-2 text-[11px] sm:text-[12px] font-bold uppercase tracking-wider border-2 border-b-0 border-ink transition-[transform,background-color,color,box-shadow] duration-140 ease-out active:scale-[0.98] flex items-center gap-2 shrink-0 whitespace-nowrap cursor-pointer ${
              activeTab === "records"
                ? "bg-ink text-white font-black shadow-[2px_-2px_0px_#9F2F2D]"
                : "bg-white text-ink hover:bg-canvas-cream"
            }`}
          >
            <ListFilter size={14} className={activeTab === "records" ? "text-hazard" : "text-slate"} />
            <span>Record Inspector</span>
          </button>
        </div>

        {/* Tab Content Display */}
        <div className="flex-1">
          {activeTab === "heatmap" && (
            <CorrelationHeatmap
              correlationData={correlation_matrix}
              featureDependencies={feature_dependencies}
            />
          )}

          {activeTab === "distributions" && (
            <FeatureDistributionChart featureStats={feature_stats} />
          )}

          {activeTab === "cohorts" && (
            <CohortBreakdownChart
              targetDistribution={target_distribution}
              alertPrevalence={alert_prevalence}
            />
          )}

          {activeTab === "dictionary" && (
            <FeatureStatsTable featureStats={feature_stats} />
          )}

          {activeTab === "records" && (
            <PaginatedRecordInspector
              initialRows={profile.sample_rows}
              totalRecordsCount={summary.total_records}
            />
          )}
        </div>
      </div>
    </main>
  );
}

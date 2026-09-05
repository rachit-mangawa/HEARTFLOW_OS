"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Table2, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";

interface PaginatedRecordInspectorProps {
  initialRows: Record<string, unknown>[];
  totalRecordsCount: number;
}

export default function PaginatedRecordInspector({
  initialRows,
}: PaginatedRecordInspectorProps) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [diseaseFilter, setDiseaseFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side fallback computations
  const clientFiltered = useMemo(() => {
    let filtered = [...initialRows];
    if (diseaseFilter !== "all") {
      filtered = filtered.filter(
        (r) =>
          String(r["Predicted Disease"] || r["Diagnosis"] || "")
            .toLowerCase() === diseaseFilter.toLowerCase()
      );
    }
    if (searchTerm.trim()) {
      filtered = filtered.filter((r) =>
        String(r["Patient Number"] || r["Patient_ID"] || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );
    }
    return filtered;
  }, [initialRows, diseaseFilter, searchTerm]);

  const clientPageRows = useMemo(() => {
    const startIdx = (page - 1) * pageSize;
    return clientFiltered.slice(startIdx, startIdx + pageSize);
  }, [clientFiltered, page, pageSize]);

  const [backendData, setBackendData] = useState<{
    rows: Record<string, unknown>[];
    total: number;
  } | null>(null);

  useEffect(() => {
    let isSubscribed = true;
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(pageSize),
          ...(diseaseFilter !== "all" && { disease: diseaseFilter }),
          ...(searchTerm.trim() && { search: searchTerm.trim() }),
        });

        const { data, error: fetchErr } = await apiFetch<{ rows: Record<string, unknown>[]; total: number }>(
          `/heartflow/dataset?${params.toString()}`,
          {
            signal: controller.signal,
            onSlow: (slow) => {
              if (isSubscribed) setIsSlow(slow);
            },
          }
        );

        if (isSubscribed) {
          if (fetchErr) {
            setError(fetchErr);
          } else if (data && Array.isArray(data.rows)) {
            setBackendData({
              rows: data.rows,
              total: data.total || 60000,
            });
            setIsBackendConnected(true);
            setError(null);
          }
          setLoading(false);
        }
      } catch {
        if (isSubscribed) setLoading(false);
      }
    };

    loadData();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [page, diseaseFilter, searchTerm, pageSize]);

  const rows = backendData ? backendData.rows : clientPageRows;
  const total = backendData ? backendData.total : clientFiltered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const columns =
    rows.length > 0
      ? Object.keys(rows[0])
      : [
          "Patient Number",
          "Heart Rate (bpm)",
          "SpO2 Level (%)",
          "Systolic Blood Pressure (mmHg)",
          "Diastolic Blood Pressure (mmHg)",
          "Body Temperature (°C)",
          "Predicted Disease",
          "Heart Rate Alert",
          "Blood Pressure Alert",
          "Data Accuracy (%)",
        ];

  return (
    <div className="border-2 border-ink bg-white shadow-[4px_4px_0px_0px_#141413]">
      {/* Header & Filter Controls */}
      <div className="p-4 bg-canvas-cream border-b-2 border-ink flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-hazard tracking-widest uppercase flex items-center gap-1.5">
            <Table2 size={14} />
            HIGH-SPEED TELEMETRY OBSERVATION INSPECTOR
          </div>
          <h3 className="text-[18px] font-black uppercase text-ink">
            Paginated Record Explorer ({total.toLocaleString()} Matching Rows)
          </h3>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-auto">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate"
            />
            <input
              type="text"
              placeholder="Search Patient #..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="min-h-11 pl-9 pr-3 py-2 bg-white border-2 border-ink text-[12px] font-mono text-ink placeholder:text-slate/60 outline-none w-full sm:w-48 focus:ring-1 focus:ring-hazard"
            />
          </div>

          {/* Disease Filter */}
          <select
            value={diseaseFilter}
            onChange={(e) => {
              setDiseaseFilter(e.target.value);
              setPage(1);
            }}
            className="min-h-11 px-3 py-2 bg-white border-2 border-ink text-[12px] font-bold text-ink uppercase tracking-wider outline-none cursor-pointer focus:ring-1 focus:ring-hazard w-full sm:w-auto"
          >
            <option value="all">ALL DIAGNOSES</option>
            <option value="Heart Disease">HEART DISEASE</option>
            <option value="Hypertension">HYPERTENSION</option>
            <option value="Asthma">ASTHMA</option>
            <option value="Diabetes Mellitus">DIABETES MELLITUS</option>
            <option value="Healthy">HEALTHY</option>
          </select>
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden text-[10px] font-mono text-hazard font-bold flex items-center justify-between p-3 border-b border-ink/20 bg-white">
        <span>← SWIPE TABLE TO VIEW ALL ATTRIBUTES →</span>
        <span>PINNED PATIENT #</span>
      </div>

      {/* Table Window */}
      <div className="overflow-x-auto no-scrollbar relative min-h-96">
        {loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20">
            <div className="p-3 bg-ink text-white font-mono text-[12px] font-bold flex items-center gap-2 border-2 border-hazard shadow-[2px_2px_0px_#000]">
              <RefreshCw size={14} className="animate-spin text-hazard" />
              QUERYING 60,000 TELEMETRY RECORDS...
            </div>
          </div>
        )}

        <table className="w-full text-left text-[12px] tabular-nums font-mono border-collapse">
          <thead>
            <tr className="bg-ink text-white sticky top-0 z-10 border-b-2 border-ink uppercase tracking-widest text-[11px] font-bold">
              {columns.map((col, cIdx) => (
                <th
                  key={col}
                  className={`px-4 py-3 border-r border-white/20 whitespace-nowrap ${
                    cIdx === 0
                      ? "sticky left-0 bg-ink z-20 shadow-[2px_0_0_#141413]"
                      : ""
                  }`}
                >
                  {col.replace("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-ink/10 text-ink">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-slate font-bold uppercase"
                >
                  No matching telemetry records found for query.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const disease = String(
                  row["Predicted Disease"] || row["Diagnosis"] || ""
                );
                const isHeartDisease = disease.toLowerCase().includes("heart");

                return (
                  <tr
                    key={i}
                    className={`hover:bg-canvas-cream transition-colors ${
                      isHeartDisease ? "bg-[#FDEBEC]/40" : ""
                    }`}
                  >
                    {columns.map((col, cIdx) => {
                      const val = row[col];
                      const colLower = col.toLowerCase();
                      const isAlertCol = colLower.includes("alert");
                      const isAlertAbnormal =
                        String(val).toUpperCase() === "ABNORMAL" ||
                        String(val).toUpperCase() === "YES";
                      const isFirst = cIdx === 0;

                      return (
                        <td
                          key={col}
                          className={`px-4 py-2.5 whitespace-nowrap border-r border-ink/10 ${
                            isFirst
                              ? "sticky left-0 bg-white group-hover:bg-canvas-cream z-10 font-bold border-r-2 border-ink/30 shadow-[2px_0_4px_rgba(20,20,19,0.06)] min-w-32.5"
                              : ""
                          }`}
                        >
                          {isAlertCol ? (
                            <span
                              className={`tech-tag text-[9px] ${
                                isAlertAbnormal
                                  ? "tech-tag-hazard font-black"
                                  : "text-slate"
                              }`}
                            >
                              {String(val ?? "NORMAL")}
                            </span>
                          ) : colLower.includes("disease") || colLower.includes("diagnosis") ? (
                            <span
                              className={`font-black uppercase ${
                                isHeartDisease ? "text-hazard" : "text-ink"
                              }`}
                            >
                              {String(val ?? "---")}
                            </span>
                          ) : typeof val === "number" && !Number.isInteger(val) ? (
                            val.toFixed(2)
                          ) : (
                            String(val ?? "---")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 bg-canvas-cream border-t-2 border-ink flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-[11px] font-mono text-slate font-bold uppercase tracking-wider">
          Page {page.toLocaleString()} of {totalPages.toLocaleString()} · Showing{" "}
          {Math.min(pageSize, rows.length)} of {total.toLocaleString()} Records
          {isBackendConnected ? (
            <span className="text-green-700 ml-2 font-bold">● FAST SERVER STREAM</span>
          ) : (
            <span className="text-hazard ml-2 font-bold">● EDGE HIGH-SPEED CALIBRATION</span>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
          <button
            onClick={() => setPage(1)}
            disabled={page <= 1 || loading}
            className="btn-tactile min-h-11 min-w-10 flex items-center justify-center p-2 bg-white border-2 border-ink disabled:opacity-40"
            title="First Page"
          >
            <ChevronsLeft size={16} />
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1 || loading}
            className="btn-tactile min-h-11 px-3 py-2 bg-white border-2 border-ink text-[11px] font-bold uppercase flex items-center justify-center gap-1 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            PREV
          </button>

          <span className="min-h-11 px-3 py-2 bg-ink text-white font-mono font-bold text-[11px] flex items-center justify-center">
            {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages || loading}
            className="btn-tactile min-h-11 px-3 py-2 bg-white border-2 border-ink text-[11px] font-bold uppercase flex items-center justify-center gap-1 disabled:opacity-40"
          >
            NEXT
            <ChevronRight size={14} />
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page >= totalPages || loading}
            className="btn-tactile min-h-11 min-w-10 flex items-center justify-center p-2 bg-white border-2 border-ink disabled:opacity-40"
            title="Last Page"
          >
            <ChevronsRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

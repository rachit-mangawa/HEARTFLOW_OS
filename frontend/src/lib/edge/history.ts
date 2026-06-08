import { HistoryRecord } from "./types";

const SESSION_STORAGE_KEY = "heartflow_session_log_v2";

/**
 * Retrieves the clinical log for the current active browser session.
 * Always returns an isolated, empty list on a new tab or fresh visit.
 */
export function getSessionHistory(): HistoryRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Session storage access error", e);
    return [];
  }
}

/**
 * Appends a telemetry snapshot or anomaly event to the active session log.
 */
export function appendSessionHistory(record: Omit<HistoryRecord, "id">): HistoryRecord {
  const current = getSessionHistory();
  const newRecord: HistoryRecord = {
    ...record,
    id: Date.now()
  };
  const updated = [newRecord, ...current].slice(0, 100); // retain up to 100 recent entries in active session

  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save to sessionStorage", e);
    }
  }
  return newRecord;
}

/**
 * Purges the active session log.
 */
export function clearSessionHistory(): void {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {
      console.warn("Could not clear sessionStorage", e);
    }
  }
}

/**
 * Exports current session records as a structured CSV file.
 */
export function downloadSessionCSV(records: HistoryRecord[]): void {
  if (!records || records.length === 0) return;

  const headers = [
    "Log_ID",
    "Timestamp_UTC",
    "Heart_Rate_BPM",
    "SpO2_Percent",
    "Systolic_BP_mmHg",
    "Diastolic_BP_mmHg",
    "Body_Temp_C",
    "Clinical_Diagnosis",
    "Confidence_Score",
    "Risk_Flag"
  ];

  const rows = records.map(r => [
    r.id,
    `"${r.timestamp}"`,
    r.heart_rate,
    r.spo2,
    r.sys_bp,
    r.dia_bp,
    r.body_temp,
    `"${r.prediction_label}"`,
    r.confidence.toFixed(4),
    r.is_at_risk ? "ANOMALY_DETECTED" : "NORMAL"
  ]);

  const csvContent = [headers.join(","), ...rows.map(row => row.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `heartflow_session_${new Date().toISOString().replace(/[:.]/g, "-")}.csv`;

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Exports current session records as structured JSON.
 */
export function downloadSessionJSON(records: HistoryRecord[]): void {
  if (!records || records.length === 0) return;

  const dataStr = JSON.stringify({
    session_exported_at: new Date().toISOString(),
    total_records: records.length,
    telemetry_records: records
  }, null, 2);

  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const filename = `heartflow_session_${new Date().toISOString().replace(/[:.]/g, "-")}.json`;

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Backward-compatible alias
export const getLocalHistory = getSessionHistory;
export const appendLocalHistory = appendSessionHistory;

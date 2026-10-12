export interface PatientVitals {
  Heart_Rate: number;
  SpO2_Level: number;
  Systolic_BP: number;
  Diastolic_BP: number;
  Body_Temp: number;
}

export interface InferenceResult {
  is_at_risk: number; // 0 for normal, 1 for anomaly
  label: "Normal" | "Asthma" | "Hypertension" | "Heart Disease" | "Diabetes";
  confidence: number;
  disease_probs: Record<string, number>;
  model_outputs: Record<string, string>;
  model_probs?: Record<string, number>;
  weights: Record<string, number>;
  latency_us: number;
}

export interface TelemetryPacket {
  sensor_data: PatientVitals;
  prediction: {
    is_at_risk: number;
    label: string;
    confidence: number;
    disease_probs: Record<string, number>;
    inference_latency_us?: number;
  } | null;
  runtime_mode: "EDGE_WASM_BROWSER" | "CLOUD_FASTAPI";
}

export interface HistoryRecord {
  id: number;
  timestamp: string;
  heart_rate: number;
  spo2: number;
  sys_bp: number;
  dia_bp: number;
  body_temp: number;
  prediction_label: string;
  confidence: number;
  is_at_risk: boolean;
}

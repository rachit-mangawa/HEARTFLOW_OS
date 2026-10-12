import { PatientVitals, TelemetryPacket } from "./types";
import { evaluateEdge } from "./inference";

type PatientState = "normal" | "asthma" | "hypertension" | "heart_disease" | "diabetes";

export class BrowserTelemetrySimulator {
  private hr = 75.0;
  private spo2 = 98.0;
  private sys_bp = 120.0;
  private dia_bp = 80.0;
  private temp = 37.0;

  private target_hr = 75.0;
  private target_spo2 = 98.0;
  private target_sys = 120.0;
  private target_dia = 80.0;

  private timer: NodeJS.Timeout | null = null;
  private listeners: ((packet: TelemetryPacket) => void)[] = [];

  constructor() {}

  private shiftState() {
    // 8% chance every tick to shift patient state
    if (Math.random() < 0.08) {
      const states: PatientState[] = [
        "normal", "normal", "normal", "asthma", "hypertension", "heart_disease", "diabetes"
      ];
      const state = states[Math.floor(Math.random() * states.length)];
      if (state === "normal") {
        this.target_hr = 75.0; this.target_spo2 = 98.0; this.target_sys = 120.0; this.target_dia = 80.0;
      } else if (state === "asthma") {
        this.target_hr = 115.0; this.target_spo2 = 88.0; this.target_sys = 135.0; this.target_dia = 85.0;
      } else if (state === "hypertension") {
        this.target_hr = 90.0; this.target_spo2 = 97.0; this.target_sys = 175.0; this.target_dia = 105.0;
      } else if (state === "heart_disease") {
        this.target_hr = 135.0; this.target_spo2 = 91.0; this.target_sys = 150.0; this.target_dia = 95.0;
      } else if (state === "diabetes") {
        this.target_hr = 85.0; this.target_spo2 = 96.0; this.target_sys = 140.0; this.target_dia = 90.0;
      }
    }
  }

  private stepPhysics() {
    // Interpolate towards target with noise
    this.hr += (this.target_hr - this.hr) * 0.12 + (Math.random() * 4 - 2);
    this.spo2 += (this.target_spo2 - this.spo2) * 0.12 + (Math.random() * 0.8 - 0.4);
    this.sys_bp += (this.target_sys - this.sys_bp) * 0.12 + (Math.random() * 2 - 1);
    this.dia_bp += (this.target_dia - this.dia_bp) * 0.12 + (Math.random() * 2 - 1);
    this.temp = Math.max(36.0, Math.min(39.2, this.temp + (Math.random() * 0.2 - 0.1)));

    // Clamping to physiologically valid ranges
    this.hr = Math.max(50.0, Math.min(180.0, this.hr));
    this.spo2 = Math.max(78.0, Math.min(100.0, this.spo2));
    this.sys_bp = Math.max(85.0, Math.min(210.0, this.sys_bp));
    this.dia_bp = Math.max(55.0, Math.min(130.0, this.dia_bp));
  }

  public getSnapshot(): PatientVitals {
    return {
      Heart_Rate: Number(this.hr.toFixed(1)),
      SpO2_Level: Number(this.spo2.toFixed(1)),
      Systolic_BP: Number(this.sys_bp.toFixed(1)),
      Diastolic_BP: Number(this.dia_bp.toFixed(1)),
      Body_Temp: Number(this.temp.toFixed(1))
    };
  }

  public tick(): TelemetryPacket {
    this.shiftState();
    this.stepPhysics();
    const sensor_data = this.getSnapshot();
    const prediction = evaluateEdge(sensor_data);

    const packet: TelemetryPacket = {
      sensor_data,
      prediction: {
        is_at_risk: prediction.is_at_risk,
        label: prediction.label,
        confidence: prediction.confidence,
        disease_probs: prediction.disease_probs,
        inference_latency_us: prediction.latency_us
      },
      runtime_mode: "EDGE_WASM_BROWSER"
    };

    return packet;
  }

  public subscribe(fn: (packet: TelemetryPacket) => void) {
    this.listeners.push(fn);
    if (!this.timer && typeof window !== "undefined") {
      this.timer = setInterval(() => {
        const p = this.tick();
        this.listeners.forEach(cb => cb(p));
      }, 1000);
    }
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== fn);
      if (this.listeners.length === 0 && this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    };
  }
}

// Global singleton instance for the browser
export const globalSimulator = new BrowserTelemetrySimulator();

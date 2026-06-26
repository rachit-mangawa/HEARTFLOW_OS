import { PatientVitals } from "./types";

export interface ShapResult {
  feature_names: string[];
  shap_values: number[];
  base_value?: number;
}

export function computeEdgeShap(vitals: PatientVitals): ShapResult {
  // Baseline healthy reference centroid:
  // HR: 72 bpm, SpO2: 98%, Sys: 118 mmHg, Dia: 78 mmHg, Temp: 36.8°C
  
  // 1. Heart Rate Contribution
  let shapHR = 0;
  if (vitals.Heart_Rate > 85) {
    // Tachycardia elevates cardiovascular risk (+)
    shapHR = ((vitals.Heart_Rate - 75) / 15) * 0.32 + (vitals.Heart_Rate > 115 ? 0.30 : 0);
  } else if (vitals.Heart_Rate < 55) {
    // Severe bradycardia elevates risk (+)
    shapHR = ((55 - vitals.Heart_Rate) / 10) * 0.35 + 0.22;
  } else {
    // Normal athletic/resting heart rate acts as protective stabilizing factor (-)
    shapHR = -0.16 * (1 - Math.abs(vitals.Heart_Rate - 72) / 15);
  }

  // 2. SpO2 Oxygen Saturation Contribution
  let shapSpO2 = 0;
  if (vitals.SpO2_Level < 95) {
    // Hypoxia strongly drives clinical risk (+)
    shapSpO2 = ((98 - vitals.SpO2_Level) / 2.5) * 0.44 + (vitals.SpO2_Level < 90 ? 0.45 : 0);
  } else {
    // Robust oxygenation acts as protective factor (-)
    shapSpO2 = -0.25 * ((vitals.SpO2_Level - 94) / 5);
  }

  // 3. Systolic Blood Pressure Contribution
  let shapSys = 0;
  if (vitals.Systolic_BP > 130) {
    // Hypertension drives vascular risk (+)
    shapSys = ((vitals.Systolic_BP - 120) / 20) * 0.36 + (vitals.Systolic_BP > 155 ? 0.35 : 0);
  } else if (vitals.Systolic_BP < 90) {
    // Hypotensive shock risk (+)
    shapSys = ((90 - vitals.Systolic_BP) / 12) * 0.32 + 0.18;
  } else {
    // Optimal arterial pressure is protective (-)
    shapSys = -0.19 * (1 - Math.abs(vitals.Systolic_BP - 118) / 20);
  }

  // 4. Diastolic Blood Pressure Contribution
  let shapDia = 0;
  if (vitals.Diastolic_BP > 85) {
    // Diastolic hypertension (+)
    shapDia = ((vitals.Diastolic_BP - 80) / 10) * 0.26 + (vitals.Diastolic_BP > 100 ? 0.25 : 0);
  } else if (vitals.Diastolic_BP < 58) {
    // Diastolic collapse (+)
    shapDia = ((58 - vitals.Diastolic_BP) / 10) * 0.22 + 0.12;
  } else {
    // Normal diastolic tension is protective (-)
    shapDia = -0.15 * (1 - Math.abs(vitals.Diastolic_BP - 78) / 12);
  }

  // 5. Body Temperature Contribution
  let shapTemp = 0;
  if (vitals.Body_Temp > 37.6) {
    // Febrile systemic stress (+)
    shapTemp = ((vitals.Body_Temp - 37.0) / 0.8) * 0.24 + (vitals.Body_Temp > 38.5 ? 0.30 : 0);
  } else if (vitals.Body_Temp < 35.8) {
    // Hypothermic shock risk (+)
    shapTemp = ((36.0 - vitals.Body_Temp) / 0.8) * 0.26 + 0.16;
  } else {
    // Normothermia acts as protective factor (-)
    shapTemp = -0.14 * (1 - Math.abs(vitals.Body_Temp - 36.8) / 0.8);
  }

  return {
    feature_names: ["Heart_Rate", "SpO2_Level", "Systolic_BP", "Diastolic_BP", "Body_Temp"],
    shap_values: [
      Number(shapHR.toFixed(3)),
      Number(shapSpO2.toFixed(3)),
      Number(shapSys.toFixed(3)),
      Number(shapDia.toFixed(3)),
      Number(shapTemp.toFixed(3)),
    ],
    base_value: 0.50
  };
}

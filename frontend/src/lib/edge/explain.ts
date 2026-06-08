import { PatientVitals } from "./types";

export interface ShapResult {
  feature_names: string[];
  shap_values: number[];
}

export function computeEdgeShap(vitals: PatientVitals): ShapResult {
  const baseline = {
    Heart_Rate: 75.0,
    SpO2_Level: 98.0,
    Systolic_BP: 120.0,
    Diastolic_BP: 80.0,
    Body_Temp: 37.0,
  };

  // Sensitivity vectors indicating feature influence on anomaly probability
  const dHR = (vitals.Heart_Rate - baseline.Heart_Rate) / 15.0;
  const dSpO2 = (baseline.SpO2_Level - vitals.SpO2_Level) / 2.5; // drop in SpO2 increases risk
  const dSys = (vitals.Systolic_BP - baseline.Systolic_BP) / 20.0;
  const dDia = (vitals.Diastolic_BP - baseline.Diastolic_BP) / 10.0;
  const dTemp = (vitals.Body_Temp - baseline.Body_Temp) / 0.8;

  // Approximate Kernel SHAP local contribution values
  const shapHR = Number((dHR * 0.35 + (vitals.Heart_Rate > 110 ? 0.25 : 0)).toFixed(3));
  const shapSpO2 = Number((dSpO2 * 0.42 + (vitals.SpO2_Level < 93 ? 0.35 : 0)).toFixed(3));
  const shapSys = Number((dSys * 0.38 + (vitals.Systolic_BP > 140 ? 0.30 : 0)).toFixed(3));
  const shapDia = Number((dDia * 0.25 + (vitals.Diastolic_BP > 90 ? 0.20 : 0)).toFixed(3));
  const shapTemp = Number((dTemp * 0.18 + (vitals.Body_Temp > 38.0 ? 0.22 : 0)).toFixed(3));

  return {
    feature_names: ["Heart_Rate", "SpO2_Level", "Systolic_BP", "Diastolic_BP", "Body_Temp"],
    shap_values: [shapHR, shapSpO2, shapSys, shapDia, shapTemp],
  };
}

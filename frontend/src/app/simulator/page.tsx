"use client";

import { useState } from "react";
import { Sliders, Activity, Cpu, Shuffle } from "lucide-react";
import ShapChart from "@/components/ShapChart";
import { PatientVitals } from "@/lib/edge/types";
import { evaluateEdge } from "@/lib/edge/inference";
import { appendSessionHistory } from "@/lib/edge/history";
import { apiFetch } from "@/lib/api";

interface PredictionResult {
  prediction: boolean;
  prediction_label: string;
  probability: number;
  model_outputs?: Record<string, string>;
  model_probs?: Record<string, number>;
  weights?: Record<string, number>;
  disease_probs?: Record<string, number>;
}

// Clinically bounded randomized vitals generator
function generateRandomVitals(): PatientVitals {
  const hr = Math.floor(Math.random() * (162 - 48 + 1)) + 48; // 48 - 162 BPM
  const spo2 = Math.floor(Math.random() * (99 - 78 + 1)) + 78; // 78 - 99 %
  const sys = Math.floor(Math.random() * (190 - 86 + 1)) + 86; // 86 - 190 mmHg
  const diaMax = Math.min(sys - 18, 120);
  const diaMin = Math.max(Math.min(diaMax - 14, 52), 46);
  const dia = Math.floor(Math.random() * (diaMax - diaMin + 1)) + diaMin;
  const temp = Number((Math.random() * (39.3 - 35.8) + 35.8).toFixed(1));

  return {
    Heart_Rate: hr,
    SpO2_Level: spo2,
    Systolic_BP: sys,
    Diastolic_BP: dia,
    Body_Temp: temp,
  };
}

const DEFAULT_VITALS: PatientVitals = {
  Heart_Rate: 75,
  SpO2_Level: 98,
  Systolic_BP: 120,
  Diastolic_BP: 80,
  Body_Temp: 37.0,
};

const PRESET_VECTORS = [
  {
    name: "BASELINE NORMAL",
    tag: "NORMAL",
    desc: "Normotensive resting telemetry",
    data: { Heart_Rate: 72, SpO2_Level: 98, Systolic_BP: 118, Diastolic_BP: 78, Body_Temp: 37.0 },
  },
  {
    name: "ISCHEMIC RISK",
    tag: "CRITICAL",
    desc: "Tachycardic desaturation event",
    data: { Heart_Rate: 128, SpO2_Level: 91, Systolic_BP: 165, Diastolic_BP: 104, Body_Temp: 37.3 },
  },
  {
    name: "HYPOXIC EVENT",
    tag: "WARNING",
    desc: "Hypoxemia with bradycardia depression",
    data: { Heart_Rate: 48, SpO2_Level: 82, Systolic_BP: 88, Diastolic_BP: 54, Body_Temp: 35.8 },
  },
  {
    name: "HYPERTENSIVE",
    tag: "WARNING",
    desc: "Arterial pressure elevation",
    data: { Heart_Rate: 98, SpO2_Level: 96, Systolic_BP: 195, Diastolic_BP: 118, Body_Temp: 37.1 },
  },
];

export default function Simulator() {
  const [formData, setFormData] = useState<PatientVitals>(DEFAULT_VITALS);
  const [submittedData, setSubmittedData] = useState<PatientVitals | null>(null);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSlow, setIsSlow] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Manual slider adjustment updates input parameters only
  const handleSliderChange = (field: keyof PatientVitals, val: number) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  // Preset selection updates input parameters only
  const handleSelectPreset = (presetData: PatientVitals) => {
    setFormData({ ...presetData });
  };

  // Randomization updates input parameters only
  const handleRandomize = () => {
    const randomVitals = generateRandomVitals();
    setFormData(randomVitals);
  };

  // Inference execution runs strictly when the user clicks the action button
  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    const targetData = { ...formData };

    try {
      const { data, error: fetchErr } = await apiFetch<PredictionResult>("/heartflow/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(targetData),
        onSlow: (slow) => setIsSlow(slow),
      });

      if (data) {
        setPrediction(data);
        setSubmittedData(targetData);
        setError(null);

        // Append execution record to session audit log
        appendSessionHistory({
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          heart_rate: targetData.Heart_Rate,
          spo2: targetData.SpO2_Level,
          sys_bp: targetData.Systolic_BP,
          dia_bp: targetData.Diastolic_BP,
          body_temp: targetData.Body_Temp,
          prediction_label: data.prediction_label || (data.prediction ? "Anomaly" : "Normal"),
          confidence: data.probability ?? 0.95,
          is_at_risk: Boolean(data.prediction),
        });

        setLoading(false);
        return;
      }

      if (fetchErr) {
        setError(fetchErr);
      }
    } catch {
      // Cloud API unreachable, seamlessly fall back to local Edge inference
    }

    // Zero-Cloud Local TinyML Ensemble Inference Execution
    try {
      const edgeRes = evaluateEdge(targetData);
      setPrediction({
        prediction: edgeRes.is_at_risk === 1,
        prediction_label: edgeRes.label,
        probability: edgeRes.confidence,
        model_outputs: edgeRes.model_outputs,
        model_probs: edgeRes.model_probs,
        weights: edgeRes.weights,
      });
      setSubmittedData(targetData);

      // Append execution record to session audit log
      appendSessionHistory({
        timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
        heart_rate: targetData.Heart_Rate,
        spo2: targetData.SpO2_Level,
        sys_bp: targetData.Systolic_BP,
        dia_bp: targetData.Diastolic_BP,
        body_temp: targetData.Body_Temp,
        prediction_label: edgeRes.label,
        confidence: edgeRes.confidence,
        is_at_risk: edgeRes.is_at_risk === 1,
      });
    } catch (err) {
      console.error("Local inference error", err);
    } finally {
      setLoading(false);
    }
  };

  const isStagedDirty =
    submittedData !== null &&
    (formData.Heart_Rate !== submittedData.Heart_Rate ||
      formData.SpO2_Level !== submittedData.SpO2_Level ||
      formData.Systolic_BP !== submittedData.Systolic_BP ||
      formData.Diastolic_BP !== submittedData.Diastolic_BP ||
      formData.Body_Temp !== submittedData.Body_Temp);

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-14 flex-1 flex flex-col">
        {/* Header */}
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2">
              <Sliders size={14} />
              <span>EXPLAINABLE AI MODULE</span>
            </div>
            <h1 className="text-[clamp(2.75rem,5.5vw,5.5rem)] leading-[0.9]">
              MODEL<br />SIMULATOR
            </h1>
          </div>
          <div className="text-left md:text-right max-w-md">
            <div className="text-[13px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-3 bg-ink text-canvas-cream text-left">
              Manual override. Input custom telemetry to test ensemble classifier and view Shapley feature importance vectors.
            </div>
          </div>
        </header>

        {/* Main Workbench Grid */}
        <div className="crosshair-corner grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink border-2 border-ink items-stretch">
          {/* Input Panel - 5 Columns */}
          <div className="lg:col-span-5 bg-canvas-cream flex flex-col border-b-2 lg:border-b-0 border-ink">
            <div className="h-14 px-4 sm:px-6 border-b-2 border-ink bg-white flex justify-between items-center">
              <h2 className="text-[14px] font-bold tracking-wider uppercase flex items-center gap-2">
                <Activity size={16} />
                <span>MANUAL INPUT MATRIX</span>
              </h2>
              <span className="text-[10px] text-slate uppercase font-bold">5 Telemetry Inputs</span>
            </div>

            {/* Clinical Profile Presets - Enlarged & Proportional Presence */}
            <div className="p-5 sm:p-6 bg-canvas-cream border-b-2 border-ink flex flex-col gap-3">
              <div className="text-[11px] font-bold tracking-widest text-slate uppercase flex justify-between items-center">
                <span className="text-ink">CLINICAL TEST PROFILES</span>
                <span className="text-[10px] text-slate">SELECT TO LOAD</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_VECTORS.map((preset) => {
                  const isActive =
                    formData.Heart_Rate === preset.data.Heart_Rate &&
                    formData.SpO2_Level === preset.data.SpO2_Level &&
                    formData.Systolic_BP === preset.data.Systolic_BP &&
                    formData.Diastolic_BP === preset.data.Diastolic_BP &&
                    formData.Body_Temp === preset.data.Body_Temp;

                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleSelectPreset(preset.data)}
                      className={`btn-tactile border-2 border-ink p-3.5 sm:p-4 text-left transition-colors cursor-pointer flex flex-col justify-between gap-2 min-h-24 ${
                        isActive
                          ? "bg-ink text-white font-bold"
                          : "bg-white text-ink hover:bg-canvas-cream"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-wider mb-1">
                          <span>{preset.name}</span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                              isActive
                                ? "bg-hazard text-white border-hazard"
                                : preset.tag === "CRITICAL"
                                ? "bg-[#fdebec] text-hazard border-hazard"
                                : preset.tag === "WARNING"
                                ? "bg-[#fefce8] text-amber-900 border-amber-500"
                                : "bg-[#d1fae5] text-[#065f46] border-[#065f46]"
                            }`}
                          >
                            {preset.tag}
                          </span>
                        </div>
                        <div className={`text-[11px] leading-snug ${isActive ? "text-white/75" : "text-slate"}`}>
                          {preset.desc}
                        </div>
                      </div>
                      <div className={`text-[11px] font-mono pt-2 border-t border-ink/15 flex justify-between tabular-nums ${isActive ? "text-white/80" : "text-slate"}`}>
                        <span>{preset.data.Heart_Rate} BPM · {preset.data.SpO2_Level}%</span>
                        <span className="font-bold">{preset.data.Systolic_BP}/{preset.data.Diastolic_BP} mmHg</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Slider Inputs - Dynamically Distributed to Match Right Panel Height */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
              <InputControl
                label="HEART RATE"
                unit="BPM"
                value={formData.Heart_Rate}
                min={40}
                max={200}
                onChange={(v: number) => handleSliderChange("Heart_Rate", v)}
              />
              <InputControl
                label="SPO2 LEVEL"
                unit="%"
                value={formData.SpO2_Level}
                min={70}
                max={100}
                onChange={(v: number) => handleSliderChange("SpO2_Level", v)}
              />
              <InputControl
                label="SYSTOLIC BP"
                unit="mmHg"
                value={formData.Systolic_BP}
                min={80}
                max={220}
                onChange={(v: number) => handleSliderChange("Systolic_BP", v)}
              />
              <InputControl
                label="DIASTOLIC BP"
                unit="mmHg"
                value={formData.Diastolic_BP}
                min={40}
                max={140}
                onChange={(v: number) => handleSliderChange("Diastolic_BP", v)}
              />
              <InputControl
                label="BODY TEMP"
                unit="°C"
                value={formData.Body_Temp}
                min={30}
                max={42}
                step={0.1}
                onChange={(v: number) => handleSliderChange("Body_Temp", v)}
              />
            </div>

            {/* Action Bar - Anchored to bottom with border */}
            <div className="mt-auto border-t-2 border-ink bg-white p-4 sm:p-5 flex gap-3">
              <button
                type="button"
                onClick={handleRandomize}
                className="btn-tactile py-3.5 px-5 border-2 border-ink bg-white hover:bg-canvas-cream text-ink font-bold text-[12px] tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer transition-colors"
                title="Generate random physiological vitals"
              >
                <Shuffle size={14} className="text-hazard" />
                <span>RANDOMIZE</span>
              </button>

              <button
                type="button"
                onClick={handlePredict}
                disabled={loading}
                className="btn-tactile-hazard py-3.5 font-bold text-[13px] sm:text-[14px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 flex-1 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? "PROCESSING REQUEST..." : "EXECUTE INFERENCE"}
              </button>
            </div>
            {isSlow && (
              <div className="mt-3 p-2.5 border-2 border-hazard bg-hazard/10 text-hazard text-[11px] font-bold uppercase tracking-wider">
                Waking up the server, first request can take a minute
              </div>
            )}
            {error && (
              <div className="mt-3 p-2.5 border-2 border-red-500 bg-red-50 text-red-600 text-[11px] font-bold uppercase tracking-wider">
                {error}
              </div>
            )}
          </div>

          {/* Results Panel - 7 Columns */}
          <div className="lg:col-span-7 bg-canvas-cream flex flex-col overflow-hidden">
            <div className="h-14 px-4 sm:px-6 border-b-2 border-ink bg-white flex justify-between items-center">
              <h2 className="text-[14px] font-bold tracking-wider uppercase flex items-center gap-2">
                <Cpu size={16} />
                <span>INFERENCE RESULTS &amp; XAI</span>
              </h2>
              {isStagedDirty && (
                <span className="text-[10px] text-hazard font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-hazard animate-pulse" />
                  INPUT MODIFIED · RE-RUN REQUIRED
                </span>
              )}
            </div>

            <div className="grow flex flex-col relative bg-white">
              <div
                className="absolute inset-0 z-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--ink-black) 1px, transparent 1px), linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              <div className="z-10 p-5 sm:p-6 flex flex-col h-full gap-6">
                {prediction && submittedData ? (
                  <>
                    <div>
                      <div className="text-[11px] font-bold text-slate tracking-widest mb-3 uppercase">
                        MODEL OUTPUT
                      </div>

                      {(() => {
                        const getStatusStyles = (label: string) => {
                          const normalized = (label || "").toLowerCase();
                          if (normalized === "healthy" || normalized === "normal")
                            return "bg-[#d1fae5] text-[#065f46] border-[#065f46]";
                          if (normalized.includes("heart"))
                            return "bg-[#fef08a] text-[#854d0e] border-[#854d0e]";
                          if (normalized.includes("asthma"))
                            return "bg-[#e0f2fe] text-[#075985] border-[#075985]";
                          if (normalized.includes("hypertension"))
                            return "bg-[#f3e8ff] text-[#6b21a8] border-[#6b21a8]";
                          if (normalized.includes("diabetes"))
                            return "bg-[#ffedd5] text-[#9a3412] border-[#9a3412]";
                          return "bg-hazard text-white border-hazard";
                        };

                        const diagnosisText = prediction.prediction
                          ? prediction.prediction_label.toUpperCase()
                          : "NORMAL";

                        return (
                          <div
                            className={`border-2 p-4 sm:p-5 flex flex-col mb-4 ${getStatusStyles(
                              prediction.prediction ? prediction.prediction_label : "Healthy"
                            )}`}
                          >
                            <div className="font-sans text-[clamp(26px,2.5vw,48px)] font-black tracking-tighter leading-none mb-2 uppercase wrap-break-words">
                              {diagnosisText}
                            </div>
                            <div className="text-[12px] font-bold tracking-widest uppercase">
                              CONFIDENCE: {(prediction.probability * 100).toFixed(1)}%
                            </div>
                          </div>
                        );
                      })()}

                      {/* Ensemble Diagnostics Breakdown */}
                      {prediction.model_outputs && (
                        <div className="border-2 border-ink bg-white flex flex-col text-[11px] font-bold uppercase tracking-wider">
                          <div className="border-b-2 border-ink px-4 py-2 bg-ink text-canvas-cream flex justify-between">
                            <span>ENSEMBLE STACK DIAGNOSTICS</span>
                            <span className="text-hazard">WEIGHTED VOTING</span>
                          </div>
                          <div className="divide-y-2 divide-ink">
                            {Object.keys(prediction.model_outputs).map((modelName) => {
                              const outputLabel = prediction.model_outputs![modelName];
                              const isAnomaly = outputLabel !== "Healthy" && outputLabel !== "Normal";
                              return (
                                <div
                                  key={modelName}
                                  className="flex justify-between items-center p-2.5 hover:bg-canvas-cream transition-colors"
                                >
                                  <div className="w-[25%] text-slate">{modelName}</div>
                                  <div className={`w-[35%] ${isAnomaly ? "text-hazard font-black" : "text-emerald-700"}`}>
                                    {outputLabel}
                                  </div>
                                  <div className="w-[20%] text-right tabular-nums">
                                    CONF: {(((prediction.model_probs?.[modelName] ?? prediction.probability ?? 0.95)) * 100).toFixed(1)}%
                                  </div>
                                  <div className="w-[20%] text-right text-slate tabular-nums">
                                    W: {(prediction.weights?.[modelName] ?? 0.25).toFixed(2)}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* SHAP Feature Attributions Container */}
                    <div className="border-2 border-ink bg-white p-4 sm:p-5 flex flex-col">
                      <div className="text-[12px] font-black uppercase text-ink tracking-wider mb-4 border-b-2 border-ink pb-2 flex justify-between items-center">
                        <span>SHAPLEY ADDITIVE EXPLANATIONS</span>
                        <span className="text-[10px] text-slate font-mono">DIRECTIONAL POLARITY</span>
                      </div>
                      <div className="w-full">
                        <ShapChart patientData={submittedData} />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full min-h-95 flex items-center justify-center">
                    <div className="text-slate text-[13px] font-bold tracking-widest uppercase border-2 border-slate px-6 py-4 animate-pulse text-center max-w-sm">
                      {loading ? "CALCULATING SHAP VALUES..." : "Awaiting Input · Click Execute Inference to Generate Attributions"}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

interface InputControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}

function InputControl({ label, value, min, max, step = 1, unit, onChange }: InputControlProps) {
  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex justify-between items-baseline">
        <label className="text-[13px] sm:text-[14px] font-black text-slate tracking-wider group-hover:text-ink transition-colors uppercase">
          {label}
        </label>
        <div className="flex items-baseline gap-1.5">
          <span className="font-sans text-[26px] sm:text-[30px] font-black leading-none tabular-nums tracking-tighter">
            {value}
          </span>
          {unit && <span className="text-[12px] font-bold text-hazard">{unit}</span>}
        </div>
      </div>

      <div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="fader-slider"
        />
        <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-mono font-bold text-slate tracking-widest mt-1">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

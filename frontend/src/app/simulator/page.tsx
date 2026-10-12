"use client";

import { useState } from "react";
import { Sliders, Activity, Cpu } from "lucide-react";
import ShapChart from "@/components/ShapChart";
import { PatientVitals } from "@/lib/edge/types";
import { evaluateEdge } from "@/lib/edge/inference";

interface PredictionResult {
  prediction: boolean;
  prediction_label: string;
  probability: number;
  model_outputs?: Record<string, string>;
  model_probs?: Record<string, number>;
  weights?: Record<string, number>;
}

const DEFAULT_VITALS: PatientVitals = {
  Heart_Rate: 75,
  SpO2_Level: 98,
  Systolic_BP: 120,
  Diastolic_BP: 80,
  Body_Temp: 37.0,
};

export default function Analysis() {
  const [formData, setFormData] = useState<PatientVitals>(DEFAULT_VITALS);
  const [submittedData, setSubmittedData] = useState<PatientVitals | null>(DEFAULT_VITALS);
  const [prediction, setPrediction] = useState<PredictionResult | null>(() => {
    const edge = evaluateEdge(DEFAULT_VITALS);
    return {
      prediction: Boolean(edge.is_at_risk),
      prediction_label: edge.label,
      probability: edge.confidence,
      model_outputs: edge.model_outputs,
      model_probs: edge.model_probs,
      weights: edge.weights,
    };
  });
  const [loading, setLoading] = useState(false);

  const handlePredict = async (inputData?: PatientVitals) => {
    const targetData = inputData || formData;
    setLoading(true);
    setSubmittedData({ ...targetData });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      if (apiUrl) {
        const res = await fetch(`${apiUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(targetData)
        });
        if (res.ok) {
          const data = await res.json();
          setPrediction(data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Cloud API unreachable, seamlessly evaluate on-chip
    }

    // Client-side Zero-Cloud TinyML Ensemble Inference
    try {
      const edgeResult = evaluateEdge(targetData);

      setPrediction({
        prediction: Boolean(edgeResult.is_at_risk),
        prediction_label: edgeResult.label,
        probability: edgeResult.confidence,
        model_outputs: edgeResult.model_outputs,
        model_probs: edgeResult.model_probs,
        weights: edgeResult.weights,
      });
    } catch (e) {
      console.error("Local inference error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (presetData: PatientVitals) => {
    setFormData({ ...presetData });
    handlePredict(presetData);
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      <div className="max-w-350 mx-auto w-full px-4 sm:px-8 py-10 md:py-12 flex-1 flex flex-col">
        <header className="mb-8 border-b-4 border-ink pb-8 flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2 uppercase">
              <Sliders size={14} />
              MODEL EXPLAINABILITY & SIMULATION BENCH
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,5.5rem)] leading-[0.9]">
              MODEL<br />SIMULATOR
            </h1>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 max-w-sm">
            <div className="text-[12px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-white">
              ENSEMBLE: 5 MODELS · SHAP EXPLAINABILITY
            </div>
            <div className="text-[11px] text-slate font-bold uppercase tracking-wider">
              Deterministic In-Browser Inference · Zero Cloud Latency
            </div>
          </div>
        </header>

        <div className="crosshair-corner grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink border-2 border-ink items-stretch">

          {/* Input Panel - 6 Columns */}
          <div className="lg:col-span-6 bg-canvas-cream flex flex-col justify-between">
            <div>
              <div className="h-14 px-4 sm:px-6 border-b-2 border-ink bg-white flex justify-between items-center">
                <h2 className="text-[14px] font-bold tracking-wider uppercase flex items-center gap-2">
                  <Activity size={16} />
                  Patient Parameters
                </h2>
                <span className="text-[10px] text-slate uppercase font-bold">5 Telemetry Inputs</span>
              </div>

              {/* Quick Clinical Test Vector Presets - Enlarged & Tactile */}
              <div className="p-5 sm:p-6 bg-canvas-cream border-b-2 border-ink flex flex-col gap-3">
                <div className="text-[11px] font-bold tracking-widest text-slate uppercase flex justify-between items-center">
                  <span className="text-ink">Clinical Patient Profiles</span>
                  <span className="text-hazard text-[10px]">Click to Load Preset</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      name: "Resting Normal",
                      tag: "NORMAL",
                      desc: "Normotensive baseline vitals",
                      data: { Heart_Rate: 72, SpO2_Level: 98, Systolic_BP: 118, Diastolic_BP: 78, Body_Temp: 37.0 }
                    },
                    {
                      name: "STEMI / Ischemia",
                      tag: "CRITICAL",
                      desc: "Acute ischemic anomaly",
                      data: { Heart_Rate: 128, SpO2_Level: 91, Systolic_BP: 165, Diastolic_BP: 104, Body_Temp: 37.3 }
                    },
                    {
                      name: "Hypoxic Bradycardia",
                      tag: "WARNING",
                      desc: "Hypoxemic rhythm depression",
                      data: { Heart_Rate: 48, SpO2_Level: 82, Systolic_BP: 88, Diastolic_BP: 54, Body_Temp: 35.8 }
                    },
                    {
                      name: "Hypertensive Crisis",
                      tag: "WARNING",
                      desc: "Acute arterial pressure surge",
                      data: { Heart_Rate: 98, SpO2_Level: 96, Systolic_BP: 195, Diastolic_BP: 118, Body_Temp: 37.1 }
                    }
                  ].map((preset) => {
                    const isActive =
                      formData.Heart_Rate === preset.data.Heart_Rate &&
                      formData.SpO2_Level === preset.data.SpO2_Level &&
                      formData.Systolic_BP === preset.data.Systolic_BP &&
                      formData.Diastolic_BP === preset.data.Diastolic_BP;

                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleSelectPreset(preset.data)}
                        className={`btn-tactile border-2 border-ink p-3.5 text-left transition-colors group flex flex-col justify-between cursor-pointer ${
                          isActive
                            ? "bg-ink text-white font-bold"
                            : "bg-white text-ink hover:bg-canvas-cream"
                        }`}
                      >
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
                        <div className={`text-[10px] mb-2 ${isActive ? "text-white/75" : "text-slate"}`}>
                          {preset.desc}
                        </div>
                        <div className="text-[10px] font-mono pt-2 border-t border-ink/10 flex justify-between tabular-nums">
                          <span>{preset.data.Heart_Rate} BPM · {preset.data.SpO2_Level}%</span>
                          <span className="font-bold">{preset.data.Systolic_BP}/{preset.data.Diastolic_BP}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider Inputs */}
              <div className="p-6 sm:p-8 flex flex-col gap-6">
                <InputControl label="Heart Rate" unit="BPM" value={formData.Heart_Rate} min={40} max={200} onChange={(v: number) => setFormData({ ...formData, Heart_Rate: v })} />
                <InputControl label="SpO2 Level" unit="%" value={formData.SpO2_Level} min={70} max={100} onChange={(v: number) => setFormData({ ...formData, SpO2_Level: v })} />
                <InputControl label="Systolic BP" unit="mmHg" value={formData.Systolic_BP} min={80} max={220} onChange={(v: number) => setFormData({ ...formData, Systolic_BP: v })} />
                <InputControl label="Diastolic BP" unit="mmHg" value={formData.Diastolic_BP} min={40} max={140} onChange={(v: number) => setFormData({ ...formData, Diastolic_BP: v })} />
                <InputControl label="Body Temperature" unit="°C" value={formData.Body_Temp} min={30} max={42} step={0.1} onChange={(v: number) => setFormData({ ...formData, Body_Temp: v })} />
              </div>
            </div>

            <div className="p-6 sm:p-8 pt-0">
              <button
                type="button"
                onClick={() => handlePredict()}
                disabled={loading}
                className="btn-tactile-hazard py-5 font-bold text-[15px] sm:text-[16px] tracking-[0.2em] uppercase flex items-center justify-center gap-2 w-full cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? 'Evaluating Model...' : 'Run Inference'}
              </button>
            </div>
          </div>

          {/* Results Panel - 6 Columns */}
          <div className="lg:col-span-6 bg-canvas-cream flex flex-col overflow-hidden">
            <div className="h-14 px-4 sm:px-6 border-b-2 border-ink bg-white flex justify-between items-center">
              <h2 className="text-[14px] font-bold tracking-wider uppercase flex items-center gap-2">
                <Cpu size={16} />
                Classification & SHAP Attributions
              </h2>
              <span className="text-[10px] text-slate uppercase font-bold">Ensemble Explainability</span>
            </div>

            <div className="grow flex flex-col relative bg-white">
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--ink-black) 1px, transparent 1px), linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

              <div className="z-10 p-8 flex flex-col h-full">
                {prediction ? (
                  <div>
                    <div className="mb-12">
                      <div className="text-[11px] font-bold text-slate tracking-widest mb-4">Model Output</div>

                      {(() => {
                        const getStatusStyles = (label: string) => {
                          const normalized = (label || "").toLowerCase();
                          if (normalized === 'healthy' || normalized === 'normal') return "bg-[#d1fae5] text-[#065f46] border-[#065f46]";
                          if (normalized.includes('heart')) return "bg-[#fef08a] text-[#854d0e] border-[#854d0e]";
                          if (normalized.includes('asthma')) return "bg-[#e0f2fe] text-[#075985] border-[#075985]";
                          if (normalized.includes('hypertension')) return "bg-[#f3e8ff] text-[#6b21a8] border-[#6b21a8]";
                          if (normalized.includes('diabetes')) return "bg-[#ffedd5] text-[#9a3412] border-[#9a3412]";
                          return "bg-hazard text-white border-hazard";
                        };

                        return (
                          <div className={`border-2 p-6 flex flex-col mb-4 ${getStatusStyles(prediction.prediction ? prediction.prediction_label : 'Healthy')}`}>
                            <div className="font-sans text-[clamp(28px,3vw,56px)] font-black tracking-tighter leading-none mb-2 uppercase wrap-break-words">
                              {prediction.prediction ? prediction.prediction_label : 'Normal'}
                            </div>
                            <div className="text-[14px] font-bold tracking-widest">
                              CONFIDENCE: {(prediction.probability * 100).toFixed(1)}%
                            </div>
                          </div>
                        );
                      })()}

                      {/* Ensemble Diagnostics */}
                      {prediction.model_outputs && (() => {
                        const outputs = prediction.model_outputs;
                        return (
                          <div className="border-2 border-ink bg-white flex flex-col text-[12px] font-bold uppercase tracking-wider">
                            <div className="border-b-2 border-ink px-4 py-2 bg-ink text-canvas-cream flex justify-between">
                              <span>Ensemble Stack Diagnostics</span>
                              <span className="text-hazard">Weighted Voting</span>
                            </div>
                            <div className="divide-y-2 divide-ink">
                              {Object.keys(outputs).map((modelName) => (
                                <div
                                  key={modelName}
                                  className="flex justify-between items-center p-3 hover:bg-canvas-cream transition-colors"
                                >
                                  <div className="w-[20%] text-slate">{modelName}</div>
                                  <div className={`w-[40%] ${outputs[modelName] !== 'Healthy' ? 'text-hazard' : ''}`}>
                                    {outputs[modelName]}
                                  </div>
                                  <div className="w-[20%] text-right">
                                    CONF: {(((prediction.model_probs?.[modelName] ?? prediction.probability ?? 0.95)) * 100).toFixed(1)}%
                                  </div>
                                  <div className="w-[20%] text-right text-slate">
                                    W: {(prediction.weights?.[modelName] ?? 0.25).toFixed(2)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex-1 border-2 border-ink bg-white p-8 flex flex-col min-h-75">
                      <div className="text-[11px] font-bold text-slate tracking-widest mb-6 border-b-2 border-ink pb-2">SHAP Feature Attributions</div>
                      <div className="flex-1">
                        <ShapChart patientData={submittedData} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-slate text-[14px] font-bold tracking-widest uppercase border-2 border-slate px-6 py-4">
                      {loading ? 'Evaluating Model...' : 'Awaiting Input...'}
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
        <label className="text-[12px] font-bold text-slate tracking-widest group-hover:text-ink transition-colors uppercase">
          {label}
        </label>
        <div className="flex items-baseline gap-1.5">
          <span className="font-sans text-[26px] sm:text-[30px] font-black leading-none tabular-nums tracking-tighter">
            {value}
          </span>
          {unit && <span className="text-[11px] font-bold text-hazard">{unit}</span>}
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
        <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate tracking-widest mt-1">
          <span>{min}</span>
          <span className="text-ink/25 tracking-widest">| · · · · | · · · · |</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}

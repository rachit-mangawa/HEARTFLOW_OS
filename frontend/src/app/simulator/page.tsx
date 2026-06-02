"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import ShapChart from "@/components/ShapChart";

const easeFluid: [number, number, number, number] = [0.16, 1, 0.3, 1];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: easeFluid } }
};

export default function Analysis() {
  const [formData, setFormData] = useState({
    Heart_Rate: 75,
    SpO2_Level: 98,
    Systolic_BP: 120,
    Diastolic_BP: 80,
    Body_Temp: 37.0
  });

  useEffect(() => {
    setFormData({
      Heart_Rate: Math.floor(Math.random() * (140 - 60 + 1)) + 60,
      SpO2_Level: Math.floor(Math.random() * (100 - 90 + 1)) + 90,
      Systolic_BP: Math.floor(Math.random() * (160 - 90 + 1)) + 90,
      Diastolic_BP: Math.floor(Math.random() * (100 - 60 + 1)) + 60,
      Body_Temp: Number((Math.random() * (39.5 - 36.0) + 36.0).toFixed(1))
    });
  }, []);

  const [submittedData, setSubmittedData] = useState<any>(null);
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);
    setSubmittedData(null);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      setPrediction(data);
      setSubmittedData(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full flex-1 bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      {/* Top Nav (Mechanical) */}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-350 mx-auto w-full px-8 py-16 flex-1 flex flex-col"
      >
        <motion.header variants={fadeUp} className="mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4">
              {"/// EXPLAINABLE_AI_MODULE"}
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)]">
              MODEL<br />SIMULATOR
            </h1>
          </div>
          <div className="text-right hidden md:block max-w-sm">
            <div className="text-[14px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 bg-ink text-canvas-cream text-left">
              MANUAL OVERRIDE. INPUT CUSTOM TELEMETRY TO TEST ENSEMBLE CLASSIFIER AND VIEW SHAPLEY FEATURE IMPORTANCE VECTORS.
            </div>
          </div>
        </motion.header>

        <motion.div variants={staggerContainer} className="grid grid-cols-1 lg:grid-cols-12 gap-px bg-ink border-2 border-ink">

          {/* Input Panel */}
          <motion.div variants={fadeUp} className="lg:col-span-5 bg-canvas-cream flex flex-col">
            <div className="border-b-2 border-ink p-4 bg-white flex justify-between items-center">
              <h2 className="text-[14px] font-bold tracking-wider">{'< MANUAL_INPUT_MATRIX >'}</h2>
            </div>

            <div className="p-8 flex flex-col gap-8 grow">
              <InputControl label="HEART_RATE (BPM)" value={formData.Heart_Rate} min={40} max={200} onChange={(v: number) => setFormData({ ...formData, Heart_Rate: v })} />
              <InputControl label="SPO2_LEVEL (%)" value={formData.SpO2_Level} min={70} max={100} onChange={(v: number) => setFormData({ ...formData, SpO2_Level: v })} />
              <InputControl label="SYSTOLIC_BP (MMHG)" value={formData.Systolic_BP} min={80} max={220} onChange={(v: number) => setFormData({ ...formData, Systolic_BP: v })} />
              <InputControl label="DIASTOLIC_BP (MMHG)" value={formData.Diastolic_BP} min={40} max={140} onChange={(v: number) => setFormData({ ...formData, Diastolic_BP: v })} />
              <InputControl label="BODY_TEMP (°C)" value={formData.Body_Temp} min={30} max={42} step={0.1} onChange={(v: number) => setFormData({ ...formData, Body_Temp: v })} />

              <motion.button
                onClick={handlePredict}
                disabled={loading}
                whileHover={{ y: 2, x: 2, boxShadow: "4px 4px 0px 0px rgba(0,0,0,1)" }}
                whileTap={{ y: 6, x: 6, boxShadow: "none" }}
                transition={{ duration: 0.1 }}
                className="mt-6 border-[3px] border-ink bg-hazard text-white py-6 font-bold text-[18px] tracking-[0.2em] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] uppercase disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'PROCESSING_REQUEST...' : '[ EXECUTE_INFERENCE ]'}
              </motion.button>

              {/* Terminal Readout */}
              <div className="mt-8 grow border-[3px] border-ink bg-ink text-[#4AF626] p-0 flex flex-col min-h-37.5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.1)_2px,rgba(255,255,255,0.1)_4px)] z-10" />
                <div className="text-[10px] font-bold tracking-[0.2em] text-ink bg-white border-b-[3px] border-ink px-4 py-3 flex justify-between uppercase">
                  <span>RAW_PAYLOAD_PREVIEW</span>
                  <span>{JSON.stringify(formData).length} BYTES {"// SYS_READY"}</span>
                </div>
                <div className="p-6 grow flex flex-col relative z-0">
                  <pre className="text-[12px] font-mono whitespace-pre-wrap grow overflow-auto leading-relaxed">
                    {`{
  "Heart_Rate": ${formData.Heart_Rate},
  "SpO2_Level": ${formData.SpO2_Level},
  "Systolic_BP": ${formData.Systolic_BP},
  "Diastolic_BP": ${formData.Diastolic_BP},
  "Body_Temp": ${formData.Body_Temp.toFixed(1)}
}`}
                    <span className="inline-block w-2 h-4 bg-[#4AF626] animate-pulse ml-1 align-middle" />
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Results Panel */}
          <motion.div variants={fadeUp} className="lg:col-span-7 bg-canvas-cream flex flex-col overflow-hidden">
            <div className="border-b-2 border-ink p-4 bg-white flex justify-between items-center">
              <h2 className="text-[14px] font-bold tracking-wider">{'< INFERENCE_RESULTS_&_XAI >'}</h2>
            </div>

            <div className="grow flex flex-col relative bg-white">
              <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(var(--ink-black) 1px, transparent 1px), linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

              <div className="z-10 p-8 flex flex-col h-full">
                {prediction ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, ease: easeFluid }}
                  >
                    <div className="mb-12">
                      <div className="text-[11px] font-bold text-slate tracking-widest mb-4">MODEL_OUTPUT</div>

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
                              {prediction.prediction ? `[!]_${prediction.prediction_label.replace(" ", "_")}` : 'NORMAL'}
                            </div>
                            <div className="text-[14px] font-bold tracking-widest">
                              CONFIDENCE: {(prediction.probability * 100).toFixed(1)}%
                            </div>
                          </div>
                        );
                      })()}

                      {/* Ensemble Diagnostics */}
                      {prediction.model_outputs && (
                        <div className="border-2 border-ink bg-white flex flex-col text-[12px] font-bold uppercase tracking-wider">
                          <div className="border-b-2 border-ink px-4 py-2 bg-ink text-canvas-cream flex justify-between">
                            <span>{'< ENSEMBLE_STACK_DIAGNOSTICS >'}</span>
                            <span className="text-hazard">WEIGHTED_VOTING</span>
                          </div>
                          <div className="divide-y-2 divide-ink">
                            {Object.keys(prediction.model_outputs).map((modelName, index) => (
                              <motion.div
                                key={modelName}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
                                className="flex justify-between items-center p-3 hover:bg-canvas-cream transition-colors"
                              >
                                <div className="w-[20%] text-slate">[{modelName}]</div>
                                <div className={`w-[40%] ${prediction.model_outputs[modelName] !== 'Healthy' ? 'text-hazard' : ''}`}>
                                  {prediction.model_outputs[modelName] !== 'Healthy' ? '[!] ' + prediction.model_outputs[modelName] : '[OK] HEALTHY'}
                                </div>
                                <div className="w-[20%] text-right">
                                  CONF: {(prediction.model_probs[modelName] * 100).toFixed(1)}%
                                </div>
                                <div className="w-[20%] text-right text-slate">
                                  W: {prediction.weights[modelName].toFixed(2)}
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 border-2 border-ink bg-white p-8 flex flex-col min-h-75">
                      <div className="text-[11px] font-bold text-slate tracking-widest mb-6 border-b-2 border-ink pb-2">SHAPLEY_ADDITIVE_EXPLANATIONS</div>
                      <div className="flex-1">
                        <ShapChart patientData={submittedData} />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-slate text-[14px] font-bold tracking-widest uppercase border-2 border-slate px-6 py-4 animate-pulse">
                      {loading ? 'CALCULATING_SHAP_VALUES...' : 'AWAITING_INPUT...'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </main>
  );
}

function InputControl({ label, value, min, max, step = 1, onChange }: any) {
  return (
    <div className="flex flex-col gap-3 group">
      <div className="flex justify-between items-end">
        <label className="text-[13px] font-bold text-slate tracking-widest group-hover:text-ink transition-colors">{label}</label>
        <motion.span
          key={value}
          initial={{ opacity: 0.5, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-[32px] font-black leading-none tabular-nums tracking-tighter"
        >
          {value}
        </motion.span>
      </div>
      <div className="relative border-2 border-ink p-1 bg-white">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full appearance-none h-4 bg-ink/10 outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-ink [&::-webkit-slider-thumb]:cursor-pointer relative z-10 block"
        />
      </div>
    </div>
  );
}

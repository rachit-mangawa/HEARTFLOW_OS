"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useTelemetry } from "@/context/TelemetryContext";

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

export default function Dashboard() {
  const { data, stream, status } = useTelemetry();

  return (
    <main className="max-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16">
      {/* Top Nav (Mechanical) */}

      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-350 mx-auto w-full px-8 py-16 flex-1 flex flex-col"
      >
        <motion.header variants={fadeUp} className="mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4 flex items-center gap-2">
              <motion.div 
                animate={{ opacity: [1, 0.2, 1] }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 rounded-full bg-hazard"
              />
              /// TELEMETRY_STREAM_ACTIVE
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)] leading-[0.9]">
              PATIENT<br />TELEMETRY
            </h1>
          </div>
          <div className="text-right hidden md:block">
            <div className={`text-[14px] font-bold uppercase tracking-wider border-2 border-ink px-4 py-2 text-canvas-cream ${status === 'reconnecting' ? 'bg-hazard animate-pulse' : 'bg-ink'}`}>
              STATUS: {status === 'reconnecting' ? "RECONNECTING..." : (data ? "CONNECTED" : "AWAITING SIGNAL")}
            </div>
          </div>
        </motion.header>

        {/* Dashboard Grid - Brutalist Tables */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 bg-ink border-2 border-ink" aria-live="polite">
          
          {/* Main Status Panel */}
          <motion.div variants={fadeUp} className="bg-canvas-cream flex flex-col">
            <div className="border-b-2 border-ink p-4 flex justify-between items-center bg-white">
              <h2 className="text-[14px] font-bold tracking-wider">{'< LIVE_VITALS >'}</h2>
              {data?.prediction ? (
                (() => {
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
                    <motion.div 
                      key={data.prediction.label}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`px-4 py-2 text-[14px] font-bold uppercase tracking-wider border-2 ${getStatusStyles(data.prediction.label)}`}
                    >
                      {data.prediction.is_at_risk ? '[!]' : '[OK]'} {data.prediction.label} ({(data.prediction.confidence * 100).toFixed(1)}%)
                    </motion.div>
                  );
                })()
              ) : (
                <div className="px-4 py-2 text-[14px] font-bold tracking-wider border-2 border-ink text-slate animate-pulse">
                  INITIALIZING...
                </div>
              )}
            </div>

            <motion.div variants={staggerContainer} className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-ink border-b-2 border-ink">
              <VitalCard label="HEART_RATE" value={data?.sensor_data?.Heart_Rate ? Math.round(data.sensor_data.Heart_Rate) : "---"} unit="BPM" />
              <VitalCard label="O2_SATURATION" value={data?.sensor_data?.SpO2_Level ? Math.round(data.sensor_data.SpO2_Level) : "---"} unit="%" />
              <VitalCard label="BLOOD_PRESSURE" value={data?.sensor_data ? `${Math.round(data.sensor_data.Systolic_BP)}/${Math.round(data.sensor_data.Diastolic_BP)}` : null} unit="MMHG" />
              <VitalCard label="CORE_TEMP" value={data?.sensor_data?.Body_Temp ? data.sensor_data.Body_Temp.toFixed(1) : "---"} unit="°C" />
            </motion.div>
            
            {/* 2-Column Mini Graphs */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-ink border-b-2 border-ink h-40">
              <div className="bg-white p-3 flex flex-col group"><div className="text-[11px] font-bold text-slate tracking-widest mb-2 group-hover:text-hazard transition-colors">HR_STREAM</div><div className="flex-1 min-h-0 relative"><TelemetryGraph stream={stream.hr} min={60} max={150} color="var(--color-ink)" fill="rgba(5,5,5,0.05)" /></div></div>
              <div className="bg-white p-3 flex flex-col group"><div className="text-[11px] font-bold text-slate tracking-widest mb-2 group-hover:text-hazard transition-colors">TEMP_STREAM</div><div className="flex-1 min-h-0 relative"><TelemetryGraph stream={stream.temp} min={36.0} max={39.0} color="var(--color-ink)" fill="rgba(5,5,5,0.05)" /></div></div>
            </motion.div>

            {/* Diagnostic Probabilities */}
            <motion.div variants={fadeUp} className="bg-white flex flex-col min-h-70">
              <div className="border-b-2 border-ink p-3 px-6 flex justify-between items-center bg-canvas-cream">
                <h2 className="text-[12px] font-bold tracking-widest uppercase">{'< DIAGNOSTIC_PROBABILITIES >'}</h2>
                <div className="text-[11px] font-bold tracking-wider text-hazard uppercase">CLASS / LIKELIHOOD</div>
              </div>
              <div className="grow p-6 bg-white flex flex-col justify-center gap-6">
                {data?.prediction?.disease_probs ? (
                   Object.entries(data.prediction.disease_probs)
                     .sort((a, b) => (b[1] as number) - (a[1] as number))
                     .map(([disease, prob], i) => {
                        const pct = ((prob as number) * 100).toFixed(1);
                        const isRisk = (prob as number) > 0.4 && disease.toLowerCase() !== 'normal' && disease.toLowerCase() !== 'healthy';
                        return (
                          <motion.div 
                            key={disease} 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: i * 0.1, ease: easeFluid }}
                            className="flex flex-col gap-2"
                          >
                            <div className="flex justify-between text-[12px] font-bold uppercase tracking-widest">
                               <span className={isRisk ? "text-hazard drop-shadow-[0_0_2px_rgba(230,25,25,0.5)]" : "text-ink"}>{disease}</span>
                               <span className="tabular-nums">{pct}%</span>
                            </div>
                            <div className="h-6 bg-canvas-cream border-2 border-ink overflow-hidden relative">
                              {/* Blueprint tick marks */}
                              <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: 'linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)', backgroundSize: '10% 100%' }}></div>
                              <motion.div 
                                className={`h-full relative z-10 ${isRisk ? 'bg-hazard shadow-[0_0_8px_var(--hazard-red)]' : 'bg-ink'}`}
                                initial={{ width: "0%" }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.8, ease: easeFluid }}
                              />
                            </div>
                          </motion.div>
                        )
                     })
                ) : (
                  <div className="h-full flex items-center justify-center text-[12px] font-bold text-slate tracking-widest animate-pulse">
                    AWAITING CLASSIFICATION DATA...
                  </div>
                )}
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </motion.div>
    </main>
  );
}

function VitalCard({ label, value, unit }: { label: string, value: string | number | null | undefined, unit: string }) {
  return (
    <motion.div variants={fadeUp} className="bg-canvas-cream p-8 flex flex-col hover:bg-white transition-colors cursor-default overflow-hidden group">
      <div className="text-[11px] font-bold text-slate tracking-widest border-b border-ink/20 pb-2 mb-4 group-hover:text-hazard transition-colors">
        {label}
      </div>
      <div>
        <motion.div 
          key={String(value)}
          initial={{ opacity: 0.5, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-sans text-[clamp(40px,3.5vw,60px)] font-black tracking-tighter tabular-nums leading-none mb-1 break-all"
        >
          {value !== null && value !== undefined ? value : "---"}
        </motion.div>
        <div className="text-[12px] font-bold tracking-wider text-hazard">
          [{unit}]
        </div>
      </div>
    </motion.div>
  );
}

function TelemetryGraph({ stream, min, max, color, fill }: { stream: number[], min: number, max: number, color: string, fill: string }) {
  const range = max - min;
  
  const points = stream.map((val, i) => {
    const x = (i / (stream.length - 1)) * 100;
    const y = Math.max(0, Math.min(100, 100 - (((val - min) / range) * 100)));
    return `${x},${y}`;
  });

  const firstY = points[0] ? points[0].split(',')[1] : 100;
  const pathD = `M 0,100 L 0,${firstY} L ${points.join(" L ")} L 100,100 Z`;
  const lineD = `M 0,${firstY} L ${points.join(" L ")}`;
  const lastPoint = points[points.length - 1];
  const lastY = lastPoint ? lastPoint.split(',')[1] : 100;

  return (
    <div className="w-full h-full relative inset-0 border-2 border-ink overflow-hidden bg-white group ">
      {/* Blueprint Grid lines */}
      <div className="relative inset-0 z-0 opacity-[0.1]" style={{ backgroundImage: 'linear-gradient(var(--ink-black) 1px, transparent 1px), linear-gradient(90deg, var(--ink-black) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {/* Signal trace */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <svg className="w-full h-full block" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Fill Area */}
          <path 
            d={pathD} 
            fill={fill} 
            className="transition-all duration-300 ease-linear"
          />
          {/* Stroke Line (Glow) */}
          <path 
            d={lineD} 
            fill="none" 
            stroke={color} 
            strokeWidth="1.5" 
            vectorEffect="non-scaling-stroke"
            className="transition-all duration-300 ease-linear"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          {/* Leading Dot */}
          <circle 
            cx="100" 
            cy={lastY} 
            r="1.5" 
            fill={color} 
            className="transition-all duration-300 ease-linear"
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
        </svg>
      </div>

      {/* Sweeping Radar Line */}
      <motion.div 
        className="relative top-0 bottom-0 w-0.5 z-20 opacity-40 pointer-events-none"
        style={{ backgroundColor: color, boxShadow: `0 0 12px 2px ${color}` }}
        initial={{ left: "0%" }}
        animate={{ left: "100%" }}
        transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
      />
      
      {/* Terminal Scanline Overlay */}
      <div className="relative inset-0 pointer-events-none z-30 opacity-40 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-size-[100%_4px]"></div>
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

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

const BlueprintNode = ({ title, desc, pulse = false }: { title: string, desc: string, pulse?: boolean }) => (
  <motion.div 
    whileHover={{ x: 5 }}
    className="border border-slate/30 bg-ink/50 p-4 relative group hover:border-hazard transition-colors cursor-default"
  >
    {pulse && (
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 2, 1], opacity: [0.8, 0, 0.8] }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-3 h-3 bg-hazard rounded-full"
        />
        <div className="w-1.5 h-1.5 bg-hazard rounded-full relative z-10" />
      </div>
    )}
    <div className="text-[10px] text-slate tracking-[0.1em] mb-1 uppercase">{desc}</div>
    <div className="text-[14px] text-white font-bold tracking-tight uppercase">{title}</div>
  </motion.div>
);

export default function Architecture() {
  return (
    <main className="min-h-[100dvh] bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16 overflow-x-hidden">
      <motion.div 
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-[1200px] mx-auto w-full px-4 md:px-8 py-8 md:py-16 flex-1 flex flex-col"
      >
        <motion.header variants={fadeUp} className="mb-8 md:mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-4">
              /// DOCS_AND_SPECS
            </div>
            <h1 className="text-[clamp(2.5rem,6vw,6rem)] leading-tight">
              SYSTEM<br />ARCHITECTURE
            </h1>
          </div>
        </motion.header>

        {/* Live Hardware Blueprint */}
        <motion.div variants={fadeUp} className="w-full bg-ink p-8 md:p-12 mb-16 relative font-mono overflow-hidden border-2 border-ink shadow-[8px_8px_0px_0px_rgba(242,56,39,1)]">
          {/* Animated Scanning Line */}
          <motion.div 
            animate={{ top: ["-10%", "110%"] }}
            transition={{ duration: 8, ease: "linear", repeat: Infinity }}
            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-hazard/10 to-transparent pointer-events-none z-0"
          />
          
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 lg:gap-16 items-stretch">
            
            {/* Stage 1: Ingestion */}
            <div className="flex-1 flex flex-col gap-6 border-l-2 border-slate/30 pl-6 relative">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-hazard" />
              <div className="text-[10px] text-hazard tracking-[0.2em] font-bold">PHASE_01 // INGESTION</div>
              <BlueprintNode title="PATIENT SENSORS" desc="60Hz Telemetry Stream" pulse />
              <BlueprintNode title="CLIENT UI" desc="Next.js 16 / React 19" />
              <BlueprintNode title="CSV BATCH" desc="Offline Dataset Upload" />
            </div>

            {/* Stage 2: Processing */}
            <div className="flex-1 flex flex-col gap-6 border-l-2 border-slate/30 pl-6 relative">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-hazard" />
              <div className="text-[10px] text-hazard tracking-[0.2em] font-bold">PHASE_02 // CORE_ROUTER</div>
              <BlueprintNode title="FASTAPI SERVER" desc="Async WebSockets & REST" pulse />
              <BlueprintNode title="SQLITE DB" desc="Aiosqlite Async Storage" />
            </div>

            {/* Stage 3: Inference & Compilation */}
            <div className="flex-1 flex flex-col gap-6 border-l-2 border-slate/30 pl-6 relative">
              <div className="absolute -left-[5px] top-0 w-2 h-2 bg-hazard" />
              <div className="text-[10px] text-hazard tracking-[0.2em] font-bold">PHASE_03 // EDGE_INTELLIGENCE</div>
              <BlueprintNode title="SCIKIT-LEARN" desc="Soft-Voting Ensemble" pulse />
              <BlueprintNode title="AST COMPILER" desc="Python to C Transpiler" />
              <BlueprintNode title="ESP32 HARDWARE" desc="Zero-Dep C Firmware" pulse />
            </div>

          </div>
        </motion.div>

        {/* Detailed Specifications */}
        <motion.div variants={staggerContainer} initial="hidden" animate="show" className="w-full flex flex-col gap-8">
          
          <motion.div variants={fadeUp} className="border-t-4 border-ink pt-8">
            <h2 className="text-[20px] md:text-[24px] font-sans font-black tracking-[-0.02em] uppercase text-ink mb-6">
              [ SPEC_01 ] Data Sanitization & Feature Engineering
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border-2 border-ink p-6">
                <h3 className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-4 uppercase">/// Pipeline_Execution</h3>
                <p className="text-[13px] md:text-[14px] text-slate leading-relaxed uppercase mb-4">
                  Raw telemetry is hostile. The ingestion script aggressively drops redundant alert flags to prevent target-leakage. Broken unicode encodings from edge sensors are patched on the fly.
                </p>
                <div className="font-mono text-[10px] md:text-[11px] bg-ink text-canvas-cream p-4 border-l-4 border-hazard">
                  <span className="text-slate">01</span> DROP: 'Heart Rate Alert', 'Patient Number'<br/>
                  <span className="text-slate">02</span> PATCH: '\ufffd' -&gt; '°'<br/>
                  <span className="text-slate">03</span> ENCODE: LabelEncoder(Predicted Disease)
                </div>
              </div>
              <div className="bg-white border-2 border-ink p-6">
                <h3 className="text-[12px] text-hazard font-bold tracking-[0.1em] mb-4 uppercase">/// Feature_Synthesis</h3>
                <p className="text-[13px] md:text-[14px] text-slate leading-relaxed uppercase mb-4">
                  Missing sensor drops are repaired using a fitted <code className="bg-canvas-cream px-1 text-ink">SimpleImputer(mean)</code>. We inject a non-linear hint directly into the AST: <code className="bg-canvas-cream px-1 text-ink">Risk_Severity</code>. All floats are strictly normalized via <code className="bg-canvas-cream px-1 text-ink">StandardScaler</code>.
                </p>
                <div className="font-mono text-[10px] md:text-[11px] bg-ink text-canvas-cream p-4 border-l-4 border-hazard">
                  Risk_Severity = (HR &gt; 105) + (SpO2 &lt; 94)<br/>
                  Imputer.fit_transform(continuous_features)<br/>
                  Scaler.fit_transform(continuous_features)
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="border-t-4 border-ink pt-8">
            <h2 className="text-[20px] md:text-[24px] font-sans font-black tracking-[-0.02em] uppercase text-ink mb-6">
              [ SPEC_02 ] Soft-Voting Ensemble & MLOps
            </h2>
            <div className="bg-white border-2 border-ink p-6">
              <p className="text-[13px] md:text-[14px] text-slate leading-relaxed uppercase mb-6 max-w-3xl">
                Single-model inference is clinically insufficient. HeartFlow_OS aggregates probability distributions from 5 disparate algorithms: <strong>KNN, SVM, LogReg, Random Forest, and a Neural Network (MLP)</strong>. 
                <br/><br/>
                When a clinician uploads a new batch dataset, the API spawns a background thread. It retrains all 5 models, calculates the weighted F1-Score against a 20% holdout, and checks <code className="bg-canvas-cream px-1 text-ink">registry.json</code>. If the new score degrades, the batch is destroyed. If it improves, the active `.pkl` weights are hot-swapped globally without dropping WebSocket streams.
              </p>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-start text-[12px] font-bold">
                <div className="bg-ink text-white px-4 py-2">F1 SCORE &gt; ACTIVE_V1</div>
                <div className="text-ink">━━▶</div>
                <div className="bg-hazard text-white px-4 py-2 border-2 border-hazard shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">HOT_SWAP_MODELS()</div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </motion.div>
    </main>
  );
}

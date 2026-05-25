"use client";

import { motion } from "framer-motion";

const easeFluid: [number, number, number, number] = [0.16, 1, 0.3, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeFluid } }
};

export default function Architecture() {
  return (
    <main className="min-h-[100dvh] bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white pb-16 overflow-x-hidden">
      
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-8 py-16 flex-1 flex flex-col">
        
        {/* HEADER BLOCK */}
        <motion.header 
          initial="hidden" animate="show" variants={fadeUp}
          className="mb-16 border-b-2 border-ink pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-8"
        >
          <div>
            <div className="text-[10px] text-hazard font-bold tracking-[0.2em] mb-4 uppercase flex items-center gap-4">
              <span className="w-2 h-2 bg-hazard animate-pulse" />
              SYSTEM_ARCHITECTURE // DECLASSIFIED
            </div>
            <h1 className="text-[clamp(3rem,8vw,8rem)] leading-[0.85] font-sans font-black tracking-[-0.04em] uppercase text-ink">
              PIPELINE<br />TOPOLOGY
            </h1>
          </div>
          <div className="text-[12px] text-slate font-bold tracking-[0.1em] uppercase text-right max-w-xs">
            REF: HFL-OS-ARCH-01<br/>
            REV: 2.6.4<br/>
            STATUS: ACTIVE
          </div>
        </motion.header>

        {/* BLUEPRINT GRID */}
        <motion.div 
          initial="hidden" animate="show" variants={fadeUp}
          className="w-full bg-ink grid grid-cols-1 md:grid-cols-3 gap-[2px] p-[2px] mb-16 shadow-[16px_16px_0px_0px_rgba(230,25,25,1)]"
        >
          {/* COLUMN 1 */}
          <div className="bg-canvas-cream flex flex-col justify-between p-8 relative group">
            <div className="absolute top-2 left-2 text-ink/30 text-[10px]">+</div>
            <div className="absolute top-2 right-2 text-ink/30 text-[10px]">+</div>
            <div className="absolute bottom-2 left-2 text-ink/30 text-[10px]">+</div>
            <div className="absolute bottom-2 right-2 text-ink/30 text-[10px]">+</div>
            
            <div className="text-[10px] text-hazard tracking-[0.2em] font-bold mb-8">PHASE_01 // INGESTION</div>
            <div className="flex flex-col gap-12">
              <div>
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ PATIENT SENSORS ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">60Hz Telemetry Stream via WebSockets</p>
              </div>
              <div>
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ CSV BATCH ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">Offline Dataset Upload for MLOps</p>
              </div>
              <div>
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ CLIENT UI ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">React 19 / Next.js 16 Edge Render</p>
              </div>
            </div>
            <div className="mt-16 text-[10px] text-slate uppercase border-t border-slate/30 pt-4">INPUT_VECTORS &gt;&gt;&gt;</div>
          </div>

          {/* COLUMN 2 */}
          <div className="bg-canvas-cream flex flex-col justify-between p-8 relative group">
            <div className="text-[10px] text-hazard tracking-[0.2em] font-bold mb-8">PHASE_02 // CORE_ROUTER</div>
            <div className="flex flex-col gap-12">
              <div>
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ FASTAPI SERVER ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">Async Uvicorn Router & REST API</p>
              </div>
              <div className="border-l-4 border-hazard pl-4">
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ SQLITE DB ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">Aiosqlite Non-Blocking Storage</p>
              </div>
            </div>
            <div className="mt-16 text-[10px] text-slate uppercase border-t border-slate/30 pt-4">PROCESSING_BUS &gt;&gt;&gt;</div>
          </div>

          {/* COLUMN 3 */}
          <div className="bg-canvas-cream flex flex-col justify-between p-8 relative group">
            <div className="text-[10px] text-hazard tracking-[0.2em] font-bold mb-8">PHASE_03 // EDGE_INTELLIGENCE</div>
            <div className="flex flex-col gap-12">
              <div>
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ SCIKIT-LEARN ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">Soft-Voting 5-Model Ensemble</p>
              </div>
              <div>
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ AST COMPILER ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">Python-to-C Zero-Dep Transpiler</p>
              </div>
              <div>
                <h3 className="font-sans text-[24px] font-black uppercase text-ink tracking-tight mb-2 group-hover:text-hazard transition-colors">[ ESP32 HARDWARE ]</h3>
                <p className="text-[12px] text-slate uppercase leading-tight">PlatformIO INT8 Quantized Firmware</p>
              </div>
            </div>
            <div className="mt-16 text-[10px] text-slate uppercase border-t border-slate/30 pt-4">TARGET_OUTPUT ///</div>
          </div>
        </motion.div>

        {/* SPECIFICATIONS */}
        <motion.div initial="hidden" animate="show" variants={fadeUp} className="w-full flex flex-col gap-16">
          
          {/* SPEC 1 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="text-[10px] text-hazard font-bold tracking-[0.15em] mb-2 uppercase">SPEC_01</div>
              <h2 className="text-[24px] font-sans font-black tracking-[-0.02em] uppercase text-ink leading-tight">DATA SANITIZATION & FEATURES</h2>
            </div>
            <div className="md:col-span-3 bg-ink p-[2px]">
              <div className="bg-canvas-cream grid grid-cols-1 md:grid-cols-2 h-full gap-[2px] bg-ink">
                
                <div className="bg-canvas-cream p-8">
                  <h3 className="text-[12px] font-bold text-ink tracking-[0.1em] mb-4 uppercase border-b-2 border-ink pb-2">/// Pipeline_Execution</h3>
                  <p className="text-[13px] text-slate leading-relaxed uppercase mb-6">
                    Raw telemetry is hostile. The ingestion script aggressively drops redundant alert flags to prevent target-leakage. Broken unicode encodings from edge sensors are patched on the fly.
                  </p>
                  <pre className="text-[10px] bg-ink text-canvas-cream p-4 uppercase overflow-hidden leading-loose">
                    <span className="text-hazard">01</span> DROP: 'Heart Rate Alert'<br/>
                    <span className="text-hazard">02</span> PATCH: '\ufffd' -&gt; '°'<br/>
                    <span className="text-hazard">03</span> ENCODE: LabelEncoder(Disease)
                  </pre>
                </div>
                
                <div className="bg-canvas-cream p-8">
                  <h3 className="text-[12px] font-bold text-ink tracking-[0.1em] mb-4 uppercase border-b-2 border-ink pb-2">/// Feature_Synthesis</h3>
                  <p className="text-[13px] text-slate leading-relaxed uppercase mb-6">
                    Missing sensor drops are repaired using a fitted <code className="bg-ink text-white px-1">SimpleImputer</code>. We inject a non-linear hint directly into the AST: <code className="bg-ink text-white px-1">Risk_Severity</code>. All floats are strictly normalized.
                  </p>
                  <pre className="text-[10px] bg-ink text-canvas-cream p-4 uppercase overflow-hidden leading-loose">
                    <span className="text-hazard">&gt;</span> Risk_Sev = (HR&gt;105) + (SpO2&lt;94)<br/>
                    <span className="text-hazard">&gt;</span> Imputer.fit_transform(features)<br/>
                    <span className="text-hazard">&gt;</span> Scaler.fit_transform(features)
                  </pre>
                </div>

              </div>
            </div>
          </div>

          {/* SPEC 2 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-1">
              <div className="text-[10px] text-hazard font-bold tracking-[0.15em] mb-2 uppercase">SPEC_02</div>
              <h2 className="text-[24px] font-sans font-black tracking-[-0.02em] uppercase text-ink leading-tight">ENSEMBLE & AUTOMATED MLOPS</h2>
            </div>
            <div className="md:col-span-3 bg-white border-4 border-ink p-8 relative">
              <div className="absolute top-0 right-8 w-8 h-full bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(230,25,25,0.1)_4px,rgba(230,25,25,0.1)_8px)]" />
              <p className="text-[14px] text-slate leading-relaxed uppercase mb-8 max-w-2xl relative z-10">
                Single-model inference is clinically insufficient. HeartFlow_OS aggregates probability distributions from 5 disparate algorithms: <strong>KNN, SVM, LogReg, Random Forest, and a Neural Network (MLP)</strong>. 
                <br/><br/>
                When a clinician uploads a new batch dataset, the API spawns a background thread. It retrains all 5 models, calculates the weighted F1-Score against a 20% holdout, and checks <code className="bg-ink text-white px-1">registry.json</code>. If the new score degrades, the batch is destroyed. If it improves, the active `.pkl` weights are hot-swapped globally without dropping WebSocket streams.
              </p>
              
              <div className="inline-flex flex-col md:flex-row border-2 border-ink bg-ink gap-[2px] relative z-10">
                <div className="bg-canvas-cream text-ink px-6 py-4 font-bold text-[12px] flex items-center justify-center">
                  F1 SCORE &gt; ACTIVE_V1
                </div>
                <div className="bg-hazard text-white px-6 py-4 font-bold text-[12px] flex items-center justify-center">
                  HOT_SWAP_MODELS()
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </main>
  );
}

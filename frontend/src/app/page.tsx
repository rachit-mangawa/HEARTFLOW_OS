"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Home() {
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

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white">
      {/* Hero Section */}
      <section className="max-w-350 mx-auto w-full px-8 pt-16 md:pt-32 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 flex-1 overflow-hidden">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="lg:col-span-7 flex flex-col justify-center"
        >
          <motion.div variants={fadeUp} className="text-[12px] text-hazard font-bold tracking-widest mb-6 flex items-center gap-4">
            <span>/// MODEL_V2.4 </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1, ease: easeFluid, delay: 0.4 }}
              className="w-12 h-px bg-hazard origin-left"
            ></motion.span>
            <span>INT8_QUANTIZED</span>
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-[clamp(3rem,8vw,8rem)] mb-8 leading-tight">
            CLINICAL<br />
            INFERENCE<br />
            <span className="text-hazard">AT THE EDGE.</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-[14px] md:text-[16px] text-ink max-w-lg leading-relaxed uppercase tracking-[0.02em] font-bold border-l-4 border-hazard pl-6 mb-12">
            An ensemble intelligence pipeline engineered for resource-constrained microcontrollers. Deploy robust cardiovascular telemetry analysis directly to the silicon.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="block w-full md:w-auto">
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: "var(--color-hazard)", borderColor: "var(--color-hazard)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="inline-flex items-center justify-center h-12 px-8 bg-ink text-white text-[14px] font-bold uppercase tracking-widest border-2 border-ink w-full"
              >
                [ INITIATE_STREAM ]
              </motion.div>
            </Link>
            <Link href="/edge" className="block w-full md:w-auto mt-2 md:mt-0">
              <motion.div
                whileHover={{ scale: 1.02, backgroundColor: "var(--color-ink)", color: "var(--color-canvas-cream)" }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="inline-flex items-center justify-center h-12 px-8 bg-transparent text-ink text-[14px] font-bold uppercase tracking-widest border-2 border-ink w-full"
              >
                C_COMPILER &gt;&gt;
              </motion.div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="lg:col-span-5 grid grid-cols-1 gap-px bg-ink border-2 border-ink mt-8 lg:mt-0"
        >
          <motion.div variants={fadeUp} className="bg-white p-8 flex flex-col justify-between group cursor-default">
            <div className="text-[10px] text-slate font-bold tracking-[0.15em] mb-4 group-hover:text-hazard transition-colors duration-300">FEAT.01</div>
            <div>
              <h3 className="font-sans text-[20px] md:text-[24px] font-black uppercase tracking-[-0.02em] mb-2 text-ink">
                INT8 Quantization
              </h3>
              <p className="text-[12px] md:text-[13px] text-slate leading-relaxed uppercase">
                Weights scaled to 8-bit integers. 75% payload reduction for ESP32 constraint matrices.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-canvas-cream p-8 flex flex-col justify-between group cursor-default">
            <div className="text-[10px] text-slate font-bold tracking-[0.15em] mb-4 group-hover:text-hazard transition-colors duration-300">FEAT.02</div>
            <div>
              <h3 className="font-sans text-[20px] md:text-[24px] font-black uppercase tracking-[-0.02em] mb-2 text-ink">
                Ensemble Architecture
              </h3>
              <p className="text-[12px] md:text-[13px] text-slate leading-relaxed uppercase">
                RF, KNN, and SVM combined with a meta-classifier for clinical-grade precision.
              </p>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="bg-white p-8 flex flex-col justify-between group cursor-default">
            <div className="text-[10px] text-slate font-bold tracking-[0.15em] mb-4 group-hover:text-hazard transition-colors duration-300">FEAT.03</div>
            <div>
              <h3 className="font-sans text-[20px] md:text-[24px] font-black uppercase tracking-[-0.02em] mb-2 text-ink">
                Zero-Dep Export
              </h3>
              <p className="text-[12px] md:text-[13px] text-slate leading-relaxed uppercase">
                Compile trained models directly to standalone C headers. Zero dynamic allocation.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

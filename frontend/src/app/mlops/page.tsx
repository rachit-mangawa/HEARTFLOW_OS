"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

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

export default function MLOps() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000") + "/retrain", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.error) {
        setStatus("error");
        setMessage(data.error);
      } else {
        setStatus("success");
        setMessage(data.message);
      }
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Upload failed");
    }
  };

  return (
    <main className="min-h-dvh bg-canvas-cream flex flex-col font-mono selection:bg-hazard selection:text-white">
      {/* Top Nav (Mechanical) */}

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="max-w-250 mx-auto w-full px-8 py-16 flex-1 flex flex-col"
      >
        <motion.header variants={fadeUp} className="mb-12 border-b-4 border-ink pb-8 flex justify-between items-end">
          <div>
            <div className="text-[12px] text-hazard font-bold tracking-widest mb-4">
              /// PIPELINE_CONTROL
            </div>
            <h1 className="text-[clamp(3rem,6vw,6rem)]">
              MODEL<br />OPERATIONS
            </h1>
          </div>
        </motion.header>

        <motion.div variants={fadeUp} className="border-2 border-ink bg-white p-8">
          <div className="border-b-2 border-ink pb-4 mb-8">
            <h2 className="text-[16px] font-bold tracking-wider uppercase text-ink">{'< BATCH_RETRAIN >'}</h2>
            <p className="text-[13px] text-slate uppercase mt-2">Append telemetry data and rebuild the edge ensemble.</p>
          </div>

          <div className="flex flex-col gap-6">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-ink bg-canvas-cream hover:bg-hazard hover:text-white transition-colors cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(45deg,var(--ink-black)_25%,transparent_25%,transparent_50%,var(--ink-black)_50%,var(--ink-black)_75%,transparent_75%,transparent)] bg-size-[20px_20px]" />
              <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={file ? 'selected' : 'unselected'}
                  className="text-[24px] font-bold mb-4 group-hover:text-white"
                >
                  {file ? '[ FILE_SELECTED ]' : '[ SELECT_CSV ]'}
                </motion.div>
                <p className="mb-2 text-[14px] font-bold uppercase">
                  {file ? file.name : "CLICK TO UPLOAD DATASET"}
                </p>
                <p className="text-[12px] uppercase opacity-70">REQUIRES MATCHING SCHEMA</p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                className="sr-only"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                aria-label="Upload CSV Dataset"
              />
            </label>

            <div className="flex justify-between items-center border-t-2 border-ink pt-6 mt-2" aria-live="polite">
              <motion.div
                key={status}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[13px] font-bold uppercase tracking-wider"
              >
                {status === "uploading" && <span className="text-slate">PROCESSING...</span>}
                {status === "error" && <span className="text-hazard">ERR: {message}</span>}
                {status === "success" && <span className="text-ink bg-canvas-cream px-2 py-1 border border-ink">SYS: {message}</span>}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "var(--color-hazard)", borderColor: "var(--color-hazard)" }}
                whileTap={{ scale: 0.98 }}
                onClick={handleUpload}
                disabled={!file || status === "uploading"}
                className="inline-flex items-center justify-center h-12 px-8 bg-ink text-white text-[14px] font-bold uppercase tracking-widest border-2 border-ink disabled:opacity-50 disabled:pointer-events-none"
              >
                EXECUTE &gt;&gt;
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[50vh] bg-canvas-cream font-mono">
      <div className="flex flex-col items-center gap-4 border-2 border-ink bg-white p-8 shadow-[3px_3px_0px_#141413]">
        <div className="w-8 h-8 border-3 border-ink border-t-hazard animate-spin rounded-full" />
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-[12px] font-black uppercase tracking-wider text-ink">
            INITIALIZING TELEMETRY STREAM
          </span>
          <span className="text-[10px] font-bold text-slate uppercase tracking-widest">
            Compiling Edge Memory Segments...
          </span>
        </div>
      </div>
    </div>
  );
}


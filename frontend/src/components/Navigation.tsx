"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Activity, Clock } from "lucide-react";

const NAV_LINKS = [
  { href: "/monitor", label: "MONITOR" },
  { href: "/simulator", label: "SIMULATOR" },
  { href: "/history", label: "HISTORY" },
  { href: "/analytics", label: "DATASET" },
  { href: "/mlops", label: "MLOPS" },
  { href: "/edge", label: "COMPILER" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [clock, setClock] = useState<string>("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setClock(`${h}:${m}:${s}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="w-full border-b-2 border-ink bg-canvas-cream sticky top-0 z-50">
      <div className="max-w-350 mx-auto px-4 sm:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="font-sans text-[17px] sm:text-[18px] font-black tracking-[-0.04em] uppercase text-ink hover:text-hazard transition-colors flex items-center gap-2 group"
          >
            <span className="inline-block w-2.5 h-2.5 bg-hazard" />
            <span>HEARTFLOW_OS</span>
          </Link>

          {/* System Telemetry Pill (Desktop) */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 bg-white border border-ink/40 text-[11px] font-mono font-bold tracking-wider uppercase text-slate">
            <Activity size={12} className="text-hazard" />
            <span>STREAM: ACTIVE</span>
            <span className="text-ink/30">|</span>
            <span className="flex items-center gap-1 text-ink tabular-nums">
              <Clock size={11} className="text-slate" />
              {clock || "READY"}
            </span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-2 text-[11px] lg:text-[12px] font-bold tracking-wider uppercase">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2.5 py-1 transition-all ${
                  isActive
                    ? "bg-ink text-canvas-cream shadow-[2px_2px_0px_#9F2F2D] font-black"
                    : "text-ink hover:text-hazard hover:bg-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex md:hidden items-center gap-2">
          {clock && (
            <span className="text-[10px] font-mono font-bold tabular-nums text-slate bg-white px-2 py-1 border border-ink/40">
              {clock}
            </span>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="px-3 py-1 border-2 border-ink bg-white text-ink text-[11px] font-bold tracking-widest uppercase hover:bg-ink hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? "CLOSE" : "MENU"}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-ink bg-white p-4 flex flex-col gap-2 shadow-[0_4px_0_0_#141413]">
          <div className="text-[10px] font-bold tracking-widest text-slate uppercase px-2 pb-1 border-b border-ink/20 flex justify-between">
            <span>NAVIGATION</span>
            <span className="text-hazard">{NAV_LINKS.length} ROUTES</span>
          </div>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 text-[12px] font-bold tracking-wider uppercase flex justify-between items-center transition-colors ${
                  isActive
                    ? "bg-ink text-white font-black"
                    : "text-ink hover:bg-canvas-cream hover:text-hazard"
                }`}
              >
                <span>{link.label}</span>
                {isActive && <span className="text-hazard text-[10px]">● ACTIVE</span>}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

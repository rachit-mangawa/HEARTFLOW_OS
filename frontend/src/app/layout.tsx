import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/context/TelemetryContext";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

import Link from "next/link";

export const metadata: Metadata = {
  title: "TinyML Heart Health",
  description: "Cardiovascular monitoring dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-mono selection:bg-hazard selection:text-white bg-canvas-cream">
        <TelemetryProvider>
          {/* Universal Nav */}
          <nav className="flex items-center px-4 md:px-8 py-4 border-b-2 border-ink bg-canvas-cream sticky top-0 z-50 overflow-x-auto">
            <div className="max-w-[1400px] mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
              <Link href="/" className="font-sans text-[18px] font-black tracking-[-0.04em] uppercase hover:text-hazard transition-colors">
                [ HEARTFLOW_OS ]
              </Link>
              <div className="flex gap-4 md:gap-8 items-center text-[12px] md:text-[13px] font-bold tracking-[0.05em] uppercase flex-wrap justify-center">
                <Link href="/dashboard" className="text-ink hover:text-hazard transition-colors">SYS.MONITOR</Link>
                <Link href="/simulator" className="text-ink hover:text-hazard transition-colors">AI.SIMULATOR</Link>
                <Link href="/history" className="text-ink hover:text-hazard transition-colors">DATA.LOG</Link>
                <Link href="/mlops" className="text-ink hover:text-hazard transition-colors">ML.OPS</Link>
                <Link href="/edge" className="text-ink hover:text-hazard transition-colors">EDGE.COMPILER</Link>
              </div>
            </div>
          </nav>
          
          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </TelemetryProvider>
        
        {/* Universal Footer */}
        <footer className="w-full border-t-2 border-ink bg-white py-6 px-8 mt-auto z-50">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink text-center md:text-left">
              © 2026 HEARTFLOW_OS. TELEMETRY_SYS.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <a href="https://huggingface.co/spaces/IDKHowToCodeFR/HEARTFLOW_OS" target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">HUGGING_FACE</a>
              <a href="https://heartflow-os.vercel.app" target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">LIVE_APP</a>
              <Link href="/architecture" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">ARCHITECTURE.MD</Link>
              <a href={`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/docs`} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">API_DOCS</a>
              <a href="https://github.com/IDKHowToCodeFR/HEARTFLOW_OS" target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-[0.05em] uppercase text-ink hover:text-hazard transition-colors">GITHUB_REPO</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

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

import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "HEARTFLOW_OS",
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
          <Navigation />

          <div className="flex-1 flex flex-col">
            {children}
          </div>
        </TelemetryProvider>

        {/* Universal Footer */}
        <footer className="w-full border-t-2 border-ink bg-white py-6 px-4 sm:px-8 mt-auto z-50">
          <div className="max-w-350 mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-[12px] font-bold tracking-wider uppercase text-ink text-center md:text-left">
              © 2026 HEARTFLOW_OS. TELEMETRY_SYS.
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <Link href="/architecture" className="text-[12px] font-bold tracking-wider uppercase text-ink hover:text-hazard transition-colors">ARCHITECTURE</Link>
              <Link href="/docs" className="text-[12px] font-bold tracking-wider uppercase text-ink hover:text-hazard transition-colors">API_DOCS</Link>
              <a href="https://github.com/rachit-mangawa/HEARTFLOW_OS" target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold tracking-wider uppercase text-ink hover:text-hazard transition-colors">GITHUB_REPO</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

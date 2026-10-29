import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { TelemetryProvider } from "@/context/TelemetryContext";
import Link from "next/link";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#FBFBFA",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://heartflow.vercel.app"),
  title: {
    default: "HEARTFLOW_OS | Clinical Edge AI Telemetry",
    template: "%s | HEARTFLOW_OS",
  },
  description:
    "Real-time edge cardiovascular telemetry and TinyML anomaly classification transpiled for bare-metal microcontrollers (ESP32 / ARM Cortex-M).",
  keywords: [
    "TinyML",
    "Edge AI",
    "Cardiovascular Telemetry",
    "ESP32",
    "Inference",
    "Microcontroller",
    "Healthcare AI",
    "ECG",
    "Biomedical Engineering",
  ],
  authors: [{ name: "HEARTFLOW Systems" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://heartflow.vercel.app",
    title: "HEARTFLOW_OS | Clinical Edge AI Telemetry",
    description:
      "Real-time edge cardiovascular telemetry and TinyML anomaly classification transpiled for bare-metal microcontrollers.",
    siteName: "HEARTFLOW_OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "HEARTFLOW_OS | Clinical Edge AI Telemetry",
    description:
      "Real-time edge cardiovascular telemetry and TinyML anomaly classification transpiled for bare-metal microcontrollers.",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-mono selection:bg-hazard selection:text-white bg-canvas-cream">
        {/* Skip to Main Content Link for A11y */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100 focus:px-4 focus:py-2 focus:bg-hazard focus:text-white focus:font-bold focus:border-2 focus:border-ink focus:shadow-[2px_2px_0px_#141413]"
        >
          SKIP TO CONTENT [↵]
        </a>

        <TelemetryProvider>
          {/* Universal Nav */}
          <Navigation />

          <div id="main-content" className="flex-1 flex flex-col">
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

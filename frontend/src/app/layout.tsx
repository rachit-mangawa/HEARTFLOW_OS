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

const isGhPages = process.env.GITHUB_PAGES === "true" || process.env.NEXT_PUBLIC_DEPLOY_TARGET === "gh-pages";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGhPages ? "/HEARTFLOW_OS" : "");
const siteOrigin = process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://rachit-mangawa.github.io";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (basePath ? `${siteOrigin}${basePath}` : `${siteOrigin}/HEARTFLOW_OS`);
const iconUrl = basePath ? `${basePath}/icon.svg` : "/icon.svg";
const ogImageUrl = `${siteUrl}/og-image.png`;

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: {
    default: "HEARTFLOW_OS | Clinical Inference at the Edge",
    template: "%s | HEARTFLOW_OS",
  },
  description:
    "Continuous vital signs monitoring and cardiac anomaly detection compiled to deterministic C99 headers for microcontrollers.",
  keywords: [
    "TinyML",
    "Edge AI",
    "Cardiovascular Telemetry",
    "ESP32",
    "ARM Cortex-M",
    "Healthcare AI",
    "C99 Firmware",
    "Clinical Monitoring",
  ],
  authors: [{ name: "HEARTFLOW Systems" }],
  creator: "HEARTFLOW Systems",
  publisher: "HEARTFLOW Systems",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "HEARTFLOW_OS",
    title: "HEARTFLOW_OS | Clinical Inference at the Edge",
    description:
      "Continuous vital signs monitoring and cardiac anomaly detection compiled to deterministic C99 headers for microcontrollers.",
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: "HEARTFLOW_OS: Bare-metal microcontroller firmware for cardiac telemetry",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HEARTFLOW_OS | Clinical Inference at the Edge",
    description:
      "Continuous vital signs monitoring and cardiac anomaly detection compiled to deterministic C99 headers for microcontrollers.",
    images: [ogImageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: iconUrl, type: "image/svg+xml" },
    ],
    apple: [
      { url: iconUrl, type: "image/svg+xml" },
    ],
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
        <footer className="w-full border-t-2 border-ink bg-white py-6 px-4 sm:px-8 mt-auto relative z-10">
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

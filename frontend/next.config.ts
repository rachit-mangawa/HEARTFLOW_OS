import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // basePath: "/TinyML-Heart-Health-Monitoring-Dashboard", // Uncomment if hosted on a subpath in GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  }
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/HEARTFLOW_OS", // Uncomment if hosted on a subpath in GitHub Pages
  images: {
    unoptimized: true, // Required for static export
  }
};

export default nextConfig;

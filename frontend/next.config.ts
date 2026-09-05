import type { NextConfig } from "next";

const isGhPages = process.env.GITHUB_PAGES === "true" || process.env.NEXT_PUBLIC_DEPLOY_TARGET === "gh-pages";
const isStandalone = process.env.OUTPUT_STANDALONE === "true";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isGhPages ? "/HEARTFLOW_OS" : "");

const nextConfig: NextConfig = {
  output: isStandalone ? ("standalone" as const) : ("export" as const),
  basePath: basePath || undefined,
  images: {
    unoptimized: true,
  }
};

export default nextConfig;

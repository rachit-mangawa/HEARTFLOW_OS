import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_PAGES === "true" || process.env.NEXT_PUBLIC_DEPLOY_TARGET === "gh-pages" ? "/HEARTFLOW_OS" : "");
  return {
    name: "HEARTFLOW_OS · Edge Clinical Telemetry",
    short_name: "HEARTFLOW",
    description: "Real-time edge cardiovascular telemetry and TinyML anomaly classification.",
    start_url: basePath ? `${basePath}/` : "/",
    display: "standalone",
    background_color: "#FBFBFA",
    theme_color: "#FBFBFA",
    icons: [
      {
        src: `${basePath}/icon.svg`,
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

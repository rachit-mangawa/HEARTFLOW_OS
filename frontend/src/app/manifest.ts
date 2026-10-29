import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HEARTFLOW_OS · Edge Clinical Telemetry",
    short_name: "HEARTFLOW",
    description: "Real-time edge cardiovascular telemetry and TinyML anomaly classification.",
    start_url: "/",
    display: "standalone",
    background_color: "#FBFBFA",
    theme_color: "#FBFBFA",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}

import { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://heartflow.vercel.app";
  const now = new Date();

  const routes = [
    "",
    "/monitor",
    "/simulator",
    "/history",
    "/dataset",
    "/analytics",
    "/mlops",
    "/edge",
    "/docs",
    "/architecture",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route === "/monitor" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route === "/monitor" ? 0.9 : 0.8,
  }));
}

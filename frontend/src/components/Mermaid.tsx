"use client";

import React, { useEffect, useState } from "react";

export default function Mermaid({ chart }: { chart: string }) {
  const [svgContent, setSvgContent] = useState<string>("");

  useEffect(() => {
    const renderChart = async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          },
        });
        const { svg } = await mermaid.render("mermaid-svg-" + Math.random().toString(36).substring(7), chart);
        setSvgContent(svg);
      } catch (e) {
        console.error("Mermaid parsing error", e);
      }
    };
    renderChart();
  }, [chart]);

  return (
    <div 
      className="w-full overflow-x-auto p-8 bg-canvas-cream border-4 border-ink flex justify-center items-center [&_svg]:max-w-full [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svgContent }} 
    />
  );
}

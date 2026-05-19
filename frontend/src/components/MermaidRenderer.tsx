"use client";

import { useEffect, useRef, useState } from "react";
import { Copy, Check, Download, AlertTriangle, RefreshCw } from "lucide-react";

interface MermaidRendererProps {
  chart: string;
}

function sanitizeMermaidCode(code: string): string {
  let cleaned = code.trim();

  // 1. Strip out markdown code fences if present
  if (cleaned.startsWith("```mermaid")) {
    cleaned = cleaned.substring("```mermaid".length);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.substring("```".length);
  }
  
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  
  cleaned = cleaned.trim();

  // 2. Fix unquoted labels containing parentheses or spaces
  // Fix NodeID[Label (Text)] -> NodeID["Label (Text)"]
  cleaned = cleaned.replace(/([a-zA-Z0-9_-]+)\[([^"\]]+)\]/g, (match, nodeId, label) => {
    return `${nodeId}["${label.trim()}"]`;
  });

  // Fix NodeID(Label (Text)) -> NodeID("Label (Text)")
  cleaned = cleaned.replace(/([a-zA-Z0-9_-]+)\(([^"\)]+)\)/g, (match, nodeId, label) => {
    if (label.startsWith('(') && label.endsWith(')')) {
      return match;
    }
    return `${nodeId}("${label.trim()}")`;
  });

  // Fix NodeID{Label (Text)} -> NodeID{"Label (Text)"}
  cleaned = cleaned.replace(/([a-zA-Z0-9_-]+)\{([^"\}]+)\}/g, (match, nodeId, label) => {
    return `${nodeId}{"${label.trim()}"}`;
  });

  return cleaned;
}

export default function MermaidRenderer({ chart }: MermaidRendererProps) {
  const cleanedChart = sanitizeMermaidCode(chart);
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgCode, setSvgCode] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [renderKey, setRenderKey] = useState<number>(0);

  useEffect(() => {
    // Dynamic import to prevent SSR (Server Side Rendering) issues
    const renderChart = async () => {
      if (!containerRef.current || !cleanedChart) return;
      setError(false);
      setSvgCode(null);

      try {
        const mermaid = (await import("mermaid")).default;
        
        // Configure Mermaid with sage/teal/pearl theme variables
        mermaid.initialize({
          startOnLoad: false,
          theme: "default",
          themeVariables: {
            background: "#161514",
            primaryColor: "#1e1d1c",
            primaryTextColor: "#f6f3eb",
            primaryBorderColor: "#353330",
            lineColor: "#c5a281",
            secondaryColor: "#222120",
            tertiaryColor: "#161514",
          },
          securityLevel: "loose",
        });

        // Clean output container first
        containerRef.current.innerHTML = `<div class="mermaid">${cleanedChart}</div>`;
        
        // Trigger mermaid rendering engine
        await mermaid.run({
          nodes: containerRef.current.querySelectorAll(".mermaid")
        });

        // Extract the generated SVG code for downloading
        const svg = containerRef.current.querySelector("svg");
        if (svg) {
          svg.setAttribute("width", "100%");
          svg.setAttribute("height", "auto");
          setSvgCode(svg.outerHTML);
        }
      } catch (err) {
        console.error("Mermaid parsing failed:", err);
        setError(true);
      }
    };

    renderChart();
  }, [cleanedChart, renderKey]);

  const copyChartCode = () => {
    navigator.clipboard.writeText(cleanedChart);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadSVG = () => {
    if (!svgCode) return;
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `system-architecture-${Date.now()}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative w-full rounded-xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl p-4 overflow-hidden">
      {/* Control Actions bar */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#2c2b29]">
        <span className="text-xs text-[#8c867e] font-mono">Architecture Topology Model</span>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setRenderKey(k => k + 1)}
            title="Redraw diagram"
            className="p-2 rounded-lg bg-[#1e1d1c] hover:bg-[#2c2b29] text-[#8f8980] hover:text-[#f6f3eb] border border-[#2c2b29] transition-colors"
          >
            <RefreshCw className="h-4.5 w-4.5" />
          </button>
          <button
            onClick={copyChartCode}
            title="Copy Mermaid Code"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1e1d1c] hover:bg-[#2c2b29] text-[#8f8980] hover:text-[#f6f3eb] border border-[#2c2b29] text-xs font-medium transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#c5a281]" />
                <span className="text-[#c5a281]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#c5a281]" />
                <span>Copy Code</span>
              </>
            )}
          </button>
          <button
            onClick={downloadSVG}
            disabled={!svgCode}
            title="Download SVG Diagram"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-[#b28d68] to-[#c5a281] hover:from-[#c5a281] hover:to-[#d4bca3] disabled:opacity-40 text-white text-xs font-medium transition-all shadow-lg hover:shadow-[0_0_20px_rgba(197,162,129,0.35)]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download SVG</span>
          </button>
        </div>
      </div>

      {/* Render Area */}
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-[#161211] border border-red-900/30 rounded-xl space-y-3 shadow-xl">
          <AlertTriangle className="h-8 w-8 text-red-500 animate-bounce" />
          <div>
            <h4 className="font-bold text-red-400 text-sm">Mermaid Render Error</h4>
            <p className="text-xs text-red-300 max-w-md mt-1">
              The AI generated a complex topology that failed standard Mermaid syntax rules. You can still copy the raw code or view the microservices list in the next tabs.
            </p>
          </div>
          <button
            onClick={copyChartCode}
            className="text-xs px-3 py-1.5 rounded bg-[#1e1d1c] hover:bg-[#2c2b29] border border-[#2c2b29] text-[#8f8980] hover:text-[#f6f3eb] font-medium transition-colors"
          >
            Copy Raw Mermaid Syntax
          </button>
        </div>
      ) : (
        <div className="w-full flex justify-center py-6 overflow-x-auto min-h-[300px] items-center">
          <div ref={containerRef} className="w-full max-w-4xl flex justify-center" />
        </div>
      )}
    </div>
  );
}

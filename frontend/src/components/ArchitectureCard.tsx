"use client";

import { useState } from "react";
import { SystemDesign } from "@/lib/api";
import MermaidRenderer from "./MermaidRenderer";
import { 
  Network, 
  Server, 
  Database, 
  Settings2, 
  ShieldCheck, 
  TrendingUp, 
  Cpu, 
  Flame, 
  Activity, 
  Layers,
  Copy,
  Check,
  FileDown
} from "lucide-react";

interface ArchitectureCardProps {
  design: SystemDesign;
}

type TabType = "diagram" | "services" | "data" | "scaling" | "security";

export default function ArchitectureCard({ design }: ArchitectureCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>("diagram");
  const [copiedMd, setCopiedMd] = useState(false);

  const generateMarkdown = () => {
    let md = `# 🏗️ ${design.title}\n\n`;
    md += `## 📝 Executive Overview & Summary\n${design.overview}\n\n`;
    
    md += `## 🧬 Architecture Topology Diagram\n`;
    md += `\`\`\`mermaid\n${design.mermaid_diagram}\n\`\`\`\n\n`;
    
    md += `## 🚀 Microservices Inventory\n`;
    md += `| Service Name | Responsibility |\n`;
    md += `| :--- | :--- |\n`;
    design.services.forEach(s => {
      md += `| **${s.name}** | ${s.responsibility} |\n`;
    });
    md += `\n`;
    
    md += `## 🗄️ Database & Storage Engine Strategy\n${design.database}\n\n`;
    md += `## 🔌 API Interfaces & Route Contracts\n${design.api_design}\n\n`;
    md += `## 📈 Scalability Approaches\n${design.scalability}\n\n`;
    md += `## 🔥 Caching Strategies\n${design.caching}\n\n`;
    md += `## 🛡️ Cybersecurity Hardening & Compliance\n${design.security}\n\n`;
    md += `## 📊 Telemetry, Monitoring & Alerting\n${design.monitoring}\n\n`;
    md += `## 📦 Infrastructure & CD\n${design.deployment}\n\n`;
    md += `*Generated via [ArchonAI](http://localhost:3000)*\n`;
    
    return md;
  };

  const handleCopyMd = () => {
    const md = generateMarkdown();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMd = () => {
    const md = generateMarkdown();
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safeTitle = design.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `system-spec-${safeTitle || "architecture"}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Helper to format technical text (handles standard bullet points and newlines cleanly)
  const formatText = (text: string) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        return (
          <li key={idx} className="ml-4 list-disc text-[#f6f3eb] mb-1.5 text-sm leading-relaxed">
            {trimmed.substring(1).trim()}
          </li>
        );
      }
      if (trimmed.startsWith("###")) {
        return (
          <h4 key={idx} className="text-sm font-bold text-[#c5a281] mt-4 mb-2 tracking-wide uppercase font-mono">
            {trimmed.replace("###", "").trim()}
          </h4>
        );
      }
      if (trimmed.startsWith("##")) {
        return (
          <h3 key={idx} className="text-base font-bold text-[#f6f3eb] mt-5 mb-2.5 border-b border-[#2c2b29] pb-1">
            {trimmed.replace("##", "").trim()}
          </h3>
        );
      }
      if (!trimmed) {
        return <div key={idx} className="h-2" />;
      }
      return (
        <p key={idx} className="text-[#f6f3eb] text-sm leading-relaxed mb-2">
          {trimmed}
        </p>
      );
    });
  };

  const tabsConfig = [
    { id: "diagram", label: "Topology & Summary", icon: Network },
    { id: "services", label: "Microservices", icon: Server },
    { id: "data", label: "Storage & APIs", icon: Database },
    { id: "scaling", label: "Scale & Cache", icon: TrendingUp },
    { id: "security", label: "Sec & Ops", icon: ShieldCheck }
  ];

  return (
    <div className="w-full space-y-6 animate-slide-up">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl backdrop-blur-md gap-4">
        <div>
          <span className="text-xs text-[#c5a281] font-bold font-mono tracking-widest uppercase">AI SYSTEM DESIGN SCHEMATIC</span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#f6f3eb] mt-1 leading-tight">{design.title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Technical Spec Export Toolbar */}
          <button
            onClick={handleCopyMd}
            title="Copy Full Architecture as Markdown"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1d1c] hover:bg-[#2c2b29] text-[#8f8980] hover:text-[#f6f3eb] text-xs font-semibold transition-colors border border-[#2c2b29] shadow-sm"
          >
            {copiedMd ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#c5a281] animate-pulse" />
                <span className="text-[#c5a281] font-mono">Copied Spec</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#c5a281]" />
                <span>Copy Spec (MD)</span>
              </>
            )}
          </button>
          
          <button
            onClick={handleDownloadMd}
            title="Download Full Architecture Spec File"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1e1d1c] hover:bg-[#2c2b29] text-[#8f8980] hover:text-[#f6f3eb] text-xs font-semibold transition-colors border border-[#2c2b29] shadow-sm"
          >
            <FileDown className="h-3.5 w-3.5 text-[#c5a281]" />
            <span>Download Spec</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#c5a281]/20 bg-[#c5a281]/5 text-[#c5a281] text-xs font-mono font-semibold">
            <Cpu className="h-3.5 w-3.5 animate-pulse" />
            <span>PRODUCTION-GRADE MODEL</span>
          </div>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl border border-[#2c2b29] bg-[#121110] overflow-x-auto shadow-inner">
        {tabsConfig.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-[#b28d68] to-[#c5a281] text-white shadow-lg font-bold"
                  : "text-[#8f8980] hover:text-[#f6f3eb] hover:bg-[#161514]/60"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="min-h-[400px]">
        {activeTab === "diagram" && (
          <div className="space-y-6 animate-fade-in">
            {/* Mermaid Diagram Box */}
            <div className="space-y-2">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Architecture Topology Diagram</span>
              </h3>
              <MermaidRenderer chart={design.mermaid_diagram} />
            </div>

            {/* Overview Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl">
              <h3 className="text-base font-bold text-[#f6f3eb] mb-3 flex items-center gap-2">
                <Settings2 className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Executive Overview & Architecture Summary</span>
              </h3>
              <div className="space-y-1">{formatText(design.overview)}</div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2">
              <Server className="h-4.5 w-4.5 text-[#c5a281]" />
              <span>Decoupled Microservices Inventory</span>
            </h3>
            
            {/* Grid of Microservices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {design.services.map((service, idx) => (
                <div 
                  key={idx} 
                  style={{ animationDelay: `${idx * 0.08}s` }}
                  className="p-5 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl glass-panel-hover flex gap-4 animate-slide-up"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#c5a281]/10 border border-[#c5a281]/20 text-[#c5a281]">
                    <Server className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#f6f3eb] text-sm tracking-tight">{service.name}</h4>
                    <p className="text-xs text-[#8f8980] leading-relaxed">{service.responsibility}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "data" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Database Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2 border-b border-[#2c2b29] pb-3">
                <Database className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Data Modeling & Storage Engine Strategy</span>
              </h3>
              <div className="space-y-1 max-h-[480px] overflow-y-auto pr-2">{formatText(design.database)}</div>
            </div>

            {/* API Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2 border-b border-[#2c2b29] pb-3">
                <Cpu className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>API Interfaces & Route Contracts</span>
              </h3>
              <div className="space-y-1 max-h-[480px] overflow-y-auto pr-2">{formatText(design.api_design)}</div>
            </div>
          </div>
        )}

        {activeTab === "scaling" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Scalability Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl space-y-4 lg:col-span-1">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2 border-b border-[#2c2b29] pb-3">
                <TrendingUp className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Scale Strategy</span>
              </h3>
              <div className="space-y-1">{formatText(design.scalability)}</div>
            </div>

            {/* Caching Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl space-y-4 lg:col-span-1">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2 border-b border-[#2c2b29] pb-3">
                <Flame className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Cache Strategy</span>
              </h3>
              <div className="space-y-1">{formatText(design.caching)}</div>
            </div>

            {/* Deployment Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl space-y-4 lg:col-span-1">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2 border-b border-[#2c2b29] pb-3">
                <Layers className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Infrastructure & CD</span>
              </h3>
              <div className="space-y-1">{formatText(design.deployment)}</div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
            {/* Security Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2 border-b border-[#2c2b29] pb-3">
                <ShieldCheck className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Cybersecurity Hardening & Compliance</span>
              </h3>
              <div className="space-y-1">{formatText(design.security)}</div>
            </div>

            {/* Monitoring Box */}
            <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl space-y-4">
              <h3 className="text-base font-bold text-[#f6f3eb] flex items-center gap-2 border-b border-[#2c2b29] pb-3">
                <Activity className="h-4.5 w-4.5 text-[#c5a281]" />
                <span>Telemetry, Monitoring & Alert Policies</span>
              </h3>
              <div className="space-y-1">{formatText(design.monitoring)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


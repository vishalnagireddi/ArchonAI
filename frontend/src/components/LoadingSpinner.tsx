"use client";

import { useEffect, useState } from "react";
import { Cpu, Terminal, Check } from "lucide-react";

const COMPILER_STAGES = [
  { id: 1, label: "Authenticating Groq Cloud Pipeline", duration: 1.0 },
  { id: 2, label: "Orchestrating Decoupled Microservices", duration: 2.5 },
  { id: 3, label: "Designing Database Partitioning & Cache Rings", duration: 4.2 },
  { id: 4, label: "Hardening Cybersecurity & Telemetry Models", duration: 5.8 },
  { id: 5, label: "Validating Mermaid Topology Diagram Syntax", duration: 7.2 },
  { id: 6, label: "Finalizing PostgreSQL Spec Registry Session", duration: 8.5 }
];

export default function LoadingSpinner() {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.round((Date.now() - start) / 100) / 10);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto py-10 px-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/85 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
      {/* Animated Radar/Spinning Core */}
      <div className="relative flex items-center justify-center w-24 h-24">
        {/* Outer glowing pulse rings */}
        <div className="absolute inset-0 rounded-full bg-[#c5a281]/10 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-[#c5a281]/5 animate-pulse" />
        
        {/* Spinning custom gear container */}
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#b28d68] to-[#c5a281] shadow-[0_0_20px_rgba(197,162,129,0.3)] animate-spin">
          <Cpu className="h-8 w-8 text-white -rotate-45" />
        </div>
      </div>
      
      {/* Loading title */}
      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#f6f3eb] tracking-tight flex items-center justify-center gap-2">
          <Terminal className="h-4.5 w-4.5 text-[#c5a281]" />
          <span>Compiling System Architecture</span>
        </h3>
        <p className="text-xs text-[#8f8980] font-mono max-w-md mx-auto">
          Please wait while Llama-3.3 synthesizes production-grade schematics.
        </p>
      </div>

      {/* Dynamic Compilation Stages List */}
      <div className="w-full max-w-sm mx-auto space-y-2 text-left bg-[#121110] p-4 rounded-xl border border-[#2c2b29] font-mono text-[11px] leading-relaxed shadow-inner">
        <div className="text-[10px] text-[#8c867e] border-b border-[#2c2b29] pb-1 mb-2 uppercase tracking-wider flex justify-between items-center">
          <span>AI SYSTEM ARCHITECT COMPILER</span>
          <span className="text-[#c5a281] font-bold">{elapsedTime.toFixed(1)}s elapsed</span>
        </div>
        {COMPILER_STAGES.map((stage) => {
          const isCompleted = elapsedTime >= stage.duration;
          const isActive = !isCompleted && (stage.id === 1 || elapsedTime >= COMPILER_STAGES[stage.id - 2].duration);
          
          let statusIndicator = (
            <div className="h-1.5 w-1.5 rounded-full bg-[#2c2b29]" />
          );
          let textStyle = "text-[#8c867e]/60";

          if (isCompleted) {
            statusIndicator = (
              <Check className="h-3.5 w-3.5 text-[#c5a281] shrink-0 animate-scale-up" />
            );
            textStyle = "text-[#f6f3eb] font-medium";
          } else if (isActive) {
            statusIndicator = (
              <div className="h-1.5 w-1.5 rounded-full bg-[#c5a281] animate-ping shrink-0" />
            );
            textStyle = "text-[#c5a281] font-bold animate-pulse";
          }

          return (
            <div key={stage.id} className={`flex items-center gap-2.5 ${textStyle} transition-all duration-350`}>
              <div className="flex items-center justify-center w-3.5 h-3.5">
                {statusIndicator}
              </div>
              <span className="truncate">{stage.label}</span>
              {isActive && <span className="ml-auto text-[8px] tracking-wider px-1.5 py-0.5 rounded bg-[#c5a281]/10 border border-[#c5a281]/30 text-[#c5a281] uppercase font-bold animate-pulse">running</span>}
              {isCompleted && <span className="ml-auto text-[8px] tracking-wider px-1.5 py-0.5 rounded bg-[#c5a281]/20 border border-[#c5a281]/40 text-[#f6f3eb] uppercase font-bold">done</span>}
            </div>
          );
        })}
      </div>

      {/* Progress placeholder bar */}
      <div className="w-64 h-1 bg-[#2c2b29] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#b28d68] to-[#c5a281] rounded-full animate-[shimmer_2s_infinite]" 
             style={{
               width: '80%',
               backgroundImage: 'linear-gradient(90deg, var(--tw-gradient-stops))',
               animationName: 'shimmer',
               animationDuration: '1.5s',
               animationIterationCount: 'infinite'
             }} 
        />
        <style jsx>{`
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    </div>
  );
}


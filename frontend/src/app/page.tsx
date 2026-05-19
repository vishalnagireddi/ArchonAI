"use client";

import { useState } from "react";
import PromptInput from "@/components/PromptInput";
import LoadingSpinner from "@/components/LoadingSpinner";
import ArchitectureCard from "@/components/ArchitectureCard";
import { api, DesignHistoryItem } from "@/lib/api";
import { Sparkles, Terminal, AlertCircle, RefreshCw } from "lucide-react";

export default function GeneratorPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<DesignHistoryItem | null>(null);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const generatedDesign = await api.generateDesign(prompt);
      setResult(generatedDesign);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to establish database or Groq LLM connection. Please verify your .env file is set up with a valid Groq API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto animate-fade-in">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#c5a281]/25 bg-[#c5a281]/5 text-[#c5a281] text-xs font-mono font-medium animate-float">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Design Systems Like a Principal Engineer</span>
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#f6f3eb] leading-none">
          Archon<span className="bg-gradient-to-r from-[#b28d68] to-[#c5a281] bg-clip-text text-transparent">AI</span>
        </h1>
        
        <p className="text-sm sm:text-base text-[#8f8980] max-w-2xl mx-auto leading-relaxed">
          Enter a prompt to model scalable microservices, define database partitions, structure API endpoints, and instantly render dynamic, exportable topology diagrams.
        </p>
      </div>

      {/* Input Form */}
      <div className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <PromptInput onSubmit={handleGenerate} isLoading={isLoading} />
      </div>

      {/* Output Renderers */}
      <div className="space-y-6">
        {isLoading && (
          <div className="py-12">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto p-6 rounded-2xl border border-red-900/30 bg-[#161211] text-center space-y-4 animate-fade-in shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-950/40 text-red-400 mx-auto">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-red-400 font-mono uppercase tracking-wide">Inference Pipeline Interrupted</h3>
              <p className="text-xs text-red-300 mt-1 leading-relaxed">
                {error}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setError(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#221c1a] hover:bg-[#2d2320] text-red-200 text-xs font-semibold transition-colors border border-red-900/30"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Reset Generator</span>
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <span className="text-xs text-[#8c867e] font-mono flex items-center gap-1.5 animate-pulse">
                <Terminal className="h-3.5 w-3.5 text-[#c5a281]" />
                <span>Generated successfully in ~1.5s</span>
              </span>
            </div>
            <ArchitectureCard design={result.response} />
          </div>
        )}
      </div>
    </div>
  );
}


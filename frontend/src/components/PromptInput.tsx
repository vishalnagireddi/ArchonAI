"use client";

import React, { useState, KeyboardEvent } from "react";
import { Search, Sparkles } from "lucide-react";

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  "Scalable Netflix Architecture",
  "Uber-like Ride Hailing System",
  "Distributed WhatsApp Chat App",
  "TikTok Video Feed Delivery System",
  "Amazon E-Commerce Checkout System"
];

export default function PromptInput({ onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <form onSubmit={handleSubmit} className="relative group">
        {/* Glow behind input on hover/focus */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#b28d68] to-[#c5a281] opacity-20 blur-xl transition duration-500 group-hover:opacity-30 animate-pulse" />
        
        <div className="relative flex flex-col sm:flex-row items-stretch gap-2 rounded-2xl bg-[#161514]/95 border border-[#2c2b29] p-2 shadow-2xl backdrop-blur-xl transition-all duration-300 focus-within:border-[#c5a281]">
          <div className="flex-1 flex items-start gap-3 px-3 py-2">
            <Search className="h-5 w-5 text-[#8c867e] mt-2 flex-shrink-0" />
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What architecture are we building today? (e.g. Design scalable Netflix video service)"
              rows={2}
              disabled={isLoading}
              className="w-full bg-transparent text-[#f6f3eb] border-0 focus:ring-0 focus:outline-none resize-none text-base placeholder-[#8c867e] pt-1 h-[52px]"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#b28d68] to-[#c5a281] hover:from-[#c5a281] hover:to-[#d4bca3] text-white font-semibold text-sm hover:shadow-[0_0_20px_rgba(197,162,129,0.35)] transition-all duration-200 disabled:opacity-40 disabled:hover:shadow-none shrink-0"
          >
            <Sparkles className="h-4 w-4" />
            <span>Generate Design</span>
          </button>
        </div>
      </form>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2 justify-center items-center">
        <span className="text-xs text-[#8c867e] font-medium font-mono">Suggestions:</span>
        {SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isLoading}
            onClick={() => handleSuggestionClick(suggestion)}
            className="text-xs px-3 py-1.5 rounded-full border border-[#2c2b29] bg-[#161514] text-[#8f8980] hover:text-[#f6f3eb] hover:border-[#c5a281]/50 hover:bg-[#c5a281]/5 transition-all duration-200 font-medium shadow-sm hover:scale-105 active:scale-95"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}


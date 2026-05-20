"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Cpu, Award, Plus, MessageSquare } from "lucide-react";
import { api, DesignHistoryItem } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function loadHistory() {
      if (!isAuthenticated) {
        setHistory([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await api.getHistory();
        if (active) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Failed to load history in sidebar:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }
    loadHistory();
    return () => {
      active = false;
    };
  }, [pathname, isAuthenticated]);

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col h-full bg-[#0e0e0d] border-r border-[#2c2b29] text-[#8f8980] overflow-hidden z-20">
      {/* Branding */}
      <div className="p-4 border-b border-[#2c2b29]">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-[#b28d68] to-[#c5a281] text-white shadow-[0_0_15px_rgba(197,162,129,0.25)] transition-transform group-hover:scale-105">
            <Cpu className="h-4.5 w-4.5" />
            <div className="absolute inset-0 rounded-lg bg-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          <span className="text-lg font-bold text-[#f6f3eb] tracking-tight">
            Archon<span className="text-[#c5a281] font-extrabold">AI</span>
          </span>
        </Link>
      </div>

      {/* New Project Button */}
      <div className="p-4">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#b28d68] to-[#c5a281] hover:from-[#c5a281] hover:to-[#d4bca3] text-white font-medium text-sm transition-all duration-200 shadow-[0_4px_12px_rgba(197,162,129,0.15)] hover:shadow-[0_6px_16px_rgba(197,162,129,0.3)] hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Architecture</span>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-[#8c867e] uppercase tracking-wider">
          Design History
        </div>

        {loading ? (
          <div className="space-y-2 px-3 py-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2 animate-pulse">
                <div className="h-4 w-4 rounded bg-[#1c1b1a]" />
                <div className="h-4 flex-1 rounded bg-[#1c1b1a]" />
              </div>
            ))}
          </div>
        ) : !isAuthenticated ? (
          <div className="px-3 py-6 rounded-xl border border-[#2c2b29] bg-[#161514] text-center space-y-3 mx-1 mt-2">
            <p className="text-xs text-[#8c867e] leading-relaxed">
              Login to save, view, and sync your system design history.
            </p>
            <button
              onClick={openAuthModal}
              className="w-full py-1.5 px-3 rounded-lg border border-[#c5a281]/30 hover:border-[#c5a281] bg-[#c5a281]/5 text-[#c5a281] hover:bg-[#c5a281]/10 text-xs font-semibold transition-all duration-200"
            >
              Log In Now
            </button>
          </div>
        ) : history.length === 0 ? (
          <div className="px-3 py-4 text-xs text-[#8c867e] italic text-center">
            No architectures generated yet
          </div>
        ) : (
          <nav className="space-y-1">
            {history.map((item) => {
              const itemUrl = `/history/${item.id}`;
              const isActive = pathname === itemUrl;
              const title = item.response?.title || item.prompt;
              
              return (
                <Link
                  key={item.id}
                  href={itemUrl}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                    isActive
                      ? "bg-[#1c1b1a] text-[#f6f3eb] font-semibold border-l-2 border-[#c5a281]"
                      : "text-[#8f8980] hover:text-[#f6f3eb] hover:bg-[#161514]"
                  }`}
                >
                  <MessageSquare className={`h-4 w-4 flex-shrink-0 ${isActive ? "text-[#c5a281]" : "text-[#8c867e] group-hover:text-[#8f8980]"}`} />
                  <span className="truncate flex-1 text-left">{title}</span>
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      {/* Bottom Footer Badge */}
      <div className="p-4 border-t border-[#2c2b29] bg-[#161514] flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#9e988f]">
          <Award className="h-4 w-4 text-[#c5a281]" />
          <span>Enterprise Grade</span>
        </div>
        <div className="text-[10px] font-mono text-[#8c867e]">v1.2.0</div>
      </div>
    </aside>
  );
}


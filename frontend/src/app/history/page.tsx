"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, DesignHistoryItem } from "@/lib/api";
import { 
  History, 
  ArrowRight, 
  Calendar, 
  Database,
  ArrowUpRight,
  Loader2
} from "lucide-react";

export default function HistoryPage() {
  const [history, setHistory] = useState<DesignHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.getHistory();
        setHistory(data);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch historical database items. Ensure the FastAPI backend is running and the database is active.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="border-b border-[#2c2b29] pb-6 space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f6f3eb] flex items-center gap-2.5">
          <History className="h-6 w-6 text-[#c5a281]" />
          <span>System Design Registry</span>
        </h1>
        <p className="text-sm text-[#8f8980]">
          A persistent log of all previously drafted architectures and topological diagrams compiled by ArchonAI.
        </p>
      </div>

      {/* States */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 font-mono text-xs text-[#8c867e]">
          <Loader2 className="h-8 w-8 text-[#c5a281] animate-spin" />
          <span>Querying PostgreSQL database clusters...</span>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl border border-red-900/30 bg-[#161211] text-center text-xs text-red-300 max-w-md mx-auto leading-relaxed shadow-xl">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#161514] text-[#8c867e] mx-auto border border-[#2c2b29]">
            <Database className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#f6f3eb] uppercase tracking-wide">Registry Empty</h3>
            <p className="text-xs text-[#8f8980] mt-1 leading-relaxed">
              You haven't generated any system designs yet. Navigate back to the generator to create your first architecture!
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#b28d68] to-[#c5a281] hover:from-[#c5a281] hover:to-[#d4bca3] text-white text-xs font-semibold hover:shadow-[0_0_20px_rgba(197,162,129,0.35)] transition duration-200"
            >
              <span>Build First Architecture</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      ) : (
        /* History Registry List */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-[#8c867e] font-mono px-2">
            <span>DATABASE TRANSACTION RECORDS</span>
            <span>{history.length} ITEMS SAVED</span>
          </div>

          <div className="grid gap-4">
            {history.map((item) => (
              <div 
                key={item.id} 
                className="group relative p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 shadow-2xl glass-panel-hover flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition duration-300"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#8c867e] font-mono flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(item.created_at)}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-[#2c2b29]" />
                    <span className="text-xs text-[#c5a281] font-mono font-bold uppercase tracking-wider">
                      ID #{item.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-[#f6f3eb] group-hover:text-[#c5a281] transition-colors">
                      {item.response.title}
                    </h3>
                    <p className="text-xs text-[#8f8980] mt-1 line-clamp-1 max-w-xl">
                      Prompt: "{item.prompt}"
                    </p>
                  </div>
                </div>

                <Link
                  href={`/history/${item.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#2c2b29] bg-[#1c1b1a] text-[#8f8980] hover:text-white hover:bg-gradient-to-r hover:from-[#b28d68] hover:to-[#c5a281] hover:border-transparent text-xs font-bold transition-all shrink-0 self-stretch sm:self-auto justify-center shadow-sm"
                >
                  <span>Review Spec</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, DesignHistoryItem } from "@/lib/api";
import ArchitectureCard from "@/components/ArchitectureCard";
import { ArrowLeft, Loader2, Calendar, FileText, AlertTriangle } from "lucide-react";

export default function HistoryDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [design, setDesign] = useState<DesignHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDesignDetail = async () => {
      try {
        const item = await api.getHistoryItem(id);
        setDesign(item);
      } catch (err: any) {
        console.error(err);
        setError("The requested system design was not found in our database records, or the API server is offline.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesignDetail();
  }, [id]);

  const formatDate = (isoStr: string) => {
    return new Date(isoStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button link */}
      <div className="flex justify-between items-center">
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-xs text-[#8f8980] hover:text-[#f6f3eb] transition-colors font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Registry</span>
        </Link>

        {design && (
          <span className="text-xs text-[#8c867e] font-mono">
            REGISTRY ENTRY #{design.id}
          </span>
        )}
      </div>

      {/* Render states */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-3 font-mono text-xs text-[#8c867e]">
          <Loader2 className="h-8 w-8 text-[#c5a281] animate-spin" />
          <span>Fetching database schema tables and JSON models...</span>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto p-8 rounded-2xl border border-red-900/30 bg-[#161211] text-center space-y-4 shadow-xl">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto animate-bounce" />
          <div>
            <h3 className="font-bold text-red-400 text-sm">Specification Not Found</h3>
            <p className="text-xs text-red-300 mt-1 leading-relaxed">{error}</p>
          </div>
          <div className="pt-2">
            <Link
              href="/history"
              className="text-xs px-4 py-2 rounded-lg bg-[#1e1d1c] hover:bg-[#2c2b29] text-[#8f8980] hover:text-[#f6f3eb] border border-[#2c2b29] font-semibold transition-colors"
            >
              Return to Registry
            </Link>
          </div>
        </div>
      ) : design ? (
        <div className="space-y-6 animate-fade-in">
          {/* Prompt banner info */}
          <div className="p-6 rounded-2xl border border-[#2c2b29] bg-[#161514]/80 flex flex-col md:flex-row justify-between gap-4 shadow-2xl backdrop-blur-md">
            <div className="space-y-1">
              <span className="text-xs text-[#8c867e] font-semibold font-mono tracking-wider flex items-center gap-1">
                <FileText className="h-3.5 w-3.5 text-[#c5a281]" />
                ORIGINAL USER INPUT PROMPT
              </span>
              <h2 className="text-sm sm:text-base text-[#f6f3eb] italic font-semibold leading-relaxed">
                "{design.prompt}"
              </h2>
            </div>
            <div className="flex items-start md:items-end flex-col shrink-0">
              <span className="text-xs text-[#8c867e] font-semibold font-mono">COMPILED TIMESTAMP</span>
              <span className="text-xs text-[#8f8980] flex items-center gap-1 mt-0.5">
                <Calendar className="h-3 w-3" />
                {formatDate(design.created_at)}
              </span>
            </div>
          </div>

          {/* Core System Design Details Card */}
          <ArchitectureCard design={design.response} />
        </div>
      ) : null}
    </div>
  );
}


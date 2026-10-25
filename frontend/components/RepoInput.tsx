"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, Sparkles, FolderGit2 } from "lucide-react";
import { api } from "@/lib/api";

interface RepoInputProps {
  initialUrl?: string;
  onAnalyze?: (url: string) => void;
  isLoading?: boolean;
}

export function RepoInput({ initialUrl = "", onAnalyze, isLoading: parentLoading = false }: RepoInputProps) {
  const router = useRouter();
  const [url, setUrl] = useState(initialUrl);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSubmitting = parentLoading || loading;

  const handleScan = async (target: string) => {
    setError(null);
    const trimmed = target.trim();
    if (!trimmed) {
      setError("Please enter a GitHub repository URL or local project path.");
      return;
    }

    if (onAnalyze) {
      onAnalyze(trimmed);
      return;
    }

    setLoading(true);
    try {
      const repo = await api.scanRepo(trimmed, trimmed.startsWith("http") ? trimmed : undefined);
      router.push(`/app?repo_id=${repo.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to scan repository. Please verify the URL or path.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleScan(url);
  };

  const handleExampleClick = (example: string) => {
    setUrl(example);
    handleScan(example);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-3 font-mono">
      <form onSubmit={handleSubmit} className="relative">
        <div className="group relative flex flex-col sm:flex-row items-stretch sm:items-center rounded-2xl border border-white/[0.12] bg-[#0e121e] p-1.5 sm:p-2 shadow-2xl transition-all focus-within:border-emerald-500/60 focus-within:ring-2 focus-within:ring-emerald-500/20">
          <div className="flex items-center flex-1 px-3 py-2 sm:py-0">
            <FolderGit2 className="h-5 w-5 text-zinc-400 mr-3 flex-shrink-0 group-focus-within:text-emerald-400 transition-colors" />
            <input
              type="text"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              placeholder="https://github.com/owner/repo or local/path"
              className="w-full bg-transparent text-sm sm:text-base font-sans text-zinc-100 placeholder-zinc-500 focus:outline-none"
              disabled={isSubmitting}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6 py-3 sm:py-3.5 text-sm font-bold text-white shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex-shrink-0 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Auditing...</span>
              </>
            ) : (
              <>
                <span className="text-base">🦥</span>
                <span>Clean My Repo</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-rose-400 font-medium justify-center">
            <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </form>

      {/* Quick Example Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
        <span className="text-zinc-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          <span>Quick Try:</span>
        </span>
        <button
          type="button"
          onClick={() => handleExampleClick("facebook/react")}
          disabled={isSubmitting}
          className="px-2.5 py-1 rounded-md border border-white/[0.08] bg-[#121624] text-zinc-300 hover:border-emerald-500/50 hover:text-white transition"
        >
          facebook/react
        </button>
        <button
          type="button"
          onClick={() => handleExampleClick("expressjs/express")}
          disabled={isSubmitting}
          className="px-2.5 py-1 rounded-md border border-white/[0.08] bg-[#121624] text-zinc-300 hover:border-emerald-500/50 hover:text-white transition"
        >
          expressjs/express
        </button>
        <button
          type="button"
          onClick={() => handleExampleClick("tailwindlabs/tailwindcss")}
          disabled={isSubmitting}
          className="px-2.5 py-1 rounded-md border border-white/[0.08] bg-[#121624] text-zinc-300 hover:border-emerald-500/50 hover:text-white transition"
        >
          tailwindlabs/tailwindcss
        </button>
        <button
          type="button"
          onClick={() => handleExampleClick(".")}
          disabled={isSubmitting}
          className="px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 transition font-bold"
        >
          📁 Current Repository
        </button>
      </div>
    </div>
  );
}

"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { FolderGit2, Globe, Sparkles, ArrowRight, ShieldCheck, Play } from "lucide-react";
import { api } from "@/lib/api";

export default function RepositorySelectionPage() {
  const router = useRouter();
  const [localPath, setLocalPath] = useState("");
  const [gitUrl, setGitUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localPath && !gitUrl) {
      setError("Please provide either a local folder path or a Git URL.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const repo = await api.scanRepo(localPath || undefined, gitUrl || undefined);
      router.push(`/app?repo_id=${repo.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to scan repository.");
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const repo = await api.startDemo();
      router.push(`/app?repo_id=${repo.id}`);
    } catch (err: any) {
      setError(err?.message || "Failed to start demo repository.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 font-mono">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-2xl">
          🦥
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Connect Repository</h1>
        <p className="text-xs text-slate-400">
          RepoJanitor scans your codebase with local AI. Code never leaves your workstation.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Main Scan Form */}
      <form onSubmit={handleScan} className="p-6 rounded-xl border border-slate-800 bg-[#0c1220] space-y-5 text-xs">
        <div className="space-y-1.5">
          <label className="text-slate-300 flex items-center gap-2">
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span>Local Repository Directory Path</span>
          </label>
          <input
            type="text"
            value={localPath}
            onChange={(e) => setLocalPath(e.target.value)}
            placeholder="e.g. C:\Users\Username\Projects\my-app"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 transition text-xs font-mono"
          />
          <div className="text-[11px] text-slate-500">Full filesystem path to your Git project root.</div>
        </div>

        <div className="space-y-1.5">
          <label className="text-slate-300 flex items-center gap-2">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>GitHub Repository URL (Optional)</span>
          </label>
          <input
            type="text"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 transition text-xs font-mono"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold transition flex items-center justify-center gap-2 shadow-sm text-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>{loading ? "Scanning Repository..." : "Scan & Analyze Codebase"}</span>
        </button>
      </form>

      {/* Demo Repository Quick Option */}
      <div className="p-5 rounded-xl border border-slate-800/80 bg-[#0c1220]/60 flex items-center justify-between text-xs">
        <div className="space-y-0.5">
          <div className="text-white font-semibold flex items-center gap-1.5">
            <span>Try Built-in Demo Repository</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
              Messy by design
            </span>
          </div>
          <div className="text-slate-500 text-[11px]">Includes duplicate helpers, broken README links, stale TODOs, and tests.</div>
        </div>

        <button
          onClick={handleQuickDemo}
          disabled={loading}
          className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 font-semibold text-xs shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-slate-200" />
          <span>Load Demo</span>
        </button>
      </div>
    </div>
  );
}

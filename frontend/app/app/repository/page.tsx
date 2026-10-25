"use client";

export const dynamic = "force-dynamic";

import React from "react";
import { FolderGit2, ShieldCheck, Sparkles } from "lucide-react";
import { RepoInput } from "@/components/RepoInput";

export default function RepositorySelectionPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-8 font-mono py-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-lg shadow-emerald-950/20">
          🦥
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit & Clean Repository</h1>
        <p className="text-xs text-slate-400 max-w-md mx-auto font-sans leading-relaxed">
          Paste any public GitHub repository URL or a local system path. RepoJanitor reasons safely using Google Gemma 2 & Gemini AI.
        </p>
      </div>

      <div className="pt-2">
        <RepoInput />
      </div>

      {/* Security & Isolation Callout */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-xs text-slate-300 flex items-start gap-3 font-sans">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-emerald-300 font-mono text-xs flex items-center gap-2">
            <span>SafetyGate Active</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-slate-400 leading-relaxed text-xs">
            Branches are checked out into isolated cleanup branches (`repo-janitor/cleanup-*`). Protected branches (`main`/`master`) and sensitive files (`.git`, `.env`) are strictly safeguarded against modification.
          </p>
        </div>
      </div>
    </div>
  );
}

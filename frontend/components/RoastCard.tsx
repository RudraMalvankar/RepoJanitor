"use client";

import React, { useState } from "react";
import { Flame, Copy, Check, Sparkles } from "lucide-react";

interface RoastCardProps {
  roast: string;
  repoName?: string;
  score?: number;
}

export function RoastCard({ roast, repoName, score }: RoastCardProps) {
  const [copiedRoast, setCopiedRoast] = useState(false);

  const handleCopyRoast = () => {
    navigator.clipboard.writeText(roast);
    setCopiedRoast(true);
    setTimeout(() => setCopiedRoast(false), 2000);
  };

  return (
    <div className="h-full rounded-2xl border border-emerald-500/30 bg-[#0e131f] p-6 shadow-xl flex flex-col justify-between font-mono relative overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl" />

      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-emerald-500/20 mb-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
            <span className="text-base">🦥</span>
            <Flame className="h-4 w-4 fill-emerald-400 text-emerald-400" />
            <span>THE JANITOR&apos;S ROAST</span>
          </div>

          <button
            type="button"
            onClick={handleCopyRoast}
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-zinc-900/90 px-3 py-1 text-xs font-mono text-zinc-300 hover:border-emerald-500/50 hover:text-white transition cursor-pointer"
          >
            {copiedRoast ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Roast</span>
              </>
            )}
          </button>
        </div>

        {/* Roast body */}
        <p className="text-sm text-zinc-200 leading-relaxed font-sans italic border-l-2 border-emerald-500/40 pl-3.5 py-1">
          &ldquo;{roast || "Scanning your repository for clutter, duplicate utilities, and stale TODOs..."}&rdquo;
        </p>
      </div>

      {/* Footer tags */}
      <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="flex items-center gap-1.5 text-emerald-300">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Automated maintenance diagnosis</span>
        </span>
        <span className="text-zinc-400 font-sans">
          {score !== undefined ? `Hygiene score: ${score}/100` : ""}
        </span>
      </div>
    </div>
  );
}

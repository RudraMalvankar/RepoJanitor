"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Sparkles, 
  Terminal, 
  ShieldCheck, 
  GitBranch, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  FolderGit2, 
  Layers, 
  Play
} from "lucide-react";
import { api } from "@/lib/api";

export default function LandingPage() {
  const router = useRouter();
  const [terminalStep, setTerminalStep] = useState(0);

  // Progressive terminal visual animation
  useEffect(() => {
    const timer = setInterval(() => {
      setTerminalStep((prev) => (prev < 6 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, []);

  const handleStart = () => {
    router.push("/app/repository");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-emerald-500/20">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#090d16]/80 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦥</span>
          <span className="font-bold tracking-tight text-lg text-white font-mono">RepoJanitor</span>
          <span className="text-xs px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono">
            Hacktoberfest 2026
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-mono">
          <Link href="#features" className="text-slate-400 hover:text-white transition">Features</Link>
          <Link href="#architecture" className="text-slate-400 hover:text-white transition">Safety</Link>
          <Link 
            href="/app/repository" 
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm transition flex items-center gap-2"
          >
            Launch RepoJanitor
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/60 text-xs text-slate-400 font-mono mb-8">
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local Open-Weight AI • Ollama Qwen2.5 / Mock Provider</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15] mb-6">
          Your code is messy.<br />
          <span className="text-emerald-400">You don't have to be.</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-normal">
          RepoJanitor uses open-weight AI to find, understand, and safely clean the repository maintenance you've been putting off.
        </p>

        {/* Call to actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/app/repository"
            className="px-6 py-3.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950/40 text-base transition flex items-center gap-2 font-mono group"
          >
            <span>🦥 Clean My Repo</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>

          <Link
            href="/app/repository"
            className="px-6 py-3.5 rounded-lg border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-medium text-base transition flex items-center gap-2 font-mono"
          >
            <FolderGit2 className="w-4 h-4 text-slate-400" />
            <span>Scan Local Repository</span>
          </Link>
        </div>

        {/* Live Terminal Hero Visual */}
        <div className="w-full max-w-3xl rounded-xl border border-slate-800 bg-[#0c1220] p-4 text-left shadow-2xl relative font-mono text-sm overflow-hidden">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
              <span className="ml-2 text-slate-400">repojanitor-agent — zsh</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE ACTIVE SCAN</span>
            </div>
          </div>

          <div className="space-y-1.5 text-slate-300 py-1">
            <div className="text-emerald-400 font-bold">REPOJANITOR</div>
            <div className="text-slate-600">────────────────────────────────────────</div>
            <div className="text-slate-400">Scanning repository: <span className="text-white">active project</span>...</div>
            
            {terminalStep >= 1 && <div className="text-emerald-400">✓ 247 files indexed</div>}
            {terminalStep >= 2 && <div className="text-emerald-400">✓ Git history & working branch analyzed</div>}
            {terminalStep >= 3 && <div className="text-amber-400">✓ 14 maintenance findings detected</div>}
            {terminalStep >= 4 && (
              <div className="pl-4 text-slate-400 space-y-0.5 text-xs">
                <div>• 2 exact duplicates (helpers_old.js, README_old.md)</div>
                <div>• 3 stale TODO / FIXME markers (auth.py)</div>
                <div>• 1 broken documentation link (legacy_guide.md)</div>
                <div>• 1 potentially dead module (unused_service.py)</div>
                <div className="text-rose-400">• 1 exposed secret (redacted and blocked)</div>
              </div>
            )}
            {terminalStep >= 5 && (
              <div className="pt-2 text-slate-300">
                <span>AI reasoning with local model (llama3.2:1b)...</span>
                <div className="text-emerald-400">[████████████████████░░] 88% — 4 Safe Fixes Verified</div>
              </div>
            )}
            {terminalStep >= 6 && (
              <div className="pt-2 text-emerald-400 font-bold flex items-center justify-between">
                <span>✓ Health score calculated: 62 → 92 / 100</span>
                <Link 
                  href="/app/repository"
                  className="text-xs bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3 py-1 rounded hover:bg-emerald-500/30 transition flex items-center gap-1.5"
                >
                  <Play className="w-3 h-3 fill-emerald-300" />
                  Connect Your Repository
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div id="features" className="w-full mt-24 text-left grid md:grid-cols-3 gap-6 font-sans">
          <div className="p-6 rounded-xl border border-slate-800 bg-[#0d1322]/60 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">Deterministic Safety Gate</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              AI proposals are passed through a strict SafetyGate. Actions are classified as SAFE, REVIEW, or BLOCKED. Secrets and .git are never exposed or touched.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-[#0d1322]/60 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">Open-Weight Local AI</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Powered by Ollama with Qwen2.5, Llama, or Gemma. Your proprietary source code never leaves your local machine or leaks to closed external clouds.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-[#0d1322]/60 backdrop-blur">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
              <GitBranch className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white text-base mb-2">Isolated Git Branch & PR</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              RepoJanitor never commits to master or main. It creates an isolated branch, verifies changes by running tests, generates a full diff, and prepares a Pull Request.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500 font-mono">
        RepoJanitor • Hacktoberfest Open-Source AI Challenge 2026 • Week 3: "Slow and Steady" • Built with open-weight AI.
      </footer>
    </div>
  );
}

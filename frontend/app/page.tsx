import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  GitBranch,
  Terminal,
  Cpu,
  ArrowRight,
  Sparkles,
  Search,
  FileCheck2,
  Trash2,
  FileText,
  Clock,
  ExternalLink
} from "lucide-react";
import { RepoInput } from "@/components/RepoInput";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#090d16] text-zinc-100 selection:bg-emerald-500/30 selection:text-white font-sans">
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-800/80 px-6 flex items-center justify-between bg-[#0b101d]/90 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <span className="text-2xl">🦥</span>
            <span className="font-extrabold tracking-tight text-white font-mono text-lg">
              RepoJanitor
            </span>
          </Link>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-300 font-semibold">
            Hacktoberfest 2026
          </span>
        </div>

        <nav className="flex items-center gap-5 text-xs font-mono text-slate-300">
          <a href="#features" className="hover:text-emerald-400 transition hidden sm:inline">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-emerald-400 transition hidden sm:inline">
            How It Works
          </a>
          <a href="#roasts" className="hover:text-emerald-400 transition hidden md:inline">
            Roasts
          </a>
          <a
            href="https://github.com/RudraMalvankar/RepoJanitor"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition flex items-center gap-1.5"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            href="/app"
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-emerald-500/10 rounded-full blur-[140px]" />

          <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-950/30 text-emerald-400 text-xs font-mono mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Week 3: &quot;Slow and Steady&quot; — The AI Maintainer for Lazy Developers</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.08]">
              <span className="block">Your code is messy.</span>
              <span className="block text-emerald-400 font-mono">You don&apos;t have to be.</span>
              <span className="block text-2xl sm:text-4xl text-slate-400 font-normal mt-2">
                RepoJanitor cleans up after you.
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
              Enter any public GitHub repository or local codebase. RepoJanitor discovers copy-paste duplicates, stale TODOs, dead modules, and documentation debt — reasons safely with Google Gemma 2 & Gemini, and fixes issues with one-click pull requests.
            </p>

            {/* DIRECT REPO INPUT COMPONENT */}
            <div className="pt-4">
              <RepoInput />
            </div>

            {/* LIVE TERMINAL VISUAL */}
            <div className="max-w-2xl mx-auto pt-8 text-left font-mono">
              <div className="rounded-xl border border-slate-800 bg-[#0c101c] shadow-2xl overflow-hidden">
                <div className="px-4 py-2.5 bg-[#080b14] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></div>
                    <span className="ml-2 text-slate-300 font-semibold">repojanitor --scan --ai</span>
                  </div>
                  <span className="text-emerald-400 text-[11px]">SafetyGate Active</span>
                </div>
                <div className="p-4 space-y-1.5 text-xs text-slate-300">
                  <div className="text-slate-400 font-bold">Scanning repository...</div>
                  <div className="text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>247 files indexed across 18 directories</span>
                  </div>
                  <div className="text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Git branch and commit history analyzed</span>
                  </div>
                  <div className="text-amber-300 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5" />
                    <span>31 potential maintenance issues discovered</span>
                  </div>
                  <div className="pl-5 text-slate-400 space-y-0.5 text-[11px]">
                    <div>• 6 exact duplicate files (helpers_old.js, utils_copy.py)</div>
                    <div>• 9 stale TODO/FIXME comments older than 90 days</div>
                    <div>• 4 broken README internal documentation links</div>
                    <div>• 3 abandoned modules with 0 imports</div>
                  </div>
                  <div className="pt-2 text-cyan-300 flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>AI Reasoning (Gemma 2 / Gemini)...</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <span>[████████████████░░] 88%</span>
                    <span className="text-[10px] text-slate-400">Classifying Risk: SAFE / REVIEW / BLOCKED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT YOU GET SECTION */}
        <section id="features" className="py-16 border-t border-slate-800/80 bg-[#0b0f1a]">
          <div className="max-w-5xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                CORE CAPABILITIES
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Built to reward laziness with flawless repository hygiene
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Static Detector Suite</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Deterministic SHA-256 duplicate hashing, AST dead code analysis, broken link validation, and stale TODO parsing.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Gemma 2 & Gemini AI</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Structured reasoning with Google Gemma 2 / Gemini API for cloud deployments, or local Ollama for 100% offline development.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Strict SafetyGate</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AI cannot run arbitrary commands. Changes are partitioned into SAFE, REVIEW, and BLOCKED with automatic file backups.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <GitBranch className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Isolated Git Branches</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Never touches main or master. Checks out clean janitor branches, runs allowlisted tests, and formats full Pull Requests.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* EXAMPLE ROASTS SECTION */}
        <section id="roasts" className="py-16 border-t border-slate-800/80 bg-[#090d16]">
          <div className="max-w-4xl mx-auto px-6 space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                THE JANITOR&apos;S ROAST
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Brutal honesty. Zero developer shame.
              </h2>
              <p className="text-xs text-slate-400">
                Every analysis generates an entertaining diagnosis of your maintenance procrastination.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
              <div className="p-5 rounded-xl border border-emerald-500/30 bg-[#0e1422] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>🦥</span>
                  <span>THE TIRED REFACTOR</span>
                </div>
                <p className="text-slate-300 italic font-sans leading-relaxed">
                  &ldquo;This repository scored 58/100. It looks like a codebase where someone promised &apos;I will refactor this next sprint&apos; and then sprinted in the exact opposite direction. You have 3 files named helpers_old.js that haven&apos;t been opened since 2023.&rdquo;
                </p>
              </div>

              <div className="p-5 rounded-xl border border-emerald-500/30 bg-[#0e1422] space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <span>🧹</span>
                  <span>THE TODO ARCHEOLOGIST</span>
                </div>
                <p className="text-slate-300 italic font-sans leading-relaxed">
                  &ldquo;We spotted 14 stale TODO comments. At this point, those TODOs qualify as historical artifacts rather than code tasks. Anyone trying to follow your README setup guide will need a search and rescue team.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-16 border-t border-slate-800/80 bg-[#0b0f1a]">
          <div className="max-w-4xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                WORKFLOW
              </span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                The 6-Step Safety Pipeline
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-2">
                <div className="text-emerald-400 font-bold text-sm">01 / SCAN & INDEX</div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Scans file tree, computes hashes for duplicates, checks broken docs, and gathers context while redacting all secrets.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-2">
                <div className="text-cyan-400 font-bold text-sm">02 / REASON & ROAST</div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Gemma 2 or Gemini evaluates each finding, explains root causes, calculates the Health Score, and crafts the maintainer roast.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-2">
                <div className="text-amber-400 font-bold text-sm">03 / SAFETY GATE</div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Strict deterministic validation prevents path traversal, blocks secret tampering, and categorizes actions by risk level.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-2">
                <div className="text-indigo-400 font-bold text-sm">04 / CONTROLLED EXECUTION</div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Approved actions are dispatched via predefined handlers with full snapshot rollback backups in place.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-2">
                <div className="text-emerald-400 font-bold text-sm">05 / TEST VALIDATION</div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Executes allowlisted project test commands (`pytest`, `npm test`) to verify changes didn&apos;t break logic.
                </p>
              </div>

              <div className="p-5 rounded-xl border border-slate-800 bg-[#0d1322] space-y-2">
                <div className="text-purple-400 font-bold text-sm">06 / BRANCH & PULL REQUEST</div>
                <p className="text-slate-400 font-sans leading-relaxed">
                  Creates an isolated `repo-janitor/cleanup-*` branch, provides an interactive diff, and publishes a GitHub PR.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-20 border-t border-slate-800/80 bg-gradient-to-b from-[#090d16] to-[#0d1424] text-center">
          <div className="max-w-2xl mx-auto px-6 space-y-6">
            <span className="text-4xl">🦥</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Ready to clean up the code you&apos;ve been putting off?
            </h2>
            <p className="text-slate-400 text-sm">
              Paste your repository URL above or launch the interactive dashboard.
            </p>
            <div className="pt-2 flex justify-center">
              <Link
                href="/app"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-950/40 text-sm font-mono"
              >
                <span>Launch RepoJanitor</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800/80 py-8 px-6 text-center text-xs font-mono text-slate-500 bg-[#080c14] space-y-2">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <span>Built by Rudra Malvankar for</span>
          <span className="text-emerald-400 font-bold">Hacktoberfest 2026 Open-Source AI Challenge</span>
        </div>
        <div>
          Licensed under MIT. Open-weight intelligence with Google Gemma 2 & Ollama.
        </div>
      </footer>
    </div>
  );
}

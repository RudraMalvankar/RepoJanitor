"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  BrainCircuit,
  CheckSquare,
  FileCode2,
  TestTube2,
  History,
  Settings,
  FolderGit2,
  GitBranch,
  Cpu,
  RefreshCw
} from "lucide-react";
import { api, Repository } from "@/lib/api";

export const dynamic = "force-dynamic";

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const repoId = searchParams.get("repo_id");

  const [repo, setRepo] = useState<Repository | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getHealth().then(setHealthStatus).catch(() => {});
    if (repoId) {
      api.getRepo(repoId)
        .then(setRepo)
        .catch(() => {});
    }
  }, [repoId]);

  const navItems = [
    { name: "Overview", href: `/app${repoId ? `?repo_id=${repoId}` : ""}`, icon: LayoutDashboard },
    { name: "Findings", href: `/app/findings${repoId ? `?repo_id=${repoId}` : ""}`, icon: Search },
    { name: "AI Analysis", href: `/app/analysis${repoId ? `?repo_id=${repoId}` : ""}`, icon: BrainCircuit },
    { name: "Actions", href: `/app/actions${repoId ? `?repo_id=${repoId}` : ""}`, icon: CheckSquare },
    { name: "Diff", href: `/app/diff${repoId ? `?repo_id=${repoId}` : ""}`, icon: FileCode2 },
    { name: "Tests", href: `/app/tests${repoId ? `?repo_id=${repoId}` : ""}`, icon: TestTube2 },
    { name: "Activity", href: `/app/activity${repoId ? `?repo_id=${repoId}` : ""}`, icon: History },
    { name: "Settings", href: `/app/settings${repoId ? `?repo_id=${repoId}` : ""}`, icon: Settings },
  ];

  const handleRescan = async () => {
    if (!repo) return;
    setLoading(true);
    try {
      const updated = await api.scanRepo(repo.path, repo.url);
      setRepo(updated);
      router.refresh();
    } catch (e) {
      alert("Scan failed: " + e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      {/* Top Bar */}
      <header className="h-14 border-b border-slate-800/80 px-6 flex items-center justify-between bg-[#0b101d] sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition">
            <span className="text-xl">🦥</span>
            <span className="font-bold tracking-tight text-white font-mono text-base">RepoJanitor</span>
          </Link>

          <span className="text-slate-600">/</span>

          <div className="flex items-center gap-2 text-sm">
            <FolderGit2 className="w-4 h-4 text-emerald-400" />
            <span className="font-medium text-slate-200">
              {repo ? repo.name : "Select Repository"}
            </span>
            {repo?.is_demo && (
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                Demo
              </span>
            )}
          </div>

          {repo && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-slate-700 bg-slate-900/60 text-xs font-mono text-slate-400">
              <GitBranch className="w-3.5 h-3.5 text-slate-400" />
              <span>{repo.current_branch}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded border border-slate-800 bg-[#0d1424]">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">AI:</span>
            <span className={healthStatus?.ollama_available ? "text-emerald-400" : "text-amber-400"}>
              {healthStatus?.ollama_available ? "Ollama (qwen2.5:7b)" : "Mock/Demo Provider"}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded border border-slate-800 bg-[#0d1424] text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>SafetyGate Active</span>
          </div>

          {repo && (
            <button
              onClick={handleRescan}
              disabled={loading}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Scanning..." : "Rescan"}</span>
            </button>
          )}

          <Link
            href="/app/repository"
            className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition"
          >
            Switch Repo
          </Link>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-60 border-r border-slate-800/80 bg-[#0b101d] flex flex-col justify-between p-3 shrink-0">
          <nav className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-slate-500">
              Workspace
            </div>
            {navItems.map((item) => {
              const active = pathname === item.href.split("?")[0];
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition ${
                    active
                      ? "bg-emerald-600/15 text-emerald-400 border border-emerald-500/25"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-3 rounded-lg border border-slate-800/80 bg-[#0d1322] text-xs font-mono space-y-1 text-slate-400">
            <div className="text-slate-300 font-semibold flex items-center gap-1.5">
              <span>🦥</span> RepoJanitor v1.0
            </div>
            <div className="text-[11px] text-slate-500">
              Deterministic Safety & AI Pair
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-[#090d16]">
          <Suspense fallback={<div className="font-mono text-xs text-slate-500 animate-pulse">Loading view...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#090d16] flex items-center justify-center font-mono text-xs text-slate-400">Loading RepoJanitor...</div>}>
      <AppLayoutInner>{children}</AppLayoutInner>
    </Suspense>
  );
}

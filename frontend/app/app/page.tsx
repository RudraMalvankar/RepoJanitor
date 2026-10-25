"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  Sparkles, 
  ArrowRight,
  GitPullRequest,
  Check,
  Play
} from "lucide-react";
import { api, Repository, Finding } from "@/lib/api";
import { ScoreCard } from "@/components/ScoreCard";
import { RoastCard } from "@/components/RoastCard";

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const repoId = searchParams.get("repo_id");

  const [repo, setRepo] = useState<Repository | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [prCreated, setPrCreated] = useState<any>(null);

  useEffect(() => {
    if (!repoId) {
      router.replace("/app/repository");
      return;
    }

    Promise.all([
      api.getRepo(repoId),
      api.getFindings(repoId)
    ]).then(([r, f]) => {
      setRepo(r);
      setFindings(f);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [repoId, router]);

  if (loading || !repo) {
    return (
      <div className="h-64 flex items-center justify-center font-mono text-sm text-slate-400">
        <span className="animate-pulse">Loading repository intelligence...</span>
      </div>
    );
  }

  const breakdown = repo.health_breakdown || {
    documentation: 85,
    code_quality: 75,
    repository_hygiene: 80,
    tests: 90,
    maintenance: 70
  };

  const safeCount = findings.filter(f => f.risk === "SAFE").length;
  const reviewCount = findings.filter(f => f.risk === "REVIEW").length;
  const blockedCount = findings.filter(f => f.risk === "BLOCKED").length;

  const handleApproveAllSafe = async () => {
    setActionLoading(true);
    try {
      await api.approveAllSafe(repo.id);
      await api.executeAllApproved(repo.id);
      // Refresh repo details
      const updated = await api.getRepo(repo.id);
      const updatedFindings = await api.getFindings(repo.id);
      setRepo(updated);
      setFindings(updatedFindings);
    } catch (e) {
      alert("Execution error: " + e);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGeneratePR = async () => {
    setActionLoading(true);
    try {
      const res = await api.createPullRequest(repo.id);
      setPrCreated(res);
    } catch (e) {
      alert("PR generation error: " + e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
            <span>Repository Health Overview</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Path: <span className="text-slate-300 font-mono">{repo.path}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/app/findings?repo_id=${repo.id}`}
            className="px-3.5 py-2 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition"
          >
            Inspect Findings ({findings.length})
          </Link>

          <button
            onClick={handleApproveAllSafe}
            disabled={actionLoading || safeCount === 0}
            className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-medium transition flex items-center gap-2 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{actionLoading ? "Cleaning..." : `Apply ${safeCount} Safe Fixes`}</span>
          </button>

          <button
            onClick={handleGeneratePR}
            disabled={actionLoading}
            className="px-3.5 py-2 rounded-md bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-mono font-medium transition flex items-center gap-2 shadow-sm"
          >
            <GitPullRequest className="w-3.5 h-3.5" />
            <span>Generate PR</span>
          </button>
        </div>
      </div>

      {/* Pull Request Alert Notification */}
      {prCreated && (
        <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-indigo-200 text-sm font-mono flex items-start justify-between">
          <div className="space-y-1">
            <div className="font-semibold text-white flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-indigo-400" />
              <span>{prCreated.title}</span>
            </div>
            <p className="text-xs text-indigo-300">{prCreated.message}</p>
            {prCreated.pr_url && (
              <a 
                href={prCreated.pr_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs text-indigo-400 underline hover:text-indigo-300 inline-block mt-1"
              >
                View Pull Request on GitHub →
              </a>
            )}
          </div>
          <button 
            onClick={() => setPrCreated(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ReadMeRoast-style Circular Gauge ScoreCard & The Janitor's Roast */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ScoreCard score={repo.health_score} breakdown={breakdown} />
        <RoastCard roast={repo.roast || "Scanning your repository for clutter, duplicate utilities, and stale TODOs..."} repoName={repo.name} score={repo.health_score} />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d1322]">
          <div className="text-xs text-slate-500">Total Issues</div>
          <div className="text-2xl font-bold text-white mt-1">{findings.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Found in active scan</div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Safe Fixes</span>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{safeCount}</div>
          <div className="text-[11px] text-emerald-500/80 mt-1">Deterministic & safe</div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
          <div className="text-xs text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Review Required</span>
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{reviewCount}</div>
          <div className="text-[11px] text-amber-500/80 mt-1">Requires human check</div>
        </div>

        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10">
          <div className="text-xs text-rose-400 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            <span>Blocked / Secrets</span>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{blockedCount}</div>
          <div className="text-[11px] text-rose-500/80 mt-1">Protected by SafetyGate</div>
        </div>
      </div>

      {/* Priority Action Items Preview */}
      <div className="p-6 rounded-xl border border-slate-800 bg-[#0c1220] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold font-mono text-slate-200">
            Top Maintenance Findings
          </h2>
          <Link
            href={`/app/findings?repo_id=${repo.id}`}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
          >
            <span>View All ({findings.length})</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-slate-800/80">
          {findings.slice(0, 4).map((f) => (
            <div key={f.id} className="py-3 flex items-center justify-between gap-4 font-mono text-xs">
              <div className="space-y-0.5">
                <div className="text-white font-medium flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    f.risk === "SAFE" 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : (f.risk === "REVIEW" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20")
                  }`}>
                    {f.risk}
                  </span>
                  <span>{f.title}</span>
                </div>
                <div className="text-slate-500 text-[11px]">{f.file_path}</div>
              </div>

              <Link
                href={`/app/findings?repo_id=${repo.id}`}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px]"
              >
                Inspect
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

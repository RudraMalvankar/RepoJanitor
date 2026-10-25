"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  FileCode, 
  Sparkles, 
  Eye, 
  Check, 
  X,
  Copy,
  FileQuestion,
  FileText
} from "lucide-react";
import { api, Finding } from "@/lib/api";

export default function FindingsPage() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repo_id");

  const [findings, setFindings] = useState<Finding[]>([]);
  const [filterRisk, setFilterRisk] = useState<string>("ALL");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [executingId, setExecutingId] = useState<string | null>(null);

  useEffect(() => {
    if (repoId) {
      api.getFindings(repoId).then(setFindings).catch(() => {});
    }
  }, [repoId]);

  const categories = ["ALL", "duplicate", "todo", "dead_code", "documentation", "secret"];
  const risks = ["ALL", "SAFE", "REVIEW", "BLOCKED"];

  const filtered = findings.filter((f) => {
    if (filterRisk !== "ALL" && f.risk !== filterRisk) return false;
    if (filterCategory !== "ALL" && f.category !== filterCategory) return false;
    return true;
  });

  const handleFixFinding = async (finding: Finding) => {
    if (!repoId) return;
    setExecutingId(finding.id);
    try {
      // First ensure actions exist by triggering analysis if needed
      const actions = await api.analyzeRepo(repoId);
      const match = actions.find(a => a.finding_id === finding.id || a.title.includes(finding.title));
      if (match) {
        await api.approveAction(repoId, match.id);
        await api.executeAction(repoId, match.id);
        // Refresh findings
        const updated = await api.getFindings(repoId);
        setFindings(updated);
      } else {
        alert("Action queued for approval in Actions tab.");
      }
    } catch (e) {
      alert("Execution error: " + e);
    } finally {
      setExecutingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <span>Maintenance Findings</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {filtered.length} of {findings.length}
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Deterministic static analysis results and local AI observations
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1 bg-[#0c1220] p-1 rounded-lg border border-slate-800">
            {risks.map((r) => (
              <button
                key={r}
                onClick={() => setFilterRisk(r)}
                className={`px-2.5 py-1 rounded transition ${
                  filterRisk === r
                    ? "bg-emerald-600 text-white font-semibold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#0c1220] border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 text-xs font-mono focus:outline-none focus:border-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Findings Cards Stream */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-800 bg-[#0c1220] font-mono text-sm text-slate-500">
          No maintenance findings match the selected filters.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="p-5 rounded-xl border border-slate-800 bg-[#0c1220] flex flex-col justify-between space-y-4 font-mono text-xs hover:border-slate-700 transition"
            >
              {/* Card Header */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    {f.category === "duplicate" && <Copy className="w-3.5 h-3.5 text-cyan-400" />}
                    {f.category === "todo" && <FileCode className="w-3.5 h-3.5 text-amber-400" />}
                    {f.category === "dead_code" && <FileQuestion className="w-3.5 h-3.5 text-indigo-400" />}
                    {f.category === "documentation" && <FileText className="w-3.5 h-3.5 text-emerald-400" />}
                    {f.category === "secret" && <XCircle className="w-3.5 h-3.5 text-rose-400" />}
                    <span>{f.category.replace("_", " ")}</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      f.risk === "SAFE"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : f.risk === "REVIEW"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                    }`}
                  >
                    {f.risk}
                  </span>
                </div>

                <div className="font-semibold text-slate-100 text-sm">{f.title}</div>
                <div className="text-slate-400 text-xs leading-relaxed font-sans">{f.description}</div>
              </div>

              {/* Target & Related Files */}
              <div className="p-3 rounded-lg bg-[#090d16] border border-slate-800/80 space-y-1 text-[11px]">
                <div className="text-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-500">File:</span>
                  <span className="text-emerald-300 truncate">{f.file_path}</span>
                  {f.line_number && <span className="text-slate-500">:{f.line_number}</span>}
                </div>
                {f.related_file_path && (
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <span className="text-slate-500">Matches:</span>
                    <span className="text-slate-300 truncate">{f.related_file_path}</span>
                  </div>
                )}
              </div>

              {/* Evidence Bullet Points */}
              <div className="space-y-1">
                <div className="text-[10px] uppercase text-slate-500 tracking-wider">Evidence</div>
                <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-0.5">
                  {f.evidence.map((ev, i) => (
                    <li key={i} className="truncate">{ev}</li>
                  ))}
                </ul>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Confidence: <span className="text-slate-300 font-bold">{Math.round(f.confidence * 100)}%</span>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/app/diff?repo_id=${repoId}`}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-[11px] flex items-center gap-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Diff</span>
                  </Link>

                  {f.risk !== "BLOCKED" && (
                    <button
                      onClick={() => handleFixFinding(f)}
                      disabled={executingId === f.id}
                      className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition text-[11px] font-semibold flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{executingId === f.id ? "Fixing..." : "Fix"}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

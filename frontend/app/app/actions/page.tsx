"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  RotateCcw,
  Check,
  X,
  AlertTriangle
} from "lucide-react";
import { api, ProposedAction } from "@/lib/api";

export default function ActionsApprovalPage() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repo_id");

  const [actions, setActions] = useState<ProposedAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [batchLoading, setBatchLoading] = useState(false);

  const fetchActions = () => {
    if (repoId) {
      api.getActions(repoId).then(setActions).catch(() => {});
    }
  };

  useEffect(() => {
    fetchActions();
  }, [repoId]);

  const handleApprove = async (actionId: string) => {
    if (!repoId) return;
    try {
      await api.approveAction(repoId, actionId);
      fetchActions();
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleReject = async (actionId: string) => {
    if (!repoId) return;
    try {
      await api.rejectAction(repoId, actionId);
      fetchActions();
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleExecute = async (actionId: string) => {
    if (!repoId) return;
    setLoading(true);
    try {
      await api.executeAction(repoId, actionId);
      fetchActions();
    } catch (e) {
      alert("Execution error: " + e);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAllSafe = async () => {
    if (!repoId) return;
    setBatchLoading(true);
    try {
      await api.approveAllSafe(repoId);
      await api.executeAllApproved(repoId);
      fetchActions();
    } catch (e) {
      alert("Batch execution error: " + e);
    } finally {
      setBatchLoading(false);
    }
  };

  const pendingSafeCount = actions.filter(a => a.risk === "SAFE" && a.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-emerald-400" />
            <span>Action Approval Queue</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Human-in-the-loop approval. RepoJanitor never blindly executes modifications.
          </p>
        </div>

        {/* Batch Safe Actions Approval Button */}
        <button
          onClick={handleApproveAllSafe}
          disabled={batchLoading || pendingSafeCount === 0}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-mono font-medium transition flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{batchLoading ? "Processing..." : `Approve & Execute All Safe (${pendingSafeCount})`}</span>
        </button>
      </div>

      {/* Safety Gate Policy Banner */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] font-mono text-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-slate-200 font-semibold">Deterministic Safety Gate Active</div>
            <div className="text-slate-500 text-[11px]">Actions outside registered allowlist or touching protected secrets are strictly blocked.</div>
          </div>
        </div>
        <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
          Zero-Arbitrary-Code
        </div>
      </div>

      {/* Actions Queue */}
      {actions.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-800 bg-[#0c1220] font-mono text-sm text-slate-500">
          No actions in queue. Trigger an AI analysis to propose changes.
        </div>
      ) : (
        <div className="space-y-4">
          {actions.map((act) => (
            <div
              key={act.id}
              className="p-5 rounded-xl border border-slate-800 bg-[#0c1220] font-mono text-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        act.risk === "SAFE"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : act.risk === "REVIEW"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {act.risk}
                    </span>
                    <span className="font-bold text-slate-100 text-sm">{act.title}</span>
                  </div>
                  <div className="text-slate-400 text-xs font-sans">{act.description}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      act.status === "EXECUTED"
                        ? "bg-emerald-500/20 text-emerald-400"
                        : act.status === "APPROVED"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : act.status === "REJECTED"
                        ? "bg-slate-800 text-slate-500"
                        : "bg-amber-500/20 text-amber-400"
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>

              {/* Action Metadata Breakdown (WHAT, WHY, EVIDENCE, RISK, CHANGES) */}
              <div className="grid sm:grid-cols-3 gap-3 p-3 rounded-lg bg-[#090d16] border border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block">ACTION TYPE:</span>
                  <code className="text-emerald-400 font-bold">{act.action_type}</code>
                </div>
                <div>
                  <span className="text-slate-500 block">TARGET FILE:</span>
                  <span className="text-slate-200">{act.details?.file_path || "Repository"}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">VALIDATION:</span>
                  <span className="text-slate-400">Post-execution test runner</span>
                </div>
              </div>

              {/* Approval Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2">
                {act.status === "PENDING" && act.risk !== "BLOCKED" && (
                  <>
                    <button
                      onClick={() => handleReject(act.id)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleApprove(act.id)}
                      className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white transition flex items-center gap-1.5 font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </>
                )}

                {act.status === "APPROVED" && (
                  <button
                    onClick={() => handleExecute(act.id)}
                    disabled={loading}
                    className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{loading ? "Executing..." : "Execute Safely"}</span>
                  </button>
                )}

                {act.status === "EXECUTED" && (
                  <div className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Safely Applied</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

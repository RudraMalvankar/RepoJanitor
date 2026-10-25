"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { 
  History, 
  Search, 
  BrainCircuit, 
  CheckCircle2, 
  XCircle, 
  GitBranch, 
  GitPullRequest, 
  TestTube2, 
  Play, 
  ShieldCheck 
} from "lucide-react";
import { api, AuditEvent } from "@/lib/api";

export default function ActivityTimelinePage() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repo_id");

  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (repoId) {
      api.getActivity(repoId)
        .then(setEvents)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [repoId]);

  const getEventIcon = (type: string) => {
    if (type.includes("SCAN")) return <Search className="w-4 h-4 text-cyan-400" />;
    if (type.includes("AI")) return <BrainCircuit className="w-4 h-4 text-indigo-400" />;
    if (type.includes("BRANCH")) return <GitBranch className="w-4 h-4 text-emerald-400" />;
    if (type.includes("PR")) return <GitPullRequest className="w-4 h-4 text-purple-400" />;
    if (type.includes("TEST")) return <TestTube2 className="w-4 h-4 text-amber-400" />;
    if (type.includes("EXECUTED") || type.includes("APPROVED")) return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    return <History className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-mono">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-emerald-400" />
          <span>Audit Log & Agent Activity Timeline</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete transparent trail of every scan, AI reasoning step, execution, and Git operation
        </p>
      </div>

      {/* Activity Timeline List */}
      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 animate-pulse">
          Loading audit trail...
        </div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-slate-800 bg-[#0c1220] text-sm text-slate-500">
          No audit events logged yet.
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
          {events.map((e) => (
            <div key={e.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1 w-6 h-6 rounded-full bg-[#0d1322] border border-slate-700 flex items-center justify-center">
                {getEventIcon(e.event_type)}
              </div>

              {/* Event Content Card */}
              <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold text-slate-200">{e.title}</span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(e.created_at).toLocaleTimeString()} • {new Date(e.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="text-[11px] text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded inline-block font-semibold">
                  {e.event_type}
                </div>

                {e.details && Object.keys(e.details).length > 0 && (
                  <div className="p-2.5 rounded bg-[#090d16] border border-slate-800 text-[11px] text-slate-400 space-y-0.5">
                    {Object.entries(e.details).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-slate-500 capitalize">{k.replace("_", " ")}:</span>{" "}
                        <span className="text-slate-300">{String(v)}</span>
                      </div>
                    ))}
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

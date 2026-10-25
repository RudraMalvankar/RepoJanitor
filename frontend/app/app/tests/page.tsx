"use client";

export const dynamic = "force-dynamic";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { TestTube2, CheckCircle2, XCircle, Play, ShieldCheck, Terminal } from "lucide-react";
import { api } from "@/lib/api";

export default function TestsValidationPage() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repo_id");

  const [running, setRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const handleRunTests = async () => {
    if (!repoId) return;
    setRunning(true);
    try {
      const res = await api.runTests(repoId);
      setTestResult(res);
    } catch (e) {
      alert("Test runner error: " + e);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TestTube2 className="w-5 h-5 text-emerald-400" />
            <span>Test Suite Validation</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Safe sandbox execution using verified test runner allowlist
          </p>
        </div>

        <button
          onClick={handleRunTests}
          disabled={running}
          className="px-4 py-2 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-2 shadow-sm"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{running ? "Executing Tests..." : "Run Test Suite"}</span>
        </button>
      </div>

      {/* Runner Info & Security Allowlist */}
      <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] text-xs text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="text-slate-200 font-semibold">Strict Command Allowlist</div>
            <div className="text-slate-500 text-[11px]">
              Allowed runners: <code className="text-emerald-400">pytest, python -m pytest, npm test, cargo test</code>
            </div>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Timeout: <span className="text-white font-bold">30s</span>
        </div>
      </div>

      {/* Test Execution Results Summary */}
      {testResult ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${
              testResult.passed
                ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                : "bg-rose-950/20 border-rose-500/30 text-rose-400"
            }`}>
              <div className="text-xs flex items-center gap-1.5 font-bold uppercase">
                {testResult.passed ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>Overall Status</span>
              </div>
              <div className="text-2xl font-bold mt-1">
                {testResult.passed ? "PASSED" : "FAILED"}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] text-slate-300">
              <div className="text-xs text-slate-500 uppercase">Command Executed</div>
              <div className="text-sm font-bold text-white mt-1 truncate">
                {testResult.command}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] text-slate-300">
              <div className="text-xs text-slate-500 uppercase">Timestamp</div>
              <div className="text-xs font-medium text-slate-400 mt-1">
                {new Date(testResult.created_at).toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Raw Log Output Terminal */}
          <div className="rounded-xl border border-slate-800 bg-[#070b13] overflow-hidden text-xs">
            <div className="px-4 py-2.5 bg-[#0c1220] border-b border-slate-800 text-slate-400 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>Console Output</span>
            </div>
            <pre className="p-4 text-slate-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {testResult.output || "No output."}
            </pre>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center rounded-xl border border-slate-800 bg-[#0c1220] text-sm text-slate-500">
          Click "Run Test Suite" to execute project tests and verify maintenance changes.
        </div>
      )}
    </div>
  );
}

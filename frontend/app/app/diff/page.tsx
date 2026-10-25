"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { FileCode2, GitBranch, Plus, Minus, RefreshCw, RotateCcw } from "lucide-react";
import { api, DiffResponse, DiffEntry } from "@/lib/api";

export default function DiffViewerPage() {
  const searchParams = useSearchParams();
  const repoId = searchParams.get("repo_id");

  const [diffData, setDiffData] = useState<DiffResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<DiffEntry | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDiff = () => {
    if (!repoId) return;
    setLoading(true);
    api.getDiff(repoId)
      .then((data) => {
        setDiffData(data);
        if (data.files && data.files.length > 0) {
          setSelectedFile(data.files[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiff();
  }, [repoId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-bold font-mono text-white flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-emerald-400" />
            <span>Git Diff Inspector</span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Review proposed modifications in isolated branch before committing
          </p>
        </div>

        <div className="flex items-center gap-4 font-mono text-xs">
          {diffData && (
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#0c1220] border border-slate-800">
              <div className="flex items-center gap-1 text-emerald-400">
                <Plus className="w-3.5 h-3.5" />
                <span>{diffData.total_added} added</span>
              </div>
              <div className="flex items-center gap-1 text-rose-400">
                <Minus className="w-3.5 h-3.5" />
                <span>{diffData.total_removed} removed</span>
              </div>
            </div>
          )}

          <button
            onClick={fetchDiff}
            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 transition flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Diff Display Area */}
      {!diffData || diffData.files_changed === 0 ? (
        <div className="p-16 text-center rounded-xl border border-slate-800 bg-[#0c1220] font-mono text-sm text-slate-400 space-y-2">
          <div className="text-2xl">🌿</div>
          <div className="font-semibold text-slate-200">Working tree clean</div>
          <div className="text-xs text-slate-500">No uncommitted diffs on active branch. Approve and execute changes to view diff.</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-4 gap-6">
          {/* File Tree List */}
          <div className="p-4 rounded-xl border border-slate-800 bg-[#0c1220] space-y-2">
            <div className="text-xs uppercase font-mono text-slate-500 tracking-wider mb-2">
              Modified Files ({diffData.files.length})
            </div>
            <div className="space-y-1 font-mono text-xs">
              {diffData.files.map((file) => (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between truncate ${
                    selectedFile?.path === file.path
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
                  }`}
                >
                  <span className="truncate">{file.path}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {file.status}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Unified Diff View */}
          <div className="md:col-span-3 rounded-xl border border-slate-800 bg-[#070b13] overflow-hidden flex flex-col font-mono text-xs">
            <div className="px-4 py-2.5 bg-[#0c1220] border-b border-slate-800 flex items-center justify-between text-slate-400">
              <span className="font-semibold text-slate-200">{selectedFile?.path}</span>
              <span className="text-[11px] text-slate-500">Status: {selectedFile?.status}</span>
            </div>

            <div className="p-4 overflow-x-auto text-slate-300 font-mono space-y-0.5 leading-relaxed">
              {selectedFile ? (
                selectedFile.diff_content ? (
                  selectedFile.diff_content.split("\n").map((line, idx) => (
                    <div
                      key={idx}
                      className={`px-2 py-0.5 rounded ${
                        line.startsWith("+")
                          ? "bg-emerald-950/40 text-emerald-300"
                          : line.startsWith("-")
                          ? "bg-rose-950/40 text-rose-300"
                          : line.startsWith("@")
                          ? "text-cyan-400 font-bold"
                          : "text-slate-400"
                      }`}
                    >
                      {line}
                    </div>
                  ))
                ) : (
                  <div className="text-slate-500 italic p-4">File deleted or staged for removal.</div>
                )
              ) : (
                <div className="text-slate-500 italic p-4">Select a file to inspect diff.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

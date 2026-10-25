"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Settings, Cpu, Globe, ShieldCheck, Check, Save } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [provider, setProvider] = useState("ollama");
  const [baseUrl, setBaseUrl] = useState("http://localhost:11434");
  const [model, setModel] = useState("qwen2.5:7b");
  const [githubToken, setGithubToken] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s.ai_provider) setProvider(s.ai_provider);
      if (s.ollama_base_url) setBaseUrl(s.ollama_base_url);
      if (s.ollama_model) setModel(s.ollama_model);
    }).catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaved(false);
    try {
      await api.updateSettings({
        ai_provider: provider,
        ollama_base_url: baseUrl,
        ollama_model: model,
        github_token: githubToken || undefined
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert("Failed to save settings: " + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-mono">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-400" />
          <span>System & Model Configuration</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure open-weight AI providers, local daemon endpoints, and GitHub integration
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Provider Section */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0c1220] space-y-4 text-xs">
          <div className="font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Open-Weight AI Engine</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">AI Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="ollama">Ollama (Local Open-Weight Model Engine)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Ollama Daemon URL</label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Ollama Model Tag</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="qwen2.5:7b"
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            />
            <div className="text-[11px] text-slate-500">
              Suggested: <code className="text-cyan-400">qwen2.5:7b</code>, <code className="text-cyan-400">llama3.2:3b</code>, <code className="text-cyan-400">gemma2:9b</code>.
            </div>
          </div>
        </div>

        {/* GitHub Integration Section */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0c1220] space-y-4 text-xs">
          <div className="font-semibold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>GitHub Integration (Optional)</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">GitHub Personal Access Token</label>
            <input
              type="password"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              placeholder="ghp_••••••••••••••••••••••••••••••••"
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono text-xs"
            />
            <div className="text-[11px] text-slate-500">
              Token is kept only in memory on the backend and never saved to the database. If omitted, local Git workflow operates seamlessly with PR preview mode.
            </div>
          </div>
        </div>

        {/* Privacy Assurance Banner */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-xs text-slate-300 flex items-start gap-3 font-sans">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-emerald-300 font-mono text-xs">Privacy Guarantee</div>
            <p className="text-slate-400 leading-relaxed text-xs">
              When using local Ollama models, your proprietary repository code and git history remain strictly on your machine. No source code is sent to external clouds or closed AI APIs.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center justify-center gap-2 shadow-sm text-xs"
        >
          <Save className="w-4 h-4" />
          <span>{loading ? "Saving..." : "Save Settings"}</span>
        </button>
      </form>
    </div>
  );
}

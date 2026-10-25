"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import { Settings, Cpu, Globe, ShieldCheck, Check, Save, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

export default function SettingsPage() {
  const [provider, setProvider] = useState("auto");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [geminiModel, setGeminiModel] = useState("gemini-1.5-flash");
  const [baseUrl, setBaseUrl] = useState("http://localhost:11434");
  const [model, setModel] = useState("qwen2.5:7b");
  const [githubToken, setGithubToken] = useState("");
  const [geminiConfigured, setGeminiConfigured] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s.ai_provider) setProvider(s.ai_provider);
      if (s.gemini_model) setGeminiModel(s.gemini_model);
      if (s.gemini_api_key_configured) setGeminiConfigured(true);
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
        gemini_api_key: geminiApiKey || undefined,
        gemini_model: geminiModel,
        ollama_base_url: baseUrl,
        ollama_model: model,
        github_token: githubToken || undefined
      });
      setSaved(true);
      if (geminiApiKey) setGeminiConfigured(true);
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
          Configure Google Gemini / Gemma API for cloud deployments, or local Ollama for offline machines.
        </p>
      </div>

      {saved && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Settings saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* AI Provider Selector */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0c1220] space-y-4 text-xs">
          <div className="font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>AI Reasoning Provider</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Active Engine</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
            >
              <option value="auto">Auto (Use Google Gemini/Gemma if API key is present, otherwise Ollama)</option>
              <option value="gemini">Google Gemini / Gemma (Cloud Deployment with API Key)</option>
              <option value="ollama">Ollama (Local Open-Weight Model Engine)</option>
            </select>
          </div>
        </div>

        {/* Google Gemini / Gemma Section */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0c1220] space-y-4 text-xs">
          <div className="font-semibold text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Google Gemini / Gemma API (Cloud & Production)</span>
            </div>
            {geminiConfigured && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/80 border border-emerald-700 text-emerald-300">
                Key Configured
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Google AI Studio / Gemini API Key</label>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder={geminiConfigured ? "•••••••••••••••••••••••••••••••• (Leave blank to keep current)" : "AIzaSy..."}
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
            />
            <div className="text-[11px] text-slate-500">
              Get an API key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-amber-400 underline">Google AI Studio</a>. Perfect for cloud deployments on Vercel, Render, Railway, or AWS.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">Gemini / Gemma Model</label>
            <input
              type="text"
              value={geminiModel}
              onChange={(e) => setGeminiModel(e.target.value)}
              placeholder="gemini-1.5-flash"
              className="w-full px-3 py-2 rounded-lg bg-[#090d16] border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-xs"
            />
            <div className="text-[11px] text-slate-500">
              Supported: <code className="text-amber-400">gemini-1.5-flash</code>, <code className="text-amber-400">gemini-2.0-flash</code>, <code className="text-amber-400">gemma-2-9b-it</code>, <code className="text-amber-400">gemma-2-27b-it</code>.
            </div>
          </div>
        </div>

        {/* Local Ollama Section */}
        <div className="p-5 rounded-xl border border-slate-800 bg-[#0c1220] space-y-4 text-xs">
          <div className="font-semibold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Ollama Local Daemon (Offline Machine)</span>
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
              Suggested: <code className="text-cyan-400">qwen2.5:7b</code>, <code className="text-cyan-400">llama3.2:1b</code>, <code className="text-cyan-400">gemma2:9b</code>.
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
            <div className="font-semibold text-emerald-300 font-mono text-xs">Security & Redaction Guarantee</div>
            <p className="text-slate-400 leading-relaxed text-xs">
              All credentials, API tokens, and private keys are pre-redacted before any code context is dispatched to AI providers. High-entropy secrets and sensitive configurations are guarded by the RepoJanitor Safety Gate.
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

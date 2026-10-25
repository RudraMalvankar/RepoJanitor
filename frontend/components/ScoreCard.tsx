import React from "react";

interface ScoreCardProps {
  score: number;
  breakdown?: {
    documentation: number;
    code_quality: number;
    repository_hygiene: number;
    tests: number;
    maintenance: number;
  };
}

export function ScoreCard({ score, breakdown }: ScoreCardProps) {
  // SVG circular gauge math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Ring stroke color based on score
  const strokeColor =
    score >= 80 ? "stroke-emerald-400" : score >= 60 ? "stroke-amber-400" : "stroke-rose-500";

  const getHeadline = (val: number) => {
    if (val >= 85) return "Pristine & Clean.";
    if (val >= 70) return "Pretty decent.";
    if (val >= 50) return "Needs attention.";
    return "Needs serious janitorial work.";
  };

  const getVerdict = (val: number) => {
    if (val >= 85) return "Your repository maintains exceptional hygiene with minimal technical debt.";
    if (val >= 70) return "Your codebase is functional but minor duplicates and stale comments are creeping in.";
    if (val >= 50) return "Maintenance debt has accumulated. Multiple duplicate files and stale TODOs require cleanup.";
    return "High clutter detected: duplicate files, dead modules, and broken documentation need immediate automated cleanup.";
  };

  return (
    <div className="h-full rounded-2xl border border-white/[0.08] bg-[#10131c] p-6 shadow-xl flex flex-col sm:flex-row items-center sm:items-start gap-6 font-mono">
      {/* Circular Gauge */}
      <div className="relative flex h-32 w-32 items-center justify-center flex-shrink-0">
        <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-zinc-800/80"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            className={`${strokeColor} transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-white">{score}</span>
          <span className="text-[11px] font-mono text-zinc-500">/ 100</span>
        </div>
      </div>

      {/* Score info */}
      <div className="space-y-2 flex-1 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            REPOSITORY HEALTH
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full border border-slate-700 bg-slate-800 text-slate-300">
            {score >= 80 ? "Grade A" : score >= 65 ? "Grade B" : score >= 50 ? "Grade C" : "Grade D"}
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {getHeadline(score)}
        </h2>
        <p className="text-xs text-zinc-400 leading-relaxed font-sans">
          {getVerdict(score)}
        </p>

        {breakdown && (
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
            <div className="px-2 py-1 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400">Hygiene: </span>
              <span className="text-emerald-400 font-semibold">{breakdown.repository_hygiene}%</span>
            </div>
            <div className="px-2 py-1 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400">Quality: </span>
              <span className="text-cyan-400 font-semibold">{breakdown.code_quality}%</span>
            </div>
            <div className="px-2 py-1 rounded bg-[#090d16] border border-slate-800">
              <span className="text-slate-400">Docs: </span>
              <span className="text-indigo-400 font-semibold">{breakdown.documentation}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

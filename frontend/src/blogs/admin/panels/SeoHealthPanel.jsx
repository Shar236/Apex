import React from 'react';
import { Sparkles, ChevronRight, CheckCircle2, XCircle } from 'lucide-react';

function ScoreRing({ score = 0 }) {
  const color = score >= 90 ? '#10B981' : score >= 75 ? '#22C55E' : score >= 60 ? '#F59E0B' : score >= 40 ? '#F97316' : '#EF4444';
  const c = 2 * Math.PI * 40;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative w-24 h-24 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="10" className="text-neutral-100 dark:text-[#262626]" />
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="10" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-500" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading font-black text-xl tabular-nums">{score}</span>
        <span className="text-[9px] font-bold text-neutral-400">/100</span>
      </div>
    </div>
  );
}

const PRIORITY_ICON = { high: '🔴', medium: '🟠', low: '🟢' };

/**
 * Live SEO Health. `analysis` is recomputed from the draft on every keystroke
 * (frontend/src/blogs/lib/seoAnalysis.js). `serverWarnings` carries the
 * cross-post duplicate checks that only the server can see.
 */
export default function SeoHealthPanel({ analysis, serverWarnings = [], onQuickFix }) {
  if (!analysis) return null;
  const warnings = [...(analysis.localWarnings || []), ...serverWarnings];

  return (
    <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-brand-pink" /> SEO Health</h3>
        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-500">● live</span>
      </div>

      <ScoreRing score={analysis.score} />
      <div className="text-center text-xs font-black text-neutral-500">{analysis.grade}</div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E]"><div className="font-black text-sm">{analysis.breakdown.technical}/40</div><div className="text-[9px] font-bold text-neutral-400">Technical</div></div>
        <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E]"><div className="font-black text-sm">{analysis.breakdown.content}/40</div><div className="text-[9px] font-bold text-neutral-400">Content</div></div>
        <div className="p-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E]"><div className="font-black text-sm">{analysis.breakdown.media}/20</div><div className="text-[9px] font-bold text-neutral-400">Media</div></div>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {analysis.recommendations.map((r, idx) => (
          <div key={idx} className="p-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
            <div className="text-xs font-black flex items-start gap-1.5">
              <span>{PRIORITY_ICON[r.priority]}</span>
              <span className="flex-1">{r.text}</span>
            </div>
            <p className="text-[10px] font-bold text-neutral-400 mt-1 ml-5">{r.fix}</p>
            <button onClick={() => onQuickFix(r)} className="ml-5 mt-1 text-[10px] font-black text-brand-pink cursor-pointer flex items-center gap-1">Fix it <ChevronRight className="w-3 h-3" /></button>
          </div>
        ))}
        {analysis.recommendations.length === 0 && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> No issues found</div>
        )}
      </div>

      {warnings.length > 0 && (
        <div className="space-y-1.5 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
          {warnings.map((w, idx) => (
            <div key={idx} className="flex items-start gap-1.5 text-[10px] font-bold text-rose-600 dark:text-rose-400"><XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> {w.text}</div>
          ))}
        </div>
      )}

      <p className="text-[9px] font-bold text-neutral-400 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">{analysis.disclaimer}</p>
    </div>
  );
}

import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function ImproveSeoPanel({ suggestions, onRun, onQuickFix, hasId }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm p-5 space-y-3">
      <button onClick={onRun} disabled={!hasId} className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900 text-xs font-black cursor-pointer disabled:opacity-40">
        <Sparkles className="w-3.5 h-3.5" /> Improve Article SEO
      </button>
      {!hasId && <p className="text-[10px] font-bold text-neutral-400 text-center">Save the post first.</p>}
      {suggestions && (
        <div className="space-y-2">
          {suggestions.suggestions.length === 0 ? (
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600"><CheckCircle2 className="w-4 h-4" /> No further suggestions right now</div>
          ) : suggestions.suggestions.map((s, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <div className="text-[11px] font-black text-amber-900 dark:text-amber-300">{s.issue}</div>
              <div className="text-[10px] font-bold text-amber-700/80 dark:text-amber-400/80 mt-0.5">{s.suggestion}</div>
              <button onClick={() => onQuickFix({ key: s.key, issue: s.issue, field: s.field, fix: s.suggestion })} className="mt-1.5 text-[10px] font-black text-brand-pink cursor-pointer">Go to field →</button>
            </div>
          ))}
          <p className="text-[9px] font-bold text-neutral-400 pt-1">{suggestions.disclaimer}</p>
        </div>
      )}
    </div>
  );
}

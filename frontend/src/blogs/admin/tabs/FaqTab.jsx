import React, { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Eye, CheckCircle2, AlertTriangle, ChevronDown } from 'lucide-react';
import { Field, TextArea, Label, Empty } from '../ui.jsx';

export default function FaqTab({ faqs, onChange }) {
  const [showPreview, setShowPreview] = useState(false);
  const [openIdx, setOpenIdx] = useState(0);

  const list = faqs || [];
  const add = () => onChange([...list, { question: '', answer: '' }]);
  const update = (idx, patch) => { const next = [...list]; next[idx] = { ...next[idx], ...patch }; onChange(next); };
  const remove = (idx) => onChange(list.filter((_, i) => i !== idx));
  const move = (idx, dir) => {
    const to = idx + dir;
    if (to < 0 || to >= list.length) return;
    const next = [...list];
    [next[idx], next[to]] = [next[to], next[idx]];
    onChange(next);
  };

  const complete = list.filter((f) => f.question.trim() && f.answer.trim());
  const schemaValid = list.length > 0 && complete.length === list.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Label>Frequently Asked Questions ({list.length})</Label>
        <div className="flex items-center gap-2">
          {list.length > 0 && (
            <button onClick={() => setShowPreview((v) => !v)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer">
              <Eye className="w-3.5 h-3.5" /> {showPreview ? 'Hide' : 'Preview'}
            </button>
          )}
          <button onClick={add} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add FAQ</button>
        </div>
      </div>

      {list.length > 0 && (
        <div className={`flex items-center gap-1.5 text-[11px] font-black ${schemaValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
          {schemaValid ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
          FAQPage schema: {schemaValid ? `valid · ${list.length} items` : `${list.length - complete.length} incomplete — fill every question and answer`}
        </div>
      )}

      {list.length === 0 && <Empty title="No FAQs yet" desc="FAQPage structured data is only generated once you add FAQs that will be rendered on the article." />}

      {showPreview && complete.length > 0 && (
        <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-4 space-y-2 bg-white dark:bg-[#0E0E0E]">
          <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">Preview</div>
          {complete.map((f, i) => {
            const open = openIdx === i;
            return (
              <div key={i} className={`rounded-xl border transition-all ${open ? 'border-brand-pink/40 bg-[#FFF0F5] dark:bg-[#2A0A17]' : 'border-[#EAEAEA] dark:border-[#292929]'}`}>
                <button type="button" onClick={() => setOpenIdx(open ? -1 : i)} className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer">
                  <span className="font-black text-xs">{f.question}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-brand-pink shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && <div className="px-4 pb-3 text-xs text-neutral-600 dark:text-neutral-300 whitespace-pre-wrap">{f.answer}</div>}
              </div>
            );
          })}
        </div>
      )}

      {list.map((f, idx) => (
        <div key={idx} className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-neutral-400 uppercase">FAQ {idx + 1}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => move(idx, -1)} disabled={idx === 0} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] disabled:opacity-30 cursor-pointer"><ArrowUp className="w-3 h-3" /></button>
              <button onClick={() => move(idx, 1)} disabled={idx === list.length - 1} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] disabled:opacity-30 cursor-pointer"><ArrowDown className="w-3 h-3" /></button>
              <button onClick={() => remove(idx)} className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
          <Field label="Question" value={f.question} onChange={(v) => update(idx, { question: v })} />
          <TextArea label="Answer" value={f.answer} onChange={(v) => update(idx, { answer: v })} rows={2} />
        </div>
      ))}
    </div>
  );
}

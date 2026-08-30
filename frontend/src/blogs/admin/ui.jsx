import React from 'react';

/** Shared form primitives for the blog admin — matches AdminConsole conventions. */

export const Label = ({ children }) => (
  <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2">{children}</span>
);

export const Field = React.forwardRef(function Field({ label, type = 'text', value, onChange, placeholder, hint }, ref) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        ref={ref}
        type={type}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition"
      />
      {hint && <span className="block text-[10px] font-bold text-neutral-400 mt-1">{hint}</span>}
    </label>
  );
});

export const TextArea = React.forwardRef(function TextArea({ label, value, onChange, rows = 3, hint, placeholder }, ref) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        ref={ref}
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition whitespace-pre-wrap"
      />
      {hint && <span className="block text-[10px] font-bold text-neutral-400 mt-1">{hint}</span>}
    </label>
  );
});

export const Select = React.forwardRef(function Select({ label, value, onChange, options }, ref) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <select
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
});

export function Check({ label, checked, onChange }) {
  return (
    <label className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-brand-pink" />
      <span className="text-xs font-black text-neutral-700 dark:text-neutral-200">{label}</span>
    </label>
  );
}

export function Th({ children, className = '' }) {
  return <th className={`text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left text-neutral-500 dark:text-neutral-400 ${className}`}>{children}</th>;
}
export function Td({ children, className = '' }) {
  return <td className={`px-4 py-3 align-top text-neutral-700 dark:text-neutral-200 ${className}`}>{children}</td>;
}

export function Empty({ title, desc }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
      <div className="font-black text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">{desc}</div>
    </div>
  );
}

export const STATUS_STYLES = {
  draft: 'bg-neutral-100 text-neutral-600 dark:bg-[#262626] dark:text-neutral-300',
  scheduled: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400',
  published: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  unpublished: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  trash: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
};

export const StatusBadge = ({ status }) => (
  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border capitalize ${STATUS_STYLES[status] || STATUS_STYLES.draft}`}>{status}</span>
);

export const ScoreBadge = ({ score, grade }) => {
  const color = score >= 75 ? 'text-emerald-600 dark:text-emerald-400' : score >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
  return (
    <div className="flex flex-col">
      <span className={`font-black text-sm tabular-nums ${color}`}>{score || 0}/100</span>
      <span className="text-[10px] font-bold text-neutral-400">{grade || '—'}</span>
    </div>
  );
};

export function CharGuide({ value, min, max }) {
  const len = (value || '').length;
  const ok = len >= min && len <= max;
  return (
    <span className={`text-[10px] font-bold ${len === 0 ? 'text-neutral-400' : ok ? 'text-emerald-600' : 'text-amber-600'}`}>
      {len} / {max} chars (guidance {min}–{max})
    </span>
  );
}

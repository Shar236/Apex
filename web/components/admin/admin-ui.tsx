'use client';

import type { ReactNode } from 'react';
import { Save, X, TrendingUp, TrendingDown } from 'lucide-react';

/** Shared admin UI primitives — ported from the old Vite AdminConsole, kept small. */

export function Pill({ text, tint = 'emerald' }: { text: string; tint?: 'emerald' | 'sky' | 'rose' | 'amber' | 'neutral' | 'pink' }) {
  const map: Record<string, string> = {
    emerald: 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/40',
    sky: 'text-sky-700 bg-sky-50 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/40',
    rose: 'text-rose-700 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/40',
    amber: 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/40',
    neutral: 'text-neutral-600 bg-neutral-100 border-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700',
    pink: 'text-brand-pink bg-brand-pink/10 border-brand-pink/20',
  };
  const auto =
    ['FULFILLED', 'PAID', 'ASSIGNED', 'USED', 'ACTIVE', 'SOLD', 'AVAILABLE'].includes(text) ? 'emerald'
    : ['PENDING', 'PROCESSING', 'RESERVED', 'PAYMENT_PENDING', 'PAYMENT_RECEIVED_NEEDS_ALLOCATION'].includes(text) ? 'amber'
    : ['CANCELLED', 'FAILED', 'REFUNDED', 'EXPIRED'].includes(text) ? 'rose'
    : 'neutral';
  return <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black ${map[tint || auto]}`}>{text}</span>;
}

export function Empty({ title, desc = 'Nothing here yet.' }: { title: string; desc?: string }) {
  return (
    <div className="text-center py-10 rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929]">
      <div className="font-black text-neutral-900 dark:text-white">{title}</div>
      <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5] mt-1">{desc}</div>
    </div>
  );
}

export function Th({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <th className={`text-[10px] font-black uppercase tracking-wider px-4 py-3 text-left ${className}`}>{children}</th>;
}

export function Td({ children, className = '' }: { children?: ReactNode; className?: string }) {
  return <td className={`px-4 py-3 align-top text-neutral-700 dark:text-neutral-200 ${className}`}>{children}</td>;
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="block text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2">{children}</span>;
}

export function Field({
  label,
  type = 'text',
  value,
  onChange,
  required,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string | number | null | undefined;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <input
        type={type}
        value={value ?? ''}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition"
      />
    </label>
  );
}

export function TextArea({
  label,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <textarea
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink transition whitespace-pre-wrap"
      />
    </label>
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="w-4 h-4 accent-brand-pink" />
      <span className="text-xs font-black text-neutral-700 dark:text-neutral-200">{label}</span>
    </label>
  );
}

export function FormCard({ title, onClose, onSave, busy = false, children }: { title: string; onClose: () => void; onSave: () => void; busy?: boolean; children: ReactNode }) {
  return (
    <div className="mb-6 rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg">{title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={onClose} disabled={busy} className="px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black text-neutral-600 dark:text-neutral-300 flex items-center gap-1.5 disabled:opacity-50">
            <X className="w-4 h-4" /> Cancel
          </button>
          {/* busy blocks double-submit — two rapid clicks previously fired two create calls */}
          <button onClick={onSave} disabled={busy} className="px-4 py-2 rounded-xl btn-pink text-white font-black text-xs flex items-center gap-1.5 shadow-lg disabled:opacity-60 disabled:cursor-wait">
            <Save className="w-4 h-4" /> {busy ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  tint = '#FF005C',
  growth = null,
  sub = null,
  onClick = null,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  tint?: string;
  growth?: number | null;
  sub?: ReactNode;
  onClick?: (() => void) | null;
}) {
  const Comp: 'button' | 'div' = onClick ? 'button' : 'div';
  return (
    <Comp
      onClick={onClick || undefined}
      className={`rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm flex flex-col justify-between text-left w-full ${onClick ? 'hover:border-brand-pink transition-colors cursor-pointer' : ''}`}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: tint }}>
            {icon}
          </div>
          {growth != null && (
            <span className={`inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full border ${growth >= 0 ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400'}`}>
              {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {growth > 0 ? `+${growth}%` : `${growth}%`}
            </span>
          )}
        </div>
        <div className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">{label}</div>
        <div className="font-heading font-black text-2xl sm:text-3xl tabular-nums mt-1">{value}</div>
      </div>
      {sub && <div className="text-[11px] font-black text-neutral-400 mt-2 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">{sub}</div>}
    </Comp>
  );
}

// ConfirmDialog now lives in components/ui/alert-dialog.tsx. The Radix version
// traps focus, restores it on close, and handles Escape — none of which the
// hand-rolled overlay that used to sit here did.

export function fmtDateTime(d?: string | Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function fmtDate(d?: string | Date | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

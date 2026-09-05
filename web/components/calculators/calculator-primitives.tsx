'use client';

import { useState, type ReactNode } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Info,
  Check,
  Copy,
  Sparkles,
  ShieldCheck,
  Clock,
  BookOpen,
  Award,
  Scale,
  GraduationCap,
} from 'lucide-react';
import { clamp } from '@/lib/calculator-logic';

/**
 * The primary "Calculate" call to action on every calculator.
 *
 * Every calculator scores reactively as you type, so this button used to be
 * inert markup — it looked like the main action and did nothing. It now does the
 * thing the label promises on the layout where it matters: on narrow screens the
 * result card sits below the inputs, so pressing Calculate brings it into view
 * and moves focus to it (which also announces the result to a screen reader).
 * Give the result panel `data-calc-result` for the lookup to find it.
 */
export function CalculateButton({ label, icon }: { label: string; icon?: ReactNode }) {
  const reveal = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Walk up to the nearest ancestor that actually contains a result panel, so
    // a page with more than one calculator still targets the right card.
    let node: HTMLElement | null = e.currentTarget;
    let panel: HTMLElement | null = null;
    while (node && !panel) {
      panel = node.querySelector<HTMLElement>('[data-calc-result]');
      node = node.parentElement;
    }
    if (!panel) return;
    panel.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'nearest',
    });
    panel.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      onClick={reveal}
      className="w-full py-3.5 px-6 rounded-2xl bg-accent hover:bg-accent-hover text-white text-[15px] font-bold shadow-lg shadow-accent/25 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer motion-reduce:transform-none"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export const calcInputCls =
  'w-full px-3.5 py-2.5 rounded-xl bg-surface-raised border border-line text-ink text-[15px] font-normal ' +
  'placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all tabular-nums';

/** Parses a raw input string; returns null when empty or not a number. */
export function parseScore(raw: string): number | null {
  if (raw.trim() === '') return null;
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Standard range error message, or null when the value is valid. Accepts null (empty input) as valid. */
export function rangeError(raw: number | null, min: number, max: number): string | null {
  if (raw === null) return null;
  if (raw < min || raw > max) return `Enter a value between ${min} and ${max}`;
  return null;
}

export function CalcCard({ className = '', children }: { className?: string; children: ReactNode }) {
  return <div className={`bg-surface border border-line rounded-2xl shadow-sm ${className}`}>{children}</div>;
}

export function CalcSectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      {subtitle && <p className="text-[13px] text-ink-muted mt-0.5 leading-relaxed">{subtitle}</p>}
    </div>
  );
}

export function CalcField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string | null;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-ink mb-1.5">
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-ink-muted mt-1.5">{hint}</p>
      )}
    </div>
  );
}

export function CalcNumberInput({
  id,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  className,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  min: number;
  max: number;
  step?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      id={id}
      type="number"
      inputMode="decimal"
      value={value}
      min={min}
      max={max}
      step={step}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={className ? `${calcInputCls} ${className}` : calcInputCls}
    />
  );
}

export function CalcSelect({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={`${calcInputCls} cursor-pointer`}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** The announced result region — screen readers read updates here. */
export function CalcResultCard({
  label,
  value,
  unit,
  caption,
  className = '',
  children,
}: {
  label: string;
  value: string;
  unit?: string;
  caption?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div role="status" aria-live="polite" className={`rounded-2xl border border-accent/25 bg-accent/5 p-5 sm:p-6 ${className}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
      <p className="mt-1.5 text-[40px] sm:text-[46px] leading-none font-bold text-accent tabular-nums">
        {value}
        {unit && <span className="ml-2 text-base font-medium text-ink-muted">{unit}</span>}
      </p>
      {caption && <div className="mt-3 text-[13px] text-ink-muted leading-relaxed">{caption}</div>}
      {children}
    </div>
  );
}

export function CalcBreakdown({ items, className = '' }: { items: Array<{ label: string; value: string }>; className?: string }) {
  return (
    <dl className={`divide-y divide-line rounded-xl border border-line overflow-hidden ${className}`}>
      {items.map((item) => (
        <div key={item.label} className="flex items-center justify-between gap-3 px-4 py-2.5 bg-surface">
          <dt className="text-[13px] text-ink-muted font-normal">{item.label}</dt>
          <dd className="text-[13px] font-semibold text-ink tabular-nums">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function CalcNote({ children }: { children: ReactNode }) {
  return <p className="text-xs text-ink-muted leading-relaxed">{children}</p>;
}

export function CalcError({ message }: { message: string }) {
  return (
    <p role="alert" className="text-[13px] font-medium text-red-500 dark:text-red-400">
      {message}
    </p>
  );
}

export function CalcDisclaimer({ title = 'Keep in mind', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-line bg-surface-raised p-4">
      <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-ink-muted leading-relaxed mt-0.5">{children}</p>
      </div>
    </div>
  );
}

/** Conversion-page flow: INPUT → connector → RESULT, so converters never look like ordinary calculators. */
export function ConversionFlow({ input, output, caption = 'Estimated conversion' }: { input: ReactNode; output: ReactNode; caption?: string }) {
  return (
    <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-4 items-stretch">
      <div>{input}</div>
      <div className="flex md:flex-col items-center justify-center gap-1.5 py-1 md:py-4" aria-hidden="true">
        <ArrowRight className="hidden md:block w-5 h-5 text-accent" />
        <ArrowDown className="md:hidden w-5 h-5 text-accent" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-ink-muted text-center leading-tight max-w-24">
          {caption}
        </span>
      </div>
      <div>{output}</div>
    </div>
  );
}

/** Horizontal score-position bar from min to max with a marker at `value`. */
export function ScoreMarkerBar({ value, min, max, ticks }: { value: number; min: number; max: number; ticks: string[] }) {
  const pct = clamp(((value - min) / (max - min)) * 100, 0, 100);
  return (
    <div>
      <div className="relative h-2 rounded-full bg-surface-raised border border-line">
        <div className="absolute inset-y-0 left-0 rounded-full bg-accent/30" style={{ width: `${pct}%` }} />
        <div
          className="absolute -top-1 h-4 w-1.5 rounded-full bg-accent border border-white/60"
          style={{ left: `calc(${pct}% - 3px)` }}
        />
      </div>
      <div className="flex justify-between mt-1.5 text-[10px] font-medium text-ink-muted">
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

/** Thin labelled progress bar for a single skill score. */
export function SkillBar({ label, value, min, max }: { label: string; value: number; min: number; max: number }) {
  const pct = clamp(((value - min) / (max - min)) * 100, 0, 100);
  return (
    <div>
      <div className="flex items-center justify-between text-[13px] mb-1">
        <span className="text-ink-muted font-normal">{label}</span>
        <span className="font-semibold text-ink tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-raised border border-line overflow-hidden">
        <div className="h-full rounded-full bg-accent/70" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** Skill Input Tile with colored icon, range hints, and error alerts */
export function SkillInputTile({
  id,
  label,
  icon,
  value,
  min,
  max,
  step = 1,
  onChange,
  iconBgClass = 'bg-accent/10 text-accent',
  placeholder,
  hint,
  error,
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  min: number;
  max: number;
  step?: number;
  onChange: (next: string) => void;
  iconBgClass?: string;
  placeholder?: string;
  hint?: string;
  error?: string | null;
}) {
  return (
    <div className="group rounded-2xl border border-line bg-surface p-4 transition-all duration-200 hover:border-accent/30 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/10">
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl shrink-0 ${iconBgClass}`}>
            {icon}
          </div>
          <div>
            <label htmlFor={id} className="block text-sm font-semibold text-ink leading-tight cursor-pointer">
              {label}
            </label>
            <span className="text-[11px] text-ink-muted">Scale: {min}–{max}</span>
          </div>
        </div>
      </div>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? `${min}–${max}`}
        className="w-full rounded-xl bg-surface-raised border border-line px-3.5 py-2.5 text-[15px] font-medium text-ink tabular-nums transition-colors placeholder:text-ink-muted/40 focus:outline-none focus:border-accent focus:bg-surface"
      />
      {error ? (
        <p role="alert" className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-ink-muted mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

/** Circular Score Gauge with animated SVG meter */
export function CircularScoreGauge({
  score,
  maxScore,
  minScore = 0,
  label = 'Score',
  sublabel,
  color = '#FF005C',
  size = 140,
}: {
  score: number;
  maxScore: number;
  minScore?: number;
  label?: string;
  sublabel?: string;
  color?: string;
  size?: number;
}) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = clamp((score - minScore) / (maxScore - minScore), 0, 1);
  const strokeDashoffset = circumference - pct * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black tracking-tight text-white tabular-nums leading-none">
            {score}
          </span>
            <span className="text-[11px] font-medium text-white/60 mt-1">out of {maxScore}</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-white/70">{label}</span>
        {sublabel && <p className="text-[11px] text-white/40">{sublabel}</p>}
      </div>
    </div>
  );
}

/** Share result button with clipboard copy and feedback */
export function ShareResultButton({
  textToCopy,
  title = 'Share Result',
  className = '',
}: {
  textToCopy: string;
  title?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }
    } catch {
      // ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={title}
      className={`inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white active:scale-95 ${className}`}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-emerald-300">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}

/** 4 Value Proposition Cards below the main calculator matching reference mockup */
export function CalcSupportingCards() {
  const cards = [
    {
      icon: BookOpen,
      title: 'How Scoring Works',
      text: 'Verified algorithms calibrated directly to published official scoring criteria and test guidelines.',
      color: 'bg-rose-500/10 text-rose-500 dark:text-rose-400',
    },
    {
      icon: Scale,
      title: 'Official Scoring Scale',
      text: 'Calibrated to official percentile ranks, CEFR frameworks, and university cutoff requirements.',
      color: 'bg-sky-500/10 text-sky-500 dark:text-sky-400',
    },
    {
      icon: Clock,
      title: 'Score Validity & Policies',
      text: 'Up-to-date guidelines on test validity periods (2–5 years) and multi-attempt superscore acceptance.',
      color: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400',
    },
    {
      icon: GraduationCap,
      title: 'University & Visa Acceptance',
      text: 'Recognized by top global institutions across the US, UK, Canada, Australia, and Germany.',
      color: 'bg-amber-500/10 text-amber-500 dark:text-amber-400',
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.title}
            className="rounded-2xl border border-line bg-surface p-5 transition-all duration-200 hover:border-accent/30 hover:shadow-sm"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3.5 ${card.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <h4 className="text-sm font-bold text-ink leading-snug mb-1.5">{card.title}</h4>
            <p className="text-xs text-ink-muted leading-relaxed">{card.text}</p>
          </div>
        );
      })}
    </div>
  );
}

/** Hero Trust Feature Pills */
export function FeaturePills() {
  const pills = [
    { icon: Sparkles, label: 'Instant Calculation' },
    { icon: Scale, label: 'Official Concordance' },
    { icon: Award, label: '100% Free & No Sign-up' },
    { icon: ShieldCheck, label: 'Privacy Protected' },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-5">
      {pills.map((pill) => {
        const Icon = pill.icon;
        return (
          <div
            key={pill.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-medium text-ink-muted shadow-xs backdrop-blur-sm"
          >
            <Icon className="h-3.5 w-3.5 text-accent" />
            <span>{pill.label}</span>
          </div>
        );
      })}
    </div>
  );
}

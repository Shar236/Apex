import type { ReactNode } from 'react';

const TONES = {
  accent: 'bg-accent/10 text-accent border-accent/25',
  accentSolid: 'bg-accent text-white border-transparent',
  success: 'bg-success/12 text-success border-success/25',
  info: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/25',
  warn: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25',
  neutral: 'bg-surface-raised text-ink-muted border-line',
} as const;

export type BadgeTone = keyof typeof TONES;

/** Compact status / label pill. Lightweight type (medium), uppercase + tracking for hierarchy instead of heavy weight. */
export default function Badge({
  tone = 'neutral',
  icon = null,
  className = '',
  children,
}: {
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full border',
        'text-[10px] font-medium uppercase tracking-[0.08em] whitespace-nowrap',
        TONES[tone] || TONES.neutral,
        className,
      ].join(' ')}
    >
      {icon}
      {children}
    </span>
  );
}

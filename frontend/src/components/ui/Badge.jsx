import React from 'react';

/**
 * Compact status / label pill. Lightweight type (medium), uppercase + tracking
 * for hierarchy instead of heavy weight.
 */
const TONES = {
  accent: 'bg-[var(--color-accent)]/10 text-[var(--color-accent)] border-[var(--color-accent)]/25',
  accentSolid: 'bg-[var(--color-accent)] text-white border-transparent',
  success: 'bg-[var(--color-success)]/12 text-[var(--color-success)] border-[var(--color-success)]/25',
  info: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/25',
  warn: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25',
  neutral: 'bg-[var(--color-surface-raised)] text-[var(--color-ink-muted)] border-[var(--color-line)]',
};

export default function Badge({ tone = 'neutral', icon = null, className = '', children }) {
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

import React from 'react';

/**
 * Compact status / label pill. Lightweight type (medium), uppercase + tracking
 * for hierarchy instead of heavy weight.
 */
const TONES = {
  accent: 'bg-accent/10 text-accent border-accent/25',
  accentSolid: 'bg-accent text-white border-transparent',
  success: 'bg-success/12 text-success border-success/25',
  info: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 border-sky-500/25',
  warn: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 border-amber-500/25',
  neutral: 'bg-surface-raised text-ink-muted border-line',
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

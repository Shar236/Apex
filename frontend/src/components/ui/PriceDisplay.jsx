import React from 'react';

/**
 * Struck original (small, muted) above a prominent current price.
 * Lightweight: current price is `font-semibold` (600) max — not black.
 *
 * Props: original, current (numbers), formatPrice (fn), size: 'md' | 'lg',
 *        emphasis: 'ink' | 'accent' (colour of the current price).
 */
const CUR = {
  md: 'text-2xl',
  lg: 'text-[2rem] sm:text-4xl',
};

export default function PriceDisplay({ original, current, formatPrice, size = 'md', emphasis = 'ink', showSaved = false, className = '' }) {
  const hasDiscount = original && original > current;
  const saved = hasDiscount ? original - current : 0;
  const curColor = emphasis === 'accent' ? 'text-[var(--color-accent)]' : 'text-[var(--color-ink)]';

  return (
    <div className={`min-w-0 ${className}`}>
      {hasDiscount ? (
        <span className="block text-xs font-normal text-[var(--color-ink-muted)] line-through leading-none mb-1">
          {formatPrice(original)}
        </span>
      ) : (
        <span className="block text-xs leading-none mb-1 select-none">&nbsp;</span>
      )}
      <span className={`font-heading font-semibold leading-none tracking-tight block ${CUR[size]} ${curColor}`}>
        {formatPrice(current)}
      </span>
      {showSaved && saved > 0 && (
        <span className="block mt-1 text-xs font-normal text-[var(--color-success)]">
          You save {formatPrice(saved)}
        </span>
      )}
    </div>
  );
}

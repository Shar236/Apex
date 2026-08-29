import React from 'react';

/**
 * Theme-aware surface. Light: white + hairline grey border + faint shadow.
 * Dark: raised dark surface + subtle navy border. Not an inversion.
 */
export default function Card({ as: Comp = 'div', interactive = false, selected = false, className = '', children, ...props }) {
  return (
    <Comp
      className={[
        'rounded-2xl bg-[var(--color-surface)] border transition-all duration-200',
        selected
          ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]/40 shadow-sm'
          : 'border-[var(--color-line)]',
        'shadow-[0_1px_3px_rgba(15,20,35,0.04),0_8px_24px_-16px_rgba(15,20,35,0.10)]',
        'dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_-16px_rgba(0,0,0,0.6)]',
        interactive ? 'hover:border-[var(--color-accent)]/45 hover:-translate-y-1 cursor-pointer' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Comp>
  );
}

import React from 'react';

/**
 * The one button for the marketing site.
 *
 *   primary    — APEX pink fill, white text, pill, subtle hover lift
 *   secondary  — surface bg, pink border + pink text
 *   ghost      — transparent, muted text, hover surface
 *   disabled   — neutral grey, clearly unavailable, no hover
 *
 * Sizes keep height / padding / radius consistent everywhere.
 * Lightweight type: label is `font-medium` (500), never black.
 */
const SIZES = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
};

const VARIANTS = {
  primary:
    'bg-[var(--color-accent)] text-white shadow-sm shadow-[var(--color-accent)]/20 ' +
    'hover:bg-[var(--color-accent-hover)] hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-accent)] border border-[var(--color-accent)]/45 ' +
    'hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/[0.06]',
  ghost:
    'bg-transparent text-[var(--color-ink-muted)] border border-[var(--color-line)] ' +
    'hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-raised)]',
  disabled:
    'bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)] border border-[var(--color-line)] ' +
    'cursor-not-allowed select-none',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}) {
  const v = disabled ? 'disabled' : variant;
  return (
    <Comp
      disabled={Comp === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      className={[
        'inline-flex items-center justify-center rounded-full font-medium whitespace-nowrap',
        'transition-all duration-200 cursor-pointer',
        SIZES[size],
        VARIANTS[v],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Comp>
  );
}

export const PrimaryButton = (p) => <Button variant="primary" {...p} />;
export const SecondaryButton = (p) => <Button variant="secondary" {...p} />;

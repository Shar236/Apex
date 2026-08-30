import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

/**
 * The one button for the marketing site.
 *
 *   primary    — APEX pink fill, white text, pill, subtle hover lift
 *   secondary  — surface bg, pink border + pink text
 *   ghost      — transparent, muted text, hover surface
 *   disabled   — neutral grey, clearly unavailable, no hover
 */
const SIZES = {
  sm: 'h-9 px-4 text-[13px] gap-1.5',
  md: 'h-11 px-5 text-sm gap-2',
  lg: 'h-12 px-6 text-[15px] gap-2',
} as const;

const VARIANTS = {
  primary:
    'bg-accent text-white shadow-sm shadow-accent/20 ' +
    'hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-md active:translate-y-0',
  secondary: 'bg-surface text-accent border border-accent/45 hover:border-accent hover:bg-accent/6',
  ghost: 'bg-transparent text-ink-muted border border-line hover:text-ink hover:bg-surface-raised',
  disabled: 'bg-surface-sunken text-ink-muted border border-line cursor-not-allowed select-none',
} as const;

type Variant = keyof typeof VARIANTS;
type Size = keyof typeof SIZES;

type ButtonProps<T extends ElementType> = {
  as?: T;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

export default function Button<T extends ElementType = 'button'>({
  as,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps<T>) {
  const Comp = (as || 'button') as ElementType;
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

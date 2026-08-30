import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';

type CardProps<T extends ElementType> = {
  as?: T;
  interactive?: boolean;
  selected?: boolean;
  className?: string;
  children?: ReactNode;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>;

/** Theme-aware surface. Light: white + hairline grey border + faint shadow. Dark: raised dark surface + subtle navy border. */
export default function Card<T extends ElementType = 'div'>({
  as,
  interactive = false,
  selected = false,
  className = '',
  children,
  ...props
}: CardProps<T>) {
  const Comp = (as || 'div') as ElementType;
  return (
    <Comp
      className={[
        'rounded-2xl bg-surface border transition-all duration-200',
        selected ? 'border-accent ring-1 ring-accent/40 shadow-sm' : 'border-line',
        'shadow-[0_1px_3px_rgba(15,20,35,0.04),0_8px_24px_-16px_rgba(15,20,35,0.10)]',
        'dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_8px_24px_-16px_rgba(0,0,0,0.6)]',
        interactive ? 'hover:border-accent/45 hover:-translate-y-1 cursor-pointer' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </Comp>
  );
}

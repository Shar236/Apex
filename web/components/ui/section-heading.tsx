import type { ReactNode } from 'react';

/** Reusable section header: optional pink eyebrow, a light Sora H2, optional sub. */
export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}: {
  eyebrow?: ReactNode;
  title?: ReactNode;
  subtitle?: ReactNode;
  align?: 'center' | 'left';
  className?: string;
}) {
  const alignCls = align === 'center' ? 'text-center items-center mx-auto' : 'text-left items-start';
  return (
    <div className={`flex flex-col ${alignCls} max-w-2xl mb-10 ${className}`}>
      {eyebrow && <span className="inline-flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-accent mb-3">{eyebrow}</span>}
      {title && <h2 className="font-heading font-light text-3xl sm:text-4xl leading-[1.15] text-ink">{title}</h2>}
      {subtitle && <p className="mt-3 text-sm sm:text-base font-normal text-ink-muted leading-relaxed">{subtitle}</p>}
    </div>
  );
}

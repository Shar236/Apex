import React from 'react';
import { PearsonPTELogo, IELTSLogo, ETSToeflLogo, DuolingoTestLogo, ETSGreLogo } from './OfficialBrandLogos';

export const ExamLogoMarquee = () => {
  const logos = [
    { id: 'pte',      component: PearsonPTELogo,  label: 'Pearson PTE Academic' },
    { id: 'ielts',    component: IELTSLogo,        label: 'IELTS Academic' },
    { id: 'toefl',    component: ETSToeflLogo,     label: 'ETS TOEFL iBT' },
    { id: 'duolingo', component: DuolingoTestLogo, label: 'Duolingo English Test' },
    { id: 'gre',      component: ETSGreLogo,       label: 'ETS GRE General' },
  ];

  /*
   * Pills always use a WHITE background in BOTH light and dark modes.
   * This ensures dark-colored logos (Pearson navy, TOEFL near-black, GRE purple)
   * are always readable — the page background changes, but the pill never goes dark.
   */
  const pillClass = [
    'h-10 sm:h-12 px-5 py-2 rounded-2xl border shadow-sm',
    'flex items-center justify-center',
    'bg-white dark:bg-white',
    'border-slate-200 dark:border-slate-200/30',
    'hover:border-[var(--color-accent)] hover:shadow-md',
    'transition-all duration-200',
  ].join(' ');

  const LogoGroup = ({ prefix }) => (
    <div className="flex items-center space-x-8 sm:space-x-12 shrink-0">
      {logos.map((item) => {
        const LogoComp = item.component;
        return (
          <React.Fragment key={`${prefix}-${item.id}`}>
            <div className={pillClass} aria-label={item.label}>
              <LogoComp inverted={false} />
            </div>
            <span className="text-[var(--color-line-strong)] font-normal text-sm select-none">•</span>
          </React.Fragment>
        );
      })}
    </div>
  );

  return (
    <section
      aria-label="Exam platforms supported by Apex Vouchers"
      className="py-6 sm:py-8 bg-[var(--color-surface)] border-y border-[var(--color-line)] relative overflow-hidden transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-3 text-center">
        <span className="text-[11px] font-medium uppercase tracking-widest text-[var(--color-ink-muted)]">
          Vouchers Available For Leading English-Language Exams
        </span>
      </div>

      <div className="relative w-full overflow-hidden">
        <div className="absolute top-0 left-0 bottom-0 w-16 sm:w-32 bg-linear-to-r from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-16 sm:w-32 bg-linear-to-l from-[var(--color-surface)] via-[var(--color-surface)]/80 to-transparent z-10 pointer-events-none" />
        <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center space-x-8 sm:space-x-12 py-2">
          <LogoGroup prefix="g1" />
          <LogoGroup prefix="g2" />
          <LogoGroup prefix="g3" />
        </div>
      </div>
    </section>
  );
};

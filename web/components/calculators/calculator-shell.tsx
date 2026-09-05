import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Sparkles, Ticket } from 'lucide-react';
import { JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/config';
import { CALCULATOR_CATEGORY_LABELS, CALCULATORS, getCalculator, type CalculatorMeta } from '@/lib/calculators';
import { CALCULATOR_CONTENT } from '@/lib/calculator-logic';
import { FeaturePills } from '@/components/calculators/calculator-primitives';

export function CalculatorShell({ meta, children }: { meta: CalculatorMeta; children: ReactNode }) {
  const content = CALCULATOR_CONTENT[meta.slug];
  const related = (content?.relatedSlugs ?? [])
    .map((slug) => getCalculator(slug))
    .filter((c): c is CalculatorMeta => Boolean(c));

  // Highlight first keyword in title (e.g. PTE, IELTS, TOEFL, GRE, SAT, ACT, WES, CGPA)
  const titleWords = meta.name.split(' ');
  const firstWord = titleWords[0];
  const restOfTitle = titleWords.slice(1).join(' ');

  return (
    <div className="calc-page min-h-screen bg-surface-sunken transition-colors duration-300">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: meta.name,
          url: `${siteConfig.siteUrl}/calculators/${meta.slug}`,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Any',
          description: meta.description,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Score Calculators', path: '/calculators' },
          { name: meta.name, path: `/calculators/${meta.slug}` },
        ])}
      />
      {content && (
        <JsonLd
          data={{
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: content.faq.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }}
        />
      )}

      {/* Breadcrumb Bar */}
      <div className="bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-ink-muted flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <Link href="/calculators" className="hover:text-accent transition-colors">Score Calculators</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-accent font-medium" aria-current="page">{meta.name}</span>
          </nav>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        {/* Centered Hero Header */}
        <header className="pt-10 sm:pt-14 pb-6 text-center relative max-w-3xl mx-auto">
          {/* Playful Study Goal Arrow from Reference Mockup */}
          <div className="hidden lg:flex flex-col items-center absolute -right-16 top-6 text-accent select-none pointer-events-none rotate-3" aria-hidden="true">
            <span className="font-heading text-[13px] font-bold tracking-tight text-accent max-w-[125px] leading-tight text-center">
              Plan your study goals today!
            </span>
            <svg width="42" height="42" viewBox="0 0 50 50" fill="none" className="text-accent mt-0.5 stroke-current">
              <path d="M10 8 C 22 14, 34 24, 32 38" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              <path d="M24 35 L 32 39 L 36 31" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{CALCULATOR_CATEGORY_LABELS[meta.category]}</span>
          </div>

          <h1 className="text-[34px] sm:text-[44px] lg:text-[48px] leading-[1.12] font-extrabold tracking-tight text-ink">
            <span className="text-accent">{firstWord}</span> {restOfTitle}
          </h1>

          {content && (
            <p className="mt-3 text-[15px] sm:text-[17px] text-ink-muted leading-relaxed max-w-2xl mx-auto">
              {content.intro}
            </p>
          )}

          <p className="mt-2 text-xs font-medium text-ink-muted/80">
            Accurate calculation • Based on official scoring methodology
          </p>

          <FeaturePills />
        </header>

        {/* Interactive Calculator Tool */}
        <section aria-label={`${meta.name} tool`} className="mt-2">
          {children}
        </section>

        {/* Informational & SEO Sections */}
        {content && (
          <div className="mt-16 space-y-12 border-t border-line pt-12">
            {/* How It Works */}
            <section aria-labelledby="how-it-works">
              <h2 id="how-it-works" className="text-[22px] sm:text-[26px] font-bold text-ink">
                How the {meta.name} Works
              </h2>
              <p className="mt-2 text-[15px] text-ink-muted leading-relaxed">
                <span className="font-semibold text-ink">Scoring Methodology:</span> {meta.formula}
              </p>
              <ul className="mt-4 space-y-2.5">
                {meta.howItWorks.map((point) => (
                  <li key={point} className="flex items-start gap-2.5 text-[15px] text-ink-muted leading-relaxed">
                    <span className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Example Calculation Table */}
            <section aria-labelledby="example">
              <h2 id="example" className="text-[22px] sm:text-[26px] font-bold text-ink">
                {content.exampleTitle}
              </h2>
              <dl className="mt-4 divide-y divide-line rounded-2xl border border-line bg-surface overflow-hidden shadow-xs">
                {content.example.map((row) => (
                  <div key={row.label} className="flex items-center justify-between gap-4 px-4 sm:px-5 py-3">
                    <dt className="text-[13px] sm:text-sm text-ink-muted font-normal">{row.label}</dt>
                    <dd className="text-[13px] sm:text-sm font-semibold text-ink tabular-nums text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">{content.exampleConclusion}</p>
            </section>

            {/* What Your Score Means */}
            <section aria-labelledby="meaning">
              <h2 id="meaning" className="text-[22px] sm:text-[26px] font-bold text-ink">
                {content.meaningTitle}
              </h2>
              <div className="mt-4 space-y-2.5 border-l-2 border-accent/40 pl-4 sm:pl-5">
                {content.meaning.map((paragraph) => (
                  <p key={paragraph} className="text-[15px] text-ink-muted leading-relaxed">{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Frequently Asked Questions */}
            <section aria-labelledby="faq">
              <h2 id="faq" className="text-[22px] sm:text-[26px] font-bold text-ink">
                Frequently Asked Questions
              </h2>
              <div className="mt-4 space-y-3">
                {content.faq.map((item) => (
                  <details key={item.question} className="group rounded-2xl border border-line bg-surface shadow-xs">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-[15px] font-semibold text-ink hover:text-accent transition-colors [&::-webkit-details-marker]:hidden">
                      {item.question}
                      <ChevronRight className="w-4 h-4 shrink-0 text-ink-muted transition-transform group-open:rotate-90" aria-hidden="true" />
                    </summary>
                    <p className="px-5 pb-4 text-sm text-ink-muted leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Related Calculators */}
        {related.length > 0 && (
          <section aria-labelledby="related" className="mt-14 pt-12 border-t border-line">
            <h2 id="related" className="text-[22px] sm:text-[26px] font-bold text-ink">
              Related Calculators
            </h2>
            <div className="mt-4 grid sm:grid-cols-3 gap-4">
              {related.map((calculator) => (
                <Link
                  key={calculator.slug}
                  href={`/calculators/${calculator.slug}`}
                  className="group flex flex-col rounded-2xl bg-surface border border-line p-5 hover:border-accent/40 hover:shadow-md transition-all"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-ink group-hover:text-accent transition-colors">{calculator.name}</span>
                    <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
                  </span>
                  <span className="text-xs text-ink-muted mt-1.5 leading-relaxed">{calculator.tagline}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Promotional Exam Voucher Discount Card */}
        <section className="mt-14 rounded-3xl p-6 sm:p-8 bg-[#0D1527] text-white border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
              <Ticket className="w-3.5 h-3.5" />
              <span>Official Exam Vouchers</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Booking your test soon? Save up to ₹3,401
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Get genuine, authorized test vouchers for PTE Academic, PTE Core, GRE, TOEFL, and Duolingo. Delivered to your email instantly with 100% money-back authenticity guarantee.
            </p>
          </div>
          <Link
            href="/exam-vouchers"
            className="px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/25 transition shrink-0 whitespace-nowrap"
          >
            Browse Exam Vouchers →
          </Link>
        </section>

        {/* Back to All Calculators Link */}
        <div className="mt-10 text-center">
          <Link href="/calculators" className="inline-flex items-center gap-1.5 font-semibold text-sm text-accent hover:underline">
            ← Browse all {CALCULATORS.length} Score Calculators
          </Link>
        </div>
      </main>
    </div>
  );
}

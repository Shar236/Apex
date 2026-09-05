import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Sparkles, Ticket } from 'lucide-react';
import { buildMetadata, JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { siteConfig } from '@/lib/config';
import { getCalculatorCategories } from '@/lib/calculators';
import { FeaturePills } from '@/components/calculators/calculator-primitives';
import { CalculatorsHubClient } from '@/components/calculators/calculators-hub-client';

export const metadata: Metadata = buildMetadata({
  title: 'Score Calculators – Free Exam Score, GPA & Grade Conversion Tools | ApexVoucher',
  description:
    'Free tools to estimate your exam scores, convert results, and plan your study goals. Calculate GRE, SAT, TOEFL, IELTS, ACT, PTE, WES GPA, CGPA, and German grades instantly.',
  path: '/calculators',
});

export default function CalculatorsLandingPage() {
  const categories = getCalculatorCategories();

  return (
    <div className="calc-page min-h-screen bg-surface-sunken transition-colors duration-300">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Score Calculators',
          url: `${siteConfig.siteUrl}/calculators`,
          description:
            'Free tools to estimate your exam scores, convert results, and plan your study goals.',
          hasPart: categories.flatMap((category) =>
            category.calculators.map((c) => ({
              '@type': 'WebApplication',
              name: c.name,
              url: `${siteConfig.siteUrl}/calculators/${c.slug}`,
              applicationCategory: 'EducationalApplication',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            })),
          ),
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'Score Calculators', path: '/calculators' }])} />

      <div className="bg-surface border-b border-line">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5">
          <nav className="flex items-center gap-2 text-xs font-medium text-ink-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-accent font-medium" aria-current="page">Score Calculators</span>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <header className="pt-10 sm:pt-14 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Free Calculators</span>
          </div>
          <h1 className="text-[36px] sm:text-[46px] lg:text-[50px] leading-[1.12] font-extrabold tracking-tight text-ink">
            Score <span className="text-accent">Calculators</span>
          </h1>
          <p className="mt-3 text-[16px] sm:text-[18px] text-ink-muted leading-relaxed max-w-2xl mx-auto">
            Free tools to estimate your exam scores, convert results, and plan your study goals.
          </p>

          <FeaturePills />
        </header>

        {/* Interactive Hub Client with Category Filters & Search */}
        <CalculatorsHubClient categories={categories} />

        {/* Promotional Banner */}
        <section className="mt-16 rounded-3xl p-6 sm:p-8 bg-[#0D1527] text-white border border-white/10 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
              <Ticket className="w-3.5 h-3.5" />
              <span>Discounted Exam Vouchers</span>
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Taking an exam soon? Save up to ₹3,401
            </h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Save on your official test fee with genuine discounted exam vouchers for PTE Academic, PTE Core, GRE, TOEFL, and Duolingo. Delivered to your email instantly.
            </p>
          </div>
          <Link
            href="/exam-vouchers"
            className="px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white text-sm font-bold shadow-lg shadow-accent/25 transition shrink-0 whitespace-nowrap"
          >
            Browse Exam Vouchers →
          </Link>
        </section>
      </main>
    </div>
  );
}

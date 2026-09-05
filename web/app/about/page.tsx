import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Award, ArrowRight, Heart, Zap, Headset } from 'lucide-react';
import { buildMetadata, JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { AboutApexVouchers } from '@/components/about-apex-vouchers';
import { VisualExplainerSection } from '@/components/visual-explainer-section';
import { HowItWorks } from '@/components/how-it-works';
import { SecurityTrustSection } from '@/components/redemption-and-security';

export const metadata: Metadata = buildMetadata({
  title: 'About Apex Vouchers | Genuine Exam Vouchers & Student Savings',
  description: 'Learn how Apex Vouchers makes study-abroad exam fees affordable with 100% genuine official PTE, IELTS, TOEFL, GRE and Duolingo vouchers, fast delivery and real human support.',
  path: '/about',
});

const aboutJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Apex Vouchers',
  url: 'https://apexvouchers.com/about',
  about: {
    '@type': 'Organization',
    name: 'Apex Vouchers',
    url: 'https://apexvouchers.com',
    description: 'Independent provider of genuine discounted exam vouchers and booking assistance for PTE, IELTS, TOEFL, GRE and Duolingo.',
  },
};

const VALUES = [
  { icon: <Zap className="w-5 h-5" />, title: 'Instant Delivery', desc: 'Automated voucher delivery within seconds of successful payment — no waiting around.' },
  { icon: <ShieldCheck className="w-5 h-5" />, title: '100% Genuine Codes', desc: 'Official codes procured through authorized institutional channels. Backed by a money-back policy.' },
  { icon: <Heart className="w-5 h-5" />, title: 'Student-First Support', desc: 'Real human guidance for voucher redemption, exam booking, and refund questions — 7 days a week.' },
  { icon: <Headset className="w-5 h-5" />, title: 'Transparent Process', desc: 'Clear pricing, honest availability, and no hidden fees. You always know what you are paying for.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-sunken text-ink transition-colors duration-300">
      <JsonLd data={aboutJsonLd} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'About', path: '/about' }])} />

      <div className="bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-accent font-medium">About</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 pb-4">
        <div className="text-center max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium uppercase tracking-widest mb-4">
            <Award className="w-4 h-4" /> About Apex Vouchers
          </span>
          <h1 className="font-heading font-light text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight">About Apex Vouchers</h1>
          <p className="text-ink-muted text-sm sm:text-base font-normal mt-3 max-w-2xl mx-auto">
            Apex Vouchers helps Indian study-abroad aspirants save on official exam fees with 100% genuine vouchers, instant delivery, and honest support.
          </p>
        </div>
      </div>

      <VisualExplainerSection />
      <AboutApexVouchers />

      <HowItWorks />

      <SecurityTrustSection />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading font-light text-2xl sm:text-3xl lg:text-4xl text-ink tracking-tight">What We Stand For</h2>
          <p className="text-ink-muted text-sm font-normal mt-3">The values behind every voucher we deliver and every student we help.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-3xl p-6 bg-surface border border-line shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              <div className="w-10 h-10 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">{v.icon}</div>
              <h3 className="font-heading font-medium text-lg text-ink mb-2">{v.title}</h3>
              <p className="text-xs sm:text-sm font-normal text-ink-muted leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl p-8 sm:p-12 text-center bg-[#0B0D12] text-white border border-white/5 space-y-4">
          <h2 className="font-heading font-medium text-2xl sm:text-3xl text-white">Ready to Save on Your Exam Fee?</h2>
          <p className="text-sm text-neutral-400 font-medium max-w-xl mx-auto">Browse genuine official vouchers for PTE, IELTS, TOEFL, GRE and Duolingo and get instant delivery after payment.</p>
          <Link href="/exam-vouchers" className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent-hover text-white font-medium text-sm shadow-lg transition">
            Browse All Vouchers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
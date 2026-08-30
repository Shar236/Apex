import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, SectionHeading } from '@/components/ui';

const STEPS = [
  {
    num: '01',
    title: 'Choose Your Exam',
    desc: 'Select from PTE Academic, PTE Core, GRE, TOEFL, or Duolingo English Test.',
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="40" fill="#FF005C" fillOpacity="0.1" stroke="#FF005C" strokeWidth="3" />
        <path d="M35 50L45 60L65 40" stroke="#FF005C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    num: '02',
    title: 'Select Your Voucher',
    desc: 'View discounted rates, savings amount, and choose your preferred voucher quantity.',
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="30" width="60" height="40" rx="6" fill="#FF005C" fillOpacity="0.12" />
        <path d="M20 42H80" stroke="#FF005C" strokeWidth="3" />
        <circle cx="65" cy="55" r="4" fill="#FF005C" />
      </svg>
    ),
  },
  {
    num: '03',
    title: 'Complete Secure Payment',
    desc: 'Pay safely using UPI, Credit/Debit cards, NetBanking, or Wallet options.',
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="35" fill="#10B981" fillOpacity="0.12" stroke="#10B981" strokeWidth="3" />
        <rect x="38" y="45" width="24" height="18" rx="3" fill="#10B981" />
        <path d="M44 45V40C44 36.6863 46.6863 34 50 34C53.3137 34 56 36.6863 56 40V45" stroke="#10B981" strokeWidth="3" />
      </svg>
    ),
  },
  {
    num: '04',
    title: 'Receive Your Voucher',
    desc: 'Get your official voucher discount code instantly delivered via email in 10s.',
    illustration: (
      <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="30" width="60" height="40" rx="6" fill="#FF005C" fillOpacity="0.1" stroke="#FF005C" strokeWidth="3" />
        <path d="M20 32L50 55L80 32" stroke="#FF005C" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 bg-surface border-b border-line relative transition-colors duration-300 scroll-mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Simple Process" title="Getting Your Voucher Is Simple." subtitle="Follow four easy steps to secure your official exam discount code in under 60 seconds." />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-1/3 left-12 right-12 h-0.5 bg-line z-0" />

          {STEPS.map((st, idx) => (
            <div key={st.num} className="relative z-10 bg-surface rounded-3xl p-6 border border-line shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading font-normal text-3xl text-accent">{st.num}</span>
                  <div className="p-2 rounded-2xl bg-surface-raised border border-line">{st.illustration}</div>
                </div>
                <h3 className="font-heading font-medium text-lg text-ink leading-snug mb-2">{st.title}</h3>
                <p className="text-ink-muted text-xs font-normal leading-relaxed">{st.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-line flex items-center gap-1 text-[11px] font-normal text-ink-muted">
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                <span>Verified Step {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button as={Link} href="/exam-vouchers" variant="primary" size="lg">
            <span>Get Your Exam Voucher Now</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

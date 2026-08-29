import React from 'react';
import { Tag, Zap, Lock, GraduationCap, Headphones, CheckCircle2 } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { SectionHeading } from './ui';

export const WhyApexVoucher = () => {
  const { setActiveTab } = useVoucher();

  const features = [
    {
      icon: Tag,
      title: 'Unmatched Discount Prices',
      desc: 'Save big on PTE, GRE, TOEFL, and Duolingo. Zero hidden fees. Direct official reseller pricing.',
      badge: '💰 Max Student Savings'
    },
    {
      icon: Zap,
      title: 'Faster Than Your OTP',
      desc: 'Receive your unique voucher code instantly in your email and WhatsApp within 10 seconds of payment.',
      badge: '⚡ 10-Second Express'
    },
    {
      icon: Lock,
      title: '256-Bit SSL Checkout',
      desc: 'Pay safely via UPI, Credit/Debit Cards, NetBanking or EMI protected by bank-grade encryption.',
      badge: '🔒 100% Secure'
    },
    {
      icon: GraduationCap,
      title: 'Up to 11 Months Validity',
      desc: 'Book your exam whenever you are confident. Long validity period gives you complete peace of mind.',
      badge: '📅 Maximum Validity'
    },
    {
      icon: Headphones,
      title: 'Real Human Support Desk',
      desc: 'Got stuck or need help selecting an exam date? Our student desk responds instantly on WhatsApp.',
      badge: '💬 WhatsApp Desk'
    },
    {
      icon: CheckCircle2,
      title: 'Zero Credentials Sharing',
      desc: 'Redeem directly on official test provider websites (Pearson, ETS, Duolingo). Zero credential sharing.',
      badge: '✓ 100% Safe'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[var(--color-surface-raised)] border-b border-[var(--color-line)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeading
          eyebrow="Why Students Love Apex"
          title="Why 13,500+ Aspirants Trust Apex Vouchers"
          subtitle="Built from the ground up to give study abroad aspirants a faster, cheaper, and reassuring exam booking experience."
        />

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[var(--color-surface)] rounded-3xl p-7 border border-[var(--color-line)] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--color-accent)]/[0.08] text-[var(--color-accent)] flex items-center justify-center group-hover:scale-105 transition-transform border border-[var(--color-accent)]/20">
                      <IconComp className="w-6 h-6" strokeWidth={2} />
                    </div>
                    <span className="text-[10px] font-medium uppercase px-3 py-1 rounded-full bg-[var(--color-surface-sunken)] text-[var(--color-ink-muted)]">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-medium text-xl text-[var(--color-ink)] leading-snug mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-[var(--color-ink-muted)] text-xs font-normal leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-line)] flex items-center text-xs font-normal text-[var(--color-success)]">
                  <span>✓ 100% Student Approved</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

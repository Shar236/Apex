import React from 'react';
import { Tag, Zap, Lock, GraduationCap, Headphones, CheckCircle2, ArrowRight } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';

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
    <section className="py-16 sm:py-24 bg-slate-50/80 dark:bg-[#0A0A0A] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF005C] bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-[#FF005C]/20 shadow-sm">
            WHY STUDENTS LOVE APEX
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
            Why 13,500+ Aspirants Trust <br />
            <span className="text-pink-highlight">Apex Vouchers</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-3">
            Built from the ground up to give study abroad aspirants a faster, cheaper, and reassuring exam booking experience.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#161616] rounded-3xl p-7 border border-slate-200/80 dark:border-[#292929] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform border border-[#FF005C]/20">
                      <IconComp className="w-6 h-6 text-[#FF005C]" strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black uppercase px-3 py-1 rounded-full bg-slate-100 dark:bg-[#262626] text-slate-800 dark:text-slate-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-[#FF005C] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-slate-600 dark:text-slate-400 text-xs font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#292929] flex items-center text-xs font-black text-[#10B981]">
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

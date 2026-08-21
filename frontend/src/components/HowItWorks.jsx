import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const HowItWorks = () => {
  const { setActiveTab } = useVoucher();

  const steps = [
    {
      num: '01',
      title: 'Choose Your Exam',
      desc: 'Select from PTE Academic, PTE Core, GRE, TOEFL, or Duolingo English Test.',
      illustration: (
        <svg className="w-16 h-16 text-brand-pink" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" fill="#FFF0F5" stroke="#FF005C" strokeWidth="3" />
          <path d="M35 50L45 60L65 40" stroke="#FF005C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    },
    {
      num: '02',
      title: 'Select Your Voucher',
      desc: 'View discounted rates, savings amount, and choose your preferred voucher quantity.',
      illustration: (
        <svg className="w-16 h-16 text-brand-pink" viewBox="0 0 100 100" fill="none">
          <rect x="20" y="30" width="60" height="40" rx="6" fill="#161616" />
          <path d="M20 42H80" stroke="#FF005C" strokeWidth="3" />
          <circle cx="65" cy="55" r="4" fill="#FF005C" />
        </svg>
      )
    },
    {
      num: '03',
      title: 'Complete Secure Payment',
      desc: 'Pay safely using UPI, Credit/Debit cards, NetBanking, or Wallet options.',
      illustration: (
        <svg className="w-16 h-16 text-emerald-500" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="35" fill="#ECFDF5" stroke="#10B981" strokeWidth="3" />
          <rect x="38" y="45" width="24" height="18" rx="3" fill="#10B981" />
          <path d="M44 45V40C44 36.6863 46.6863 34 50 34C53.3137 34 56 36.6863 56 40V45" stroke="#10B981" strokeWidth="3" />
        </svg>
      )
    },
    {
      num: '04',
      title: 'Receive Your Voucher',
      desc: 'Get your official voucher discount code instantly delivered via Email & WhatsApp in 10s.',
      illustration: (
        <svg className="w-16 h-16 text-brand-pink" viewBox="0 0 100 100" fill="none">
          <rect x="20" y="30" width="60" height="40" rx="6" fill="#FFF0F5" stroke="#FF005C" strokeWidth="3" />
          <path d="M20 32L50 55L80 32" stroke="#FF005C" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-[#EAEAEA] dark:border-[#292929] relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-brand-pink/20">
            SIMPLE PROCESS
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 dark:text-white tracking-tight mt-3">
            Getting Your Voucher <span className="text-pink-highlight">Is Simple.</span>
          </h2>
          <p className="text-neutral-500 dark:text-[#B5B5B5] font-medium text-base mt-3">
            Follow four easy steps to secure your official exam discount code in under 60 seconds.
          </p>
        </div>

        {/* Horizontal Timeline Desktop / Vertical Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-1/3 left-12 right-12 h-0.5 bg-neutral-200 dark:bg-[#292929] -z-0" />

          {steps.map((st, idx) => (
            <div
              key={idx}
              className="relative z-10 bg-white dark:bg-[#161616] rounded-3xl p-6 border border-[#EAEAEA] dark:border-[#292929] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading font-black text-3xl text-brand-pink">{st.num}</span>
                  <div className="p-2 rounded-2xl bg-neutral-50 dark:bg-[#111111] border border-[#EAEAEA] dark:border-[#292929]">
                    {st.illustration}
                  </div>
                </div>

                <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white leading-snug mb-2">
                  {st.title}
                </h3>

                <p className="text-neutral-500 dark:text-[#B5B5B5] text-xs font-medium leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EAEAEA] dark:border-[#292929] flex items-center gap-1 text-[11px] font-bold text-brand-pink">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Verified Step {idx + 1}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Callout */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setActiveTab('shop')}
            className="btn-pink !py-3.5 !px-8 !text-sm"
          >
            <span>Get Your Exam Voucher Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

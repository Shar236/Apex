import React from 'react';
import { Tag, Zap, Lock, GraduationCap, Headphones, CheckCircle2, ArrowRight } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';

export const WhyApexVoucher = () => {
  const { setActiveTab } = useVoucher();

  const features = [
    {
      icon: Tag,
      title: 'Better Prices',
      desc: 'Save significantly compared with standard official exam booking prices on PTE, GRE, TOEFL, and Duolingo.',
      badge: '💰 Max Savings'
    },
    {
      icon: Zap,
      title: 'Fast Delivery',
      desc: 'Receive your unique voucher code instantly in your email and WhatsApp within 10 seconds of payment.',
      badge: '⚡ 10s Delivery'
    },
    {
      icon: Lock,
      title: 'Secure Payment',
      desc: 'Use trusted payment gateways (UPI, Cards, NetBanking, EMI) protected by 256-bit SSL encryption.',
      badge: '🔒 100% Safe'
    },
    {
      icon: GraduationCap,
      title: 'Multiple Exams',
      desc: 'One-stop platform for Pearson PTE Academic, PTE Core, ETS GRE, TOEFL iBT, and Duolingo English Test.',
      badge: '🎓 All Major Exams'
    },
    {
      icon: Headphones,
      title: 'Customer Support',
      desc: 'Get prompt human help whenever you need assistance with booking, date selection, or redemption.',
      badge: '💬 Real Humans'
    },
    {
      icon: CheckCircle2,
      title: 'Transparent Process',
      desc: 'No hidden fees, no confusing steps, and no mandatory login credential sharing required.',
      badge: '✓ 100% Clear'
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-slate-50 dark:bg-[#111111] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-slate-800 dark:text-white bg-white dark:bg-[#161616] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929] shadow-sm">
            UNMATCHED VALUE & TRUST
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
            Why Students Choose <br />
            <span className="text-pink-highlight">Apex Vouchers</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-3">
            Built from the ground up to give study abroad aspirants a faster, cheaper, and safer exam booking experience.
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-[#161616] rounded-3xl p-6 border border-slate-200/80 dark:border-[#292929] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-[#0A0A0A] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform border border-slate-800">
                      <IconComp className="w-6 h-6 text-[#FF005C]" strokeWidth={2.2} />
                    </div>
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-[#262626] text-slate-800 dark:text-slate-200">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-[#FF005C] transition-colors">
                    {feat.title}
                  </h3>

                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#292929] flex items-center text-xs font-bold text-[#FF005C]">
                  <span>Guaranteed feature ✓</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => setActiveTab('shop')}
            className="btn-pink !py-3.5 !px-8 !text-sm"
          >
            <span>Explore Vouchers & Start Saving</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

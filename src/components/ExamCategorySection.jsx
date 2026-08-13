import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PearsonPTELogo, IELTSLogo, ETSToeflLogo, DuolingoTestLogo } from './OfficialBrandLogos';

export const ExamCategorySection = () => {
  const { setActiveTab, formatPrice, startCheckout, products } = useVoucher();

  const categories = [
    {
      id: 'pte',
      name: 'PTE Voucher',
      fullName: 'Pearson PTE Academic & Core',
      desc: 'Save more on your PTE Academic & PTE Core exam booking.',
      startingPrice: 15499,
      regularPrice: 18900,
      savings: 'Save ₹3,401',
      validity: 'Valid for 6 Months',
      badge: 'MOST POPULAR',
      featured: true,
      logoComponent: <PearsonPTELogo />
    },
    {
      id: 'ielts',
      name: 'IELTS Voucher',
      fullName: 'IELTS Academic & General',
      desc: 'Get exclusive discount codes for official IELTS test registration.',
      startingPrice: 16500,
      regularPrice: 17200,
      savings: 'Save ₹700',
      validity: 'Valid for 12 Months',
      badge: 'BEST VALUE',
      featured: false,
      logoComponent: <IELTSLogo />
    },
    {
      id: 'toefl',
      name: 'TOEFL Voucher',
      fullName: 'ETS TOEFL iBT Test',
      desc: 'Save more on TOEFL iBT accepted by universities worldwide.',
      startingPrice: 13999,
      regularPrice: 18000,
      savings: 'Save ₹4,001',
      validity: 'Valid for 12 Months',
      badge: 'MAX DISCOUNT',
      featured: false,
      logoComponent: <ETSToeflLogo />
    },
    {
      id: 'duolingo',
      name: 'Duolingo English Test Voucher',
      fullName: 'Duolingo English Test Coupon',
      desc: 'Fast digital delivery with instant coupon savings.',
      startingPrice: 4999,
      regularPrice: 6112,
      savings: 'Save ₹1,113',
      validity: 'Valid for 90 Days',
      badge: 'FAST RESULTS',
      featured: false,
      logoComponent: <DuolingoTestLogo />
    }
  ];

  return (
    <section id="choose-your-exam" className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF005C] bg-[#F0F7FF] dark:bg-[#1E293B] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929]">
            CHOOSE YOUR EXAM
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight mt-3">
            Save on Your <span className="text-pink-highlight">English Test Booking.</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base mt-3">
            Select your English language test and get genuine vouchers at exclusive prices.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const product = products.find(p => p.name.toLowerCase().includes(cat.name.split(' ')[0].toLowerCase())) || products[0];

            return (
              <div
                key={cat.id}
                className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  cat.featured
                    ? 'bg-[#0F172A] text-white shadow-2xl border-2 border-[#FF005C] -translate-y-1.5'
                    : 'bg-white dark:bg-[#161616] text-[#0F172A] dark:text-white border border-slate-200/80 dark:border-[#292929] hover:border-[#FF005C] hover:shadow-xl hover:-translate-y-1'
                }`}
              >
                {/* Top Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    cat.featured ? 'bg-[#FF005C] text-white shadow-sm' : 'bg-slate-100 dark:bg-[#262626] text-slate-700 dark:text-slate-300'
                  }`}>
                    {cat.badge}
                  </span>
                  <span className={`text-xs font-bold ${cat.featured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {cat.validity}
                  </span>
                </div>

                {/* Logo Area */}
                <div className={`p-4 rounded-2xl mb-4 border flex items-center justify-center ${
                  cat.featured 
                    ? 'bg-slate-900 border-slate-800' 
                    : 'bg-[#F0F7FF] dark:bg-[#1E293B] border-slate-200/80 dark:border-[#292929]'
                }`}>
                  {cat.logoComponent}
                </div>

                {/* Card Title & Desc */}
                <div className="space-y-2 mb-6">
                  <h3 className={`font-heading font-black text-xl leading-snug ${cat.featured ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>
                    {cat.name}
                  </h3>
                  <p className={`text-xs font-medium leading-relaxed ${cat.featured ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                    {cat.desc}
                  </p>
                </div>

                {/* Pricing & CTA */}
                <div className={`pt-4 border-t space-y-3 ${cat.featured ? 'border-slate-800' : 'border-slate-100 dark:border-[#292929]'}`}>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className={`text-[10px] uppercase font-bold block ${cat.featured ? 'text-slate-400' : 'text-slate-400'}`}>
                        Starting From
                      </span>
                      <span className={`font-heading font-black text-2xl ${cat.featured ? 'text-white' : 'text-[#0F172A] dark:text-white'}`}>
                        {formatPrice(cat.startingPrice)}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-[#10B981] text-white font-extrabold text-xs shadow-sm">
                      {cat.savings}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      if (cat.featured) {
                        startCheckout(product);
                      } else {
                        setActiveTab('shop');
                      }
                    }}
                    className="w-full btn-pink !py-3.5 !rounded-xl !text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>View {cat.name}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

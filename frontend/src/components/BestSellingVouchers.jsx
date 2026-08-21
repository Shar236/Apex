import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { HomepageVoucherCard } from './HomepageVoucherCard';
import { ArrowRight, ShieldCheck, Zap, Tag, Headphones, LayoutGrid } from 'lucide-react';

const isPTE = (p) => {
  const haystack = `${p.name || ''} ${p.brand || ''} ${p.provider || ''} ${p.category || ''}`.toLowerCase();
  return haystack.includes('pte') && !haystack.includes('gre') && !haystack.includes('toefl');
};

export const BestSellingVouchers = () => {
  const { products, setActiveTab } = useVoucher();

  const activeProducts = products.filter((p) => p.active !== false && !p.archived);
  const pteProducts = activeProducts
    .filter(isPTE)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));

  if (pteProducts.length === 0) return null;

  const features = [
    {
      icon: Zap,
      iconBg: 'bg-brand-pink/20 text-brand-pink',
      title: 'Instant Digital Delivery',
      subtitle: 'Get voucher in 10 seconds'
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-[#10B981]/20 text-[#10B981]',
      title: '100% Genuine Vouchers',
      subtitle: 'Official exam partners'
    },
    {
      icon: Tag,
      iconBg: 'bg-purple-500/20 text-purple-400',
      title: 'Best Prices Guaranteed',
      subtitle: 'Save more on every purchase'
    },
    {
      icon: Headphones,
      iconBg: 'bg-blue-500/20 text-blue-400',
      title: '24/7 Customer Support',
      subtitle: "We're here to help you"
    }
  ];

  return (
    <section className="py-16 sm:py-24 bg-[#06080E] text-white border-b border-slate-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0D1322] border border-slate-800 shadow-sm text-xs font-bold text-slate-200">
            <ShieldCheck className="w-4 h-4 text-brand-pink" />
            <span>TRUSTED BY 15,000+ STUDENTS</span>
          </div>

          {/* Main Title */}
          <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
            PTE <span className="text-brand-pink">Vouchers</span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-400 font-medium text-base sm:text-lg">
            Choose the right PTE option for your test preparation, study or eligible pathway.
          </p>

        </div>

        {/* 4 Feature Pill Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {features.map((feat, idx) => {
            const IconComp = feat.icon;
            return (
              <div
                key={idx}
                className="bg-[#0D1322] p-4 rounded-2xl border border-slate-800/80 flex items-center gap-3.5 shadow-md"
              >
                <div className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center shrink-0`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-snug">
                  <span className="text-xs font-black text-white">{feat.title}</span>
                  <span className="text-[11px] font-medium text-slate-400">{feat.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* PTE Voucher Cards Grid — white cards on dark bg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 items-start">
          {pteProducts.map((product) => (
            <HomepageVoucherCard key={product.id || product._id} product={product} />
          ))}
        </div>

        {/* Bottom Centered "Explore All Vouchers" Pill Button */}
        <div className="text-center">
          <button
            onClick={() => setActiveTab('shop')}
            className="inline-flex items-center gap-2 bg-[#0D1322] hover:bg-[#1A2338] text-white font-bold text-xs px-7 py-3.5 rounded-full border border-slate-800 transition-all cursor-pointer shadow-lg hover:scale-[1.02]"
          >
            <LayoutGrid className="w-4 h-4 text-brand-pink" />
            <span>Explore All Vouchers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};

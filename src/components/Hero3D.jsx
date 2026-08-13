import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Star, Zap, Lock, Clock } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { ApexLogo } from './ApexLogo';

export const Hero3D = () => {
  const { setActiveTab, formatPrice, startCheckout, products } = useVoucher();

  const pteVoucher = products?.find(p => p.id === 'pte-academic') || {
    originalPrice: 18900,
    discountedPrice: 15499,
    savings: 3401
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50 dark:from-[#0A0A0A] dark:via-[#0A0A0A] dark:to-[#111111] pt-10 lg:pt-16 pb-20 border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      
      {/* Background Subtle Soft Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-slate-200/30 dark:bg-[#FF005C]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline, Subheading & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Small Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#161616] border border-slate-200 dark:border-[#292929] shadow-sm text-xs font-bold text-slate-800 dark:text-white">
              <span className="w-2 h-2 rounded-full bg-[#FF005C] animate-ping" />
              <ShieldCheck className="w-4 h-4 text-[#FF005C]" />
              <span>Trusted Exam Voucher Platform</span>
            </div>

            {/* Large Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-slate-900 dark:text-white tracking-tight">
              Save More on Your <br className="hidden sm:inline" />
              <span className="relative inline-block">
                <span className="relative z-10">English <span className="text-pink-highlight">Exam.</span></span>
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg leading-relaxed max-w-xl">
              Get genuine exam vouchers for <strong className="text-slate-900 dark:text-white font-bold">PTE, IELTS, TOEFL and Duolingo English Test</strong> at competitive prices. Instant delivery & official acceptance guaranteed.
            </p>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('shop')}
                className="btn-pink !py-4 !px-8 !text-base shadow-xl"
              >
                <span>Explore Vouchers</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActiveTab('how-it-works')}
                className="btn-secondary !py-4 !px-7 !text-base"
              >
                <Sparkles className="w-4.5 h-4.5 text-[#FF005C]" />
                <span>How It Works</span>
              </button>
            </div>

            {/* Checklist Below CTAs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200/80 dark:border-[#292929]">
              {[
                { label: 'Genuine vouchers', icon: '✓' },
                { label: 'Fast delivery', icon: '✓' },
                { label: 'Secure payment', icon: '✓' },
                { label: 'Customer support', icon: '✓' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-extrabold flex items-center justify-center text-[10px]">
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Trust Proof */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex -space-x-2.5 overflow-hidden">
                <img className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#161616] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#161616] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Student" />
                <img className="inline-block h-9 w-9 rounded-full ring-2 ring-white dark:ring-[#161616] object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" alt="Student" />
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <span>★★★★★</span>
                  <span className="text-slate-900 dark:text-white font-extrabold ml-1">4.9/5 Rating</span>
                </div>
                <span>Over 13,500+ student exam vouchers delivered</span>
              </div>
            </div>

          </div>

          {/* Right Column: Custom Visual Illustration & Floating Mini Cards */}
          <div className="lg:col-span-5 relative flex justify-center">
            
            {/* Main Interactive Voucher Card */}
            <div className="relative w-full max-w-md bg-white dark:bg-[#161616] rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-[#292929] card-shadow z-10">
              
              {/* Floating Mini Badges */}
              <div className="absolute -top-4 -left-4 bg-slate-900 dark:bg-[#0A0A0A] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-lg border border-slate-700 dark:border-[#292929] flex items-center gap-1.5 animate-float-gentle z-20">
                <Clock className="w-3.5 h-3.5 text-[#FF005C]" />
                <span>Voucher Delivered</span>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 z-20">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure Payment</span>
              </div>

              <div className="absolute top-1/2 -right-6 -translate-y-1/2 bg-[#FF005C] text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md animate-pulse-subtle z-20">
                💰 Save ₹₹₹
              </div>

              {/* Student Laptop + Voucher Illustration Top Banner */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-5 bg-slate-950 dark:bg-[#0A0A0A] p-5 flex flex-col justify-between text-white border border-slate-800">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80" 
                  alt="Student on Laptop"
                  className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                />
                
                <div className="relative z-10 flex justify-between items-start">
                  <span className="px-3 py-1 rounded-full bg-[#FF005C] text-white font-extrabold text-[11px] uppercase tracking-wider">
                    Official Exam Code
                  </span>
                  <div className="bg-black/60 p-1 px-2 rounded-lg border border-white/10">
                    <ApexLogo className="h-6" whiteText={true} />
                  </div>
                </div>

                <div className="relative z-10 space-y-1">
                  <h3 className="font-heading font-extrabold text-xl text-white leading-tight">
                    Pearson PTE Academic
                  </h3>
                  <p className="text-xs text-slate-300 font-medium">
                    100% Genuine Official Voucher Code
                  </p>
                </div>
              </div>

              {/* Price Breakdown Box (Clean Neutral Background) */}
              <div className="bg-slate-50 dark:bg-[#0A0A0A] p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-[#292929] mb-5 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <span>Regular Exam Fee</span>
                  <span className="text-sm font-bold text-slate-400 line-through">{formatPrice(pteVoucher.originalPrice)}</span>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-200 dark:border-[#292929]">
                  <div>
                    <span className="text-[11px] font-extrabold text-[#FF005C] uppercase tracking-wider block">Apex Voucher Price</span>
                    <span className="font-heading font-black text-3xl text-slate-900 dark:text-white">{formatPrice(pteVoucher.discountedPrice)}</span>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#FF005C] text-white font-black text-xs shadow-sm">
                      SAVE {formatPrice(pteVoucher.savings)}!
                    </span>
                    <span className="block text-[10px] text-slate-400 font-semibold mt-1">(incl. 18% GST)</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="space-y-3">
                <button
                  onClick={() => startCheckout(pteVoucher)}
                  className="w-full btn-pink !py-3.5 !rounded-xl !text-base font-black flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5 fill-white" />
                  <span>Buy PTE Voucher Now</span>
                </button>

                <p className="text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Instant 10-Second Digital Delivery</span>
                </p>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

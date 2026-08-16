import React from 'react';
import { ArrowRight, ShieldCheck, Sparkles, Star, Zap, Lock, Clock, CheckCircle2, Play, Tag, Shield, Award, Mail, Calendar, Headphones } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { ApexLogo } from './ApexLogo';
import { StudentHeroVector, DaylightStudentHeroVector } from './VectorIllustrations';
import { DaylightHero3DGraphic } from './DaylightHero3DGraphic';

export const Hero3D = () => {
  const { setActiveTab, formatPrice, startCheckout, products } = useVoucher();

  const pteVoucher = products?.find(p =>
    p.id === 'pte-academic' ||
    p.slug?.includes('pte') ||
    p.name?.toLowerCase().includes('pte academic') ||
    p.name?.toLowerCase().includes('pte') ||
    p.brand?.toLowerCase().includes('pearson')
  ) || products[0] || {};

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50 dark:from-[#0A0A0A] dark:via-[#0A0A0A] dark:to-[#111111] pt-8 lg:pt-14 pb-16 border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      
      {/* Background Subtle Soft Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#FF005C]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ========================================================================= */}
        {/* LIGHT MODE (DAYLIGHT) HERO SECTION - MATCHING REFERENCE IMAGE */}
        {/* ========================================================================= */}
        <div className="block dark:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
            
            {/* Left Column: Headline, Subheading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Top Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F5] border border-[#FF005C]/20 shadow-sm text-xs font-black text-[#FF005C]">
                <span>🎟️</span>
                <span>Save on Exam Fees with Apex Vouchers</span>
              </div>

              {/* Headline */}
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-slate-900 tracking-tight">
                Your Exam. Your Dream. <br />
                <span className="text-[#FF005C]">Our Vouchers.</span> <br />
                Your Savings.
              </h1>

              {/* Subheading with Brand Colors */}
              <p className="text-slate-600 font-medium text-base sm:text-lg leading-relaxed max-w-xl">
                Get official voucher codes for <span className="text-[#0284C7] font-extrabold">PTE</span>, <span className="text-[#FF005C] font-extrabold">IELTS</span>, <span className="text-[#F59E0B] font-extrabold">TOEFL</span> & <span className="text-[#10B981] font-extrabold">Duolingo</span> at the best prices and save more on your exam fees.
              </p>

              {/* 4 Feature Pills Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                {[
                  { icon: '🏷️', label: 'Best Prices', sub: 'Guaranteed' },
                  { icon: '⚡', label: 'Instant Delivery', sub: 'in 10 Seconds' },
                  { icon: '🛡️', label: '100% Official', sub: 'Vouchers' },
                  { icon: '🔒', label: 'Secure Payments', sub: '& Safe Checkout' }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2.5 bg-white p-2.5 px-3 rounded-2xl border border-slate-200/80 shadow-sm">
                    <span className="text-base">{item.icon}</span>
                    <div className="flex flex-col text-left leading-none">
                      <span className="text-xs font-black text-slate-900">{item.label}</span>
                      <span className="text-[10px] font-semibold text-slate-500 mt-0.5">{item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('shop')}
                  className="bg-[#FF005C] hover:bg-[#E00052] text-white font-black text-base py-4 px-8 rounded-full shadow-lg shadow-[#FF005C]/25 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                >
                  <span>Browse Vouchers</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveTab('how-it-works')}
                  className="bg-white hover:bg-slate-50 text-slate-800 font-bold text-base py-4 px-7 rounded-full border border-slate-200 shadow-sm flex items-center gap-2 hover:border-[#FF005C] transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-slate-800 text-slate-800" />
                  <span>How It Works</span>
                </button>
              </div>

            </div>

            {/* Right Column: Custom 3D Code Interactive Hero Graphic Component */}
            <div className="lg:col-span-5 flex justify-center">
              <DaylightHero3DGraphic />
            </div>

          </div>

          {/* Daylight 6-Column Bottom Trust Bar (Matching Reference Image) */}
          <div className="mt-12 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: Award, color: 'text-blue-600 bg-blue-50', title: 'Official Exam Partners', sub: '100% Genuine Vouchers' },
              { icon: Mail, color: 'text-purple-600 bg-purple-50', title: 'Instant Email Delivery', sub: 'Get in 10 Seconds' },
              { icon: Calendar, color: 'text-amber-600 bg-amber-50', title: 'Valid for 6-24 Months', sub: 'Long Validity' },
              { icon: Tag, color: 'text-emerald-600 bg-emerald-50', title: 'No Hidden Charges', sub: 'What You See is What You Pay' },
              { icon: Headphones, color: 'text-indigo-600 bg-indigo-50', title: '24/7 Customer Support', sub: "We're Here to Help" },
              { icon: Star, color: 'text-amber-500 bg-amber-50', title: '4.8/5 Rating', sub: 'From 15,000+ Students' },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="flex items-center gap-3 p-1">
                  <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left leading-tight">
                    <span className="text-xs font-black text-slate-900">{item.title}</span>
                    <span className="text-[10px] font-semibold text-slate-500 mt-0.5">{item.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DARK MODE (NIGHT THEME) HERO SECTION - UNTOUCHED & UNCHANGED */}
        {/* ========================================================================= */}
        <div className="hidden dark:block">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headline, Subheading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Small Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2A0A17] border border-[#FF005C]/20 shadow-sm text-xs font-bold text-[#FF005C]">
                <span className="w-2 h-2 rounded-full bg-[#FF005C] animate-ping" />
                <ShieldCheck className="w-4 h-4 text-[#FF005C]" />
                <span>India's #1 Student-Friendly Voucher Hub</span>
              </div>

              {/* Large Headline */}
              <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-white tracking-tight">
                You Relax. <br className="hidden sm:inline" />
                <span className="relative inline-block">
                  <span className="relative z-10">We Save On Your <span className="text-gradient-pink">Exam Fee.</span></span>
                </span>
              </h1>

              {/* Reassuring Student Microcopy */}
              <p className="text-slate-300 font-medium text-base sm:text-lg leading-relaxed max-w-xl">
                Practice from bed, sofa, or panic-desk! Get genuine vouchers for <strong className="text-white font-bold">PTE, IELTS, TOEFL & Duolingo</strong> delivered faster than your OTP.
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => setActiveTab('shop')}
                  className="btn-pink !py-4 !px-8 !text-base shadow-xl group hover:scale-[1.02] transition-all"
                >
                  <span>Buy Voucher Now</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                </button>
                <button
                  onClick={() => setActiveTab('how-it-works')}
                  className="btn-secondary !py-4 !px-7 !text-base hover:border-[#FF005C]"
                >
                  <Sparkles className="w-4.5 h-4.5 text-[#FF005C]" />
                  <span>How It Works</span>
                </button>
              </div>

              {/* Checklist Below CTAs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#292929]">
                {[
                  { label: 'Faster than your OTP', icon: '⚡' },
                  { label: 'Up to 11 Months Validity', icon: '📅' },
                  { label: 'Instant WhatsApp Delivery', icon: '📲' },
                  { label: 'Zero Hidden Fees', icon: '🛡️' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-extrabold text-slate-200 bg-[#1A1A1A] px-3 py-2 rounded-xl border border-[#2A2A2A]">
                    <span className="text-sm">{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Trust Proof */}
              <div className="flex items-center gap-3 pt-2">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-[#161616] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Student" />
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-[#161616] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Student" />
                  <img className="inline-block h-9 w-9 rounded-full ring-2 ring-[#161616] object-cover" src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80" alt="Student" />
                </div>
                <div className="text-xs text-slate-400">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <span>★★★★★</span>
                    <span className="text-white font-extrabold ml-1">4.9/5 Student Rating</span>
                  </div>
                  <span>Over 13,500+ happy test takers & counting!</span>
                </div>
              </div>

            </div>

            {/* Right Column: Custom Dark Vector Illustration & Interactive Pricing Card */}
            <div className="lg:col-span-5 relative flex flex-col items-center">
              
              <div className="w-full max-w-md mb-2 hover:scale-[1.01] transition-transform duration-300">
                <StudentHeroVector className="w-full h-auto drop-shadow-xl" />
              </div>

              {/* Main Interactive Voucher Card */}
              <div className="relative w-full max-w-md bg-[#161616] rounded-3xl p-6 shadow-2xl border border-[#292929] card-shadow z-10 hover:-translate-y-1 transition-all duration-300">
                
                {/* Floating Mini Badges */}
                <div className="absolute -top-4 -left-4 bg-[#0A0A0A] text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-lg border border-[#292929] flex items-center gap-1.5 z-20">
                  <Clock className="w-3.5 h-3.5 text-[#FF005C]" />
                  <span>10-Sec Code Delivery</span>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 z-20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Official Partner</span>
                </div>

                {/* Price Breakdown Box */}
                <div className="bg-[#0A0A0A] p-4 sm:p-5 rounded-2xl border border-[#292929] mb-4 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>Regular Test Fee</span>
                    <span className="text-sm font-bold text-slate-400 line-through">{formatPrice(pteVoucher.originalPrice)}</span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-[#292929]">
                    <div>
                      <span className="text-[11px] font-extrabold text-[#FF005C] uppercase tracking-wider block">Apex Voucher Price</span>
                      <span className="font-heading font-black text-3xl text-white">{formatPrice(pteVoucher.discountedPrice)}</span>
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
                    className="w-full btn-pink !py-3.5 !rounded-xl !text-base font-black flex items-center justify-center gap-2 group shadow-lg"
                  >
                    <Zap className="w-5 h-5 fill-white" />
                    <span>Get PTE Voucher Now</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <p className="text-center text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Direct official acceptance on Pearson & ETS portals</span>
                  </p>
                </div>

              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

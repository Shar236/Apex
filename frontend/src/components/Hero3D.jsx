import React, { useState, useEffect } from 'react';
import { ArrowRight, Play, Tag, Award, Mail, Calendar, Headphones, Star } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { useTheme } from '../context/ThemeContext';
import { DaylightHero3DGraphic } from './DaylightHero3DGraphic';
import { NightHero3DGraphic } from './NightHero3DGraphic';

const CampaignCountdownTimer = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endDate).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="inline-flex items-center gap-2 text-xs font-black text-slate-900 dark:text-white bg-white/95 dark:bg-[#1A1A1A] px-3.5 py-1.5 rounded-full border border-brand-pink/30 shadow-md">
      <span className="text-brand-pink animate-pulse">🔥 Offer Ends In:</span>
      <div className="flex items-center gap-1 font-mono text-xs">
        <span className="bg-brand-pink text-white px-1.5 py-0.5 rounded">{String(timeLeft.days).padStart(2, '0')}d</span>
        <span>:</span>
        <span className="bg-slate-900 text-white dark:bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>:</span>
        <span className="bg-slate-900 text-white dark:bg-slate-800 px-1.5 py-0.5 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>:</span>
        <span className="bg-brand-pink text-white px-1.5 py-0.5 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
};

export const Hero3D = () => {
  const { setActiveTab, heroSettings, activeCampaign, benefitCards } = useVoucher();
  const { isDark } = useTheme();

  const heading1 = heroSettings?.headingLine1 || 'Your Exam. Your Dream.';
  const headingHighlight = heroSettings?.headingHighlight || 'Our Vouchers.';
  const heading3 = heroSettings?.headingLine3 || 'Your Savings.';
  const descriptionText =
    heroSettings?.descriptionText ||
    'Get official voucher codes for PTE, IELTS, TOEFL & Duolingo at the best prices and save more on your exam fees.';
  const mainCtaText = activeCampaign?.ctaText || heroSettings?.ctaText || 'Browse Vouchers';

  const defaultBenefits = [
    { icon: '🏷️', label: 'Best Prices', sub: 'Guaranteed' },
    { icon: '⚡', label: 'Instant Delivery', sub: 'in 10 Seconds' },
    { icon: '🛡️', label: '100% Official', sub: 'Vouchers' },
    { icon: '🔒', label: 'Secure Payments', sub: '& Safe Checkout' },
  ];

  const displayBenefits =
    Array.isArray(benefitCards) && benefitCards.length > 0
      ? benefitCards.map((b, idx) => ({
          icon: b.icon && b.icon.length <= 4 ? b.icon : defaultBenefits[idx % 4]?.icon || '🎟️',
          label: b.title || b.label || defaultBenefits[idx % 4]?.label,
          sub: b.sub || defaultBenefits[idx % 4]?.sub || '',
        }))
      : defaultBenefits;

  return (
    <section className="relative overflow-hidden bg-linear-to-b from-slate-50/80 via-white to-slate-50 dark:from-[#0A0A0A] dark:via-[#0A0A0A] dark:to-[#111111] pt-8 lg:pt-14 pb-16 border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
      {/* Background Subtle Soft Glows */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-brand-pink/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          {/* Left Column: Headline, Subheading & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Promotional Campaign Banner Card */}
            {activeCampaign ? (
              <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-[#FFF0F5] via-rose-50 to-pink-50 dark:from-[#2A0A17] dark:via-[#1F0811] dark:to-[#16050B] border border-brand-pink/30 shadow-lg space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink text-white font-black text-xs uppercase tracking-wider shadow-sm">
                    {activeCampaign.badgeText || '🇮🇳 SPECIAL CAMPAIGN'}
                  </span>
                  {activeCampaign.showCountdown !== false && (
                    <CampaignCountdownTimer endDate={activeCampaign.endDate} />
                  )}
                </div>

                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
                    {activeCampaign.title || '50% OFF EXAM VOUCHERS'}
                  </h2>
                  <p className="text-sm font-semibold text-brand-pink dark:text-rose-400 mt-0.5">
                    {activeCampaign.subtitle || 'Limited period promotional offer'}
                  </p>
                </div>
              </div>
            ) : (
              /* Normal Pill Badge */
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 text-xs font-black text-brand-pink">
                <span>🎟️</span>
                <span>Save on Exam Fees with Apex Vouchers</span>
              </div>
            )}

            {/* Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] text-slate-900 dark:text-white tracking-tight">
              {heading1} <br />
              <span className="text-brand-pink">{headingHighlight}</span> <br />
              {heading3}
            </h1>

            {/* Subheading */}
            <p className="text-slate-600 dark:text-slate-300 font-medium text-base sm:text-lg leading-relaxed max-w-xl">
              {descriptionText}
            </p>

            {/* Feature Pills Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              {displayBenefits.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 bg-white dark:bg-[#161616] p-2.5 px-3 rounded-2xl border border-slate-200/80 dark:border-[#292929] shadow-sm"
                >
                  <span className="text-base">{item.icon}</span>
                  <div className="flex flex-col text-left leading-none">
                    <span className="text-xs font-black text-slate-900 dark:text-white">{item.label}</span>
                    {item.sub && (
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.sub}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setActiveTab('shop')}
                className="bg-brand-pink hover:bg-[#E00052] text-white font-black text-base py-4 px-8 rounded-full shadow-lg shadow-brand-pink/25 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
              >
                <span>{mainCtaText}</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('how-it-works')}
                className="bg-white dark:bg-[#161616] hover:bg-slate-50 dark:hover:bg-[#222222] text-slate-800 dark:text-white font-bold text-base py-4 px-7 rounded-full border border-slate-200 dark:border-[#292929] shadow-sm flex items-center gap-2 hover:border-brand-pink transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-slate-800 dark:fill-white text-slate-800 dark:text-white" />
                <span>How It Works</span>
              </button>
            </div>
          </div>

          {/* Right Column: Custom 3D Code Interactive Hero Graphic Component */}
          <div className="lg:col-span-5 flex justify-center">
            {isDark ? <NightHero3DGraphic /> : <DaylightHero3DGraphic />}
          </div>
        </div>

        {/* 6-Column Bottom Trust Bar */}
        <div className="mt-12 bg-white dark:bg-[#161616] rounded-3xl p-5 border border-slate-200/80 dark:border-[#292929] shadow-sm grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: Award, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40', title: 'Official Exam Partners', sub: '100% Genuine Vouchers' },
            { icon: Mail, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40', title: 'Instant Email Delivery', sub: 'Get in 10 Seconds' },
            { icon: Calendar, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40', title: 'Valid for 6-24 Months', sub: 'Long Validity' },
            { icon: Tag, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40', title: 'No Hidden Charges', sub: 'What You See is What You Pay' },
            { icon: Headphones, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40', title: '24/7 Customer Support', sub: "We're Here to Help" },
            { icon: Star, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40', title: '4.8/5 Rating', sub: 'From 15,000+ Students' },
          ].map((item, idx) => {
            const IconComp = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 p-1">
                <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{item.title}</span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{item.sub}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

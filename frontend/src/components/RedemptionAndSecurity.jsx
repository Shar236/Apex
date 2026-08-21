import React from 'react';
import { ShieldCheck, Lock, CreditCard, Mail, Headphones, Info, Zap, CheckCircle2, ArrowRight } from 'lucide-react';
import { ExpressCarDeliveryVector, DaylightExpressCarDeliveryVector } from './VectorIllustrations';

export const RedemptionAndSecurity = () => {
  const redemptionSteps = [
    { num: 1, title: 'Pick Your Exam', desc: 'Select PTE, GRE, TOEFL, or Duolingo discount voucher.' },
    { num: 2, title: 'Instant Express Pay', desc: 'Pay via UPI, Cards, NetBanking or EMI in seconds.' },
    { num: 3, title: 'Code Speeding to You', desc: 'Voucher code arrives instantly on WhatsApp & Email.' },
    { num: 4, title: 'Redeem at Provider', desc: 'Paste code on official Pearson, ETS, or Duolingo site.' },
    { num: 5, title: 'Payable Drops to ₹0', desc: 'Confirm your test appointment with 0 extra fee!' },
  ];

  return (
    <>
      {/* Dynamic Express Car Transport Delivery Section */}
      <section className="py-16 sm:py-24 bg-linear-to-b from-slate-100 via-white to-slate-50 dark:from-slate-900 dark:via-[#0F172A] dark:to-slate-950 text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-colors duration-300">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-200/40 dark:bg-brand-pink/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Copy Column */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF0F5] dark:bg-brand-pink/20 border border-brand-pink/30 text-xs font-black text-brand-pink uppercase tracking-wider">
                <Zap className="w-4 h-4 fill-[#FF005C]" />
                <span>EXPRESS SPEED DELIVERY</span>
              </div>

              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-slate-900 dark:text-white">
                Delivered Faster Than <br />
                <span className="text-brand-pink">Your OTP.</span>
              </h2>

              <p className="text-slate-600 dark:text-slate-300 font-medium text-base leading-relaxed max-w-lg">
                No waiting around! The moment your payment completes, our automated engine dispatches your official voucher code directly to your <strong className="text-slate-900 dark:text-white font-bold">WhatsApp and Email in under 10 seconds</strong>.
              </p>

              {/* Express Speed Checkpoints */}
              <div className="space-y-3 pt-2">
                {[
                  'Speeding to your inbox & WhatsApp in 10 seconds',
                  '100% Genuine, verified official reseller codes',
                  'Up to 11 months validity with zero hassle',
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-slate-800 dark:text-slate-200 bg-white/80 dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-brand-pink text-white flex items-center justify-center font-black text-xs shrink-0">
                      ✓
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Express Car Vector Illustration Column */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl backdrop-blur-sm">
                <div className="block dark:hidden">
                  <DaylightExpressCarDeliveryVector className="w-full h-auto drop-shadow-2xl" />
                </div>
                <div className="hidden dark:block">
                  <ExpressCarDeliveryVector className="w-full h-auto drop-shadow-2xl" />
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Section: Step-by-Step Redemption Guide */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-brand-pink/20">
              STEP-BY-STEP REDEMPTION
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
              How to Redeem Your <span className="text-pink-highlight">Voucher</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base mt-3">
              Redeeming your code on official testing portals (Pearson, ETS, Duolingo) takes under 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {redemptionSteps.map((s) => (
              <div key={s.num} className="p-6 rounded-3xl bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#292929] space-y-3 flex flex-col justify-between hover:border-brand-pink hover:-translate-y-1 transition-all duration-300">
                <div>
                  <div className="w-9 h-9 rounded-2xl bg-brand-pink text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                    0{s.num}
                  </div>
                  <h3 className="font-heading font-black text-sm text-slate-900 dark:text-white leading-snug">
                    {s.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Legal Disclaimer */}
          <div className="mt-10 p-5 rounded-2xl bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#292929] text-xs text-slate-600 dark:text-slate-400 font-medium flex items-start gap-3 max-w-3xl mx-auto">
            <Info className="w-5 h-5 text-brand-pink shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-white font-bold">Official Acceptance Notice:</strong> Apex Vouchers provides authorized bulk reseller voucher codes. All vouchers are redeemed directly on official test provider portals (Pearson, ETS, Duolingo). Zero hassle & guaranteed acceptance.
            </p>
          </div>

        </div>
      </section>

      {/* Section: Security / Trust Section (Dark Section) */}
      <section className="py-16 sm:py-24 bg-slate-950 dark:bg-[#0A0A0A] text-white border-b border-slate-800 dark:border-[#292929] relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-brand-pink bg-brand-pink/10 px-3.5 py-1.5 rounded-full border border-brand-pink/20">
              100% SECURITY & TRUST
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-3">
              Your Payment. Your Voucher. <br />
              <span className="text-brand-pink">Your Peace of Mind.</span>
            </h2>
            <p className="text-slate-400 font-medium text-base mt-3">
              Bank-grade security protocols so you can buy your voucher with 100% confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {[
              { icon: Lock, title: '256-Bit SSL Lock', desc: 'Encrypted checkout protocols' },
              { icon: ShieldCheck, title: 'Direct Partner Code', desc: 'Direct official reseller issuing' },
              { icon: CreditCard, title: 'All Payment Options', desc: 'UPI, Credit/Debit & EMI' },
              { icon: Mail, title: 'Instant Invoice', desc: 'GST invoice + WhatsApp delivery' },
              { icon: Headphones, title: 'Human Desk 24/7', desc: 'Instant WhatsApp & Call support' },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 dark:bg-[#161616] border border-slate-800 dark:border-[#292929] space-y-3 hover:border-brand-pink hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-brand-pink border border-white/10 flex items-center justify-center mx-auto shadow-sm">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-black text-sm text-white">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </>
  );
};

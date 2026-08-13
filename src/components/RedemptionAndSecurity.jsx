import React from 'react';
import { ShieldCheck, Lock, CreditCard, Mail, Headphones, Info } from 'lucide-react';

export const RedemptionAndSecurity = () => {
  const redemptionSteps = [
    { num: 1, title: 'Purchase your voucher', desc: 'Select your exam voucher and complete instant payment.' },
    { num: 2, title: 'Receive voucher code', desc: 'Check your Email & WhatsApp for your unique voucher code.' },
    { num: 3, title: 'Visit official exam website', desc: 'Log into mypte.pearsonpte.com, ets.org, or englishtest.duolingo.com.' },
    { num: 4, title: 'Enter voucher code', desc: 'Paste code into the "Voucher / Promo Code" box on the payment step.' },
    { num: 5, title: 'Complete your booking', desc: 'Your payable amount waives to ₹0! Confirm your test appointment.' },
  ];

  return (
    <>
      {/* Section 15: Redemption Guide */}
      <section className="py-16 sm:py-24 bg-white dark:bg-[#0A0A0A] border-b border-slate-200/80 dark:border-[#292929] transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF005C] bg-slate-100 dark:bg-[#161616] px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-[#292929]">
              STEP-BY-STEP REDEMPTION
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-3">
              How to Redeem Your <span className="text-pink-highlight">Voucher</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-base mt-3">
              Redeeming your voucher code on official testing portals takes less than 60 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {redemptionSteps.map((s) => (
              <div key={s.num} className="p-5 rounded-2xl bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#292929] space-y-2 flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-full bg-[#FF005C] text-white font-black text-xs flex items-center justify-center mb-3">
                    {s.num}
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-900 dark:text-white leading-snug">
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
          <div className="mt-8 p-4 rounded-2xl bg-slate-50 dark:bg-[#161616] border border-slate-200/80 dark:border-[#292929] text-xs text-slate-600 dark:text-slate-400 font-medium flex items-start gap-3 max-w-3xl mx-auto">
            <Info className="w-4 h-4 text-[#FF005C] shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-900 dark:text-white font-bold">Important Notice:</strong> Apex Vouchers is an independent bulk reseller of official exam vouchers. Vouchers are redeemed directly on official test provider websites (Pearson, ETS, Duolingo). Apex Vouchers does not administer exams.
            </p>
          </div>

        </div>
      </section>

      {/* Section 16: Security / Trust Section (Dark Section) */}
      <section className="py-16 sm:py-24 bg-slate-950 dark:bg-[#0A0A0A] text-white border-b border-slate-800 dark:border-[#292929] relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#FF005C] bg-[#FF005C]/10 px-3.5 py-1.5 rounded-full border border-[#FF005C]/20">
              100% SECURITY & TRUST
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mt-3">
              Your Payment. Your Voucher. <br />
              <span className="text-[#FF005C]">Your Trust.</span>
            </h2>
            <p className="text-slate-400 font-medium text-base mt-3">
              We employ bank-grade security protocols so you can buy your voucher with complete peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 text-center">
            {[
              { icon: Lock, title: 'Secure checkout', desc: '256-bit SSL encrypted checkout' },
              { icon: ShieldCheck, title: 'Verified process', desc: 'Direct official reseller code issuing' },
              { icon: CreditCard, title: 'Multiple payment methods', desc: 'UPI, Credit/Debit, NetBanking & EMI' },
              { icon: Mail, title: 'Email confirmation', desc: 'Tax invoice + instant code delivery' },
              { icon: Headphones, title: 'Support available', desc: '24/7 human customer support desk' },
            ].map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-6 rounded-3xl bg-slate-900 dark:bg-[#161616] border border-slate-800 dark:border-[#292929] space-y-3 hover:border-[#FF005C]/50 transition-colors">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-[#FF005C] border border-white/10 flex items-center justify-center mx-auto">
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-white">{item.title}</h3>
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

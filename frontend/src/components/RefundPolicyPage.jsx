import React, { useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  FileText,
  ChevronRight,
  Info,
  Layers,
} from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { setMetaTag } from '../lib/api';

export function RefundPolicyPage() {
  const { policySettings, globalSEO } = useVoucher();

  const apex = policySettings?.apexRefund || {};
  const effectiveDate = apex.effectiveDate || '2026-01-01';
  const supportPhone = apex.supportPhone || '+91 98559 26113';
  const supportEmail = apex.supportEmail || 'info@apexvouchers.com';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const title = 'Refund & Cancellation Policy | Apex Vouchers';
    const desc =
      'Official Refund & Cancellation Policy for Apex Vouchers. Learn about unredeemed voucher refund guarantees, Pearson exam cancellation rules, and 24-48hr refund processing.';
    const canonical = `${globalSEO?.websiteUrl || 'https://apexvouchers.com'}/refund-policy`;

    document.title = title;
    setMetaTag('description', desc);
    setMetaTag('canonical', canonical, 'rel');
    setMetaTag('og:title', title, 'property');
    setMetaTag('og:description', desc, 'property');
    setMetaTag('og:url', canonical, 'property');
  }, [globalSEO]);

  return (
    <div className="bg-[#FAF8F5] dark:bg-[#0A0A0A] text-neutral-900 dark:text-neutral-100 min-h-screen antialiased transition-colors duration-300">
      
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-[#121212] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <a href="/" className="hover:text-brand-pink transition-colors">Home</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-400">Policies</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-pink font-bold">Refund & Cancellation Policy</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-[#121212] border-b border-[#EAEAEA] dark:border-[#222] py-12 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-xs font-black uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" /> Official Consumer Protection Terms
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-neutral-900 dark:text-white tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-medium">
            Clear, transparent policies separating Pearson official exam appointments from Apex Vouchers discount code purchases.
          </p>
          <div className="pt-2 text-xs font-mono text-neutral-400">
            Effective Date: {effectiveDate} • Last Reviewed: 2026
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
        
        {/* Section 1: Fundamental Distinction */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-4">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-brand-pink" />
            1. Important Notice: Pearson Appointments vs. Apex Vouchers
          </h2>

          <p>
            Please note the fundamental operational and legal difference between:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#1C1C1C] border border-slate-200 dark:border-[#2E2E2E] space-y-2">
              <h3 className="font-heading font-black text-sm text-neutral-900 dark:text-white">
                PTE Appointments Booked Directly with Pearson
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                If you paid examination fees directly on Pearson's official website, Pearson's direct cancellation timeline determines your refund (100% if 14+ days, 50% if 13–8 days, 0% if &lt;7 days).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/30 space-y-2">
              <h3 className="font-heading font-black text-sm text-brand-pink">
                Appointments Booked Using an Apex Voucher
              </h3>
              <p className="text-xs text-neutral-700 dark:text-neutral-300">
                If you purchased a voucher from Apex Vouchers, cancelling your test appointment with Pearson <strong>does not automatically refund your voucher payment</strong>. Voucher refunds are governed solely by Apex Vouchers' refund terms below.
              </p>
            </div>
          </div>
        </section>

        {/* Section 2: Apex Vouchers Refund Terms */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-neutral-900 dark:text-white flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-emerald-500" />
            2. Apex Vouchers Guarantee & Return Rules
          </h2>

          <p>
            Apex Vouchers offers a <strong>{apex.refundPercentage || 100}% Money-Back Guarantee</strong> on all test vouchers subject to the following transparent criteria:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Eligibility</span>
              <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                {apex.eligibilityCriteria || 'Voucher code must be 100% unredeemed and unapplied in any testing account.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Refund Request Window</span>
              <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                Within {apex.cancellationPeriodDays || 7} calendar days of original purchase date.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Processing Fee</span>
              <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ₹0 / 0% Deduction — Full refund of the amount paid.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
              <span className="text-[11px] font-bold text-neutral-400 uppercase">Turnaround Time</span>
              <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">
                {apex.refundProcessingTime || '24 to 48 business hours back to original payment method.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-[#EAEAEA] dark:border-[#292929] text-xs space-y-2">
            <div className="font-bold text-neutral-900 dark:text-white">Code Invalidation on Refund:</div>
            <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {apex.cancellationRules || 'Upon processing a refund, the associated alphanumeric voucher code is immediately voided and deactivated across all systems. Attempting to use a refunded voucher code constitutes unauthorized fraud.'}
            </p>
          </div>
        </section>

        {/* Section 3: Step-by-Step How to Request a Refund */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-5">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-neutral-900 dark:text-white flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-brand-pink" />
            3. How to Request a Voucher Refund
          </h2>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-brand-pink text-white font-bold flex items-center justify-center shrink-0">1</div>
              <div>
                <strong>Option A — Via User Dashboard:</strong> Log in to your Apex Vouchers account, navigate to <em>Dashboard → My Vouchers</em>, locate the unredeemed voucher, and click <strong>Request Refund</strong>.
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-brand-pink text-white font-bold flex items-center justify-center shrink-0">2</div>
              <div>
                <strong>Option B — Via WhatsApp / Email:</strong> Contact support at <a href={`mailto:${supportEmail}`} className="text-brand-pink font-bold">{supportEmail}</a> or WhatsApp <a href={`https://wa.me/${supportPhone.replace(/\D/g, '')}`} className="text-brand-pink font-bold">{supportPhone}</a> with your Order ID.
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Exceptional Circumstances */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-4">
          <h2 className="font-heading font-black text-xl sm:text-2xl text-neutral-900 dark:text-white flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            4. Exceptional Circumstances & Rescheduling
          </h2>

          <p>
            {apex.exceptionalCircumstances || 'If you face medical emergencies, bereavement, or visa rejections after the standard 7-day period, please provide official supporting documentation to our support desk for compassionate review.'}
          </p>

          <p>
            {apex.reschedulingRules || 'Please remember that vouchers cannot be used to pay Pearson rescheduling fees. Rescheduling is managed directly via the student\'s myPTE portal.'}
          </p>
        </section>

        {/* Section 5: Support Desk Contact Card */}
        <section className="p-8 rounded-3xl bg-[#111111] text-white border border-neutral-800 space-y-4">
          <h3 className="font-heading font-black text-xl text-white">Have Questions About a Refund or Cancellation?</h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl font-medium">
            Our customer care team is available 7 days a week to help verify your voucher status, assist with cancellation advice, or process quick refunds.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <a
              href={`mailto:${supportEmail}`}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 transition"
            >
              <Mail className="w-4 h-4 text-brand-pink" /> {supportEmail}
            </a>
            <a
              href={`https://wa.me/${supportPhone.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-pink hover:bg-[#E00052] text-white font-bold shadow-md transition"
            >
              <MessageSquare className="w-4 h-4" /> WhatsApp: {supportPhone}
            </a>
          </div>
        </section>

      </main>
    </div>
  );
}

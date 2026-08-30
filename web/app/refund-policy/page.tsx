import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Layers, DollarSign, RefreshCw, AlertTriangle, Mail, MessageSquare } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Refund & Cancellation Policy',
  description: 'Official Refund & Cancellation Policy for Apex Vouchers. Learn about unredeemed voucher refund guarantees, Pearson exam cancellation rules, and 24-48hr refund processing.',
  path: '/refund-policy',
});

const SUPPORT_PHONE = '+91 98559 26113';
const SUPPORT_EMAIL = 'info@apexvouchers.com';

export default function RefundPolicyPage() {
  return (
    <div className="bg-surface-sunken text-ink min-h-screen antialiased transition-colors duration-300">
      <div className="bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs font-normal text-ink-muted">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-400">Policies</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-accent font-normal">Refund & Cancellation Policy</span>
          </nav>
        </div>
      </div>

      <header className="bg-surface border-b border-line py-12 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wide">
            <ShieldCheck className="w-4 h-4" /> Official Consumer Protection Terms
          </div>
          <h1 className="font-heading font-medium text-3xl sm:text-4xl text-ink tracking-tight">Refund & Cancellation Policy</h1>
          <p className="text-sm sm:text-base text-ink-muted font-medium">Clear, transparent policies separating Pearson official exam appointments from Apex Vouchers discount code purchases.</p>
          <div className="pt-2 text-xs font-mono text-neutral-400">Effective Date: January 1, 2026 • Last Reviewed: 2026</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-sm sm:text-base text-ink-muted leading-relaxed">
        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-accent" /> 1. Important Notice: Pearson Appointments vs. Apex Vouchers
          </h2>
          <p>Please note the fundamental operational and legal difference between:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="p-5 rounded-2xl bg-surface-raised border border-line space-y-2">
              <h3 className="font-heading font-medium text-sm text-ink">PTE Appointments Booked Directly with Pearson</h3>
              <p className="text-xs text-ink-muted">If you paid examination fees directly on Pearson&apos;s official website, Pearson&apos;s direct cancellation timeline determines your refund (100% if 14+ days, 50% if 13–8 days, 0% if &lt;7 days).</p>
            </div>
            <div className="p-5 rounded-2xl bg-accent/8 border border-accent/30 space-y-2">
              <h3 className="font-heading font-medium text-sm text-accent">Appointments Booked Using an Apex Voucher</h3>
              <p className="text-xs text-ink-muted">If you purchased a voucher from Apex Vouchers, cancelling your test appointment with Pearson <strong>does not automatically refund your voucher payment</strong>. Voucher refunds are governed solely by Apex Vouchers&apos; refund terms below.</p>
            </div>
          </div>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-6">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5">
            <DollarSign className="w-5 h-5 text-emerald-500" /> 2. Apex Vouchers Guarantee & Return Rules
          </h2>
          <p>Apex Vouchers offers a <strong>100% Money-Back Guarantee</strong> on all test vouchers subject to the following transparent criteria:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-surface-raised border border-line space-y-1">
              <span className="text-[11px] font-normal text-neutral-400 uppercase">Eligibility</span>
              <p className="text-xs sm:text-sm font-normal text-ink">Voucher code must be 100% unredeemed and unapplied in any testing account.</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-raised border border-line space-y-1">
              <span className="text-[11px] font-normal text-neutral-400 uppercase">Refund Request Window</span>
              <p className="text-xs sm:text-sm font-normal text-ink">Within 7 calendar days of original purchase date.</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-raised border border-line space-y-1">
              <span className="text-[11px] font-normal text-neutral-400 uppercase">Processing Fee</span>
              <p className="text-xs sm:text-sm font-normal text-emerald-600 dark:text-emerald-400">₹0 / 0% Deduction — Full refund of the amount paid.</p>
            </div>
            <div className="p-4 rounded-2xl bg-surface-raised border border-line space-y-1">
              <span className="text-[11px] font-normal text-neutral-400 uppercase">Turnaround Time</span>
              <p className="text-xs sm:text-sm font-normal text-ink">24 to 48 business hours back to original payment method.</p>
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-surface-raised border border-line text-xs space-y-2">
            <div className="font-normal text-ink">Code Invalidation on Refund:</div>
            <p className="text-ink-muted leading-relaxed">Upon processing a refund, the associated alphanumeric voucher code is immediately voided and deactivated across all systems. Attempting to use a refunded voucher code constitutes unauthorized fraud.</p>
          </div>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-5">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5">
            <RefreshCw className="w-5 h-5 text-accent" /> 3. How to Request a Voucher Refund
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-surface-raised border border-line flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-accent text-white font-normal flex items-center justify-center shrink-0">1</span>
              <div><strong>Option A — Via User Dashboard:</strong> Log in to your Apex Vouchers account, navigate to <em>Dashboard → My Vouchers</em>, locate the unredeemed voucher, and click <strong>Request Refund</strong>.</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-raised border border-line flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-accent text-white font-normal flex items-center justify-center shrink-0">2</span>
              <div><strong>Option B — Via WhatsApp / Email:</strong> Contact support at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent font-normal">{SUPPORT_EMAIL}</a> or WhatsApp <a href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`} className="text-accent font-normal">{SUPPORT_PHONE}</a> with your Order ID.</div>
            </div>
          </div>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" /> 4. Exceptional Circumstances & Rescheduling
          </h2>
          <p>If you face medical emergencies, bereavement, or visa rejections after the standard 7-day period, please provide official supporting documentation to our support desk for compassionate review.</p>
          <p>Please remember that vouchers cannot be used to pay Pearson rescheduling fees. Rescheduling is managed directly via the student&apos;s myPTE portal.</p>
        </section>

        <section className="p-8 rounded-3xl bg-[#0B0D12] text-white border border-white/5 space-y-4">
          <h3 className="font-heading font-medium text-xl text-white">Have Questions About a Refund or Cancellation?</h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl font-medium">Our customer care team is available 7 days a week to help verify your voucher status, assist with cancellation advice, or process quick refunds.</p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-normal border border-white/20 transition">
              <Mail className="w-4 h-4 text-accent" /> {SUPPORT_EMAIL}
            </a>
            <a href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-normal shadow-md transition">
              <MessageSquare className="w-4 h-4" /> WhatsApp: {SUPPORT_PHONE}
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}
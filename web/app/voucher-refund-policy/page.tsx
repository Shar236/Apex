import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Ticket, Zap, ShieldCheck, Lock } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  title: 'Voucher Refund & Replacement Policy',
  description: 'Detailed Voucher Refund Policy for Apex Vouchers: unredeemed returns, instant replacement guarantee, validity terms, and security protocols.',
  path: '/voucher-refund-policy',
});

const SUPPORT_PHONE = '+91 98559 26113';
const SUPPORT_EMAIL = 'info@apexvouchers.com';

export default function VoucherRefundPolicyPage() {
  return (
    <div className="bg-surface-sunken text-ink min-h-screen antialiased transition-colors duration-300">
      <div className="bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs font-normal text-ink-muted">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-400">Policies</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-accent font-normal">Voucher Refund Policy</span>
          </nav>
        </div>
      </div>

      <header className="bg-surface border-b border-line py-12 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium uppercase tracking-wide">
            <Ticket className="w-4 h-4" /> Official Voucher Terms
          </div>
          <h1 className="font-heading font-medium text-3xl sm:text-4xl text-ink tracking-tight">Voucher Refund & Replacement Policy</h1>
          <p className="text-sm sm:text-base text-ink-muted font-medium">100% Genuine Official Exam Codes with Instant Replacement & Unredeemed Return Guarantees.</p>
          <div className="pt-2 text-xs font-mono text-neutral-400">Effective Date: January 1, 2026 • Applicable to All Exam Vouchers</div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-10 text-sm sm:text-base text-ink-muted leading-relaxed">
        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink">1. 100% Unredeemed Voucher Return Guarantee</h2>
          <p>Every voucher purchased on Apex Vouchers is backed by our <strong>7-Day Money-Back Guarantee</strong>. If you have not redeemed or applied the code on Pearson, ETS, or Duolingo portals, you are eligible for a full 100% refund.</p>
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs sm:text-sm text-emerald-900 dark:text-emerald-200 font-medium">
            ✓ <strong>Zero Deductions:</strong> No processing fees, gateway surcharges, or hidden penalties are subtracted from eligible refunds.
          </div>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink">2. Instant Replacement Guarantee</h2>
          <p>In the extremely rare event that an issued voucher code displays an error or is flagged as invalid during portal checkout, our security team provides an <strong>immediate verified replacement code within 15 minutes</strong> or an instant full refund.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-normal text-ink-muted">
            <div className="p-4 rounded-2xl bg-surface-raised border border-line text-center space-y-1">
              <Zap className="w-5 h-5 text-accent mx-auto" />
              <div className="font-normal text-ink">15-Min Response</div>
              <div className="text-neutral-500 text-[11px]">Expedited support review</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-raised border border-line text-center space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-500 mx-auto" />
              <div className="font-normal text-ink">100% Genuine</div>
              <div className="text-neutral-500 text-[11px]">Direct partner inventory</div>
            </div>
            <div className="p-4 rounded-2xl bg-surface-raised border border-line text-center space-y-1">
              <Lock className="w-5 h-5 text-blue-500 mx-auto" />
              <div className="font-normal text-ink">Safe Encryption</div>
              <div className="text-neutral-500 text-[11px]">Unmasked on-demand</div>
            </div>
          </div>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink">3. Voucher Expiry & Validity Rules</h2>
          <p>Standard vouchers issued by Apex Vouchers are valid for <strong>6 to 11 months from purchase date</strong>. The test must be scheduled and taken on or before the voucher expiry date indicated on your order receipt.</p>
          <p className="text-xs text-ink-muted">* Once a voucher passes its official expiration date without redemption, it cannot be refunded, renewed, or extended.</p>
        </section>

        <section className="bg-surface p-6 sm:p-8 rounded-3xl border border-line shadow-sm space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-ink">4. Transferability & Gifting</h2>
          <p>Vouchers purchased on Apex Vouchers are transferable prior to portal redemption. You may reassign or gift the voucher code to a friend or student through your <em>User Dashboard → Transfer Voucher</em> feature. Once redeemed on a candidate&apos;s personal testing profile, the voucher is non-transferable.</p>
        </section>

        <section className="p-8 rounded-3xl bg-[#0B0D12] text-white border border-white/5 space-y-3">
          <h3 className="font-heading font-medium text-xl text-white">Need Assistance with a Voucher?</h3>
          <p className="text-xs text-neutral-400 font-medium">
            Contact our dedicated voucher verification desk via email at <a href={`mailto:${SUPPORT_EMAIL}`} className="text-accent">{SUPPORT_EMAIL}</a> or phone/WhatsApp at <a href={`tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`} className="text-accent">{SUPPORT_PHONE}</a>.
          </p>
        </section>
      </main>
    </div>
  );
}
import React, { useEffect } from 'react';
import {
  FileText,
  ShieldCheck,
  ChevronRight,
  Lock,
  Scale,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { setMetaTag } from '../lib/api';

export function TermsAndConditionsPage() {
  const { globalSEO, footerSettings } = useVoucher();
  const supportPhone = footerSettings?.phone || '+91 98559 26113';
  const supportEmail = footerSettings?.email || 'apexvouchers@gmail.com';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const title = 'Terms & Conditions | Apex Vouchers';
    const desc =
      'Official Terms and Conditions governing voucher purchases, portal redemption, booking assistance services, and consumer rights on Apex Vouchers.';
    const canonical = `${globalSEO?.websiteUrl || 'https://apexvouchers.com'}/terms`;

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
            <span className="text-neutral-400">Legal</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-pink font-bold">Terms & Conditions</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white dark:bg-[#121212] border-b border-[#EAEAEA] dark:border-[#222] py-12 sm:py-16 text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-pink/10 text-brand-pink text-xs font-black uppercase tracking-wide">
            <Scale className="w-4 h-4" /> Legal Agreement
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-neutral-900 dark:text-white tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300 font-medium">
            Please read these terms and conditions carefully before purchasing exam vouchers or utilizing our booking assistance services.
          </p>
          <div className="pt-2 text-xs font-mono text-neutral-400">
            Effective Date: January 1, 2026 • Apex Vouchers Platform Terms
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-sm sm:text-base text-neutral-700 dark:text-neutral-300 leading-relaxed">
        
        {/* Section 1 */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-3">
          <h2 className="font-heading font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using Apex Vouchers (apexvouchers.com), registering an account, or purchasing test vouchers for examinations including PTE Academic, PTE Core, IELTS, TOEFL iBT, GRE, or Duolingo, you agree to be legally bound by these Terms & Conditions. If you do not agree with any part of these terms, you must not use our website.
          </p>
        </section>

        {/* Section 2 */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-3">
          <h2 className="font-heading font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            2. Nature of Service & Digital Delivery
          </h2>
          <p>
            Apex Vouchers distributes 100% genuine, official examination discount vouchers. Upon successful payment verification via our PCI-DSS compliant checkout gateway, voucher codes are generated and transmitted instantly via SMS, Email, and your secure online User Dashboard.
          </p>
          <p className="text-xs text-neutral-500">
            Candidates are responsible for ensuring their registered email address and phone number are accurate at the time of purchase.
          </p>
        </section>

        {/* Section 3 */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-3">
          <h2 className="font-heading font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            3. Non-Affiliation & Independent Reseller Disclaimer
          </h2>
          <p>
            Apex Vouchers is an independent provider and reseller of genuine educational exam vouchers. Pearson PTE, ETS, IELTS, and Duolingo are registered trademarks of their respective owners. Apex Vouchers is not directly endorsed by or affiliated with Pearson Inc. or ETS. All official examination booking guidelines, test-day rules, identity verifications, and score reports are governed strictly by the respective test conducting bodies.
          </p>
        </section>

        {/* Section 4 */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-3">
          <h2 className="font-heading font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            4. Voucher Validity & Redemption Obligations
          </h2>
          <p>
            Each voucher code carries a specific validity expiration date (typically 6 to 11 months from purchase). Candidates must redeem their voucher and schedule their test appointment before the code expires. Expired codes cannot be renewed or refunded. Vouchers cannot be used to settle rescheduling penalty fees on testing portals.
          </p>
        </section>

        {/* Section 5 */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-3">
          <h2 className="font-heading font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            5. Limitation of Liability
          </h2>
          <p>
            In no event shall Apex Vouchers, its directors, employees, or partners be liable for any indirect, incidental, punitive, or consequential damages arising from test center cancellations, candidate test-day disqualifications, internet outages during testing, or missed examination appointments. Our maximum liability shall not exceed the amount paid for the specific voucher purchased.
          </p>
        </section>

        {/* Section 6 */}
        <section className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-3">
          <h2 className="font-heading font-black text-lg sm:text-xl text-neutral-900 dark:text-white">
            6. Governing Law & Dispute Resolution
          </h2>
          <p>
            These Terms and Conditions shall be governed by and construed in accordance with the laws of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in India.
          </p>
        </section>

        {/* Support info */}
        <section className="p-6 rounded-3xl bg-[#111111] text-white border border-neutral-800 text-xs space-y-2">
          <div className="font-bold text-white">Questions regarding these terms?</div>
          <p className="text-neutral-400">
            Reach out to our legal and compliance desk at <a href={`mailto:${supportEmail}`} className="text-brand-pink">{supportEmail}</a> or call <a href={`tel:${supportPhone.replace(/\s+/g, '')}`} className="text-brand-pink">{supportPhone}</a>.
          </p>
        </section>

      </main>
    </div>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Calendar, Clock, CheckCircle2, AlertTriangle, HelpCircle, ArrowRight, ShieldCheck, FileText,
  DollarSign, AlertOctagon, BookOpen, Phone, Mail, MessageSquare, ArrowLeftRight, Info, Zap, ChevronRight,
} from 'lucide-react';
import { buildMetadata, JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { FaqAccordion } from '@/components/blog/faq-accordion';

export const metadata: Metadata = buildMetadata({
  title: 'How to Reschedule or Cancel a PTE Exam in 2026',
  description:
    'Complete 2026 guide to PTE exam rescheduling, cancellation, Pearson refund rules (100%, 50%, no refund) & voucher refund policies. Step-by-step instructions.',
  path: '/how-to-reschedule-cancel-pte-exam',
});

const CTA_PHONE = '+91 98559 26113';
const CTA_EMAIL = 'info@apexvouchers.com';

const FAQS = [
  {
    question: 'Can I reschedule my PTE exam for free?',
    answer:
      'Yes — if there are more than 14 full calendar days before your test date, Pearson generally allows free rescheduling to a new date, time, or test centre. Within 13–8 days you may face a 50% refund rule on cancellation, and under 7 days there is normally no refund.',
  },
  {
    question: 'If I cancel my Pearson appointment, will I get a cash refund from Apex Vouchers?',
    answer:
      'Not automatically. Cancelling your Pearson appointment is governed by Pearson\'s own cancellation/refund rules. Any refund of the amount you paid to Apex Vouchers for the voucher is a separate matter and is governed by our Voucher Refund & Replacement Policy.',
  },
  {
    question: 'Can I use my PTE voucher to pay a rescheduling fee?',
    answer:
      'No. PTE vouchers can only be applied toward the primary test fee. Any rescheduling or penalty fee must be paid with an accepted card or Pearson-supported payment method.',
  },
  {
    question: 'What happens if I miss my PTE exam (no-show)?',
    answer:
      'A no-show candidate is not eligible for any refund under official Pearson regulations, and the test fee or voucher used for the booking is entirely forfeited. If you know you cannot attend, reschedule or cancel as early as possible in your myPTE portal.',
  },
  {
    question: 'What if I have a medical or family emergency?',
    answer:
      'Pearson may grant exceptions at its sole discretion for extraordinary circumstances such as severe illness, bereavement, or natural disasters. Contact Pearson PTE Customer Support as soon as possible (normally within 14 days of the test date) with official supporting documentation. Submitting documentation does not guarantee an exception or full refund.',
  },
  {
    question: 'How long is my Apex Vouchers voucher valid?',
    answer:
      'Standard vouchers are valid for 6 to 11 months from the purchase date. The test must be scheduled and taken on or before the voucher expiry date shown on your order receipt.',
  },
  {
    question: 'Can I transfer or gift my unused voucher?',
    answer:
      'Yes — vouchers are transferable prior to portal redemption. You may reassign or gift the code through your User Dashboard → Transfer Voucher feature. Once redeemed on a candidate\'s testing profile, the voucher is non-transferable.',
  },
];

const RESCHEDULE_STEPS = [
  { step: 1, title: 'Log in to your myPTE account', desc: 'Visit pearsonpte.com and log in with your registered username and password credentials.' },
  { step: 2, title: 'Open "My Activity"', desc: 'Navigate to the dashboard and open the "My Activity" tab to locate your upcoming scheduled PTE appointment.' },
  { step: 3, title: 'Select the appointment to change', desc: 'Click on the specific PTE Academic, PTE Core, or PTE UKVI appointment you wish to modify.' },
  { step: 4, title: 'Choose "Reschedule"', desc: 'Select the Reschedule option if the link is active and available for your booking timeframe.' },
  { step: 5, title: 'Select new date, time and test centre', desc: 'Use the interactive calendar to pick an available slot at your preferred authorized Pearson VUE testing center.' },
  { step: 6, title: 'Review and confirm the change', desc: 'Carefully review the updated appointment summary, time zone, and address, then confirm the change.' },
  { step: 7, title: 'Retain confirmation email', desc: 'Check your registered email inbox for Pearson\'s updated appointment confirmation email and save it for test-day verification.' },
];

const CANCEL_STEPS = [
  { step: 1, title: 'Log in to your myPTE account', desc: 'Access your account on the official Pearson portal.' },
  { step: 2, title: 'Go to My Activity', desc: 'Locate the active test appointment you need to cancel.' },
  { step: 3, title: 'Find your PTE appointment', desc: 'Click on the booking card to view appointment details and available actions.' },
  { step: 4, title: 'Select the cancellation option', desc: 'Click the "Cancel" option shown for your booking.' },
  { step: 5, title: 'Review cancellation and refund information', desc: 'Examine the refund breakdown or forfeiture notice calculated based on the days remaining before test day.' },
  { step: 6, title: 'Confirm cancellation & retain email', desc: 'Submit your cancellation and retain the confirmation email sent by Pearson for your financial and testing records.' },
];

const FLOW_STEPS = [
  { step: '1', title: 'Student purchases discounted voucher', desc: 'Voucher code is delivered instantly via email & WhatsApp.' },
  { step: '2', title: 'Voucher is applied on myPTE portal', desc: 'Voucher code is redeemed to schedule the exam date at Pearson VUE center.' },
  { step: '3', title: 'Student decides to cancel exam appointment', desc: 'Student accesses myPTE portal to initiate appointment cancellation.' },
  { step: '4', title: 'Student checks Pearson appointment cancellation rules', desc: 'Pearson applies timing window policy (14+ days, 13–8 days, <7 days).' },
  { step: '5', title: 'Student contacts voucher provider regarding voucher refund', desc: 'Voucher vendor reviews unredeemed/reactivation policy independently.' },
];

const NAV_ITEMS = [
  { id: 'intro', label: '1. Introduction' },
  { id: 'can-you-reschedule', label: '2. Can You Reschedule?' },
  { id: 'how-to-reschedule', label: '3. Step-by-Step Rescheduling' },
  { id: 'how-to-cancel', label: '4. How to Cancel Exam' },
  { id: 'refund-policy-table', label: '5. PTE Refund Policy Table' },
  { id: 'direct-vs-voucher', label: '6. Direct vs Voucher Booking' },
  { id: 'apex-voucher-policy', label: '7. Apex Vouchers Policy' },
  { id: 'voucher-flow-example', label: '8. Cancellation Journey Flow' },
  { id: 'voucher-rescheduling-fee', label: '9. Vouchers & Reschedule Fee' },
  { id: 'medical-emergency', label: '10. Medical / Family Emergencies' },
  { id: 'missed-exam', label: '11. Missed Exam (No-Show)' },
  { id: 'faq-section', label: '12. Frequently Asked Questions' },
  { id: 'buy-voucher-cta', label: '13. Book New Exam CTA' },
];

const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'How to Reschedule or Cancel a PTE Exam in 2026',
  description: metadata.description,
  author: { '@type': 'Organization', name: 'Apex Vouchers Research & Editorial Team', url: 'https://apexvouchers.com' },
  publisher: { '@type': 'Organization', name: 'Apex Vouchers', logo: { '@type': 'ImageObject', url: 'https://apexvouchers.com/icon.svg' } },
  datePublished: '2026-01-01T00:00:00+05:30',
  mainEntityOfPage: 'https://apexvouchers.com/how-to-reschedule-cancel-pte-exam',
};

const howToJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Reschedule or Cancel a PTE Exam',
  step: [
    { '@type': 'HowToStep', name: 'Log in to myPTE', text: 'Log in to your official myPTE account.' },
    { '@type': 'HowToStep', name: 'Locate appointment', text: 'Open My Activity and locate your existing PTE appointment.' },
    { '@type': 'HowToStep', name: 'Choose Action', text: 'Select Reschedule or Cancel depending on test timing eligibility.' },
    { '@type': 'HowToStep', name: 'Confirm change', text: 'Review the details, confirm the change, and retain your confirmation email.' },
  ],
};

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function PTEReschedulingGuidePage() {
  return (
    <div className="bg-[#FAF8F5] dark:bg-[#06070B] text-neutral-900 dark:text-neutral-100 min-h-screen antialiased transition-colors duration-300">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={howToJsonLd} />
      <JsonLd data={faqJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'PTE Rescheduling & Cancellation Guide', path: '/how-to-reschedule-cancel-pte-exam' },
        ])}
      />

      <div className="bg-white dark:bg-[#121212] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            <Link href="/" className="hover:text-brand-pink transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-neutral-400">Guides</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-pink font-bold truncate">PTE Rescheduling & Cancellation 2026</span>
          </nav>
        </div>
      </div>

      <header className="relative bg-linear-to-b from-white via-[#FFF5F8] to-[#FAF8F5] dark:from-[#121212] dark:via-[#1A0C13] dark:to-[#06070B] border-b border-[#EAEAEA] dark:border-[#222] py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-pink/10 dark:bg-brand-pink/20 border border-brand-pink/30 text-brand-pink text-xs font-black tracking-wide uppercase">
            <Zap className="w-3.5 h-3.5" /> Official 2026 Academic &amp; Core Guide
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl text-neutral-900 dark:text-white tracking-tight leading-[1.15]">
            How to Reschedule or Cancel a PTE Exam in 2026
          </h1>
          <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Complete Guide to PTE Rescheduling, Cancellation, Refunds &amp; Voucher Bookings
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 text-xs font-bold text-neutral-500 dark:text-neutral-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-brand-pink" /> 6 Min Comprehensive Read
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-pink" /> Updated for 2026 Testing Cycle
            </span>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Pearson Policy Verified
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white dark:bg-[#141414] p-6 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-4">
                <div className="flex items-center gap-2 font-heading font-black text-sm text-neutral-900 dark:text-white uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-brand-pink" /> Table of Contents
                </div>
                <nav className="space-y-1 text-xs">
                  {NAV_ITEMS.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="block px-3 py-2 rounded-xl font-bold transition-colors text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-[#1E1E1E] hover:text-neutral-900 dark:hover:text-white"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="p-6 rounded-3xl bg-linear-to-br from-[#FFF0F5] to-rose-50 dark:from-[#2A0A17] dark:to-[#1A0710] border border-brand-pink/20 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-brand-pink">Need Urgent Help?</span>
                <h4 className="font-heading font-black text-base text-neutral-900 dark:text-white">Exam Date Tomorrow?</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                  If your exam is within 48 hours, Pearson rules strictly apply. Contact support or book an emergency replacement voucher.
                </p>
                <div className="pt-1">
                  <a
                    href={`https://wa.me/${CTA_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Apex Vouchers, I need emergency assistance with my PTE exam booking.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-pink text-white font-black text-xs shadow-md hover:bg-[#E00052] transition"
                  >
                    <MessageSquare className="w-4 h-4" /> WhatsApp Support
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-12 text-sm sm:text-base leading-relaxed text-neutral-700 dark:text-neutral-300">
            <section id="intro" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-4">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">Introduction: Changing Your PTE Exam Date or Cancelling</h2>
              <p className="font-medium text-neutral-800 dark:text-neutral-200">Have you booked your PTE exam but need to change your test date or cancel your appointment?</p>
              <p>Preparing for an international English proficiency test like PTE Academic or PTE Core requires intensive scheduling. However, unforeseen personal obligations, health issues, or preparation delays frequently necessitate rescheduling or cancelling your test appointment.</p>
              <p>Understanding how Pearson&apos;s cancellation and refund rules work — and the critical difference between booking directly with Pearson versus booking with a discounted voucher purchased from a third-party provider like <strong>Apex Vouchers</strong> — can save you thousands of rupees and prevent avoidable test-day forfeiture.</p>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3.5 text-xs sm:text-sm">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-bold text-amber-900 dark:text-amber-200">Crucial Distinction:</strong> Pearson&apos;s examination cancellation/refund rules and a voucher provider&apos;s refund policy are <strong>two separate matters</strong>. Cancelling your Pearson appointment does not automatically trigger a cash refund from a voucher provider.
                </div>
              </div>
            </section>

            <section id="can-you-reschedule" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <Calendar className="w-4 h-4" /> Eligibility Criteria
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">Can You Reschedule a PTE Exam?</h2>
              <p>Yes. Eligible PTE test appointments can generally be rescheduled directly through the candidate&apos;s official <strong>myPTE account</strong> on the Pearson portal.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 space-y-2">
                  <div className="flex items-center gap-2 font-heading font-black text-emerald-800 dark:text-emerald-300 text-sm">
                    <CheckCircle2 className="w-4 h-4" /> More Than 14 Full Calendar Days
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                    Pearson&apos;s current policy generally allows <strong>free rescheduling</strong> when more than 14 full calendar days remain before your scheduled test date. You can choose a new date, time, or test center without additional test fee charges.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                  <div className="flex items-center gap-2 font-heading font-black text-rose-800 dark:text-rose-300 text-sm">
                    <AlertOctagon className="w-4 h-4" /> 14 Days or Less Before Test
                  </div>
                  <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                    If your appointment is 14 days or less away, the direct reschedule option may <strong>not be available</strong> in your portal. The candidate may need to cancel the existing appointment under Pearson refund rules and book a fresh test.
                  </p>
                </div>
              </div>
            </section>

            <section id="how-to-reschedule" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4" /> Step-by-Step Instructions
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">How to Reschedule Your PTE Exam</h2>
              <p>Follow this official numbered step-by-step procedure to change your PTE test date or test center online:</p>
              <div className="space-y-3.5">
                {RESCHEDULE_STEPS.map((item) => (
                  <div key={item.step} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-brand-pink text-white font-heading font-black text-sm flex items-center justify-center shrink-0 shadow-sm">{item.step}</div>
                    <div className="space-y-0.5">
                      <h4 className="font-heading font-black text-sm text-neutral-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="how-to-cancel" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <AlertOctagon className="w-4 h-4" /> Cancellation Process
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">How to Cancel a PTE Exam</h2>
              <p>If you cannot attend the exam and wish to cancel your booking altogether, follow these numbered steps:</p>
              <div className="space-y-3.5">
                {CANCEL_STEPS.map((item) => (
                  <div key={item.step} className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] flex items-start gap-4">
                    <div className="w-8 h-8 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-heading font-black text-sm flex items-center justify-center shrink-0 shadow-sm">{item.step}</div>
                    <div className="space-y-0.5">
                      <h4 className="font-heading font-black text-sm text-neutral-900 dark:text-white">{item.title}</h4>
                      <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="refund-policy-table" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <DollarSign className="w-4 h-4" /> Pearson Official Refund Schedule
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">PTE Cancellation Refund Policy Matrix</h2>
              <p>Pearson calculates test appointment refunds strictly based on the number of full calendar days remaining before the exam date. Below is the published schedule:</p>
              <div className="overflow-x-auto rounded-2xl border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#111111] text-white text-xs sm:text-sm font-heading font-black uppercase tracking-wider">
                      <th className="p-4 sm:p-5">Cancellation Timing</th>
                      <th className="p-4 sm:p-5 text-right">Refund Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#292929] text-xs sm:text-sm font-semibold">
                    <tr className="bg-emerald-50/40 dark:bg-emerald-950/20">
                      <td className="p-4 sm:p-5 text-neutral-900 dark:text-white font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 14 or more full calendar days before the test
                      </td>
                      <td className="p-4 sm:p-5 text-right font-heading font-black text-emerald-700 dark:text-emerald-400 text-base">100% Refund</td>
                    </tr>
                    <tr className="bg-amber-50/40 dark:bg-amber-950/20">
                      <td className="p-4 sm:p-5 text-neutral-900 dark:text-white font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> 13–8 full calendar days before the test
                      </td>
                      <td className="p-4 sm:p-5 text-right font-heading font-black text-amber-700 dark:text-amber-400 text-base">50% Refund</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                      <td className="p-4 sm:p-5 text-neutral-900 dark:text-white font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Fewer than 7 full calendar days before the test
                      </td>
                      <td className="p-4 sm:p-5 text-right font-heading font-black text-rose-700 dark:text-rose-400 text-base">No Refund (0%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="p-5 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/30 space-y-2">
                <div className="flex items-center gap-2 font-heading font-black text-brand-pink text-sm">
                  <Info className="w-4 h-4" /> Important Clarification on the 14-Day Boundary
                </div>
                <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  <strong>Important:</strong> &ldquo;Less than 14 days&rdquo; does <em>not</em> automatically mean a 50% refund. Under the current published schedule, the 50% refund applies specifically to cancellations made <strong>13–8 full calendar days</strong> before the test. Fewer than 7 full calendar days before the test normally means <strong>no refund</strong>.
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                  * Note: All cancellation timing and refund percentages listed above are subject to Pearson&apos;s latest terms, conditions, and jurisdiction-specific regulatory policies.
                </p>
              </div>
            </section>

            <section id="direct-vs-voucher" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <ArrowLeftRight className="w-4 h-4" /> Visual Comparison
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">Direct Pearson Booking vs. Third-Party Voucher Booking</h2>
              <p>How your refund is treated depends on <strong>how you paid</strong> for the examination:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-[#181818] border border-slate-200 dark:border-[#2C2C2C] space-y-3.5">
                  <div className="inline-flex px-3 py-1 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-black uppercase">Option 1</div>
                  <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white">Paid Directly to Pearson</h3>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed font-medium">
                    If the student booked the PTE exam directly through the official Pearson PTE website and paid the examination fee directly via Pearson&apos;s payment gateway, Pearson&apos;s direct cancellation and refund policy applies.
                  </p>
                  <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 font-semibold pt-1">
                    <li className="flex items-center gap-1.5"><span className="text-emerald-600 font-black">✓</span> 14+ full days: generally 100% refund to card/bank</li>
                    <li className="flex items-center gap-1.5"><span className="text-amber-600 font-black">✓</span> 13–8 full days: generally 50% refund</li>
                    <li className="flex items-center gap-1.5"><span className="text-rose-600 font-black">✕</span> Fewer than 7 days: generally no refund</li>
                  </ul>
                </div>
                <div className="p-6 rounded-3xl bg-linear-to-br from-[#FFF0F5] to-rose-50 dark:from-[#2A0A17] dark:to-[#1A0710] border border-brand-pink/30 space-y-3.5">
                  <div className="inline-flex px-3 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase">Option 2</div>
                  <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white">Booked Using a Third-Party Voucher</h3>
                  <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed font-medium">
                    If the student purchased a PTE voucher code from a third-party vendor, agent, reseller, or authorized voucher provider (e.g. Apex Vouchers) and applied it on Pearson&apos;s checkout:
                  </p>
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-black/40 border border-brand-pink/20 text-xs font-bold text-neutral-800 dark:text-neutral-200">
                    Pearson appointment cancellation rules and the voucher provider&apos;s refund policy are <strong>completely separate matters</strong>.
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                    For refunds relating to the voucher purchase amount, the student must contact the specific company from which the voucher was bought and review that company&apos;s applicable terms.
                  </p>
                </div>
              </div>
            </section>

            <section id="apex-voucher-policy" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" /> Live Business Policy
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">Apex Vouchers Refund &amp; Cancellation Policy</h2>
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-neutral-100 dark:bg-[#202020] text-neutral-600 dark:text-neutral-300">Effective: 2026-01-01</span>
              </div>
              <p>Apex Vouchers maintains transparent, student-first terms for all official test voucher purchases. Below are the actual policy terms applicable to vouchers purchased on apexvouchers.com:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Refund Eligibility</span>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">100% unredeemed and unapplied voucher codes.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Cancellation Window</span>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">Within 7 days of initial voucher purchase.</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Refund Percentage</span>
                  <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">100% of amount paid (Zero hidden cancellation fees).</p>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] space-y-1">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Refund Processing Time</span>
                  <p className="text-xs sm:text-sm font-bold text-neutral-900 dark:text-white">24 to 48 business hours via source payment method.</p>
                </div>
              </div>
              <div className="space-y-3 pt-2 text-xs sm:text-sm">
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1C1C1C] border border-[#EAEAEA] dark:border-[#2E2E2E] space-y-1.5">
                  <h4 className="font-heading font-black text-neutral-900 dark:text-white text-sm">Voucher Validity &amp; Cancellation Rules</h4>
                  <p className="text-neutral-600 dark:text-neutral-300">Once a voucher refund is issued, the alphanumeric code is permanently deactivated in our database and cannot be applied to any exam booking.</p>
                  <p className="text-[11px] text-neutral-400 font-semibold">Standard voucher validity: 6 to 11 months from purchase date.</p>
                </div>
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1C1C1C] border border-[#EAEAEA] dark:border-[#2E2E2E] space-y-1.5">
                  <h4 className="font-heading font-black text-neutral-900 dark:text-white text-sm">Rescheduling &amp; Exceptional Circumstances</h4>
                  <p className="text-neutral-600 dark:text-neutral-300">Vouchers cannot be used to pay Pearson rescheduling fees. Rescheduling is managed directly via the student&apos;s myPTE account.</p>
                  <p className="text-neutral-600 dark:text-neutral-300">For medical or family emergencies, official documentation may be submitted to support for expedited case-by-case review.</p>
                </div>
              </div>
            </section>

            <section id="voucher-flow-example" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <ArrowRight className="w-4 h-4" /> Visual Process Workflow
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">The Voucher Booking &amp; Cancellation Journey</h2>
              <p>Here is the real-world sequence of events when cancelling an exam booked with a voucher:</p>
              <div className="space-y-2">
                {FLOW_STEPS.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-full p-4 rounded-2xl bg-[#FAF8F5] dark:bg-[#181818] border border-[#EAEAEA] dark:border-[#292929] flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-brand-pink/10 text-brand-pink border border-brand-pink/30 font-heading font-black text-xs flex items-center justify-center shrink-0">{item.step}</div>
                      <div className="flex-1">
                        <div className="font-heading font-black text-xs sm:text-sm text-neutral-900 dark:text-white">{item.title}</div>
                        <div className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 font-medium">{item.desc}</div>
                      </div>
                    </div>
                    {idx < FLOW_STEPS.length - 1 && <div className="h-4 w-0.5 bg-brand-pink/40 my-0.5" />}
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs sm:text-sm font-semibold text-amber-900 dark:text-amber-200">
                ⚠️ <strong>Key Takeaway:</strong> Cancelling an examination appointment on Pearson&apos;s website does <em>not</em> automatically mean the amount paid to a third-party voucher vendor will be refunded into your bank account. Always verify your voucher provider&apos;s specific refund terms.
              </div>
            </section>

            <section id="voucher-rescheduling-fee" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-4">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">Can I Use a Voucher to Pay a Rescheduling Fee?</h2>
              <p><strong>No.</strong> Pearson explicitly states that PTE vouchers can only be applied toward the <strong>primary test fee</strong>. A voucher <strong>cannot</strong> be used to pay a rescheduling fee or penalty fee.</p>
              <p>If your rescheduling request falls within a timeframe where Pearson charges a rescheduling fee, you must pay that fee using an accepted credit card, debit card, or Pearson-supported payment method during the online reschedule process.</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Always ensure you check the current validity of your voucher code and understand all applicable voucher terms before attempting redemption.</p>
            </section>

            <section id="medical-emergency" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-4">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">What If I Have a Medical or Family Emergency?</h2>
              <p>Pearson understands that unexpected emergencies occur. Under Pearson&apos;s emergency policy, exceptions or partial considerations may be granted at <strong>Pearson&apos;s sole discretion</strong> under extraordinary circumstances such as:</p>
              <ul className="space-y-2 text-xs sm:text-sm pl-4 list-disc text-neutral-700 dark:text-neutral-300">
                <li>Sudden severe illness, hospitalization, or medical emergency of the candidate.</li>
                <li>Bereavement or death in the immediate family.</li>
                <li>Natural disasters, government-imposed curfews, or transportation shutdown.</li>
              </ul>
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 text-xs sm:text-sm space-y-2">
                <div className="font-bold text-blue-900 dark:text-blue-200">How to Submit an Emergency Request:</div>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed font-medium">
                  Students should contact <strong>Pearson PTE Customer Support</strong> as soon as practically possible (normally within 14 days of the test date) and provide official medical certificates, hospital discharge summaries, or relevant certified documentation.
                </p>
                <p className="text-[11px] text-blue-700 dark:text-blue-400 italic">* Important: Submitting documentation does not guarantee an exception or full refund; Pearson reviews each request on a case-by-case basis.</p>
              </div>
            </section>

            <section id="missed-exam" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-4">
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">What If I Miss My PTE Exam? (No-Show Policy)</h2>
              <p>A candidate who does not attend their scheduled PTE test appointment at the designated time and test center is categorized as a <strong>&quot;No-Show&quot;</strong>.</p>
              <p>Under official Pearson regulations, a No-Show candidate is <strong>not eligible for any refund</strong>, and the test appointment fee or voucher code used for the booking is entirely forfeited.</p>
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#1E1E1E] text-xs sm:text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                💡 <strong>Proactive Advice:</strong> If you realize in advance that you cannot attend your scheduled appointment, explore rescheduling or cancellation in your myPTE portal as early as possible rather than letting the test lapse into a No-Show.
              </div>
            </section>

            <section id="faq-section" className="bg-white dark:bg-[#141414] p-6 sm:p-8 rounded-3xl border border-[#EAEAEA] dark:border-[#262626] shadow-sm space-y-6">
              <div className="flex items-center gap-2.5 text-brand-pink font-bold text-xs uppercase tracking-wider">
                <HelpCircle className="w-4 h-4" /> Clear Answers
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white tracking-tight">Frequently Asked Questions</h2>
              <FaqAccordion faqs={FAQS} />
            </section>

            <section id="buy-voucher-cta" className="p-8 sm:p-10 rounded-3xl bg-linear-to-r from-[#1E0A14] via-[#111111] to-[#1E0A14] text-white border border-brand-pink/30 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-pink/10 rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
              <div className="space-y-2 relative z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-pink/20 text-brand-pink border border-brand-pink/40 text-xs font-black uppercase">
                  <Zap className="w-3.5 h-3.5" /> Instant Delivery • Save up to ₹3,401
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-white tracking-tight">Planning to Book a New PTE Exam?</h3>
                <p className="text-sm sm:text-base text-neutral-300 font-medium max-w-xl">Purchase your 100% genuine official PTE voucher from Apex Vouchers and save on examination fees instantly.</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 relative z-10">
                <Link href="/exam-vouchers" className="px-6 sm:px-8 py-4 rounded-2xl bg-brand-pink hover:bg-[#E00052] text-white font-heading font-black text-sm sm:text-base shadow-xl shadow-brand-pink/30 inline-flex items-center gap-2.5 transition">
                  BUY PTE VOUCHER ONLINE <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href={`https://wa.me/${CTA_PHONE.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Apex Vouchers, I want to purchase a discounted PTE voucher.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 inline-flex items-center gap-2 transition"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-400" /> WhatsApp: {CTA_PHONE}
                </a>
              </div>
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-semibold relative z-10">
                <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-brand-pink" /> Email: <a href={`mailto:${CTA_EMAIL}`} className="text-white hover:text-brand-pink">{CTA_EMAIL}</a></span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-brand-pink" /> Phone: <a href={`tel:${CTA_PHONE.replace(/\s+/g, '')}`} className="text-white hover:text-brand-pink">{CTA_PHONE}</a></span>
              </div>
            </section>

            <section className="p-6 rounded-3xl bg-neutral-100 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#262626] text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
              <p>
                <strong>Disclaimer:</strong> This article is for general informational purposes and is not affiliated with or endorsed by Pearson. PTE fees, cancellation rules, refund policies, voucher terms and booking procedures may change. Students should verify the latest information directly with Pearson and review the terms of their voucher provider before making a cancellation, rescheduling request or refund claim.
              </p>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
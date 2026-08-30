import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, HelpCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import { buildMetadata, JsonLd, breadcrumbJsonLd } from '@/lib/seo';
import { FAQSection } from '@/components/faq-section';
import { FAQ_ITEMS } from '@/lib/faq-data';

export const metadata: Metadata = buildMetadata({
  title: 'Frequently Asked Questions',
  description: 'Find answers to common questions about exam vouchers, instant delivery, voucher validity, refunds, and PTE booking assistance on Apex Vouchers.',
  path: '/faq',
});

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((f) => ({
    '@type': 'Question',
    name: f.question,
    acceptedAnswer: { '@type': 'Answer', text: f.answer },
  })),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-surface-sunken text-ink transition-colors duration-300">
      <JsonLd data={faqJsonLd} />
      <JsonLd data={breadcrumbJsonLd([{ name: 'Home', path: '/' }, { name: 'FAQ', path: '/faq' }])} />

      <div className="bg-surface border-b border-line">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <nav className="flex items-center gap-2 text-xs font-medium text-ink-muted">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-accent font-medium">FAQ</span>
          </nav>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-14 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium uppercase tracking-widest mb-4">
          <HelpCircle className="w-4 h-4" /> Frequently Asked Questions
        </div>
        <h1 className="font-heading font-light text-3xl sm:text-4xl lg:text-5xl text-ink tracking-tight">Got Questions? We Have Answers.</h1>
        <p className="text-ink-muted text-sm sm:text-base font-normal mt-3 max-w-xl mx-auto">
          Everything you need to know about exam vouchers, code validity, instant delivery, and booking. Still stuck? Contact our support desk below.
        </p>
      </div>

      <FAQSection />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl p-6 sm:p-8 bg-[#0B0D12] text-white border border-white/5 space-y-4">
          <h2 className="font-heading font-medium text-xl sm:text-2xl text-white">Still Have Questions?</h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-medium max-w-xl">
            Our student support desk is available 7 days a week to help you with voucher redemption, bookings, and refunds.
          </p>
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <a href={`https://wa.me/${'9855926113'}?text=${encodeURIComponent('Hello Apex Vouchers, I have a question about my exam voucher.')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium shadow-md transition">
              <MessageCircle className="w-4 h-4" /> WhatsApp Support
            </a>
            <a href="mailto:info@apexvouchers.com" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition">
              <Mail className="w-4 h-4 text-accent" /> info@apexvouchers.com
            </a>
            <a href="tel:+919855926113" className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 transition">
              <Phone className="w-4 h-4 text-accent" /> +91 98559 26113
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { useVoucher } from '../context/VoucherContext';
import { Phone, Mail, Heart } from 'lucide-react';
import { ApexLogo } from './ApexLogo';

export const LegalTrustFooter = () => {
  const { setActiveTab, footerSettings } = useVoucher();

  const footerDesc =
    footerSettings?.description ||
    'Official platform for discounted English language exam vouchers (PTE, IELTS, TOEFL, Duolingo). Test smarter, save more.';
  const footerPhone = footerSettings?.phone || '+91 9855926113';
  const footerEmail = footerSettings?.email || 'apexvouchers@gmail.com';
  const footerCopyright = footerSettings?.copyright || '© 2026 Apex Vouchers. All rights reserved.';

  return (
    <footer className="bg-[#111111] dark:bg-[#0A0A0A] text-neutral-400 text-xs border-t border-neutral-800 dark:border-[#292929] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-neutral-800 dark:border-[#292929]">
          {/* Column 1: APEX VOUCHERS Logo */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div onClick={() => setActiveTab('home')}>
              <ApexLogo showTagline={true} whiteText={true} />
            </div>

            <p className="text-neutral-400 text-xs font-medium leading-relaxed">{footerDesc}</p>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <p className="text-neutral-300 font-bold flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-brand-pink" />
                <a href={`tel:${footerPhone.replace(/\s+/g, '')}`} className="hover:text-brand-pink">
                  {footerPhone}
                </a>
              </p>
              <p className="text-neutral-300 font-bold flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-pink" />
                <a href={`mailto:${footerEmail}`} className="hover:text-brand-pink">
                  {footerEmail}
                </a>
              </p>
            </div>
          </div>

          {/* Column 2: Exam Vouchers & Services */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">Services & Booking</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('shop')} className="hover:text-brand-pink transition-colors text-left font-medium">
                  Exam Vouchers
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('exam-booking'); window.location.href = '/exam-booking'; }} className="hover:text-brand-pink transition-colors text-left font-medium flex items-center gap-1">
                  <span>PTE Exam Booking</span>
                  <span className="text-[9px] bg-brand-pink/20 text-brand-pink px-1.5 py-0.2 rounded font-black">NEW</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('exam-booking'); window.location.href = '/exam-booking?exam=pte-academic'; }} className="hover:text-brand-pink transition-colors text-left font-medium">
                  PTE Academic
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('exam-booking'); window.location.href = '/exam-booking?exam=pte-core'; }} className="hover:text-brand-pink transition-colors text-left font-medium">
                  PTE Core
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab('exam-booking'); window.location.href = '/exam-booking?exam=pte-ukvi'; }} className="hover:text-brand-pink transition-colors text-left font-medium">
                  PTE Academic UKVI
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Company */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              {[
                { name: 'About Us', tab: 'home' },
                { name: 'Contact', tab: 'faq' },
                { name: 'FAQ', tab: 'faq' },
                { name: 'Blog', tab: 'exam-guides' }
              ].map((item, idx) => (
                <li key={idx}>
                  <button onClick={() => setActiveTab(item.tab)} className="hover:text-brand-pink transition-colors text-left font-medium">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Policies (Dedicated Area - accessible only from footer) */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">Policies</h4>
            <ul className="space-y-2">
              <li>
                <a href="/refund-policy" className="hover:text-brand-pink transition-colors text-left font-medium block">
                  Refund & Cancellation Policy
                </a>
              </li>
              <li>
                <a href="/how-to-reschedule-cancel-pte-exam" className="hover:text-brand-pink transition-colors text-left font-medium flex items-center gap-1.5">
                  <span>PTE Rescheduling Guide</span>
                  <span className="text-[9px] bg-brand-pink/20 text-brand-pink px-1.5 py-0.2 rounded font-black">2026</span>
                </a>
              </li>
              <li>
                <a href="/voucher-refund-policy" className="hover:text-brand-pink transition-colors text-left font-medium block">
                  Voucher Refund Policy
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-brand-pink transition-colors text-left font-medium block">
                  Terms & Conditions
                </a>
              </li>
              <li>
                <a href="/privacy-policy" className="hover:text-brand-pink transition-colors text-left font-medium block">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 5: Support & Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-heading font-extrabold text-xs text-white uppercase tracking-wider">Support & Payment</h4>
            <ul className="space-y-1.5 pb-2">
              <li>
                <button onClick={() => setActiveTab('faq')} className="hover:text-brand-pink transition-colors text-left font-medium text-xs">
                  Help Center & FAQs
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${footerPhone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Apex Vouchers support team, I need assistance.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-pink transition-colors text-left font-medium text-xs text-emerald-400"
                >
                  Live WhatsApp Support
                </a>
              </li>
            </ul>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-medium">
              256-bit SSL Encrypted Secure Checkout
            </p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {['UPI', 'GPay', 'PhonePe', 'Visa', 'Mastercard', 'NetBanking', 'EMI'].map((pay, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px] font-extrabold border border-neutral-700">
                  {pay}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>{footerCopyright}</p>
          <div className="flex items-center gap-1 text-neutral-400 font-semibold">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-brand-pink fill-[#FF005C]" />
            <span>for study abroad candidates worldwide.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

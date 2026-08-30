import Link from 'next/link';
import { Phone, Mail, Heart } from 'lucide-react';
import { ApexLogo } from '@/components/apex-logo';

interface FooterProps {
  description?: string;
  phone?: string;
  email?: string;
  copyright?: string;
}

const PAYMENT_METHODS = ['UPI', 'GPay', 'PhonePe', 'Visa', 'Mastercard', 'NetBanking', 'EMI'];

export function Footer({
  description = 'Official platform for discounted English language exam vouchers (PTE, IELTS, TOEFL, Duolingo). Test smarter, save more.',
  phone = '+91 9855926113',
  email = 'apexvouchers@gmail.com',
  copyright = '© 2026 Apex Vouchers. All rights reserved.',
}: FooterProps) {
  const linkCls = 'hover:text-accent transition-colors text-left font-normal';
  const headingCls = 'font-heading font-medium text-xs text-white uppercase tracking-wider';

  return (
    <footer className="bg-[#0B0D12] text-neutral-400 text-xs border-t border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-white/5">
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link href="/">
              <ApexLogo showTagline whiteText />
            </Link>
            <p className="text-neutral-400 text-xs font-normal leading-relaxed">{description}</p>
            <div className="space-y-1.5 pt-1 text-[11px]">
              <p className="text-neutral-300 font-normal flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-accent" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-accent">
                  {phone}
                </a>
              </p>
              <p className="text-neutral-300 font-normal flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <a href={`mailto:${email}`} className="hover:text-accent">
                  {email}
                </a>
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className={headingCls}>Services & Booking</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/exam-vouchers" className={linkCls}>
                  Exam Vouchers
                </Link>
              </li>
              <li>
                <Link href="/exam-booking" className={`${linkCls} flex items-center gap-1`}>
                  <span>PTE Exam Booking</span>
                  <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-medium">NEW</span>
                </Link>
              </li>
              <li>
                <Link href="/exam-booking?exam=pte-academic" className={linkCls}>
                  PTE Academic
                </Link>
              </li>
              <li>
                <Link href="/exam-booking?exam=pte-core" className={linkCls}>
                  PTE Core
                </Link>
              </li>
              <li>
                <Link href="/exam-booking?exam=pte-ukvi" className={linkCls}>
                  PTE Academic UKVI
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className={headingCls}>Company</h4>
            <ul className="space-y-2">
              {[
                { name: 'About Us', href: '/' },
                { name: 'Contact', href: '/#faq' },
                { name: 'FAQ', href: '/#faq' },
                { name: 'Blog', href: '/blog' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className={linkCls}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className={headingCls}>Policies</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/refund-policy" className={`${linkCls} block`}>
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/how-to-reschedule-cancel-pte-exam" className={`${linkCls} flex items-center gap-1.5`}>
                  <span>PTE Rescheduling Guide</span>
                  <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.2 rounded font-medium">2026</span>
                </Link>
              </li>
              <li>
                <Link href="/voucher-refund-policy" className={`${linkCls} block`}>
                  Voucher Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className={`${linkCls} block`}>
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className={`${linkCls} block`}>
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className={headingCls}>Support & Payment</h4>
            <ul className="space-y-1.5 pb-2">
              <li>
                <Link href="/#faq" className={`${linkCls} text-xs`}>
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <a
                  href={`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello Apex Vouchers support team, I need assistance.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkCls} text-xs text-neutral-300`}
                >
                  Live WhatsApp Support
                </a>
              </li>
            </ul>
            <p className="text-[11px] text-neutral-400 leading-relaxed font-normal">256-bit SSL Encrypted Secure Checkout</p>
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {PAYMENT_METHODS.map((pay) => (
                <span key={pay} className="px-2 py-0.5 rounded bg-white/5 text-neutral-300 text-[10px] font-medium border border-white/10">
                  {pay}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>{copyright}</p>
          <div className="flex items-center gap-1 text-neutral-400 font-normal">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
            <span>for study abroad candidates worldwide.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

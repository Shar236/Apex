import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  ShoppingCart,
  User,
  ChevronDown,
  Ticket,
  Sparkles,
  Menu,
  X,
  BookOpen,
  Calculator,
  HelpCircle,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVoucher } from '../context/VoucherContext';
import { useAuth } from '../context/AuthContext';
import { ApexLogo } from './ApexLogo';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [vouchersDropdownOpen, setVouchersDropdownOpen] = useState(false);
  const {
    cart,
    activeTab,
    setActiveTab,
    setIsCartOpen,
    activeCampaign,
    announcementSettings,
    footerSettings,
  } = useVoucher();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

  const isExamBookingActive = location.pathname === '/exam-booking' || activeTab === 'exam-booking';
  const isHomeActive = location.pathname === '/' && activeTab === 'home';
  const isShopActive = location.pathname === '/' && activeTab === 'shop';
  const isHowItWorksActive = location.pathname === '/' && activeTab === 'how-it-works';
  const isCalculatorActive = location.pathname === '/' && activeTab === 'calculator';
  const isGuidesActive = location.pathname === '/' && activeTab === 'exam-guides';
  const isFaqActive = location.pathname === '/' && activeTab === 'faq';

  const handleNav = (tabName) => {
    setActiveTab(tabName);
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleExamBookingNav = () => {
    setActiveTab('exam-booking');
    navigate('/exam-booking');
    setIsMenuOpen(false);
  };

  const examCategories = [
    { name: 'PTE Academic Voucher', desc: 'Save up to ₹3,401 on official PTE Academic test', tag: 'PTE', tab: 'shop' },
    { name: 'PTE Core Voucher', desc: 'IRCC accepted for Canada PR & Work Permits', tag: 'PTE Core', tab: 'shop' },
    { name: 'ETS GRE Voucher', desc: 'Accepted by top global grad schools & MS programs', tag: 'GRE', tab: 'shop' },
    { name: 'ETS TOEFL iBT Voucher', desc: 'Accepted by 12,000+ universities worldwide', tag: 'TOEFL', tab: 'shop' },
    { name: 'Duolingo English Test Voucher', desc: 'Fast 48-hour results & 18% instant discount', tag: 'Duolingo', tab: 'shop' },
  ];

  const supportPhone = footerSettings?.phone || '+91 9855926113';
  const supportEmail = footerSettings?.email || 'apexvouchers@gmail.com';

  const announcementText =
    activeCampaign && announcementSettings?.overrideWithCampaign !== false
      ? `${activeCampaign.badgeText || '🔥 Special Offer'} — ${activeCampaign.title || 'Up to 50% OFF Exam Vouchers'}`
      : announcementSettings?.text || '⚡ Instant Voucher Delivery in 10s • 100% Genuine Official Vouchers';

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300">
      {/* ── Top Support Bar ─────────────────────────────────────────────────── */}
      <div className="bg-[#111111] dark:bg-[#0A0A0A] text-neutral-300 dark:text-neutral-400 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-neutral-800 dark:border-[#262626]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          
          {/* Contact Support Links */}
          <div className="flex items-center gap-5 whitespace-nowrap text-[11px] sm:text-xs">
            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 hover:text-brand-pink transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-brand-pink" />
              <span>
                Support: <strong className="text-white font-semibold">{supportPhone}</strong>
              </span>
            </a>
            <a
              href={`mailto:${supportEmail}`}
              className="hidden md:flex items-center gap-1.5 hover:text-brand-pink transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-brand-pink" />
              <span>
                Email: <strong className="text-white font-semibold">{supportEmail}</strong>
              </span>
            </a>
          </div>

          {/* Right Utility: Announcement Pill + Auth */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0 whitespace-nowrap text-[11px] sm:text-xs">
            {announcementSettings?.enabled !== false && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-pink/15 text-brand-pink font-black text-[10.5px] border border-brand-pink/30 shadow-sm animate-pulse-subtle">
                {announcementText}
              </span>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/account')}
                className="flex items-center gap-1 hover:text-white font-semibold text-xs transition-colors"
              >
                <User className="w-3.5 h-3.5 text-brand-pink" />
                <span>My Account ({user?.name?.split(' ')[0] || 'Dashboard'})</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 hover:text-white font-semibold text-xs transition-colors"
              >
                <User className="w-3.5 h-3.5 text-brand-pink" />
                <span>Login / Register</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ── Main Navigation Bar ─────────────────────────────────────────────── */}
      <nav
        className={`w-full transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md shadow-md py-2.5 border-b border-[#EAEAEA] dark:border-[#262626]'
            : 'bg-white dark:bg-[#0A0A0A] border-b border-[#EAEAEA] dark:border-[#262626] py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            
            {/* 1. Brand Logo */}
            <button
              onClick={() => handleNav('home')}
              className="flex items-center text-left focus:outline-none cursor-pointer group shrink-0"
              aria-label="Go to Apex Vouchers Home"
            >
              <ApexLogo showTagline={false} />
            </button>

            {/* 2. Compact Single-Line Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-semibold text-[13px] xl:text-[14px] text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
              
              {/* Home */}
              <button
                onClick={() => handleNav('home')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isHomeActive
                    ? 'text-brand-pink font-black bg-[#FFF0F5] dark:bg-[#2A0A17]'
                    : 'hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-brand-pink'
                }`}
              >
                Home
              </button>

              {/* Vouchers Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setVouchersDropdownOpen(true)}
                onMouseLeave={() => setVouchersDropdownOpen(false)}
              >
                <button
                  onClick={() => handleNav('shop')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                    isShopActive
                      ? 'text-brand-pink font-black bg-[#FFF0F5] dark:bg-[#2A0A17]'
                      : 'hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-brand-pink'
                  }`}
                >
                  <span>Vouchers</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      vouchersDropdownOpen ? 'rotate-180 text-brand-pink' : 'text-neutral-400'
                    }`}
                  />
                </button>

                {vouchersDropdownOpen && (
                  <div className="absolute top-full left-0 w-100 bg-white dark:bg-[#161616] rounded-2xl shadow-2xl border border-[#EAEAEA] dark:border-[#292929] p-3 mt-1 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 py-1.5">
                      Supported Exams
                    </div>
                    <div className="space-y-1">
                      {examCategories.map((exam, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleNav(exam.tab);
                            setVouchersDropdownOpen(false);
                          }}
                          className="w-full text-left p-2.5 sm:p-3 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] transition-all group flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-brand-pink transition-colors leading-tight">
                              {exam.name}
                            </div>
                            <div className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-medium mt-0.5 leading-snug">
                              {exam.desc}
                            </div>
                          </div>
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/25 whitespace-nowrap shrink-0">
                            {exam.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Exam Booking with compact inline PTE badge */}
              <button
                onClick={handleExamBookingNav}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  isExamBookingActive
                    ? 'text-brand-pink font-black bg-[#FFF0F5] dark:bg-[#2A0A17]'
                    : 'hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-brand-pink'
                }`}
              >
                <span>Exam Booking</span>
                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-brand-pink/10 text-brand-pink border border-brand-pink/20 leading-tight">
                  PTE
                </span>
              </button>

              {/* How It Works */}
              <button
                onClick={() => handleNav('how-it-works')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isHowItWorksActive
                    ? 'text-brand-pink font-black bg-[#FFF0F5] dark:bg-[#2A0A17]'
                    : 'hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-brand-pink'
                }`}
              >
                How It Works
              </button>

              {/* Savings */}
              <button
                onClick={() => handleNav('calculator')}
                title="Savings Calculator"
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isCalculatorActive
                    ? 'text-brand-pink font-black bg-[#FFF0F5] dark:bg-[#2A0A17]'
                    : 'hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-brand-pink'
                }`}
              >
                Savings
              </button>

              {/* Blog */}
              <button
                onClick={() => handleNav('exam-guides')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isGuidesActive
                    ? 'text-brand-pink font-black bg-[#FFF0F5] dark:bg-[#2A0A17]'
                    : 'hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-brand-pink'
                }`}
              >
                Blog
              </button>

              {/* FAQ */}
              <button
                onClick={() => handleNav('faq')}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  isFaqActive
                    ? 'text-brand-pink font-black bg-[#FFF0F5] dark:bg-[#2A0A17]'
                    : 'hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-brand-pink'
                }`}
              >
                FAQ
              </button>
            </div>

            {/* 3. Compact Right Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Compact Theme Toggle Icon */}
              <ThemeToggle compact={true} showLabel={false} />

              {/* Compact Cart Icon Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-xl bg-neutral-100 dark:bg-[#161616] hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] text-neutral-800 dark:text-neutral-200 hover:text-brand-pink transition-all border border-[#EAEAEA] dark:border-[#292929]"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-brand-pink text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse-subtle">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Secondary Outline CTA: Book Exam */}
              <button
                onClick={handleExamBookingNav}
                className="hidden lg:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] hover:bg-[#FFE0EB] text-brand-pink font-black text-xs border border-brand-pink/30 transition-colors whitespace-nowrap cursor-pointer"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book Exam</span>
              </button>

              {/* Primary Pink CTA: Buy Voucher */}
              <button
                onClick={() => handleNav('shop')}
                className="hidden sm:inline-flex btn-pink py-2! px-4! text-xs! font-black whitespace-nowrap items-center gap-1.5"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Buy Voucher</span>
              </button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-neutral-100 dark:bg-[#161616] text-neutral-800 dark:text-neutral-100 border border-[#EAEAEA] dark:border-[#292929]"
                aria-label="Open navigation menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile Navigation Drawer ──────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#161616] border-b border-[#EAEAEA] dark:border-[#292929] px-4 pt-3 pb-6 space-y-2.5 mt-2 animate-in slide-in-from-top duration-200">
            
            {/* Mobile Day/Night Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929]">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Theme Mode</span>
              <ThemeToggle compact={false} showLabel={true} />
            </div>

            <button
              onClick={() => handleNav('shop')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-bold text-neutral-900 dark:text-white bg-[#FFF0F5] dark:bg-[#2A0A17] flex items-center justify-between"
            >
              <span>🎟️ Browse All Vouchers</span>
              <span className="text-xs bg-brand-pink text-white px-2 py-0.5 rounded-md font-bold">Save 22%</span>
            </button>

            <button
              onClick={handleExamBookingNav}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-bold flex items-center justify-between ${
                isExamBookingActive
                  ? 'bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink'
                  : 'text-neutral-800 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-[#262626]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-brand-pink" />
                <span>PTE Exam Booking Assistance</span>
              </div>
              <span className="text-[10px] bg-brand-pink/15 text-brand-pink px-2 py-0.5 rounded-md font-black">NEW</span>
            </button>

            <button
              onClick={() => handleNav('how-it-works')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-brand-pink" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => handleNav('calculator')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-brand-pink" />
              <span>Savings Calculator</span>
            </button>

            <button
              onClick={() => handleNav('exam-guides')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-brand-pink" />
              <span>Exam Guides & Blog</span>
            </button>

            <button
              onClick={() => handleNav('faq')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>FAQ & Help</span>
            </button>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleExamBookingNav}
                className="w-full py-2.5 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink font-black text-xs border border-brand-pink/30 flex items-center justify-center gap-1.5"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Book PTE Exam</span>
              </button>
              <button
                onClick={() => handleNav('shop')}
                className="w-full btn-pink py-2.5! text-xs! font-black"
              >
                Buy Voucher Now
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

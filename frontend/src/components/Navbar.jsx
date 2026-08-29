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
  Trophy,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useVoucher } from '../context/VoucherContext';
import { useAuth } from '../context/AuthContext';
import { ApexLogo } from './ApexLogo';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui';

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
  const isGuidesActive = location.pathname.startsWith('/blog');
  const isFaqActive = location.pathname === '/' && activeTab === 'faq';
  const isAwardsActive = location.pathname === '/' && activeTab === 'awards';

  const handleNav = (tabName) => {
    setActiveTab(tabName);
    navigate('/');
    setIsMenuOpen(false);
  };

  const handleBlogNav = () => {
    setActiveTab('home');
    navigate('/blog');
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

  const navLinkClass = (active) =>
    `px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
      active
        ? 'text-[var(--color-accent)] font-medium bg-[var(--color-accent)]/[0.08]'
        : 'hover:bg-[var(--color-accent)]/[0.06] hover:text-[var(--color-accent)]'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300">
      {/* ── Top Support Bar ─────────────────────────────────────────────────── */}
      <div className="bg-[#0B0D12] text-neutral-400 text-xs py-1.5 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">

          {/* Contact Support Links */}
          <div className="flex items-center gap-5 whitespace-nowrap text-[11px] sm:text-xs">
            <a
              href={`tel:${supportPhone.replace(/\s+/g, '')}`}
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>
                Support: <strong className="text-white font-medium">{supportPhone}</strong>
              </span>
            </a>
            <a
              href={`mailto:${supportEmail}`}
              className="hidden md:flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              <span>
                Email: <strong className="text-white font-medium">{supportEmail}</strong>
              </span>
            </a>
          </div>

          {/* Right Utility: Announcement Pill + Auth */}
          <div className="flex items-center gap-3 ml-auto sm:ml-0 whitespace-nowrap text-[11px] sm:text-xs">
            {announcementSettings?.enabled !== false && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--color-accent)]/15 text-[var(--color-accent)] font-medium text-[10.5px] border border-[var(--color-accent)]/30">
                {announcementText}
              </span>
            )}
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/account')}
                className="flex items-center gap-1 hover:text-white font-normal text-xs transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[var(--color-accent)]" />
                <span>My Account ({user?.name?.split(' ')[0] || 'Dashboard'})</span>
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-1 hover:text-white font-normal text-xs transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[var(--color-accent)]" />
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
            ? 'bg-[var(--color-surface)]/95 backdrop-blur-md shadow-sm py-2.5 border-b border-[var(--color-line)]'
            : 'bg-[var(--color-surface)] border-b border-[var(--color-line)] py-3.5'
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
            <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 font-normal text-[13px] xl:text-[14px] text-[var(--color-ink-muted)] whitespace-nowrap">

              {/* Home */}
              <button onClick={() => handleNav('home')} className={navLinkClass(isHomeActive)}>
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
                      ? 'text-[var(--color-accent)] font-medium bg-[var(--color-accent)]/[0.08]'
                      : 'hover:bg-[var(--color-accent)]/[0.06] hover:text-[var(--color-accent)]'
                  }`}
                >
                  <span>Vouchers</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      vouchersDropdownOpen ? 'rotate-180 text-[var(--color-accent)]' : 'text-[var(--color-ink-muted)]'
                    }`}
                  />
                </button>

                {vouchersDropdownOpen && (
                  <div className="absolute top-full left-0 w-100 bg-[var(--color-surface)] rounded-2xl shadow-xl border border-[var(--color-line)] p-3 mt-1 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="text-[11px] font-medium text-[var(--color-ink-muted)] uppercase tracking-wider px-3 py-1.5">
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
                          className="w-full text-left p-2.5 sm:p-3 rounded-xl hover:bg-[var(--color-accent)]/[0.06] transition-all group flex items-center justify-between gap-3 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors leading-tight">
                              {exam.name}
                            </div>
                            <div className="text-xs text-[var(--color-ink-muted)] font-normal mt-0.5 leading-snug">
                              {exam.desc}
                            </div>
                          </div>
                          <span className="text-[10px] font-medium px-2.5 py-1 rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/25 whitespace-nowrap shrink-0">
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
                    ? 'text-[var(--color-accent)] font-medium bg-[var(--color-accent)]/[0.08]'
                    : 'hover:bg-[var(--color-accent)]/[0.06] hover:text-[var(--color-accent)]'
                }`}
              >
                <span>Exam Booking</span>
                <span className="text-[9px] font-medium px-1.5 py-0.2 rounded bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20 leading-tight">
                  PTE
                </span>
              </button>

              {/* How It Works */}
              <button onClick={() => handleNav('how-it-works')} className={navLinkClass(isHowItWorksActive)}>
                How It Works
              </button>

              {/* Savings */}
              <button
                onClick={() => handleNav('calculator')}
                title="Savings Calculator"
                className={navLinkClass(isCalculatorActive)}
              >
                Savings
              </button>

              {/* Blog */}
              <button onClick={handleBlogNav} className={navLinkClass(isGuidesActive)}>
                Blog
              </button>

              {/* Awards & Achievements */}
              <button
                onClick={() => handleNav('awards')}
                className={`hidden xl:inline-block ${navLinkClass(isAwardsActive)}`}
              >
                Awards
              </button>

              {/* FAQ */}
              <button onClick={() => handleNav('faq')} className={navLinkClass(isFaqActive)}>
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
                className="relative p-2 rounded-xl bg-[var(--color-surface-raised)] hover:bg-[var(--color-accent)]/[0.06] text-[var(--color-ink)] hover:text-[var(--color-accent)] transition-all border border-[var(--color-line)]"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-medium flex items-center justify-center shadow-md">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Secondary Outline CTA: Book Exam */}
              <Button
                onClick={handleExamBookingNav}
                variant="secondary"
                size="sm"
                className="hidden lg:inline-flex"
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Book Exam</span>
              </Button>

              {/* Primary Pink CTA: Buy Voucher */}
              <Button
                onClick={() => handleNav('shop')}
                variant="primary"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Buy Voucher</span>
              </Button>

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-[var(--color-surface-raised)] text-[var(--color-ink)] border border-[var(--color-line)]"
                aria-label="Open navigation menu"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* ── Mobile Navigation Drawer ──────────────────────────────────────── */}
        {isMenuOpen && (
          <div className="lg:hidden bg-[var(--color-surface)] border-b border-[var(--color-line)] px-4 pt-3 pb-6 space-y-2.5 mt-2 animate-in slide-in-from-top duration-200">

            {/* Mobile Day/Night Theme Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-surface-raised)] border border-[var(--color-line)]">
              <span className="text-xs font-medium text-[var(--color-ink)]">Theme Mode</span>
              <ThemeToggle compact={false} showLabel={true} />
            </div>

            <button
              onClick={() => handleNav('shop')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-medium text-[var(--color-ink)] bg-[var(--color-accent)]/[0.08] flex items-center justify-between"
            >
              <span>🎟️ Browse All Vouchers</span>
              <span className="text-xs bg-[var(--color-accent)] text-white px-2 py-0.5 rounded-md font-medium">Save 22%</span>
            </button>

            <button
              onClick={handleExamBookingNav}
              className={`w-full text-left px-4 py-2.5 rounded-xl font-normal flex items-center justify-between ${
                isExamBookingActive
                  ? 'bg-[var(--color-accent)]/[0.08] text-[var(--color-accent)]'
                  : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)]'
              }`}
            >
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[var(--color-accent)]" />
                <span>PTE Exam Booking Assistance</span>
              </div>
              <span className="text-[10px] bg-[var(--color-accent)]/15 text-[var(--color-accent)] px-2 py-0.5 rounded-md font-medium">NEW</span>
            </button>

            <button
              onClick={() => handleNav('how-it-works')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-normal text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => handleNav('calculator')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-normal text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)] flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Savings Calculator</span>
            </button>

            <button
              onClick={handleBlogNav}
              className="w-full text-left px-4 py-2.5 rounded-xl font-normal text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)] flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Students Diary & Blog</span>
            </button>

            <button
              onClick={() => handleNav('awards')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-normal text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)] flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-[var(--color-accent)]" />
              <span>Awards & Achievements</span>
            </button>

            <button
              onClick={() => handleNav('faq')}
              className="w-full text-left px-4 py-2.5 rounded-xl font-normal text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-raised)] hover:text-[var(--color-ink)] flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-[var(--color-ink-muted)]" />
              <span>FAQ & Help</span>
            </button>

            <div className="pt-2 flex flex-col gap-2">
              <Button onClick={handleExamBookingNav} variant="secondary" size="md" fullWidth>
                <CalendarCheck className="w-4 h-4" />
                <span>Book PTE Exam</span>
              </Button>
              <Button onClick={() => handleNav('shop')} variant="primary" size="md" fullWidth>
                Buy Voucher Now
              </Button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Phone, Mail, ShoppingCart, User, ChevronDown, Ticket, Sparkles, Menu, X, Shield, BookOpen, Calculator, HelpCircle } from 'lucide-react';
import { useVoucher } from '../context/VoucherContext';
import { ApexLogo } from './ApexLogo';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [vouchersDropdownOpen, setVouchersDropdownOpen] = useState(false);
  const { cart, activeTab, setActiveTab, toggleCart } = useVoucher();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = cart?.reduce((s, i) => s + (i.quantity || 1), 0) || 0;

  const examCategories = [
    { name: 'PTE Academic Voucher', desc: 'Save up to ₹3,401 on official PTE Academic test', tag: 'PTE', tab: 'shop' },
    { name: 'PTE Core Voucher', desc: 'IRCC accepted for Canada PR & Work Permits', tag: 'PTE Core', tab: 'shop' },
    { name: 'ETS GRE Voucher', desc: 'Accepted by top global grad schools & MS programs', tag: 'GRE', tab: 'shop' },
    { name: 'ETS TOEFL iBT Voucher', desc: 'Accepted by 12,000+ universities worldwide', tag: 'TOEFL', tab: 'shop' },
    { name: 'Duolingo English Test Voucher', desc: 'Fast 48-hour results & 18% instant discount', tag: 'Duolingo', tab: 'shop' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full transition-colors duration-300">
      {/* Top Announcement Bar */}
      <div className="bg-[#111111] dark:bg-[#0A0A0A] text-neutral-300 dark:text-neutral-400 text-xs py-2 px-4 sm:px-8 border-b border-neutral-800 dark:border-[#292929]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-6">
            <a href="tel:+919266808333" className="flex items-center gap-1.5 hover:text-[#FF005C] transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#FF005C]" />
              <span>Support: <strong className="text-white font-semibold">+91 9266808333</strong></span>
            </a>
            <a href="mailto:support@apexvouchers.com" className="hidden sm:flex items-center gap-1.5 hover:text-[#FF005C] transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#FF005C]" />
              <span>Email: <strong className="text-white font-semibold">support@apexvouchers.com</strong></span>
            </a>
          </div>

          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            <span className="hidden md:inline-flex px-2.5 py-0.5 rounded-full bg-[#FF005C]/10 text-[#FF005C] font-bold text-[10px] border border-[#FF005C]/20">
              ⚡ Instant Voucher Delivery in 10s
            </span>
            <button 
              onClick={() => setActiveTab('dashboard')} 
              className="flex items-center gap-1 hover:text-white font-medium text-xs transition-colors"
            >
              <User className="w-3.5 h-3.5 text-[#FF005C]" />
              <span>User Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className={`w-full transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-md shadow-md py-3 border-b border-[#EAEAEA] dark:border-[#292929]' 
          : 'bg-white dark:bg-[#0A0A0A] border-b border-[#EAEAEA] dark:border-[#292929] py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Official Logo Everywhere */}
            <div onClick={() => setActiveTab('home')}>
              <ApexLogo showTagline={false} />
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center gap-1 font-semibold text-sm text-neutral-700 dark:text-neutral-300">
              
              <button 
                onClick={() => setActiveTab('home')}
                className={`px-3 py-2 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-[#FF005C] transition-colors ${
                  activeTab === 'home' ? 'text-[#FF005C] font-bold bg-[#FFF0F5] dark:bg-[#2A0A17]' : ''
                }`}
              >
                Home
              </button>

              {/* Exam Vouchers Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setVouchersDropdownOpen(true)}
                onMouseLeave={() => setVouchersDropdownOpen(false)}
              >
                <button 
                  onClick={() => setActiveTab('shop')}
                  className={`flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-[#FF005C] transition-colors ${
                    activeTab === 'shop' ? 'text-[#FF005C] font-bold bg-[#FFF0F5] dark:bg-[#2A0A17]' : ''
                  }`}
                >
                  <span>Exam Vouchers</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${vouchersDropdownOpen ? 'rotate-180 text-[#FF005C]' : 'text-neutral-400'}`} />
                </button>

                {vouchersDropdownOpen && (
                  <div className="absolute top-full left-0 w-80 bg-white dark:bg-[#161616] rounded-2xl shadow-2xl border border-[#EAEAEA] dark:border-[#292929] p-3 mt-1 animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider px-3 py-1.5">Supported Exams</div>
                    <div className="space-y-1">
                      {examCategories.map((exam, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveTab(exam.tab);
                            setVouchersDropdownOpen(false);
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] transition-colors group flex items-start justify-between"
                        >
                          <div>
                            <div className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-[#FF005C] transition-colors">{exam.name}</div>
                            <div className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-normal">{exam.desc}</div>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C] whitespace-nowrap">{exam.tag}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button 
                onClick={() => setActiveTab('how-it-works')}
                className={`px-3 py-2 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-[#FF005C] transition-colors ${
                  activeTab === 'how-it-works' ? 'text-[#FF005C] font-bold bg-[#FFF0F5] dark:bg-[#2A0A17]' : ''
                }`}
              >
                How It Works
              </button>

              <button 
                onClick={() => setActiveTab('calculator')}
                className={`px-3 py-2 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-[#FF005C] transition-colors ${
                  activeTab === 'calculator' ? 'text-[#FF005C] font-bold bg-[#FFF0F5] dark:bg-[#2A0A17]' : ''
                }`}
              >
                Savings Calculator
              </button>

              <button 
                onClick={() => setActiveTab('exam-guides')}
                className={`px-3 py-2 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-[#FF005C] transition-colors ${
                  activeTab === 'exam-guides' ? 'text-[#FF005C] font-bold bg-[#FFF0F5] dark:bg-[#2A0A17]' : ''
                }`}
              >
                Blog
              </button>

              <button 
                onClick={() => setActiveTab('faq')}
                className={`px-3 py-2 rounded-xl hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] hover:text-[#FF005C] transition-colors ${
                  activeTab === 'faq' ? 'text-[#FF005C] font-bold bg-[#FFF0F5] dark:bg-[#2A0A17]' : ''
                }`}
              >
                FAQ
              </button>
            </div>

            {/* Right Action Buttons with Day/Night Theme Toggle */}
            <div className="flex items-center gap-3">
              
              {/* Day / Night Mode Toggle Switch (Header Top Right specified in prompt) */}
              <ThemeToggle compact={false} showLabel={false} />

              {/* Cart Button */}
              <button
                onClick={() => toggleCart()}
                className="relative p-2.5 rounded-xl bg-neutral-100 dark:bg-[#161616] hover:bg-[#FFF0F5] dark:hover:bg-[#2A0A17] text-neutral-800 dark:text-neutral-200 hover:text-[#FF005C] transition-all border border-[#EAEAEA] dark:border-[#292929]"
                aria-label="Shopping Cart"
              >
                <ShoppingCart className="w-4.5 h-4.5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[#FF005C] text-white text-[11px] font-extrabold flex items-center justify-center shadow-md animate-pulse-subtle">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Primary Action Button */}
              <button
                onClick={() => setActiveTab('shop')}
                className="hidden sm:inline-flex btn-pink !py-2.5 !px-5 !text-sm"
              >
                <Ticket className="w-4 h-4" />
                <span>Buy Voucher</span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-xl bg-neutral-100 dark:bg-[#161616] text-neutral-800 dark:text-neutral-100 border border-[#EAEAEA] dark:border-[#292929]"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer with Theme Toggle */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-[#161616] border-b border-[#EAEAEA] dark:border-[#292929] px-4 pt-3 pb-6 space-y-3 mt-2">
            
            {/* Mobile Day/Night Theme Toggle specified in prompt */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929]">
              <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Theme Mode</span>
              <ThemeToggle compact={false} showLabel={true} />
            </div>

            <button
              onClick={() => { setActiveTab('shop'); setIsMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl font-bold text-neutral-900 dark:text-white bg-[#FFF0F5] dark:bg-[#2A0A17] flex items-center justify-between"
            >
              <span>🎟️ Browse All Vouchers</span>
              <span className="text-xs bg-[#FF005C] text-white px-2 py-0.5 rounded-md font-bold">Save 22%</span>
            </button>

            <button
              onClick={() => { setActiveTab('how-it-works'); setIsMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#FF005C]" />
              <span>How It Works</span>
            </button>

            <button
              onClick={() => { setActiveTab('calculator'); setIsMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <Calculator className="w-4 h-4 text-[#FF005C]" />
              <span>Savings Calculator</span>
            </button>

            <button
              onClick={() => { setActiveTab('exam-guides'); setIsMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-[#FF005C]" />
              <span>Exam Guides & Blog</span>
            </button>

            <button
              onClick={() => { setActiveTab('faq'); setIsMenuOpen(false); }}
              className="w-full text-left px-4 py-3 rounded-xl font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-[#262626] flex items-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
              <span>FAQ & Help</span>
            </button>

            <div className="pt-2">
              <button 
                onClick={() => { setActiveTab('shop'); setIsMenuOpen(false); }} 
                className="w-full btn-pink !py-3 !text-sm"
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

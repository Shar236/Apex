import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useVoucher } from '../context/VoucherContext';
import { useAuth } from '../context/AuthContext';
import { pteBookingApi, applyPageMetadata } from '../lib/api';
import { EXAM_PROVIDERS, PTE_INDIAN_CITIES } from '../lib/examProviders';
import { PhoneInput } from './PhoneInput';
import {
  PearsonOfficialLogo,
  PearsonPTELogo,
  PTEAcademicLogo,
  PTECoreLogo,
  PTEUKVILogo,
  DynamicPTELogo,
  ETSGreLogo,
  ETSToeflLogo,
  IELTSLogo,
} from './OfficialBrandLogos';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  HelpCircle,
  ChevronDown,
  Lock,
  ExternalLink,
  MessageCircle,
  Copy,
  Check,
  Loader2,
  Sparkles,
  Users,
  GraduationCap,
  FileCheck,
  Building2,
  Search,
  Phone,
  Mail,
  Play,
  RotateCcw,
  BadgeCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

const EXAM_TYPE_OPTIONS = [
  {
    id: 'PTE Academic',
    slug: 'pte-academic',
    label: 'PTE Academic',
    badge: 'MOST POPULAR',
    tint: '#005A9C',
    icon: GraduationCap,
    desc: 'For university study admissions, student visas & professional registrations worldwide (Australia, UK, USA, Canada, NZ).',
  },
  {
    id: 'PTE Core',
    slug: 'pte-core',
    label: 'PTE Core',
    badge: 'CANADA PR',
    tint: '#FF005C',
    icon: ShieldCheck,
    desc: 'Approved by IRCC for Canadian Permanent Residency (PR), Express Entry, Provincial Nominees, and Citizenship pathways.',
  },
  {
    id: 'PTE Academic UKVI',
    slug: 'pte-ukvi',
    label: 'PTE Academic UKVI',
    badge: 'UK VISA (SELT)',
    tint: '#6C3CE0',
    icon: Building2,
    desc: 'Secure English Language Test (SELT) approved by the UK Home Office for UK work, study, and family visa applications.',
  },
];

const TIME_OPTIONS = ['Morning', 'Afternoon', 'Evening', 'Any Time'];

const FAQ_LIST = [
  {
    q: 'What is PTE Exam Booking Assistance?',
    a: 'PTE Exam Booking Assistance is a dedicated guidance service by Apex Vouchers. Our team helps you understand the different PTE exam types, select your preferred city and centre, review date options, and navigate the official booking process without confusion.',
  },
  {
    q: 'Which PTE tests can you help with?',
    a: 'We provide booking assistance for all three official Pearson PTE variants: PTE Academic (study and general visas), PTE Core (Canadian Express Entry and PR pathways), and PTE Academic UKVI (UK Home Office SELT visa applications).',
  },
  {
    q: 'Can you help me choose the correct PTE test?',
    a: 'Yes, we provide objective guidance on the differences between PTE Academic, PTE Core, and PTE Academic UKVI. However, the ultimate requirement must always be confirmed with your specific university, employer, or immigration authority.',
  },
  {
    q: 'Can you guarantee my preferred slot, test centre, or date?',
    a: 'No. Test slots and appointments are managed directly within Pearson’s official test centre network. An appointment is only confirmed when the official Pearson booking process succeeds and issues an official Pearson booking confirmation.',
  },
  {
    q: 'Can I request a preferred city and test centre?',
    a: 'Yes! In the booking assistance form, you can specify your preferred city, test centre, preferred exam date, and time preference. You can also provide alternative dates in case your primary choice is full.',
  },
  {
    q: 'What if my preferred date or test centre is unavailable?',
    a: 'If your primary slot is full, our team will review the alternative dates or nearby test centres you provided, or contact you directly with the closest official availability to help you schedule without delay.',
  },
  {
    q: 'Do I need my own Pearson account?',
    a: 'Yes. You should create and maintain your personal myPTE account on Pearson’s official portal (pearsonpte.com) to access your official test confirmation, admit card, and scorecard.',
  },
  {
    q: 'Should I give Apex Vouchers my Pearson password or OTP?',
    a: 'Never. Apex Vouchers will NEVER ask you for your Pearson account password, myPTE password, OTP, UPI PIN, or bank card PIN. You always retain complete control and ownership of your personal credentials.',
  },
  {
    q: 'Can I book PTE Academic UKVI for the UK?',
    a: 'Yes, we assist with PTE Academic UKVI requests, which are specifically required for certain UK Home Office visa routes requiring a Secure English Language Test (SELT).',
  },
  {
    q: 'Can I book PTE Core for Canada Express Entry?',
    a: 'Yes. PTE Core is accepted by Immigration, Refugees and Citizenship Canada (IRCC) for Express Entry, Provincial Nominee Programs (PNP), and Canadian Citizenship.',
  },
  {
    q: 'How do I know when my exam booking is confirmed?',
    a: 'Your appointment is officially confirmed only when you receive an official Pearson Booking Confirmation email containing your official appointment details, centre address, and Pearson candidate reference.',
  },
  {
    q: 'How much does booking assistance cost?',
    a: 'Booking assistance is currently available as a dedicated support service from Apex Vouchers. If you also purchase an official discounted exam voucher from us, you can apply the voucher during your official checkout to save on exam fees.',
  },
];

const todayISO = () => new Date().toISOString().slice(0, 10);

export const PTEExamBookingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { footerSettings, setActiveTab, globalSEO } = useVoucher();
  const { user } = useAuth();

  const formRef = useRef(null);
  const howItWorksRef = useRef(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [examType, setExamType] = useState('PTE Academic');
  const [preferredCity, setPreferredCity] = useState('');
  const [otherCity, setOtherCity] = useState('');
  const [preferredTestCentre, setPreferredTestCentre] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('Any Time');
  const [alternativeDate, setAlternativeDate] = useState('');
  const [additionalRequirements, setAdditionalRequirements] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  // UI interaction states
  const [citySearch, setCitySearch] = useState('');
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [copiedId, setCopiedId] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Read URL query parameter for preselecting exam type (?exam=pte-academic, pte-core, pte-ukvi)
  useEffect(() => {
    const examParam = searchParams.get('exam')?.toLowerCase();
    if (examParam) {
      if (examParam.includes('core')) setExamType('PTE Core');
      else if (examParam.includes('ukvi')) setExamType('PTE Academic UKVI');
      else setExamType('PTE Academic');
    }
  }, [searchParams]);

  // SEO metadata for this dedicated route (title/description/canonical/OG/Twitter)
  useEffect(() => {
    const title = 'PTE Exam Booking Assistance | Apex Vouchers';
    const description =
      'Get assistance with PTE Academic, PTE Core and PTE Academic UKVI exam booking. Choose your preferred test, city and date and get guidance through the booking process.';
    const base = (globalSEO?.websiteUrl || 'https://apexvouchers.com').replace(/\/$/, '');
    const canonical = `${base}/exam-booking`;
    applyPageMetadata({
      title,
      description,
      canonical,
      ogTitle: title,
      ogDescription: description,
      ogUrl: canonical,
      ogType: 'website',
      twitterTitle: title,
      twitterDescription: description,
    });
  }, [globalSEO]);

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      if (user.name && !fullName) setFullName(user.name);
      if (user.email && !email) setEmail(user.email);
      if (user.phone && !phone) setPhone(user.phone);
    }
  }, [user]);

  // Draft recovery from sessionStorage for non-sensitive data
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('apex_pte_booking_draft');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.preferredCity && !preferredCity) setPreferredCity(parsed.preferredCity);
        if (parsed.preferredTime && preferredTime === 'Any Time') setPreferredTime(parsed.preferredTime);
      }
    } catch {}
  }, []);

  // Save non-sensitive draft changes
  useEffect(() => {
    try {
      sessionStorage.setItem(
        'apex_pte_booking_draft',
        JSON.stringify({ preferredCity, preferredTime, examType })
      );
    } catch {}
  }, [preferredCity, preferredTime, examType]);

  const supportPhone = footerSettings?.phone || '+91 9855926113';
  const supportEmail = footerSettings?.email || 'apexvouchers@gmail.com';

  const resolvedCity = preferredCity === 'Other' ? otherCity.trim() : preferredCity;

  const filteredCities = useMemo(() => {
    if (!citySearch.trim()) return PTE_INDIAN_CITIES;
    return PTE_INDIAN_CITIES.filter((c) =>
      c.name.toLowerCase().includes(citySearch.toLowerCase()) ||
      c.state.toLowerCase().includes(citySearch.toLowerCase())
    );
  }, [citySearch]);

  const scrollToForm = (preselectExam = null) => {
    if (preselectExam) {
      setExamType(preselectExam);
      const matched = EXAM_TYPE_OPTIONS.find((e) => e.id === preselectExam);
      if (matched) {
        setSearchParams({ exam: matched.slug });
      }
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToHowItWorks = () => {
    howItWorksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const validate = () => {
    const errs = {};
    if (!fullName.trim() || fullName.trim().length < 2) errs.fullName = 'Please enter your full legal name';
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = 'Please enter a valid email address';
    if (!phone || phone.replace(/\D/g, '').length < 6) errs.phone = 'Please enter a valid mobile number';
    if (!resolvedCity) errs.preferredCity = 'Please select or enter your preferred test city';
    if (preferredCity === 'Other' && !otherCity.trim()) errs.otherCity = 'Please specify your city';
    const today = todayISO();
    if (preferredDate && preferredDate < today) errs.preferredDate = 'Exam date cannot be in the past';
    if (alternativeDate && alternativeDate < today) errs.alternativeDate = 'Alternative date cannot be in the past';
    if (!termsAccepted) errs.termsAccepted = 'Please acknowledge that this is a booking assistance request';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await pteBookingApi.submit({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        examType,
        preferredCity: resolvedCity,
        preferredTestCentre: preferredTestCentre.trim(),
        preferredDate: preferredDate || null,
        preferredTime,
        alternativeDate: alternativeDate || null,
        additionalRequirements: additionalRequirements.trim(),
        message: additionalRequirements.trim(),
        termsAccepted,
      });

      setIsSubmitting(false);

      if (res?.success) {
        setSubmittedData({
          requestId: res.data?.requestId || 'PTE-REQUEST',
          fullName: fullName.trim(),
          examType,
          preferredCity: resolvedCity,
          preferredDate,
          preferredTime,
          duplicate: res.duplicate || false,
        });
        sessionStorage.removeItem('apex_pte_booking_draft');
      } else {
        setSubmitError(res?.message || 'Something went wrong. Please check your details and try again.');
      }
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Unable to connect. Please check your internet connection and try again.');
    }
  };

  const copyRequestId = (reqId) => {
    if (!reqId) return;
    navigator.clipboard.writeText(reqId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const resetForm = () => {
    setSubmittedData(null);
    setErrors({});
    setSubmitError('');
    setPreferredDate('');
    setAlternativeDate('');
    setAdditionalRequirements('');
    setTermsAccepted(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white antialiased transition-colors duration-300">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebPage',
                '@id': 'https://apexvouchers.com/exam-booking',
                url: 'https://apexvouchers.com/exam-booking',
                name: 'PTE Exam Booking Assistance | Apex Vouchers',
                description:
                  'Get PTE exam booking assistance for PTE Academic, PTE Core, and PTE Academic UKVI. Choose your preferred city and date and get guidance through the booking process.',
                breadcrumb: {
                  '@type': 'BreadcrumbList',
                  itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://apexvouchers.com/' },
                    { '@type': 'ListItem', position: 2, name: 'Exam Booking', item: 'https://apexvouchers.com/exam-booking' },
                  ],
                },
              },
              {
                '@type': 'Service',
                name: 'PTE Exam Booking Assistance',
                provider: { '@type': 'Organization', name: 'Apex Vouchers', url: 'https://apexvouchers.com' },
                serviceType: 'Educational Examination Guidance & Support',
                areaServed: 'India, Global',
              },
              {
                '@type': 'FAQPage',
                mainEntity: FAQ_LIST.map((f) => ({
                  '@type': 'Question',
                  name: f.q,
                  acceptedAnswer: { '@type': 'Answer', text: f.a },
                })),
              },
            ],
          }),
        }}
      />

      {/* ── Breadcrumbs ──────────────────────────────────────────────────────────── */}
      <div className="border-b border-[#EAEAEA] dark:border-[#202020] bg-neutral-50/70 dark:bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 text-xs font-bold text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
          <Link to="/" className="hover:text-brand-pink transition-colors">
            Home
          </Link>
          <span className="text-neutral-300 dark:text-neutral-600">/</span>
          <span className="text-brand-pink">PTE Exam Booking</span>
        </div>
      </div>

      {/* ── HERO SECTION ────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-[#EAEAEA] dark:border-[#222]">
        {/* Background glow accents */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-150 h-87.5 bg-linear-to-tr from-brand-pink/15 via-[#6C3CE0]/15 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Heading & Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Badge & Official Provider Indicator */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink font-black text-xs border border-brand-pink/30 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                  PTE EXAM BOOKING ASSISTANCE
                </span>
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <PearsonOfficialLogo className="h-4" />
                </div>
              </div>

              {/* Main Heading */}
              <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black text-neutral-900 dark:text-white tracking-tight leading-[1.1]">
                Book Your <span className="text-brand-pink">PTE Exam</span> With Confidence
              </h1>

              {/* Supporting Copy */}
              <p className="text-base sm:text-lg text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-medium">
                Not sure which PTE test to book, where to take it, or how to choose your preferred date?
                Apex Vouchers can guide you through the booking process and help you prepare the right details
                before you book.
              </p>

              {/* Service Disclaimer Alert Box */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-start gap-3 max-w-2xl text-left">
                <Info className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <p>
                  <strong>Important:</strong> Our service provides booking assistance and guidance.
                  Your exam appointment is confirmed only through the official booking process.
                </p>
              </div>

              {/* Hero Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  onClick={() => scrollToForm()}
                  className="w-full sm:w-auto btn-pink py-3.5! px-8! text-sm! font-extrabold flex items-center justify-center gap-2 shadow-xl hover:shadow-brand-pink/25"
                >
                  <span>Start Booking Assistance</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={scrollToHowItWorks}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-[#1A1A1A] hover:bg-neutral-200 dark:hover:bg-[#252525] text-neutral-800 dark:text-neutral-200 font-bold text-sm border border-[#EAEAEA] dark:border-[#292929] transition-colors"
                >
                  How It Works ↓
                </button>
              </div>

              {/* Trust highlights under CTA */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs font-bold text-neutral-500 dark:text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-brand-pink" /> 100% Genuine Guidance
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Never Asks For Passwords
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4 text-sky-500" /> WhatsApp & Call Support
                </span>
              </div>

            </div>

            {/* Right Column: Hero Visual Graphic */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-md rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#141414] border-2 border-[#EAEAEA] dark:border-[#262626] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-brand-pink/10 to-[#6C3CE0]/10 blur-2xl rounded-full pointer-events-none" />

                {/* Visual Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 dark:border-[#222] pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-neutral-400">
                    PTE EXAM BOOKING
                  </span>
                </div>

                {/* Checklist Visual Items */}
                <div className="space-y-3.5 mb-6">
                  {[
                    { label: 'Test Type', value: 'PTE Academic / Core / UKVI', icon: GraduationCap, tint: '#005A9C' },
                    { label: 'Preferred City', value: 'Delhi, Mumbai, Chandigarh & 20+ Cities', icon: MapPin, tint: '#FF005C' },
                    { label: 'Test Centre', value: 'Select Nearest Authorized Centre', icon: Building2, tint: '#6C3CE0' },
                    { label: 'Preferred Date', value: 'Custom Slots & Morning/Afternoon', icon: Calendar, tint: '#10B981' },
                  ].map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#1B1B1B] border border-neutral-100 dark:border-[#282828] flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: `${item.tint}15`, color: item.tint }}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-[11px] font-extrabold text-neutral-400 uppercase">{item.label}</div>
                            <div className="text-xs font-black text-neutral-900 dark:text-white">{item.value}</div>
                          </div>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xs font-black">
                          ✓
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer of visual */}
                <div className="p-3.5 rounded-2xl bg-[#FFF0F5] dark:bg-[#200A13] border border-brand-pink/20 flex items-center justify-between text-xs font-black">
                  <div className="flex items-center gap-2 text-brand-pink">
                    <Sparkles className="w-4 h-4" />
                    <span>Booking Assistance</span>
                  </div>
                  <span className="text-neutral-600 dark:text-neutral-300 font-bold">Apex Vouchers</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── QUICK BOOKING FORM SECTION ──────────────────────────────────────────── */}
      <section ref={formRef} id="booking-form-section" className="py-16 sm:py-20 bg-neutral-50/60 dark:bg-[#0E0E0E] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {submittedData ? (
            /* ── SUCCESS SCREEN ── */
            <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#141414] border-2 border-emerald-500/50 shadow-2xl text-center animate-in fade-in slide-in-from-bottom-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50">
                REQUEST SUBMITTED SUCCESSFULLY
              </span>

              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white mt-3">
                We've Received Your Booking Request
              </h2>

              {/* Request ID Banner with 1-click copy */}
              <div className="my-6 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#1C1C1C] border border-[#EAEAEA] dark:border-[#292929] inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-6 justify-center">
                <div className="text-left">
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-400">Your Request ID</div>
                  <div className="font-mono font-black text-lg sm:text-xl text-brand-pink">{submittedData.requestId}</div>
                </div>
                <button
                  type="button"
                  onClick={() => copyRequestId(submittedData.requestId)}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-[#121212] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink text-xs font-black flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Summary of what customer requested */}
              <div className="max-w-md mx-auto p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#262626] text-left text-xs font-bold space-y-2 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Exam:</span>
                  <span className="text-neutral-900 dark:text-white font-black">{submittedData.examType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">City:</span>
                  <span className="text-neutral-900 dark:text-white font-black">{submittedData.preferredCity}</span>
                </div>
                {submittedData.preferredDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Date:</span>
                    <span className="text-neutral-900 dark:text-white font-black">{submittedData.preferredDate}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">Time:</span>
                  <span className="text-neutral-900 dark:text-white font-black">{submittedData.preferredTime}</span>
                </div>
              </div>

              {/* Clear Lifecycle Message */}
              <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium leading-relaxed max-w-lg mx-auto mb-6">
                Our team will review your booking preferences and contact you using the details provided to assist with
                scheduling through Pearson's official process.
              </p>

              {/* Next Steps 4-stage pipeline */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8 text-left">
                {[
                  { step: '01', title: 'Request Received', active: true },
                  { step: '02', title: 'Under Review', active: false },
                  { step: '03', title: 'Booking Guidance', active: false },
                  { step: '04', title: 'Official Confirmation', active: false },
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs ${
                      s.active
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-black'
                        : 'bg-neutral-50 dark:bg-[#1A1A1A] border-[#EAEAEA] dark:border-[#282828] text-neutral-400 font-bold'
                    }`}
                  >
                    <div className="text-[10px] font-mono">{s.step}</div>
                    <div className="text-xs">{s.title}</div>
                  </div>
                ))}
              </div>

              {/* Action Buttons: WhatsApp + Back */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/${supportPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Hello Apex Vouchers, I submitted PTE booking assistance request ${submittedData.requestId} and need help with my booking.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp for Faster Assistance</span>
                </a>
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-neutral-100 dark:bg-[#1E1E1E] text-neutral-800 dark:text-neutral-200 font-extrabold text-xs hover:bg-neutral-200 dark:hover:bg-[#282828] transition-colors"
                >
                  Back to Exam Booking Form
                </button>
              </div>
            </div>
          ) : (
            /* ── BOOKING FORM ── */
            <div className="rounded-3xl p-6 sm:p-10 bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] shadow-xl">
              
              {/* Form Heading & Subtitle */}
              <div className="text-center max-w-xl mx-auto mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
                  QUICK ASSISTANCE FORM
                </span>
                <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white mt-1">
                  Tell Us What You Need
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-2">
                  Share your preferred exam and booking details. Our team will review your request and guide you through the next step.
                </p>
              </div>

              {submitError && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Exam Type Selector with Dynamic Provider Logo */}
                <div>
                  <label className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-2">
                    Select PTE Test <span className="text-brand-pink">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {EXAM_TYPE_OPTIONS.map((opt) => {
                      const isSelected = examType === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => {
                            setExamType(opt.id);
                            setSearchParams({ exam: opt.slug });
                          }}
                          className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                            isSelected
                              ? 'border-brand-pink bg-[#FFF0F5] dark:bg-[#250915] shadow-md'
                              : 'border-[#EAEAEA] dark:border-[#292929] bg-neutral-50/50 dark:bg-[#181818] hover:border-neutral-300 dark:hover:border-neutral-700'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md text-white"
                              style={{ backgroundColor: opt.tint }}
                            >
                              {opt.badge}
                            </span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-brand-pink" />}
                          </div>
                          <div className="font-heading font-black text-sm text-neutral-900 dark:text-white">
                            {opt.label}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Dynamic Official Provider Badge reflecting selection */}
                  <div className="mt-3 p-3 rounded-xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#282828] flex items-center justify-between">
                    <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">Selected Provider Examination:</span>
                    <DynamicPTELogo examType={examType} className="h-6" />
                  </div>
                </div>

                {/* 2. Customer Contact Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Full Legal Name <span className="text-brand-pink">*</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      placeholder="As per your official ID / Passport"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: null });
                      }}
                      className={`w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border text-xs sm:text-sm font-bold text-neutral-900 dark:text-white outline-none transition-colors ${
                        errors.fullName
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
                      }`}
                    />
                    {errors.fullName && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-brand-pink">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                      className={`w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border text-xs sm:text-sm font-bold text-neutral-900 dark:text-white outline-none transition-colors ${
                        errors.email
                          ? 'border-rose-500 focus:border-rose-500'
                          : 'border-[#EAEAEA] dark:border-[#292929] focus:border-brand-pink'
                      }`}
                    />
                    {errors.email && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.email}</p>}
                  </div>

                </div>

                {/* Mobile Number */}
                <div>
                  <label htmlFor="phone" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Mobile Number (WhatsApp) <span className="text-brand-pink">*</span>
                  </label>
                  <PhoneInput
                    value={phone}
                    onChange={(val) => {
                      setPhone(val);
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                    defaultCountry="IN"
                    error={errors.phone}
                    className="w-full"
                  />
                  {errors.phone && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.phone}</p>}
                </div>

                {/* 3. Location & Test Centre */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Preferred City (Searchable Dropdown) */}
                  <div className="relative">
                    <label className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Preferred City <span className="text-brand-pink">*</span>
                    </label>
                    <div
                      onClick={() => setCityDropdownOpen(!cityDropdownOpen)}
                      className={`w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border text-xs sm:text-sm font-bold flex items-center justify-between cursor-pointer transition-colors ${
                        errors.preferredCity
                          ? 'border-rose-500'
                          : 'border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink'
                      }`}
                    >
                      <span className={preferredCity ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}>
                        {preferredCity ? preferredCity : 'Select city...'}
                      </span>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${cityDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>

                    {/* City Dropdown Menu */}
                    {cityDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 z-30 mt-1.5 p-2 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-2xl animate-in fade-in slide-in-from-top-2">
                        <div className="p-2 border-b border-neutral-100 dark:border-[#222] flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-neutral-400" />
                          <input
                            type="text"
                            placeholder="Filter cities..."
                            value={citySearch}
                            onChange={(e) => setCitySearch(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full bg-transparent text-xs font-bold outline-none"
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1 py-1">
                          {filteredCities.map((c) => (
                            <button
                              key={c.name}
                              type="button"
                              onClick={() => {
                                setPreferredCity(c.name);
                                setCityDropdownOpen(false);
                                if (errors.preferredCity) setErrors({ ...errors, preferredCity: null });
                              }}
                              className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors ${
                                preferredCity === c.name
                                  ? 'bg-[#FFF0F5] dark:bg-[#280B17] text-brand-pink'
                                  : 'hover:bg-neutral-100 dark:hover:bg-[#202020] text-neutral-800 dark:text-neutral-200'
                              }`}
                            >
                              <span>{c.name}</span>
                              <span className="text-[10px] text-neutral-400">{c.state}</span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setPreferredCity('Other');
                              setCityDropdownOpen(false);
                              if (errors.preferredCity) setErrors({ ...errors, preferredCity: null });
                            }}
                            className={`w-full px-3 py-2 rounded-xl text-left text-xs font-bold transition-colors ${
                              preferredCity === 'Other'
                                ? 'bg-[#FFF0F5] dark:bg-[#280B17] text-brand-pink'
                                : 'hover:bg-neutral-100 dark:hover:bg-[#202020] text-neutral-500'
                            }`}
                          >
                            + Other City (Enter Manually)
                          </button>
                        </div>
                      </div>
                    )}
                    {errors.preferredCity && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.preferredCity}</p>}
                  </div>

                  {/* Preferred Test Centre (Optional) */}
                  <div>
                    <label htmlFor="preferredTestCentre" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Preferred Test Centre <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="preferredTestCentre"
                      type="text"
                      placeholder="e.g. Pearson Professional Centre"
                      value={preferredTestCentre}
                      onChange={(e) => setPreferredTestCentre(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] text-xs sm:text-sm font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-pink transition-colors"
                    />
                  </div>

                </div>

                {/* Other City manual input if selected */}
                {preferredCity === 'Other' && (
                  <div>
                    <label htmlFor="otherCity" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Specify City Name <span className="text-brand-pink">*</span>
                    </label>
                    <input
                      id="otherCity"
                      type="text"
                      placeholder="Enter city or town name"
                      value={otherCity}
                      onChange={(e) => {
                        setOtherCity(e.target.value);
                        if (errors.otherCity) setErrors({ ...errors, otherCity: null });
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] text-xs sm:text-sm font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-pink"
                    />
                    {errors.otherCity && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.otherCity}</p>}
                  </div>
                )}

                {/* 4. Dates & Time Preference */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  
                  {/* Preferred Date */}
                  <div>
                    <label htmlFor="preferredDate" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Preferred Date
                    </label>
                    <input
                      id="preferredDate"
                      type="date"
                      min={todayISO()}
                      value={preferredDate}
                      onChange={(e) => {
                        setPreferredDate(e.target.value);
                        if (errors.preferredDate) setErrors({ ...errors, preferredDate: null });
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] text-xs sm:text-sm font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-pink"
                    />
                    {errors.preferredDate && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.preferredDate}</p>}
                  </div>

                  {/* Preferred Time */}
                  <div>
                    <label htmlFor="preferredTime" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Preferred Time
                    </label>
                    <select
                      id="preferredTime"
                      value={preferredTime}
                      onChange={(e) => setPreferredTime(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] text-xs sm:text-sm font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-pink"
                    >
                      {TIME_OPTIONS.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>

                  {/* Alternative Date */}
                  <div>
                    <label htmlFor="alternativeDate" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                      Alternative Date <span className="text-neutral-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      id="alternativeDate"
                      type="date"
                      min={todayISO()}
                      value={alternativeDate}
                      onChange={(e) => {
                        setAlternativeDate(e.target.value);
                        if (errors.alternativeDate) setErrors({ ...errors, alternativeDate: null });
                      }}
                      className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] text-xs sm:text-sm font-bold text-neutral-900 dark:text-white outline-none focus:border-brand-pink"
                    />
                    {errors.alternativeDate && <p className="text-[11px] font-bold text-rose-500 mt-1">{errors.alternativeDate}</p>}
                  </div>

                </div>

                {/* 5. Additional Requirements */}
                <div>
                  <label htmlFor="additionalRequirements" className="block text-xs font-black text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Additional Requirements or Questions <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id="additionalRequirements"
                    rows={3}
                    placeholder="Tell us if you have a preferred centre, flexible dates, or any other booking preference."
                    value={additionalRequirements}
                    onChange={(e) => setAdditionalRequirements(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929] text-xs sm:text-sm font-medium text-neutral-900 dark:text-white outline-none focus:border-brand-pink transition-colors"
                  />
                </div>

                {/* 6. Terms & Non-Guaranteed Disclaimer Checkbox */}
                <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#292929]">
                  <label className="flex items-start gap-3 cursor-pointer text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => {
                        setTermsAccepted(e.target.checked);
                        if (errors.termsAccepted) setErrors({ ...errors, termsAccepted: null });
                      }}
                      className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-brand-pink focus:ring-brand-pink"
                    />
                    <span>
                      I confirm that the information provided is correct and understand that this is a{' '}
                      <strong className="text-brand-pink">booking assistance request</strong>, not a guaranteed exam slot.
                    </span>
                  </label>
                  {errors.termsAccepted && <p className="text-[11px] font-bold text-rose-500 mt-1.5 ml-7">{errors.termsAccepted}</p>}
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-pink py-4! text-sm! sm:text-base! font-extrabold flex items-center justify-center gap-2 shadow-xl hover:shadow-brand-pink/30 disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Submitting Booking Request...</span>
                    </>
                  ) : (
                    <>
                      <span>Request Booking Assistance</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

              </form>

            </div>
          )}

        </div>
      </section>

      {/* ── WHICH PTE TEST DO YOU NEED? ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
              EXAM SELECTION GUIDE
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-neutral-900 dark:text-white mt-2">
              Which PTE Test Do You Need?
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium mt-3">
              Different PTE tests serve different purposes. Make sure you choose the one required for your application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {EXAM_TYPE_OPTIONS.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="rounded-3xl p-6 sm:p-7 bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] hover:border-brand-pink hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full text-white shadow-sm"
                        style={{ backgroundColor: card.tint }}
                      >
                        {card.badge}
                      </span>
                      <PearsonOfficialLogo className="h-4" />
                    </div>

                    <div
                      className="w-12 h-12 rounded-2xl mb-4 flex items-center justify-center"
                      style={{ backgroundColor: `${card.tint}15`, color: card.tint }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="font-heading font-black text-xl text-neutral-900 dark:text-white mb-2">
                      {card.label}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed mb-6">
                      {card.desc}
                    </p>
                  </div>

                  <button
                    onClick={() => scrollToForm(card.id)}
                    className="w-full py-3 rounded-xl bg-neutral-100 dark:bg-[#202020] group-hover:bg-brand-pink text-neutral-900 dark:text-white group-hover:text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Book {card.label}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Test Selection Disclaimer Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#121212] border border-[#EAEAEA] dark:border-[#262626] text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong>Important Disclaimer:</strong> Not sure which test you need? Confirm the required test with your
              university, immigration authority, visa requirements or the official Pearson PTE information before booking.
              Apex Vouchers provides guidance based on publicly available requirements but does not make official visa decisions.
            </p>
          </div>

        </div>
      </section>

      {/* ── EXAMS WE CAN HELP YOU NAVIGATE (PROVIDER LOGO STRIP) ──────────────── */}
      <section className="py-12 bg-neutral-50/50 dark:bg-[#0D0D0D] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-400">
            EXAMS WE CAN HELP YOU NAVIGATE
          </span>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 mt-6">
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
              <PearsonPTELogo className="h-7" />
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
              <ETSGreLogo className="h-7" />
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
              <ETSToeflLogo className="h-7" />
            </div>
            <div className="px-5 py-3 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
              <IELTSLogo className="h-7" />
            </div>
          </div>

          <p className="text-xs font-medium text-neutral-400 dark:text-neutral-500 max-w-2xl mx-auto mt-5">
            We provide guidance and booking assistance for selected examination services. Availability and eligibility
            depend on the official examination provider. Pearson, ETS, and IELTS are registered trademarks of their respective owners.
          </p>
        </div>
      </section>

      {/* ── HOW PTE EXAM BOOKING WORKS (4 STEPS) ────────────────────────────────── */}
      <section ref={howItWorksRef} id="how-it-works-section" className="py-16 sm:py-24 border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
              SIMPLE 4-STEP PROCESS
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-neutral-900 dark:text-white mt-2">
              How PTE Exam Booking Works
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium mt-3">
              A clear, transparent process from choosing your test to getting your booking details ready.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                title: 'Choose Your PTE Test',
                desc: 'Select PTE Academic, PTE Core, or PTE Academic UKVI based on your specific university or immigration route.',
                tint: '#005A9C',
              },
              {
                step: '02',
                title: 'Share Your Preferences',
                desc: 'Tell us your preferred city, centre, preferred exam date, time slot, and alternative dates.',
                tint: '#FF005C',
              },
              {
                step: '03',
                title: 'Get Booking Guidance',
                desc: 'Our team reviews your request and personally guides you through the official Pearson booking steps.',
                tint: '#6C3CE0',
              },
              {
                step: '04',
                title: 'Confirm Your Appointment',
                desc: 'The exam appointment is officially confirmed once processed through Pearson’s official booking system.',
                tint: '#10B981',
              },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-3xl p-6 bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] shadow-sm relative overflow-hidden"
              >
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-black text-sm mb-5"
                  style={{ backgroundColor: `${s.tint}15`, color: s.tint }}
                >
                  {s.step}
                </div>
                <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CHECK PTE DATES & TEST CENTRES ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-neutral-50/60 dark:bg-[#0D0D0D] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-10 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#262626] shadow-lg flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left max-w-xl">
              <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
                OFFICIAL AVAILABILITY GUIDANCE
              </span>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white">
                Looking for a PTE Test Centre?
              </h2>
              <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
                PTE test centres, dates and available times can vary by city and change as appointments are booked,
                cancelled or rescheduled. We guide you using current official Pearson test centre networks across India.
              </p>
            </div>
            <a
              href="https://www.pearsonpte.com/test-centers-and-fees"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-extrabold text-xs flex items-center gap-2 shadow-md hover:opacity-90 transition-opacity shrink-0"
            >
              <span>Check Official PTE Availability</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── PTE CITIES COVERAGE ─────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
              NATIONWIDE ASSISTANCE
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl tracking-tight text-neutral-900 dark:text-white mt-2">
              PTE Booking Assistance Across India
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium mt-2">
              Assisting test takers across all major Indian cities with authorized Pearson test centres.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
            {PTE_INDIAN_CITIES.slice(0, 12).map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => {
                  setPreferredCity(city.name);
                  scrollToForm();
                }}
                className="p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] hover:border-brand-pink hover:bg-[#FFF0F5] dark:hover:bg-[#200A13] text-left transition-all group"
              >
                <div className="flex items-center gap-1.5 text-neutral-400 group-hover:text-brand-pink text-xs font-bold mb-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{city.state.split('/')[0]}</span>
                </div>
                <div className="font-heading font-black text-sm text-neutral-900 dark:text-white group-hover:text-brand-pink">
                  {city.name}
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs font-bold text-neutral-400">
            And other locations where PTE test centres are officially available. Availability changes based on Pearson schedules.
          </p>

        </div>
      </section>

      {/* ── WHY APEX VOUCHERS (TRUST SECTION) ──────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-neutral-50/60 dark:bg-[#0D0D0D] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
              WHY CHOOSE APEX VOUCHERS
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight text-neutral-900 dark:text-white mt-2">
              More Than a Voucher
            </h2>
            <p className="text-sm sm:text-base text-neutral-500 dark:text-neutral-400 font-medium mt-3">
              We provide human guidance, transparent processes, and dedicated booking support every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Clear Guidance',
                desc: 'Understand the booking process, requirements, and timeline before you proceed.',
                icon: HelpCircle,
              },
              {
                title: 'Right Test Selection',
                desc: 'Get unbiased guidance on the differences between PTE Academic, PTE Core, and PTE UKVI.',
                icon: FileCheck,
              },
              {
                title: 'Booking Support',
                desc: 'Get human help preparing all personal and identification details required for booking.',
                icon: Users,
              },
              {
                title: 'Transparent Process',
                desc: 'Know exactly what happens at each stage of your booking assistance request.',
                icon: ShieldCheck,
              },
              {
                title: 'Customer Support',
                desc: 'Get fast assistance by email, WhatsApp, and phone whenever you have questions.',
                icon: Phone,
              },
              {
                title: 'Official Voucher Discounts',
                desc: 'Save significantly on official Pearson exam fees with our genuine instant vouchers.',
                icon: Sparkles,
              },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  className="rounded-3xl p-6 bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] shadow-sm"
                >
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading font-black text-lg text-neutral-900 dark:text-white mb-2">
                    {card.title}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── SAFE & TRANSPARENT BOOKING (SECURITY FIRST) ────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-10 bg-linear-to-br from-[#121A2D] to-[#0A0E17] text-white border border-slate-800 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-3 text-sky-400 text-xs font-black uppercase tracking-wider mb-3">
              <Lock className="w-4 h-4" />
              <span>SECURITY & PRIVACY GUARANTEE</span>
            </div>
            
            <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
              Your Booking. Your Account. Your Control.
            </h2>
            
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed mt-3 font-medium">
              Keep control of your official Pearson account and personal credentials. Apex Vouchers will{' '}
              <strong className="text-white">never ask you to share your Pearson password, OTP, UPI PIN, or bank credentials</strong>{' '}
              through our website or support team.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-800 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black">✓</span>
                <span>You own your myPTE login</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black">✓</span>
                <span>No password collection</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-black">✓</span>
                <span>256-bit encrypted data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOKING REQUEST VS CONFIRMED BOOKING (PIPELINE) ───────────────────── */}
      <section className="py-16 sm:py-20 bg-neutral-50/50 dark:bg-[#0D0D0D] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
              TRANSPARENT STATUS PROGRESSION
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white mt-1">
              Booking Request vs Official Confirmation
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2">
              Understanding what happens after you submit your assistance request.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { status: 'Request Submitted', desc: 'Your preferred city, exam, and dates are safely received by our team.' },
              { status: 'Under Review', desc: 'Our team evaluates test centre schedules and requirements.' },
              { status: 'Booking Guidance', desc: 'We coordinate with you on official Pearson scheduling steps.' },
              { status: 'Official Confirmation', desc: 'Your appointment is confirmed once Pearson officially issues your admit card.' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm">
                <div className="w-7 h-7 rounded-xl bg-neutral-100 dark:bg-[#222] font-mono font-black text-xs flex items-center justify-center text-brand-pink mb-3">
                  0{idx + 1}
                </div>
                <h4 className="font-heading font-black text-sm text-neutral-900 dark:text-white mb-1.5">{item.status}</h4>
                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IF MY PREFERRED SLOT IS UNAVAILABLE? ─────────────────────────── */}
      <section className="py-16 sm:py-20 border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="rounded-3xl p-8 bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] shadow-md space-y-4">
            <span className="text-xs font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
              FLEXIBILITY & CONTINGENCY
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-neutral-900 dark:text-white">
              What If My Preferred Slot Isn't Available?
            </h2>
            <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Test centre availability can change quickly. If your preferred date, time or centre is unavailable,
              our team can help you evaluate the alternatives you provided in your request:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-bold text-neutral-700 dark:text-neutral-200">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#282828] flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-pink" /> Try alternative morning or afternoon slots
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#282828] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-pink" /> Try adjacent dates in the same week
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#282828] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-brand-pink" /> Try another authorized centre in the same city
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#282828] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-pink" /> Check available centres in nearby cities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ SECTION ─────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 bg-neutral-50/60 dark:bg-[#0D0D0D] border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-neutral-900 dark:text-white mt-1">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-2">
              Everything you need to know about PTE exam booking assistance with Apex Vouchers.
            </p>
          </div>

          <div className="space-y-3">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-5 text-left font-black text-sm sm:text-base text-neutral-900 dark:text-white flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-brand-pink' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed border-t border-neutral-100 dark:border-[#202020] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── FINAL CALL TO ACTION ────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 border-b border-[#EAEAEA] dark:border-[#222]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="rounded-3xl p-8 sm:p-14 bg-linear-to-tr from-[#FFF0F5] via-white to-[#F3EEFF] dark:from-[#1E0914] dark:via-[#141414] dark:to-[#160D26] border-2 border-brand-pink/30 shadow-2xl relative overflow-hidden">
            <span className="text-xs font-black uppercase tracking-widest text-brand-pink">
              READY TO BOOK YOUR PTE EXAM?
            </span>
            <h2 className="font-heading font-black text-3xl sm:text-5xl text-neutral-900 dark:text-white mt-2 tracking-tight">
              Tell Us Your Preferences
            </h2>
            <p className="text-sm sm:text-base font-medium text-neutral-600 dark:text-neutral-300 max-w-xl mx-auto mt-3">
              Tell us your preferred test, city and date. We'll guide you through the next step with 100% genuine support.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <button
                onClick={() => scrollToForm()}
                className="w-full sm:w-auto btn-pink py-4! px-8! text-sm! font-black flex items-center justify-center gap-2 shadow-xl"
              >
                <span>Start PTE Booking Assistance</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href={`https://wa.me/${supportPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                  'Hello Apex Vouchers, I have a question about PTE exam booking assistance.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
                <span>Chat with Support on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEED HELP BEFORE YOU BOOK? (CONTACT CHANNELS) ──────────────────────── */}
      <section className="py-12 bg-neutral-50/50 dark:bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-2xl bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#262626]">
            <div>
              <h3 className="font-heading font-black text-base text-neutral-900 dark:text-white">Need Help Before You Book?</h3>
              <p className="text-xs text-neutral-500 font-medium">Contact our support team directly for immediate assistance with your PTE test choice.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${supportPhone.replace(/\s+/g, '')}`}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#202020] text-xs font-black flex items-center gap-2 hover:text-brand-pink transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-brand-pink" />
                <span>{supportPhone}</span>
              </a>
              <a
                href={`mailto:${supportEmail}`}
                className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#202020] text-xs font-black flex items-center gap-2 hover:text-brand-pink transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-brand-pink" />
                <span>{supportEmail}</span>
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PTEExamBookingPage;

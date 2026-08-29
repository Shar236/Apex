import React, { useEffect, useMemo, useState } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { useAuth } from '../context/AuthContext';
import { PhoneInput } from './PhoneInput';
import { pteBookingApi } from '../lib/api';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  Loader2,
} from 'lucide-react';

const EXAM_TYPES = ['PTE Academic', 'PTE Core', 'PTE Academic UKVI'];

const CITY_OPTIONS = [
  'Delhi', 'Chandigarh', 'Mumbai', 'Bangalore', 'Hyderabad', 'Pune',
  'Chennai', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kochi',
  'Amritsar', 'Ludhiana', 'Other',
];

const todayISO = () => new Date().toISOString().slice(0, 10);

const EMPTY_FORM = {
  fullName: '',
  email: '',
  phone: '',
  examType: 'PTE Academic',
  preferredCity: '',
  otherCity: '',
  preferredTestCentre: '',
  preferredDate: '',
  alternativeDate: '',
  message: '',
  termsAccepted: false,
};

export const PTEBookingModal = () => {
  const { isPTEBookingOpen, setIsPTEBookingOpen, pteBookingExamType, footerSettings, setActiveTab } = useVoucher();
  const { isAuthenticated, user } = useAuth();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isPTEBookingOpen) return;
    setForm((f) => ({
      ...EMPTY_FORM,
      examType: EXAM_TYPES.includes(pteBookingExamType) ? pteBookingExamType : 'PTE Academic',
      fullName: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }));
    setErrors({});
    setSubmitError('');
    setIsSubmitted(false);
    setResult(null);
  }, [isPTEBookingOpen, pteBookingExamType, user]);

  const isOtherCity = form.preferredCity === 'Other';

  const resolvedCity = useMemo(
    () => (isOtherCity ? form.otherCity.trim() : form.preferredCity),
    [isOtherCity, form.otherCity, form.preferredCity]
  );

  if (!isPTEBookingOpen) return null;

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim() || form.fullName.trim().length < 2) next.fullName = 'Full name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'A valid email address is required';
    if (!form.phone || form.phone.replace(/\D/g, '').length < 6) next.phone = 'A valid phone number is required';
    if (!EXAM_TYPES.includes(form.examType)) next.examType = 'Please select an exam type';
    if (!resolvedCity) next.preferredCity = 'Preferred city is required';
    const today = todayISO();
    if (form.preferredDate && form.preferredDate < today) next.preferredDate = 'Date cannot be in the past';
    if (form.alternativeDate && form.alternativeDate < today) next.alternativeDate = 'Date cannot be in the past';
    if (!form.termsAccepted) next.termsAccepted = 'Please confirm to continue';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    if (!validate()) return;

    setIsSubmitting(true);
    const res = await pteBookingApi.submit({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone,
      examType: form.examType,
      preferredCity: resolvedCity,
      preferredTestCentre: form.preferredTestCentre.trim(),
      preferredDate: form.preferredDate || null,
      alternativeDate: form.alternativeDate || null,
      message: form.message.trim(),
      termsAccepted: form.termsAccepted,
    });
    setIsSubmitting(false);

    if (res.success) {
      setResult(res.data);
      setIsSubmitted(true);
    } else {
      setSubmitError(res.message || 'Something went wrong. Please try again.');
    }
  };

  const handleClose = () => {
    setIsPTEBookingOpen(false);
  };

  const whatsappHref = (() => {
    const raw = footerSettings?.phone || '+91 9855926113';
    const digits = raw.replace(/[^\d]/g, '');
    const msg = encodeURIComponent(
      result?.requestId
        ? `Hi Apex Vouchers! I need urgent help with my PTE booking assistance request ${result.requestId}.`
        : 'Hi Apex Vouchers! I need help with PTE exam booking assistance.'
    );
    return `https://wa.me/${digits}?text=${msg}`;
  })();

  const copyRequestId = () => {
    if (!result?.requestId) return;
    navigator.clipboard?.writeText(result.requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-neutral-900 dark:text-white transition-colors duration-300">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 dark:bg-[#262626] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            <div className="mb-6 border-b border-[#EAEAEA] dark:border-[#292929] pb-4">
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/20 inline-block mb-2">
                PTE Booking Assistance Request
              </span>
              <h2 className="font-heading font-black text-2xl">Request Booking Assistance</h2>
              <p className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-medium mt-1">
                Our team will personally help you find and book your PTE exam slot. This is a booking assistance
                request — not a guaranteed reservation.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Personal Information */}
              <FieldGroup title="Personal Information">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <MiniLabel>Full Name *</MiniLabel>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={form.fullName}
                      onChange={(e) => set('fullName')(e.target.value)}
                      className={inputClass(errors.fullName)}
                    />
                    <FieldError msg={errors.fullName} />
                  </div>
                  <div>
                    <MiniLabel>Email Address *</MiniLabel>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={form.email}
                      onChange={(e) => set('email')(e.target.value)}
                      className={inputClass(errors.email)}
                    />
                    <FieldError msg={errors.email} />
                  </div>
                  <div>
                    <MiniLabel>Phone Number *</MiniLabel>
                    <PhoneInput value={form.phone} onChange={(v) => set('phone')(v)} error={errors.phone} />
                    <FieldError msg={errors.phone} />
                  </div>
                </div>
              </FieldGroup>

              {/* Exam Information */}
              <FieldGroup title="Exam Information">
                <div>
                  <MiniLabel>PTE Exam Type *</MiniLabel>
                  <select
                    value={form.examType}
                    onChange={(e) => set('examType')(e.target.value)}
                    className={inputClass(errors.examType)}
                  >
                    {EXAM_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <FieldError msg={errors.examType} />
                </div>
              </FieldGroup>

              {/* Preferred Booking Details */}
              <FieldGroup title="Preferred Booking Details">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <MiniLabel>Preferred City *</MiniLabel>
                    <select
                      value={form.preferredCity}
                      onChange={(e) => set('preferredCity')(e.target.value)}
                      className={inputClass(errors.preferredCity)}
                    >
                      <option value="">Select a city</option>
                      {CITY_OPTIONS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <FieldError msg={errors.preferredCity} />
                  </div>
                  {isOtherCity && (
                    <div>
                      <MiniLabel>Enter Your City *</MiniLabel>
                      <input
                        type="text"
                        placeholder="e.g. Patiala"
                        value={form.otherCity}
                        onChange={(e) => set('otherCity')(e.target.value)}
                        className={inputClass(errors.preferredCity)}
                      />
                    </div>
                  )}
                  <div className={isOtherCity ? '' : 'sm:col-span-1'}>
                    <MiniLabel>Preferred Test Centre (optional)</MiniLabel>
                    <input
                      type="text"
                      placeholder="e.g. Pearson Centre, Sector 34"
                      value={form.preferredTestCentre}
                      onChange={(e) => set('preferredTestCentre')(e.target.value)}
                      className={inputClass()}
                    />
                  </div>
                  <div>
                    <MiniLabel>Preferred Exam Date (optional)</MiniLabel>
                    <input
                      type="date"
                      min={todayISO()}
                      value={form.preferredDate}
                      onChange={(e) => set('preferredDate')(e.target.value)}
                      className={inputClass(errors.preferredDate)}
                    />
                    <FieldError msg={errors.preferredDate} />
                  </div>
                  <div>
                    <MiniLabel>Alternative Date (optional)</MiniLabel>
                    <input
                      type="date"
                      min={todayISO()}
                      value={form.alternativeDate}
                      onChange={(e) => set('alternativeDate')(e.target.value)}
                      className={inputClass(errors.alternativeDate)}
                    />
                    <FieldError msg={errors.alternativeDate} />
                  </div>
                </div>
              </FieldGroup>

              {/* Additional Requirements */}
              <FieldGroup title="Additional Requirements">
                <MiniLabel>Anything else you'd like us to know? (optional)</MiniLabel>
                <textarea
                  rows={3}
                  placeholder="e.g. I prefer morning slots. I need a centre near Chandigarh. I am flexible with the date."
                  value={form.message}
                  onChange={(e) => set('message')(e.target.value)}
                  className={`${inputClass()} resize-none`}
                />
              </FieldGroup>

              {/* Terms */}
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.termsAccepted}
                  onChange={(e) => set('termsAccepted')(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-brand-pink shrink-0"
                />
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  I confirm that the information provided is correct and I understand that this is a booking
                  assistance request, not a guarantee of an exam slot.
                </span>
              </label>
              <FieldError msg={errors.termsAccepted} />

              {submitError && (
                <div className="text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-pink py-4! rounded-xl! text-base! font-black flex items-center justify-center gap-2 shadow-xl disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Request...</span>
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
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h2 className="font-heading font-black text-3xl">Request Submitted</h2>
              <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] font-medium mt-2 max-w-md mx-auto">
                Your PTE booking assistance request has been received. Our team will review your request and
                contact you using the details provided.
              </p>
            </div>

            <div className="inline-flex flex-col items-center gap-2 p-5 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border-2 border-dashed border-brand-pink/40">
              <span className="text-[11px] font-black text-brand-pink uppercase tracking-wider">Request ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-2xl tracking-wider select-all">{result?.requestId}</span>
                <button
                  onClick={copyRequestId}
                  className="p-2 rounded-lg bg-white dark:bg-[#161616] border border-brand-pink/30 text-brand-pink"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold text-neutral-500 dark:text-neutral-400 max-w-sm mx-auto">
              {result?.examType} · {result?.preferredCity}
              {result?.preferredDate ? ` · ${new Date(result.preferredDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : ''}
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => {
                  handleClose();
                  setActiveTab('shop');
                }}
                className="w-full btn-pink py-3.5! rounded-xl! text-sm! font-extrabold"
              >
                Back to Vouchers
              </button>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-extrabold text-sm shadow-md"
              >
                <MessageCircle className="w-4 h-4" />
                Need urgent help? Contact Support
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function FieldGroup({ title, children }) {
  return (
    <div>
      <h4 className="text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-[#B5B5B5] mb-2.5">
        {title}
      </h4>
      {children}
    </div>
  );
}

function MiniLabel({ children }) {
  return (
    <span className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1.5">
      {children}
    </span>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="mt-1.5 text-xs font-bold text-rose-500">{msg}</p>;
}

function inputClass(error) {
  return `w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border ${error ? 'border-rose-400 dark:border-rose-500' : 'border-[#EAEAEA] dark:border-[#292929]'} text-sm font-semibold focus:outline-none focus:border-brand-pink transition-all`;
}

export default PTEBookingModal;

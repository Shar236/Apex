import React, { useState, useEffect } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Lock, CheckCircle2, QrCode, CreditCard, Sparkles, ArrowRight, Copy, Check, AlertCircle, ExternalLink, LogIn } from 'lucide-react';
import { ApexLogo } from './ApexLogo';
import { orderApi, accountApi, formatPrice as fmt } from '../lib/api';

export const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, checkoutProduct, formatPrice, handlePurchaseSuccess, setActiveTab } = useVoucher();
  const { isAuthenticated, user, login, register } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [completedVouchers, setCompletedVouchers] = useState([]);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [error, setError] = useState('');

  const [guestLoginTab, setGuestLoginTab] = useState(isAuthenticated ? 'billing' : 'login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [registerMode, setRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (!isCheckoutOpen) return;
    setGuestLoginTab(isAuthenticated ? 'billing' : 'login');
    if (user) {
      setFormData((f) => ({
        ...f,
        name: f.name || user.name || '',
        email: f.email || user.email || '',
        phone: f.phone || user.phone || '',
      }));
    }
  }, [isCheckoutOpen, isAuthenticated, user]);

  if (!isCheckoutOpen || !checkoutProduct) return null;

  const subtotal = checkoutProduct.discountedPrice;
  const finalPrice = Math.max(0, subtotal - promoDiscount);

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return;
    if (!isAuthenticated) {
      setPromoError('Please log in first to apply a promo code');
      return;
    }
    setPromoError('');
    const res = await accountApi.validatePromo({
      code: promoCode,
      subtotal,
      productIds: [checkoutProduct._id || checkoutProduct.id],
    });
    if (res.success && res.valid) {
      setPromoApplied(true);
      setPromoDiscount(res.discount);
    } else {
      setPromoApplied(false);
      setPromoDiscount(0);
      setPromoError(res.reason || res.message || 'Invalid promo code');
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      let res;
      if (registerMode) {
        res = await register(registerForm);
      } else {
        res = await login(loginForm);
      }
      if (!res.success) {
        setAuthError(res.message || 'Login failed');
      } else {
        setGuestLoginTab('billing');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!isAuthenticated) {
      setGuestLoginTab('login');
      setError('Please log in or create an account to complete your purchase.');
      return;
    }
    if (!formData.name || (!formData.email && !formData.phone)) {
      setError('Please fill in your name and email/WhatsApp number for voucher delivery.');
      return;
    }
    setIsProcessing(true);
    const orderPayload = {
      items: [{ productId: checkoutProduct._id || checkoutProduct.id, quantity: 1 }],
      promoCode: promoApplied ? promoCode.trim().toUpperCase() : null,
      billing: {
        ...formData,
        email: formData.email || user?.email,
      },
    };
    const orderRes = await orderApi.create(orderPayload);
    if (!orderRes.success) {
      setIsProcessing(false);
      setError(orderRes.message || 'Failed to create order');
      return;
    }
    const order = orderRes.data;
    const payRes = await orderApi.simulatePay(order._id || order.id, {
      provider: paymentMethod,
      reference: `SIM-${order.orderNo}`,
    });
    if (!payRes.success) {
      setIsProcessing(false);
      setError(payRes.message || 'Payment failed');
      return;
    }
    setIsProcessing(false);
    setIsCompleted(true);
    setCompletedOrder(payRes.data || order);
    setCompletedVouchers(payRes.vouchers || []);

    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    handlePurchaseSuccess({ orderId: order.orderNo });
  };

  const handleCopy = (idx, code) => {
    navigator.clipboard?.writeText(code);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 3000);
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIsCompleted(false);
    setCompletedOrder(null);
    setCompletedVouchers([]);
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode('');
    setPromoError('');
    setError('');
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', phone: '', password: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-neutral-900 dark:text-white transition-colors duration-300">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-100 dark:bg-[#262626] text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div>
            <div className="mb-6 border-b border-[#EAEAEA] dark:border-[#292929] pb-4">
              <div className="flex items-center gap-2 mb-2">
                <ApexLogo className="h-6" />
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200">
                  Secure Checkout
                </span>
              </div>
              <h2 className="font-heading font-black text-2xl">Complete Exam Voucher Order</h2>
              <p className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-medium">
                Voucher appears in your dashboard and email instantly after payment.
              </p>
            </div>

            <div className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-4 rounded-2xl border border-[#FF005C]/20 mb-5 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF005C] tracking-wider block">Selected Voucher</span>
                <h4 className="font-heading font-extrabold text-base leading-snug">{checkoutProduct.name}</h4>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  Instant Delivery • Valid {checkoutProduct.validityMonths || 6} months
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-neutral-400 line-through block">{formatPrice(checkoutProduct.originalPrice)}</span>
                <span className="font-heading font-black text-2xl text-[#FF005C] block leading-none">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="mb-5 rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-4">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setRegisterMode(false)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black border ${!registerMode ? 'bg-[#FF005C] text-white border-[#FF005C]' : 'bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-600 dark:text-neutral-300 border-[#EAEAEA] dark:border-[#292929]'}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setRegisterMode(true)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-black border ${registerMode ? 'bg-[#FF005C] text-white border-[#FF005C]' : 'bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-600 dark:text-neutral-300 border-[#EAEAEA] dark:border-[#292929]'}`}
                  >
                    Create Account
                  </button>
                </div>
                <form onSubmit={handleAuth} className="space-y-3">
                  {registerMode ? (
                    <>
                      <MiniField label="Full name" value={registerForm.name} onChange={(v) => setRegisterForm({ ...registerForm, name: v })} required />
                      <MiniField label="Email" type="email" value={registerForm.email} onChange={(v) => setRegisterForm({ ...registerForm, email: v })} required />
                      <MiniField label="Phone / WhatsApp" value={registerForm.phone} onChange={(v) => setRegisterForm({ ...registerForm, phone: v })} />
                      <MiniField label="Password (min 6)" type="password" value={registerForm.password} onChange={(v) => setRegisterForm({ ...registerForm, password: v })} required />
                    </>
                  ) : (
                    <>
                      <MiniField label="Email" type="email" value={loginForm.email} onChange={(v) => setLoginForm({ ...loginForm, email: v })} required />
                      <MiniField label="Password" type="password" value={loginForm.password} onChange={(v) => setLoginForm({ ...loginForm, password: v })} required />
                    </>
                  )}
                  {authError && (
                    <div className="text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-3 py-2">{authError}</div>
                  )}
                  <button disabled={authLoading} className="w-full px-4 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black text-xs flex items-center justify-center gap-2 disabled:opacity-60">
                    <LogIn className="w-4 h-4" />
                    {authLoading ? 'Please wait…' : registerMode ? 'Create account & continue' : 'Log in & continue'}
                  </button>
                </form>
              </div>
            )}

            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <MiniLabel>Full Candidate Name *</MiniLabel>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-sm font-semibold focus:outline-none focus:border-[#FF005C] transition-all"
                  />
                </div>
                <div>
                  <MiniLabel>Email Address *</MiniLabel>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-sm font-semibold focus:outline-none focus:border-[#FF005C] transition-all"
                  />
                </div>
                <div>
                  <MiniLabel>WhatsApp Number *</MiniLabel>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-sm font-semibold focus:outline-none focus:border-[#FF005C] transition-all"
                  />
                </div>
              </div>

              <div className="pt-1">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. APEX100)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-xs font-bold focus:outline-none focus:border-[#FF005C]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold hover:bg-[#FF005C] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Promo applied — {fmt(promoDiscount)} saved!
                  </p>
                )}
                {promoError && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {promoError}
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <MiniLabel>Payment Method</MiniLabel>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${paymentMethod === 'upi' ? 'border-[#FF005C] bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C]' : 'border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-700 dark:text-neutral-300'}`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI / GPay / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-[#FF005C] bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C]' : 'border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-700 dark:text-neutral-300'}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / NetBanking</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-[#FF005C]/20 p-4 space-y-2 mt-3 text-sm font-bold">
                <Row label="Subtotal (MRP)" value={formatPrice(checkoutProduct.originalPrice)} line />
                <Row label="Product discount" value={`− ${formatPrice(checkoutProduct.originalPrice - subtotal)}`} good />
                {promoApplied && <Row label="Promo code" value={`− ${fmt(promoDiscount)}`} good />}
                <div className="h-px bg-[#FF005C]/20 my-1" />
                <Row label="Total Payable" value={formatPrice(finalPrice)} big />
              </div>

              {error && (
                <div className="text-xs font-bold text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button type="submit" disabled={isProcessing} className="w-full btn-pink !py-4 !rounded-xl !text-base font-black flex items-center justify-center gap-2 shadow-xl disabled:opacity-60">
                  {isProcessing ? (
                    <span>Processing Payment & Assigning Voucher…</span>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay {formatPrice(finalPrice)} & Get Code Instantly</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] font-bold text-neutral-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit Encrypted SSL Gateway • 100% Genuine Official Vouchers</span>
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF005C] block mb-1">
                ORDER # {completedOrder?.orderNo || 'SUCCESSFUL'}
              </span>
              <h2 className="font-heading font-black text-3xl">Voucher Code Issued!</h2>
              <p className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-medium mt-1">
                Your voucher is now in your account dashboard and email.
              </p>
            </div>

            {completedVouchers?.length > 0 ? (
              <div className="space-y-3">
                {completedVouchers.map((v, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border-2 border-dashed border-[#FF005C]/40 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-[#FF005C] uppercase tracking-wider">{v.productName || 'Your Voucher Code'}</span>
                      <span className="text-[10px] font-black text-neutral-500 dark:text-[#B5B5B5]">
                        Exp {new Date(v.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-mono font-black text-2xl sm:text-3xl tracking-wider select-all break-all">
                      {v.code}
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleCopy(i, v.code)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#161616] text-[#FF005C] font-black text-xs border border-[#FF005C]/40 shadow-sm hover:bg-[#FF005C] hover:text-white transition-all"
                      >
                        {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedIdx === i ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                      <a href="https://pearsonpte.com" target="_blank" rel="noreferrer" className="text-[11px] font-black text-[#6C3CE0] inline-flex items-center gap-1">
                        Redeem on Pearson <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs font-bold text-amber-700 dark:text-amber-300">
                Voucher codes are available in your Account dashboard → My Vouchers.
              </div>
            )}

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  handleClose();
                  setActiveTab('dashboard');
                  window.location.hash = '#/account';
                }}
                className="w-full btn-pink !py-3.5 !rounded-xl !text-sm font-extrabold"
              >
                Open My Voucher Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function MiniLabel({ children }) {
  return (
    <span className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
      {children}
    </span>
  );
}

function MiniField({ label, type = 'text', value, onChange, required = false, placeholder }) {
  return (
    <label className="block">
      <MiniLabel>{label}</MiniLabel>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-sm font-semibold focus:outline-none focus:border-[#FF005C] transition-all"
      />
    </label>
  );
}

function Row({ label, value, line = false, good = false, big = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${line ? 'line-through text-neutral-400' : good ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-600 dark:text-neutral-300'} ${big ? 'uppercase tracking-wider text-black dark:text-white' : ''}`}>
        {label}
      </span>
      <span className={big ? 'font-heading font-black text-2xl' : ''}>{value}</span>
    </div>
  );
}

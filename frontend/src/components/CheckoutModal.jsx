import React, { useState, useEffect, useRef } from 'react';
import { useVoucher } from '../context/VoucherContext';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Lock, CheckCircle2, QrCode, CreditCard, Sparkles, ArrowRight, Copy, Check, AlertCircle, ExternalLink, LogIn } from 'lucide-react';
import { ApexLogo } from './ApexLogo';
import { orderApi, accountApi, paymentApi, formatPrice as fmt } from '../lib/api';

const RAZORPAY_SDK_URL = 'https://checkout.razorpay.com/v1/checkout.js';

const loadRazorpaySdk = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(window.Razorpay);
    const existing = document.querySelector(`script[src="${RAZORPAY_SDK_URL}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.Razorpay || null));
      existing.addEventListener('error', () => resolve(null));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SDK_URL;
    script.async = true;
    script.onload = () => resolve(window.Razorpay || null);
    script.onerror = () => resolve(null);
    document.body.appendChild(script);
  });

export const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, checkoutProduct, formatPrice, handlePurchaseSuccess, clearCart, setActiveTab } = useVoucher();
  const { isAuthenticated, user, login, register } = useAuth();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingState, setProcessingState] = useState('idle');
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

  // True once the Razorpay handler has fired — stops the (sometimes late)
  // modal `ondismiss` from overwriting a success/verifying state.
  const paymentHandledRef = useRef(false);

  const checkoutItems = React.useMemo(() => {
    if (!checkoutProduct) return [];
    if (Array.isArray(checkoutProduct)) return checkoutProduct;
    if (checkoutProduct.items && Array.isArray(checkoutProduct.items)) return checkoutProduct.items;
    return [{ ...checkoutProduct, quantity: checkoutProduct.quantity || 1 }];
  }, [checkoutProduct]);

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

  if (!isCheckoutOpen || checkoutItems.length === 0) return null;

  const subtotal = checkoutItems.reduce(
    (s, it) => s + (Number(it.discountedPrice != null ? it.discountedPrice : (it.sellingPrice || 0)) * (it.quantity || 1)),
    0
  );
  const totalOriginal = checkoutItems.reduce(
    (s, it) => s + (Number(it.originalPrice || 0) * (it.quantity || 1)),
    0
  );
  const totalSavings = Math.max(0, totalOriginal - subtotal);
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
      productIds: checkoutItems.map((it) => it._id || it.id),
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

  // Handle the verified-payment result coming back from our own server.
  // NOTE: the browser NEVER decides that a payment succeeded — the backend does,
  // after verifying the Razorpay signature and re-checking the payment with the
  // gateway. We only render what the server tells us.
  const applyVerifiedResult = (verifyRes, order) => {
    setIsProcessing(false);
    setProcessingState('idle');

    if (verifyRes?.success && verifyRes.paymentStatus === 'PAID' && !verifyRes.needsAllocation) {
      setIsCompleted(true);
      setCompletedOrder(verifyRes.data || order || null);
      setCompletedVouchers(verifyRes.vouchers || []);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      clearCart();
      handlePurchaseSuccess({ orderId: order?.orderNo });
      return;
    }
    if (verifyRes?.needsAllocation) {
      setIsCompleted(true);
      setCompletedOrder(verifyRes.data || order || null);
      setCompletedVouchers([]);
      clearCart();
      handlePurchaseSuccess({ orderId: order?.orderNo });
      return;
    }
    if (verifyRes?.paymentStatus === 'PENDING') {
      setError(verifyRes.message || 'Payment is being finalized. Please check your Candidate Vault in a minute.');
      return;
    }
    setError(verifyRes?.message || 'We could not verify your payment. If money was deducted it will be auto-refunded.');
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isProcessing) return;
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
    setProcessingState('creating');
    paymentHandledRef.current = false;

    const orderPayload = {
      items: checkoutItems.map((it) => ({
        productId: it._id || it.id,
        quantity: it.quantity || 1,
      })),
      promoCode: promoApplied ? promoCode.trim().toUpperCase() : null,
      paymentMethod,
      billing: { ...formData, email: formData.email || user?.email },
    };

    // 1. Server creates the internal order (PENDING) + a Razorpay order for the
    //    exact server-calculated amount. Frontend totals are never trusted.
    let createRes;
    try {
      createRes = await paymentApi.createOrder(orderPayload);
    } catch (err) {
      setIsProcessing(false);
      setProcessingState('idle');
      setError(err?.message || 'Could not start checkout. Please try again.');
      return;
    }
    if (!createRes?.success || !createRes.razorpayOrderId || !createRes.keyId) {
      setIsProcessing(false);
      setProcessingState('idle');
      setError(createRes?.message || 'Online payment is temporarily unavailable. Please try again later.');
      return;
    }

    const { orderId, orderNo, amount, currency, razorpayOrderId, keyId, prefill } = createRes;
    const orderRef = { orderNo, _id: orderId };

    // 2. Load the Razorpay Checkout SDK.
    setProcessingState('opening');
    const Razorpay = await loadRazorpaySdk();
    if (!Razorpay) {
      setIsProcessing(false);
      setProcessingState('idle');
      setError('Could not load the secure payment window. Check your connection and try again — your order is saved.');
      return;
    }

    // 3. Open Razorpay Checkout. Success/failure is decided by our server in step 4.
    const rzp = new Razorpay({
      key: keyId,
      order_id: razorpayOrderId,
      amount,
      currency: currency || 'INR',
      name: 'Apex Vouchers',
      description: `Order ${orderNo}`,
      prefill: {
        name: prefill?.name || formData.name || '',
        email: prefill?.email || formData.email || user?.email || '',
        contact: prefill?.contact || formData.phone || '',
      },
      theme: { color: '#FF005C' },
      modal: {
        escape: true,
        ondismiss: () => {
          if (paymentHandledRef.current) return; // payment already captured — ignore late dismiss
          setIsProcessing(false);
          setProcessingState('idle');
          setError('Payment was cancelled. Your order is saved — you can retry any time. No voucher has been issued.');
        },
      },
      handler: async (resp) => {
        paymentHandledRef.current = true;
        setProcessingState('verifying');
        try {
          const verifyRes = await paymentApi.verify({
            orderId,
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          });
          applyVerifiedResult(verifyRes, orderRef);
        } catch (err) {
          setIsProcessing(false);
          setProcessingState('idle');
          setError(
            err?.message ||
              'Payment received but verification failed on our side. Your Candidate Vault will update automatically once confirmed.'
          );
        }
      },
    });

    rzp.on('payment.failed', (resp) => {
      setIsProcessing(false);
      setProcessingState('idle');
      const reason = resp?.error?.description || 'Your payment could not be completed.';
      setError(`${reason} No voucher has been issued — you can retry.`);
    });

    rzp.open();
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
    setIsProcessing(false);
    setProcessingState('idle');
    paymentHandledRef.current = false;
    setLoginForm({ email: '', password: '' });
    setRegisterForm({ name: '', email: '', phone: '', password: '' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-surface border border-line rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[92vh] text-ink transition-colors duration-300">
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-surface-raised text-ink-muted hover:text-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!isCompleted ? (
          <div>
            <div className="mb-6 border-b border-line pb-4">
              <div className="flex items-center gap-2 mb-2">
                <ApexLogo className="h-6" />
                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/80 text-success border border-emerald-200">
                  Secure Checkout
                </span>
              </div>
              <h2 className="font-heading font-medium text-2xl">Complete Exam Voucher Order</h2>
              <p className="text-xs text-ink-muted font-normal">
                Vouchers appear in your Candidate Vault and email instantly after payment.
              </p>
            </div>

            {checkoutItems.length === 1 ? (
              <div className="bg-accent/8 p-4 rounded-2xl border border-accent/20 mb-5 flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-normal text-accent tracking-wider block">
                    {checkoutItems[0].quantity > 1 ? `Selected Voucher (${checkoutItems[0].quantity}×)` : 'Selected Voucher'}
                  </span>
                  <h4 className="font-heading font-medium text-base leading-snug">{checkoutItems[0].name}</h4>
                  <span className="text-xs font-normal text-success block mt-0.5">
                    Instant Delivery • Valid {checkoutItems[0].validityMonths || 6} months
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-normal text-neutral-400 line-through block">{formatPrice(totalOriginal)}</span>
                  <span className="font-heading font-medium text-2xl text-accent block leading-none">{formatPrice(finalPrice)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-accent/8 p-4 rounded-2xl border border-accent/20 mb-5 space-y-3">
                <div className="flex items-center justify-between border-b border-accent/20 pb-2">
                  <span className="text-[10px] uppercase font-normal text-accent tracking-wider block">
                    Order Summary ({checkoutItems.reduce((acc, it) => acc + (it.quantity || 1), 0)} Vouchers)
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-normal text-neutral-400 line-through mr-2">{formatPrice(totalOriginal)}</span>
                    <span className="font-heading font-medium text-xl text-accent">{formatPrice(finalPrice)}</span>
                  </div>
                </div>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {checkoutItems.map((item, idx) => (
                    <div key={item.id || item._id || idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-accent">{item.quantity || 1}×</span>
                        <span className="font-normal text-ink line-clamp-1">{item.name}</span>
                      </div>
                      <span className="font-medium text-neutral-900 dark:text-white shrink-0">
                        {formatPrice((item.discountedPrice != null ? item.discountedPrice : (item.sellingPrice || 0)) * (item.quantity || 1))}
                      </span>
                    </div>
                  ))}
                </div>
                {totalSavings > 0 && (
                  <div className="text-[11px] font-normal text-success flex items-center gap-1 pt-1 border-t border-accent/10">
                    <span>🎁 Total Savings: {formatPrice(totalSavings + promoDiscount)}</span>
                  </div>
                )}
              </div>
            )}

            {!isAuthenticated && (
              <div className="mb-5 rounded-2xl border border-line p-4">
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setRegisterMode(false)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-medium border ${!registerMode ? 'bg-accent text-white border-accent' : 'bg-surface-raised text-ink-muted border-line'}`}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => setRegisterMode(true)}
                    className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-medium border ${registerMode ? 'bg-accent text-white border-accent' : 'bg-surface-raised text-ink-muted border-line'}`}
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
                    <div className="text-xs font-normal text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-3 py-2">{authError}</div>
                  )}
                  <button disabled={authLoading} className="w-full px-4 py-3 rounded-xl bg-ink text-surface font-medium text-xs flex items-center justify-center gap-2 disabled:opacity-60">
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
                    className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-line text-sm font-normal focus:outline-none focus:border-accent transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-line text-sm font-normal focus:outline-none focus:border-accent transition-all"
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
                    className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-line text-sm font-normal focus:outline-none focus:border-accent transition-all"
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
                    className="flex-1 px-4 py-2.5 rounded-xl bg-surface-raised border border-line text-xs font-normal focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2.5 rounded-xl bg-ink text-surface text-xs font-medium hover:bg-accent transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <p className="text-xs font-normal text-success mt-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Promo applied — {fmt(promoDiscount)} saved!
                  </p>
                )}
                {promoError && (
                  <p className="text-xs font-normal text-amber-700 dark:text-amber-400 mt-1.5 flex items-center gap-1.5">
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
                    className={`p-3 rounded-xl border font-normal text-xs flex items-center justify-center gap-2 transition-all ${paymentMethod === 'upi' ? 'border-accent bg-accent/8 text-accent' : 'border-line bg-surface-raised text-ink-muted'}`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI / GPay / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border font-normal text-xs flex items-center justify-center gap-2 transition-all ${paymentMethod === 'card' ? 'border-accent bg-accent/8 text-accent' : 'border-line bg-surface-raised text-ink-muted'}`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / NetBanking</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-accent/8 border border-accent/20 p-4 space-y-2 mt-3 text-sm font-normal">
                <Row label="Subtotal (MRP)" value={formatPrice(checkoutProduct.originalPrice)} line />
                <Row label="Product discount" value={`− ${formatPrice(checkoutProduct.originalPrice - subtotal)}`} good />
                {promoApplied && <Row label="Promo code" value={`− ${fmt(promoDiscount)}`} good />}
                <div className="h-px bg-accent/20 my-1" />
                <Row label="Total Payable" value={formatPrice(finalPrice)} big />
              </div>

              {error && (
                <div className="text-xs font-normal text-rose-700 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-xl px-4 py-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
              )}

              <div className="pt-2 space-y-2">
                <button type="submit" disabled={isProcessing} className="w-full bg-accent hover:bg-accent-hover text-white py-4 rounded-xl text-base font-medium flex items-center justify-center gap-2 shadow-lg transition-colors disabled:opacity-60 cursor-pointer">
                  {isProcessing ? (
                    <span>
                      {processingState === 'creating' && 'Creating Secure Payment…'}
                      {processingState === 'opening' && 'Opening Secure Checkout…'}
                      {processingState === 'verifying' && 'Verifying Payment & Issuing Voucher…'}
                      {processingState === 'idle' && 'Processing Payment…'}
                    </span>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay {formatPrice(finalPrice)} & Get Code Instantly</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] font-normal text-neutral-400 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit Encrypted SSL Gateway • 100% Genuine Official Vouchers</span>
                </p>
              </div>
            </form>
          </div>
        ) : (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-success flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-widest text-accent block mb-1">
                ORDER # {completedOrder?.orderNo || 'SUCCESSFUL'}
              </span>
              <h2 className="font-heading font-medium text-3xl">Voucher Code Issued!</h2>
              <p className="text-xs text-ink-muted font-normal mt-1">
                Your voucher is now in your Apex account dashboard and email.
              </p>
              <div className="mt-3 text-xs font-normal text-success bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 rounded-xl py-2 px-3 inline-block">
                📧 Confirmation email sent to <span className="underline">{formData.email || user?.email}</span>
              </div>
            </div>

            {completedVouchers?.length > 0 ? (
              <div className="space-y-3">
                {completedVouchers.map((v, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-accent/8 border-2 border-dashed border-accent/40 text-left space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-medium text-accent uppercase tracking-wider">{v.productName || 'Your Voucher Code'}</span>
                      <span className="text-[10px] font-medium text-ink-muted">
                        Exp {new Date(v.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="font-mono font-medium text-2xl sm:text-3xl tracking-wider select-all break-all">
                      {v.code}
                    </div>
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleCopy(i, v.code)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface text-accent font-medium text-xs border border-accent/40 shadow-sm hover:bg-accent hover:text-white transition-all"
                      >
                        {copiedIdx === i ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedIdx === i ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                      <a href="https://pearsonpte.com" target="_blank" rel="noreferrer" className="text-[11px] font-medium text-accent inline-flex items-center gap-1">
                        Redeem on Pearson <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs font-normal text-amber-700 dark:text-amber-300">
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
                className="w-full bg-accent hover:bg-accent-hover text-white py-3.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
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
    <span className="block text-xs font-normal text-ink-muted uppercase tracking-wider mb-1.5">
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
        className="w-full px-4 py-3 rounded-xl bg-surface-raised border border-line text-sm font-normal focus:outline-none focus:border-accent transition-all"
      />
    </label>
  );
}

function Row({ label, value, line = false, good = false, big = false }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`${line ? 'line-through text-neutral-400' : good ? 'text-success' : 'text-ink-muted'} ${big ? 'uppercase tracking-wider text-black dark:text-white' : ''}`}>
        {label}
      </span>
      <span className={big ? 'font-heading font-medium text-2xl' : ''}>{value}</span>
    </div>
  );
}

import React, { useState } from 'react';
import { useVoucher } from '../context/VoucherContext';
import confetti from 'canvas-confetti';
import { X, ShieldCheck, Lock, CheckCircle2, QrCode, CreditCard, Sparkles, ArrowRight, Copy, Check, Download, AlertCircle } from 'lucide-react';
import { ApexLogo } from './ApexLogo';

export const CheckoutModal = () => {
  const { isCheckoutOpen, setIsCheckoutOpen, checkoutProduct, formatPrice, handlePurchaseSuccess, setActiveTab } = useVoucher();
  
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedVoucher, setCompletedVoucher] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  if (!isCheckoutOpen || !checkoutProduct) return null;

  const finalPrice = Math.max(0, checkoutProduct.discountedPrice - promoDiscount);

  const handleApplyPromo = () => {
    if (promoCode.toUpperCase() === 'APEX100' || promoCode.toUpperCase() === 'FIRSTEXAM') {
      setPromoApplied(true);
      setPromoDiscount(100);
    } else {
      alert('Invalid promo code. Try APEX100 for ₹100 extra off!');
    }
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || (!formData.email && !formData.phone)) {
      alert('Please fill in your name and email/WhatsApp number for voucher code delivery.');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      const generatedCode = `APEX-${checkoutProduct.brand.substring(0,3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
      
      const newVoucher = {
        code: generatedCode,
        productName: checkoutProduct.name,
        paidPrice: finalPrice,
        customer: formData
      };
      setCompletedVoucher(newVoucher);

      handlePurchaseSuccess(checkoutProduct, formData);
    }, 2000);
  };

  const handleCopy = () => {
    if (completedVoucher?.code) {
      navigator.clipboard.writeText(completedVoucher.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 3000);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setIsCompleted(false);
    setCompletedVoucher(null);
    setPromoApplied(false);
    setPromoDiscount(0);
    setPromoCode('');
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
                  Instant Code Dispatch
                </span>
              </div>
              <h2 className="font-heading font-black text-2xl text-neutral-900 dark:text-white">
                Complete Exam Voucher Order
              </h2>
              <p className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-medium">
                Voucher code will be delivered instantly to your email & WhatsApp in 10s.
              </p>
            </div>

            {/* Selected Product Summary Box */}
            <div className="bg-[#FFF0F5] dark:bg-[#2A0A17] p-4 rounded-2xl border border-[#FF005C]/20 mb-6 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#FF005C] tracking-wider block">Target Voucher</span>
                <h4 className="font-heading font-extrabold text-base text-neutral-900 dark:text-white leading-snug">{checkoutProduct.name}</h4>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mt-0.5">Instant 10s Delivery • Valid 6-12 Months</span>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-neutral-400 line-through block">{formatPrice(checkoutProduct.originalPrice)}</span>
                <span className="font-heading font-black text-2xl text-[#FF005C] block leading-none">{formatPrice(finalPrice)}</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePaymentSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                  Full Candidate Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-[#FF005C] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-[#FF005C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider mb-1.5">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-neutral-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-[#FF005C] transition-all"
                  />
                </div>
              </div>

              {/* Promo Code Entry */}
              <div className="pt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. APEX100)"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-[#0A0A0A] border border-[#EAEAEA] dark:border-[#292929] text-neutral-900 dark:text-white text-xs font-bold focus:outline-none focus:border-[#FF005C]"
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
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">✓ Promo APEX100 applied: ₹100 Extra Discount!</p>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="pt-2 space-y-2">
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Payment Gateway Option
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#FF005C] bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C]'
                        : 'border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>UPI / GPay / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#FF005C] bg-[#FFF0F5] dark:bg-[#2A0A17] text-[#FF005C]'
                        : 'border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#0A0A0A] text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Card / NetBanking</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 space-y-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-pink !py-4 !rounded-xl !text-base font-black flex items-center justify-center gap-2 shadow-xl"
                >
                  {isProcessing ? (
                    <span>Processing Payment & Issuing Code...</span>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pay {formatPrice(finalPrice)} & Get Code Instantly</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] font-bold text-neutral-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>256-bit Encrypted SSL Gateway • 100% Guaranteed Official Code</span>
                </p>
              </div>
            </form>
          </div>
        ) : (
          /* Order Confirmation Screen */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF005C] block mb-1">
                ORDER SUCCESSFUL
              </span>
              <h2 className="font-heading font-black text-3xl text-neutral-900 dark:text-white">
                Voucher Code Issued!
              </h2>
              <p className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-medium mt-1">
                Your official voucher has been emailed to <strong className="text-neutral-900 dark:text-white">{completedVoucher?.customer?.email}</strong> and WhatsApp.
              </p>
            </div>

            {/* Generated Code Box */}
            <div className="p-6 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border-2 border-dashed border-[#FF005C]/40 space-y-3">
              <span className="text-xs font-black text-[#FF005C] uppercase tracking-wider block">Your Official Voucher Code</span>
              <div className="font-heading font-black text-3xl tracking-widest text-neutral-900 dark:text-white select-all">
                {completedVoucher?.code}
              </div>

              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#161616] text-[#FF005C] font-black text-xs border border-[#FF005C]/40 shadow-sm hover:bg-[#FF005C] hover:text-white transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Code'}</span>
              </button>
            </div>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  handleClose();
                  setActiveTab('dashboard');
                }}
                className="w-full btn-pink !py-3.5 !rounded-xl !text-sm font-extrabold"
              >
                Go to User Dashboard & Redeem Guide
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

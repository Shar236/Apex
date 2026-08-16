import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { paymentApi, formatPrice } from '../lib/api';
import { ApexLogo } from './ApexLogo';
import { CheckCircle2, AlertCircle, ArrowRight, Ticket, ShieldCheck, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentReturnPage = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('orderId') || '';
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [statusData, setStatusData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      setError('No Order ID found in return URL.');
      return;
    }

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await paymentApi.getCashfreeStatus(orderId, true);
        if (!isMounted) return;
        setLoading(false);
        if (res.success) {
          setStatusData(res);
          if (res.paymentStatus === 'PAID' || res.orderStatus === 'FULFILLED') {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
        } else {
          setError(res.message || 'Payment status verification failed.');
        }
      } catch (err) {
        if (!isMounted) return;
        setLoading(false);
        setError('Network error checking payment status.');
      }
    };

    checkStatus();
    return () => { isMounted = false; };
  }, [orderId]);

  const isPaid = statusData?.paymentStatus === 'PAID' || statusData?.orderStatus === 'FULFILLED' || statusData?.data?.paymentStatus === 'PAID';
  const order = statusData?.data;
  const vouchers = statusData?.vouchers || [];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] rounded-3xl p-7 shadow-2xl text-center space-y-6">
        <div className="flex justify-center">
          <ApexLogo className="h-8" />
        </div>

        {loading ? (
          <div className="py-12 space-y-4">
            <RefreshCw className="w-10 h-10 text-[#FF005C] animate-spin mx-auto" />
            <h2 className="font-heading font-black text-xl">Verifying Payment with Cashfree…</h2>
            <p className="text-xs text-neutral-500 font-medium">Please wait while we confirm your payment status and issue your exam voucher.</p>
          </div>
        ) : error || !isPaid ? (
          <div className="py-6 space-y-5">
            <div className="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 flex items-center justify-center mx-auto shadow-md">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-rose-600 block mb-1">
                PAYMENT PENDING / FAILED
              </span>
              <h2 className="font-heading font-black text-2xl">Payment Status Update</h2>
              <p className="text-xs text-neutral-500 font-medium mt-1.5 max-w-sm mx-auto">
                {error || 'Your payment was not completed. If money was deducted, your order will be automatically updated.'}
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Link to="/account" className="flex-1 py-3.5 rounded-2xl bg-neutral-100 dark:bg-[#262626] font-black text-xs">
                Check Candidate Vault
              </Link>
              <Link to="/" className="flex-1 py-3.5 rounded-2xl btn-pink text-white font-black text-xs">
                Try Again
              </Link>
            </div>
          </div>
        ) : (
          <div className="py-4 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#FF005C] block mb-1">
                ORDER # {order?.orderNo || orderId}
              </span>
              <h2 className="font-heading font-black text-3xl">Payment Confirmed!</h2>
              <p className="text-xs text-neutral-500 dark:text-[#B5B5B5] font-medium mt-1">
                Your exam voucher code has been issued and sent to your email.
              </p>
            </div>

            {vouchers.length > 0 ? (
              <div className="space-y-3 text-left">
                {vouchers.map((v, i) => (
                  <div key={i} className="p-5 rounded-2xl bg-[#FFF0F5] dark:bg-[#2A0A17] border-2 border-dashed border-[#FF005C]/40 space-y-2">
                    <div className="flex justify-between items-center text-xs font-black text-[#FF005C]">
                      <span>{v.productName || 'Voucher Code'}</span>
                      <span>Exp: {new Date(v.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="font-mono font-black text-2xl tracking-wider select-all break-all text-neutral-900 dark:text-white">
                      {v.code}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Your voucher codes are ready in your Candidate Vault.
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => navigate('/account')}
                className="w-full py-4 rounded-2xl btn-pink text-white font-black text-sm shadow-xl flex items-center justify-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                <span>Go to Candidate Vault</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReturnPage;

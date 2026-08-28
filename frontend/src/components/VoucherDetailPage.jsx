import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ShoppingCart,
  Zap,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Clock,
  ChevronDown,
  MessageCircle,
  Mail,
  ImageOff,
  X,
  Headphones,
  Lock,
} from 'lucide-react';
import { useVoucher, adaptProduct } from '../context/VoucherContext';
import { productApi, applyPageMetadata, setStructuredData } from '../lib/api';
import { getRedemptionGuide, getRedemptionSteps } from '../lib/redemptionGuides';
import { BrandLogoContainer } from './OfficialBrandLogos';
import { imageUrl } from '../lib/imageUrl.js';

/* ───────────────────────────── Screenshot / Lightbox ───────────────────────────── */

const GuideScreenshot = ({ image, alt, caption, onOpen }) => {
  if (!image) {
    return (
      <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#111111] flex flex-col items-center justify-center gap-2 text-center px-4">
        <ImageOff className="w-6 h-6 text-neutral-300 dark:text-neutral-600" />
        <span className="text-[11px] font-bold text-neutral-400 dark:text-neutral-600">Screenshot coming soon</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen({ image, alt, caption })}
      className="w-full aspect-video rounded-2xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden bg-neutral-50 dark:bg-[#111111] cursor-zoom-in group relative"
    >
      <img src={imageUrl(image, { width: 900 })} alt={alt} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
    </button>
  );
};

const Lightbox = ({ item, onClose }) => {
  useEffect(() => {
    if (!item) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [item, onClose]);

  if (!item) return null;
  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-5 right-5 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
      >
        <X className="w-6 h-6" />
      </button>
      <div className="max-w-3xl w-full space-y-3" onClick={(e) => e.stopPropagation()}>
        <img src={imageUrl(item.image, { width: 1600 })} alt={item.alt} className="w-full max-h-[80vh] object-contain rounded-2xl" />
        {item.caption && <p className="text-center text-sm font-bold text-white/80">{item.caption}</p>}
      </div>
    </div>
  );
};

/* ───────────────────────────── Small building blocks ───────────────────────────── */

const SectionHeading = ({ eyebrow, title, subtitle }) => (
  <div className="text-center max-w-2xl mx-auto mb-10 space-y-2.5">
    {eyebrow && (
      <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest text-brand-pink bg-[#FFF0F5] dark:bg-[#2A0A17] px-3.5 py-1.5 rounded-full border border-brand-pink/20">
        {eyebrow}
      </span>
    )}
    <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
      {title}
    </h2>
    {subtitle && <p className="text-neutral-500 dark:text-[#B5B5B5] font-medium text-sm sm:text-base">{subtitle}</p>}
  </div>
);

const OfficialWebsiteButton = ({ url, providerLabel }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-black text-sm shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
    >
      <span>Visit Official {providerLabel} Website</span>
      <ExternalLink className="w-4 h-4" />
    </a>
  );
};

/* ───────────────────────────── Page ───────────────────────────── */

export const VoucherDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { formatPrice, startCheckout, addToCart, setActiveTab, globalSEO, footerSettings } = useVoucher();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [lightboxItem, setLightboxItem] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    window.scrollTo({ top: 0, behavior: 'auto' });

    productApi.get(slug).then((res) => {
      if (cancelled) return;
      if (res.success && res.data) {
        const adapted = adaptProduct(res.data);
        setProduct(adapted);
        setRelated(Array.isArray(res.relatedProducts) ? res.relatedProducts.map(adaptProduct) : []);

        const base = (globalSEO?.websiteUrl || 'https://apexvouchers.com').replace(/\/$/, '');
        const canonical = `${base}/exam-vouchers/${adapted.slug || slug}`;
        const title = adapted.seo?.title || adapted.seoTitle || `${adapted.name} Voucher | ${globalSEO?.websiteName || 'Apex Vouchers'}`;
        const description = adapted.seo?.description || adapted.seoDescription || adapted.shortDescription || adapted.description || `Buy the official ${adapted.name} voucher at a discounted price with instant delivery from Apex Vouchers.`;
        applyPageMetadata({
          title,
          description,
          canonical,
          ogTitle: adapted.seo?.ogTitle || title,
          ogDescription: adapted.seo?.ogDescription || description,
          ogImage: adapted.seo?.ogImage || adapted.image || adapted.logo || globalSEO?.defaultOgImage,
          ogUrl: canonical,
          ogType: 'product',
          twitterTitle: adapted.seo?.twitterTitle || title,
          twitterDescription: adapted.seo?.twitterDescription || description,
          twitterImage: adapted.seo?.twitterImage || adapted.seo?.ogImage || adapted.image || adapted.logo,
          noindex: !!adapted.seo?.noindex,
          nofollow: !!adapted.seo?.nofollow,
        });
        if (res.structuredData?.product) setStructuredData('product', res.structuredData.product);
        if (res.structuredData?.breadcrumb) setStructuredData('breadcrumb', res.structuredData.breadcrumb);
      } else {
        setNotFound(true);
      }
    }).catch(() => {
      if (!cancelled) setNotFound(true);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      setStructuredData('product', null);
      setStructuredData('breadcrumb', null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const goBackToVouchers = useCallback(() => {
    navigate('/');
    setActiveTab('shop');
  }, [navigate, setActiveTab]);

  const supportWhatsAppLink = (() => {
    const digits = String(footerSettings?.phone || '+91 9855926113').replace(/[^\d]/g, '');
    const msg = encodeURIComponent(`Hi Apex Vouchers team! I need help redeeming my ${product?.name || 'exam'} voucher.`);
    return `https://wa.me/${digits}?text=${msg}`;
  })();
  const supportEmail = footerSettings?.email || 'apexvouchers@gmail.com';

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <div className="animate-pulse text-sm font-bold text-neutral-500 dark:text-neutral-400">Loading voucher guide…</div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-white dark:bg-[#0A0A0A] text-center px-4">
        <p className="font-heading text-2xl font-black text-neutral-900 dark:text-white">Voucher not found</p>
        <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] max-w-sm">This voucher may have been removed or is no longer available.</p>
        <button onClick={goBackToVouchers} className="btn-pink py-3! px-6! text-sm!">
          Browse All Exam Vouchers
        </button>
      </div>
    );
  }

  const isOutOfStock = product.inStock === false;
  const isComingSoon = product.comingSoon || product.stockStatus === 'COMING SOON';
  const inclusions = Array.isArray(product.inclusions) && product.inclusions.length > 0
    ? product.inclusions
    : ['Genuine Digital Voucher', 'Fast Delivery to Email', 'Clear Redemption Instructions', 'Official Provider Redemption', 'Customer Support', 'Transparent Pricing'];

  const redemptionGuide = getRedemptionGuide(product);
  const redemptionSteps = getRedemptionSteps(product);

  const faqs = Array.isArray(product.faqs) && product.faqs.length > 0
    ? product.faqs
    : [
        {
          question: 'How will I receive my voucher?',
          answer: `Your voucher will be delivered to your registered email${product.deliveryType ? ` (${product.deliveryType})` : ''} shortly after your payment is confirmed.`,
        },
        {
          question: 'Where do I redeem the voucher?',
          answer: redemptionGuide.officialUrl
            ? `You redeem it directly on the official ${redemptionGuide.providerLabel} website: ${redemptionGuide.officialUrl}`
            : `You redeem it directly on the official ${redemptionGuide.providerLabel} website.`,
        },
        {
          question: 'Can I use the voucher more than once?',
          answer: 'No — each Apex voucher code is valid for a single redemption only.',
        },
        {
          question: 'How long is the voucher valid?',
          answer: product.validityMonths
            ? `This voucher is valid for ${product.validityMonths} months from the date of purchase.`
            : 'Please check the validity period shown in the pricing section above.',
        },
        {
          question: 'Can I get a refund?',
          answer: 'Apex Vouchers offers a refund guarantee if your voucher code is unredeemed within 7 days of purchase. Contact support to request a refund.',
        },
        {
          question: "What should I do if my voucher doesn't work?",
          answer: 'Contact our support team via WhatsApp or email with your order ID and we will verify and resolve the issue promptly.',
        },
      ];

  const purchaseSteps = [
    {
      title: 'Choose Your Voucher',
      description: `Select the ${product.name} and click "Buy Now" from the voucher page.`,
    },
    {
      title: 'Review Your Order',
      description: 'Check the exam/product, quantity, price, discount, validity and delivery method before proceeding.',
    },
    {
      title: 'Complete Payment',
      description: 'Pay securely via UPI / GPay / QR or Card / NetBanking through our encrypted Cashfree checkout.',
    },
    {
      title: 'Receive Your Voucher',
      description: 'Your voucher will be delivered to your registered email after successful payment.',
    },
  ];

  return (
    <>
      <Lightbox item={lightboxItem} onClose={() => setLightboxItem(null)} />

      {/* Back link */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={goBackToVouchers}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-brand-pink dark:text-neutral-400 dark:hover:text-brand-pink transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Exam Vouchers
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#0B0F19] rounded-3xl border border-[#1E293B] shadow-2xl p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            <div className="md:col-span-4 flex justify-center">
              <div className="w-full max-w-55">
                {product.logo ? (
                  <div className="w-full aspect-square rounded-2xl bg-[#090D16] border border-[#1E293B] flex items-center justify-center p-6">
                    <img src={imageUrl(product.logo, { width: 440 })} alt={`${product.name} logo`} className="max-h-full max-w-full object-contain" />
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-2xl bg-[#090D16] border border-[#1E293B] flex items-center justify-center p-6">
                    <BrandLogoContainer brand={product.brand || product.provider} name={product.name} inverted={true} />
                  </div>
                )}
              </div>
            </div>

            <div className="md:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">{(product.provider || product.brand || '').toUpperCase()}</span>
                {isOutOfStock && !isComingSoon && (
                  <span className="px-2.5 py-1 rounded-full bg-[#E53E3E] text-white text-[10px] font-black uppercase">Out of Stock</span>
                )}
                {isComingSoon && (
                  <span className="px-2.5 py-1 rounded-full bg-slate-700 text-white text-[10px] font-black uppercase">Coming Soon</span>
                )}
              </div>

              <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {product.name} Voucher
              </h1>

              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                {product.shortDescription || product.description || 'Official genuine exam voucher with instant digital delivery from Apex Vouchers.'}
              </p>

              <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
                <span className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">{formatPrice(product.discountedPrice)}</span>
                {product.originalPrice > product.discountedPrice && (
                  <span className="text-base font-bold text-slate-500 line-through">{formatPrice(product.originalPrice)}</span>
                )}
                {product.discountPercent > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#2A0A17] text-brand-pink border border-brand-pink/30 text-xs font-black">{product.discountPercent}% OFF</span>
                )}
                {product.savings > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#052E16] text-[#10B981] border border-[#10B981]/30 text-xs font-black">SAVE {formatPrice(product.savings)}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-[#F59E0B]" />{product.deliveryType || 'Instant Delivery'}</span>
                {product.validityMonths ? <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#F59E0B]" />Valid {product.validityMonths} Months</span> : null}
                <span className={`flex items-center gap-1.5 ${isOutOfStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />{isComingSoon ? 'Coming Soon' : product.stockStatus || (isOutOfStock ? 'Out of Stock' : 'In Stock')}
                </span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />Genuine Voucher</span>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                {!isOutOfStock ? (
                  <button
                    onClick={() => startCheckout(product)}
                    className="inline-flex items-center gap-2 bg-brand-pink hover:bg-[#D9004C] text-white rounded-full py-3.5 px-7 text-sm font-black shadow-lg shadow-brand-pink/20 hover:scale-[1.02] transition-all cursor-pointer"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button disabled className="inline-flex items-center gap-2 bg-[#111625] text-slate-500 rounded-full py-3.5 px-7 text-sm font-black cursor-not-allowed border border-[#1E293B]">
                    <Clock className="w-4 h-4" />
                    <span>{isComingSoon ? 'Coming Soon' : 'Out of Stock'}</span>
                  </button>
                )}
                {!isOutOfStock && (
                  <button
                    onClick={() => addToCart(product)}
                    className="inline-flex items-center gap-2 bg-transparent hover:bg-[#161D2F] text-slate-300 hover:text-white rounded-full py-3.5 px-6 text-sm font-bold border border-[#1E293B] transition-colors cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-brand-pink" />
                    <span>Add to Cart</span>
                  </button>
                )}
              </div>

              {(product.officialWebsiteUrl || product.officialProductUrl) && (
                <a
                  href={product.officialWebsiteUrl || product.officialProductUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <span>Official Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-neutral-50 dark:bg-[#111111] border-y border-[#EAEAEA] dark:border-[#292929] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Simple 3-Step Process" title="How It Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Buy Your Voucher', desc: 'Purchase your voucher securely from Apex Vouchers.' },
              { n: '02', title: 'Receive Your Code', desc: `Your voucher is delivered to your registered email — ${(product.deliveryType || 'Instant Delivery').toLowerCase()}.` },
              { n: '03', title: 'Redeem on Official Website', desc: `Visit the official ${redemptionGuide.providerLabel} website and apply your code during checkout.` },
            ].map((step, i) => (
              <div key={i} className="bg-white dark:bg-[#161616] rounded-3xl border border-[#EAEAEA] dark:border-[#292929] p-6 space-y-3 shadow-sm">
                <span className="font-heading font-black text-4xl text-brand-pink/20">{step.n}</span>
                <h3 className="font-heading font-extrabold text-lg text-neutral-900 dark:text-white">{step.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Purchase from Apex ────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Buying Guide" title="How to Purchase from Apex Vouchers" subtitle="A simple, secure checkout — from selection to your inbox." />
          <div className="space-y-10">
            {purchaseSteps.map((step, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className={`space-y-2.5 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink font-black text-xs border border-brand-pink/20">{i + 1}</span>
                  <h3 className="font-heading font-extrabold text-lg text-neutral-900 dark:text-white">Step {i + 1} — {step.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] font-medium leading-relaxed">{step.description}</p>
                </div>
                <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <GuideScreenshot onOpen={setLightboxItem} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Redeem ────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-neutral-50 dark:bg-[#111111] border-y border-[#EAEAEA] dark:border-[#292929] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Redemption Guide" title={`How to Redeem Your ${product.name}`} />
          <div className="space-y-10">
            {redemptionSteps.map((step, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className={`space-y-2.5 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink font-black text-xs border border-brand-pink/20">{i + 1}</span>
                  <h3 className="font-heading font-extrabold text-lg text-neutral-900 dark:text-white">Step {i + 1} — {step.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-[#B5B5B5] font-medium leading-relaxed">{step.description}</p>
                  {i === 0 && <OfficialWebsiteButton url={redemptionGuide.officialUrl} providerLabel={redemptionGuide.providerLabel} />}
                </div>
                <div className={i % 2 === 1 ? 'md:order-1' : ''}>
                  <GuideScreenshot onOpen={setLightboxItem} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What You Get ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What You Get" title="Everything Included With Your Voucher" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inclusions.map((inc, i) => (
              <div key={i} className="flex items-center gap-3 bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-[#EAEAEA] dark:border-[#292929] px-4 py-3.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{inc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Important Information ────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-neutral-50 dark:bg-[#111111] border-y border-[#EAEAEA] dark:border-[#292929] transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Good to Know" title="Important Information" />
          <div className="bg-white dark:bg-[#161616] rounded-3xl border border-[#EAEAEA] dark:border-[#292929] divide-y divide-[#EAEAEA] dark:divide-[#292929] overflow-hidden">
            {[
              product.validityMonths ? { label: 'Voucher Validity', value: `${product.validityMonths} Months from purchase date` } : null,
              product.deliveryType ? { label: 'Delivery Method', value: product.deliveryType } : null,
              redemptionGuide.providerLabel ? { label: 'Redemption Method', value: `Online, directly on the official ${redemptionGuide.providerLabel} website` } : null,
              { label: 'Refund Policy', value: 'Refund guarantee if the voucher code is unredeemed within 7 days of purchase. Contact support to request one.' },
            ].filter(Boolean).map((row, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-6 py-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-400">{row.label}</span>
                <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaqIndex === i;
              return (
                <div key={i} className="bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(open ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="font-heading font-extrabold text-sm text-neutral-900 dark:text-white">{f.question}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-sm text-neutral-600 dark:text-[#B5B5B5] font-medium leading-relaxed">
                      {f.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Support ───────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#0B0F19] text-white transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <Headphones className="w-8 h-8 text-brand-pink mx-auto" />
          <h2 className="font-heading text-2xl sm:text-3xl font-black">Need Help Redeeming Your Voucher?</h2>
          <p className="text-slate-400 font-medium text-sm sm:text-base max-w-xl mx-auto">
            Our support team can help you understand the purchase and redemption process.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a href={supportWhatsAppLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full py-3.5 px-6 text-sm font-black shadow-lg transition-all cursor-pointer">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
            <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-2 bg-[#161D2F] hover:bg-[#1E293B] text-white rounded-full py-3.5 px-6 text-sm font-bold border border-[#1E293B] transition-colors cursor-pointer">
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Related Vouchers ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-16 sm:py-20 bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Explore More" title="Related Vouchers" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((r) => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/exam-vouchers/${r.slug || r.id}`)}
                  className="text-left bg-neutral-50 dark:bg-[#161616] rounded-2xl border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink/50 p-4 space-y-2 transition-colors cursor-pointer"
                >
                  <span className="text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">{r.provider || r.brand}</span>
                  <p className="font-heading font-extrabold text-sm text-neutral-900 dark:text-white leading-snug line-clamp-2">{r.name}</p>
                  <span className="font-heading font-black text-base text-brand-pink">{formatPrice(r.discountedPrice)}</span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand disclaimer ──────────────────────────────────── */}
      <p className="text-center text-[11px] font-medium text-neutral-400 dark:text-neutral-600 py-8 px-4 max-w-2xl mx-auto leading-relaxed">
        All trademarks and logos belong to their respective owners. Apex Vouchers is an independent voucher/service provider unless otherwise stated.
      </p>

      {/* ── Sticky mobile Buy Now bar ─────────────────────────── */}
      {!isOutOfStock && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0B0F19]/95 backdrop-blur-md border-t border-[#EAEAEA] dark:border-[#1E293B] px-4 py-3 flex items-center justify-between gap-3 shadow-2xl">
          <div className="min-w-0">
            <span className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider truncate">{product.name}</span>
            <span className="font-heading font-black text-lg text-neutral-900 dark:text-white">{formatPrice(product.discountedPrice)}</span>
          </div>
          <button
            onClick={() => startCheckout(product)}
            className="shrink-0 inline-flex items-center gap-2 bg-brand-pink hover:bg-[#D9004C] text-white rounded-full py-3 px-6 text-xs font-black shadow-lg cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Buy This Voucher</span>
          </button>
        </div>
      )}
    </>
  );
};

export default VoucherDetailPage;

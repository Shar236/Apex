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
import {
  Button, StockBadge, PriceDisplay, DiscountBadge, DeliveryValidityBar,
  SectionHeading,
} from './ui';
import VoucherCard from './VoucherCard.jsx';

/* ───────────────────────────── Screenshot / Lightbox ───────────────────────────── */

const GuideScreenshot = ({ image, alt, caption, onOpen }) => {
  if (!image) {
    return (
      <div className="w-full aspect-video rounded-2xl border-2 border-dashed border-line bg-surface-raised flex flex-col items-center justify-center gap-2 text-center px-4">
        <ImageOff className="w-6 h-6 text-ink-muted" />
        <span className="text-[11px] font-normal text-ink-muted">Screenshot coming soon</span>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpen({ image, alt, caption })}
      className="w-full aspect-video rounded-2xl border border-line overflow-hidden bg-surface-raised cursor-zoom-in group relative"
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
        {item.caption && <p className="text-center text-sm font-normal text-white/80">{item.caption}</p>}
      </div>
    </div>
  );
};

/* ───────────────────────────── Small building blocks ───────────────────────────── */

const OfficialWebsiteButton = ({ url, providerLabel }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-ink text-surface font-medium text-sm shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
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
      <div className="min-h-[60vh] flex items-center justify-center bg-surface">
        <div className="animate-pulse text-sm font-normal text-ink-muted">Loading voucher guide…</div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-surface text-center px-4">
        <p className="font-heading text-2xl font-normal text-ink">Voucher not found</p>
        <p className="text-sm font-normal text-ink-muted max-w-sm">This voucher may have been removed or is no longer available.</p>
        <Button variant="primary" size="md" onClick={goBackToVouchers}>Browse All Exam Vouchers</Button>
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
          className="inline-flex items-center gap-1.5 text-xs font-normal text-ink-muted hover:text-accent transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Exam Vouchers
        </button>
      </div>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12 bg-surface transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-line bg-surface shadow-[0_1px_3px_rgba(15,20,35,0.04),0_20px_50px_-24px_rgba(15,20,35,0.15)] dark:shadow-[0_1px_3px_rgba(0,0,0,0.4),0_20px_50px_-24px_rgba(0,0,0,0.7)] p-6 sm:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">

            <div className="md:col-span-4 flex justify-center">
              <div className="w-full max-w-55 aspect-square rounded-2xl border border-line bg-white flex items-center justify-center p-6">
                {product.logo ? (
                  <img src={imageUrl(product.logo, { width: 440 })} alt={`${product.name} logo`} className="max-h-full max-w-full object-contain" />
                ) : (
                  <BrandLogoContainer brand={product.brand || product.provider} name={product.name} inverted={false} />
                )}
              </div>
            </div>

            <div className="md:col-span-8 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-medium uppercase tracking-widest text-ink-muted">{product.provider || product.brand}</span>
                <StockBadge product={product} />
              </div>

              <h1 className="font-heading font-normal text-2xl sm:text-3xl lg:text-4xl text-ink leading-tight">
                {product.name} Voucher
              </h1>

              <p className="text-sm text-ink-muted font-normal leading-relaxed">
                {product.shortDescription || product.description || 'Official genuine exam voucher with instant digital delivery from Apex Vouchers.'}
              </p>

              <div className="flex items-end gap-4">
                <PriceDisplay original={product.originalPrice || 0} current={product.discountedPrice ?? product.sellingPrice ?? 0} formatPrice={formatPrice} size="lg" emphasis="accent" showSaved />
                <DiscountBadge percent={product.discountPercent || 0} savings={product.savings || 0} formatPrice={formatPrice} />
              </div>

              <DeliveryValidityBar product={product} className="max-w-xs" />

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {!isOutOfStock ? (
                  <Button variant="primary" size="lg" onClick={() => startCheckout(product)}>
                    Buy Now <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button variant="disabled" size="lg" disabled>
                    <Clock className="w-4 h-4" /> {isComingSoon ? 'Coming Soon' : 'Out of Stock'}
                  </Button>
                )}
                {!isOutOfStock && (
                  <Button variant="secondary" size="lg" onClick={() => addToCart(product)}>
                    <ShoppingCart className="w-4 h-4" /> Add to Cart
                  </Button>
                )}
              </div>

              {(product.officialWebsiteUrl || product.officialProductUrl) && (
                <a
                  href={product.officialWebsiteUrl || product.officialProductUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-accent transition-colors"
                >
                  Official Website <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-surface-raised border-y border-line transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Simple 3-Step Process" title="How It Works" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Buy Your Voucher', desc: 'Purchase your voucher securely from Apex Vouchers.' },
              { n: '02', title: 'Receive Your Code', desc: `Your voucher is delivered to your registered email — ${(product.deliveryType || 'Instant Delivery').toLowerCase()}.` },
              { n: '03', title: 'Redeem on Official Website', desc: `Visit the official ${redemptionGuide.providerLabel} website and apply your code during checkout.` },
            ].map((step, i) => (
              <div key={i} className="bg-surface rounded-3xl border border-line p-6 space-y-3 shadow-sm">
                <span className="font-heading font-medium text-4xl text-accent/20">{step.n}</span>
                <h3 className="font-heading font-medium text-lg text-ink">{step.title}</h3>
                <p className="text-sm text-ink-muted font-normal leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Purchase from Apex ────────────────────────── */}
      <section className="py-16 sm:py-20 bg-surface transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Buying Guide" title="How to Purchase from Apex Vouchers" subtitle="A simple, secure checkout — from selection to your inbox." />
          <div className="space-y-10">
            {purchaseSteps.map((step, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className={`space-y-2.5 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/8 text-accent font-medium text-xs border border-accent/20">{i + 1}</span>
                  <h3 className="font-heading font-medium text-lg text-ink">Step {i + 1} — {step.title}</h3>
                  <p className="text-sm text-ink-muted font-normal leading-relaxed">{step.description}</p>
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
      <section className="py-16 sm:py-20 bg-surface-raised border-y border-line transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Redemption Guide" title={`How to Redeem Your ${product.name}`} />
          <div className="space-y-10">
            {redemptionSteps.map((step, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className={`space-y-2.5 ${i % 2 === 1 ? 'md:order-2' : ''}`}>
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/8 text-accent font-medium text-xs border border-accent/20">{i + 1}</span>
                  <h3 className="font-heading font-medium text-lg text-ink">Step {i + 1} — {step.title}</h3>
                  <p className="text-sm text-ink-muted font-normal leading-relaxed">{step.description}</p>
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
      <section className="py-16 sm:py-20 bg-surface transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="What You Get" title="Everything Included With Your Voucher" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {inclusions.map((inc, i) => (
              <div key={i} className="flex items-center gap-3 bg-surface-raised rounded-2xl border border-line px-4 py-3.5">
                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                <span className="text-sm font-normal text-ink">{inc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Important Information ────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-surface-raised border-y border-line transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Good to Know" title="Important Information" />
          <div className="bg-surface rounded-3xl border border-line divide-y divide-line overflow-hidden">
            {[
              product.validityMonths ? { label: 'Voucher Validity', value: `${product.validityMonths} Months from purchase date` } : null,
              product.deliveryType ? { label: 'Delivery Method', value: product.deliveryType } : null,
              redemptionGuide.providerLabel ? { label: 'Redemption Method', value: `Online, directly on the official ${redemptionGuide.providerLabel} website` } : null,
              { label: 'Refund Policy', value: 'Refund guarantee if the voucher code is unredeemed within 7 days of purchase. Contact support to request one.' },
            ].filter(Boolean).map((row, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-6 py-4">
                <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">{row.label}</span>
                <span className="text-sm font-normal text-ink">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-surface transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="FAQ" title="Frequently Asked Questions" />
          <div className="space-y-3">
            {faqs.map((f, i) => {
              const open = openFaqIndex === i;
              return (
                <div key={i} className="bg-surface-raised rounded-2xl border border-line overflow-hidden">
                  <button
                    onClick={() => setOpenFaqIndex(open ? -1 : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                  >
                    <span className="font-heading font-medium text-sm text-ink">{f.question}</span>
                    <ChevronDown className={`w-4 h-4 text-neutral-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-4 text-sm text-ink-muted font-normal leading-relaxed">
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
      <section className="py-16 sm:py-20 bg-[#0B0D12] text-white transition-colors duration-300">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <Headphones className="w-8 h-8 text-accent mx-auto" />
          <h2 className="font-heading text-2xl sm:text-3xl font-light">Need Help Redeeming Your Voucher?</h2>
          <p className="text-neutral-400 font-normal text-sm sm:text-base max-w-xl mx-auto">
            Our support team can help you understand the purchase and redemption process.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a href={supportWhatsAppLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-full py-3.5 px-6 text-sm font-medium shadow-lg transition-all cursor-pointer">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Support</span>
            </a>
            <a href={`mailto:${supportEmail}`} className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white rounded-full py-3.5 px-6 text-sm font-medium border border-white/10 transition-colors cursor-pointer">
              <Mail className="w-4 h-4" />
              <span>Contact Support</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Related Vouchers ──────────────────────────────────── */}
      {related.length > 0 && (
        <section className="py-16 sm:py-20 bg-surface transition-colors duration-300">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Explore More" title="Related Vouchers" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
              {related.map((r) => (
                <VoucherCard key={r.id || r._id} product={r} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Brand disclaimer ──────────────────────────────────── */}
      <p className="text-center text-[11px] font-medium text-ink-muted py-8 px-4 max-w-2xl mx-auto leading-relaxed">
        All trademarks and logos belong to their respective owners. Apex Vouchers is an independent voucher/service provider unless otherwise stated.
      </p>

      {/* ── Sticky mobile Buy Now bar ─────────────────────────── */}
      {!isOutOfStock && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-line px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.25)]">
          <div className="min-w-0">
            <span className="block text-[10px] font-normal text-ink-muted uppercase tracking-wider truncate">{product.name}</span>
            <span className="font-heading font-semibold text-lg text-ink">{formatPrice(product.discountedPrice)}</span>
          </div>
          <Button variant="primary" size="md" className="shrink-0" onClick={() => startCheckout(product)}>
            <Lock className="w-3.5 h-3.5" /> Buy This Voucher
          </Button>
        </div>
      )}
    </>
  );
};

export default VoucherDetailPage;

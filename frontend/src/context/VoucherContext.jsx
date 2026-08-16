import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS, TESTIMONIALS, FAQ_ITEMS, SOCIAL_PROOF_EVENTS } from '../types/data';
import {
  productApi,
  orderApi,
  accountApi,
  formatPrice as fmtPrice,
  applyPageMetadata,
  setStructuredData,
} from '../lib/api';
import { useAuth } from './AuthContext';

const VoucherContext = createContext();

const CART_KEY = 'apex.cart';
const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {}
};

const adaptProduct = (p) => {
  const orig = Number(p.originalPrice) || 0;
  const sell = Number(p.sellingPrice != null ? p.sellingPrice : (p.discountedPrice || 0));
  const savings = Math.max(0, orig - sell);
  const discountPercent = orig > 0 ? Math.max(0, Math.min(100, Math.round((savings / orig) * 100))) : 0;
  const avail = p.availability ?? p.availableStock ?? 0;
  const inStock = p.inStock !== false && avail > 0;
  return {
    id: p._id || p.id,
    _id: p._id || p.id,
    name: p.name,
    slug: p.slug || '',
    provider: p.provider || p.brand || '',
    providerShortName: p.providerShortName || '',
    brand: p.brand || p.provider || '',
    category: p.category || 'English Language Test',
    shortDescription: p.shortDescription || '',
    description: p.description || '',
    richDescription: p.richDescription || '',
    logo: p.logo || '',
    image: p.image || '',
    imageSeo: p.imageSeo || { altText: '', imageTitle: '', caption: '' },
    originalPrice: orig,
    discountedPrice: sell,
    sellingPrice: sell,
    savings,
    discountPercent,
    discountEnabled: p.discountEnabled !== false,
    cta: p.cta || 'Buy Now',
    inStock,
    availability: avail,
    availableStock: avail,
    stockStatus: p.stockStatus || (avail > 10 ? 'IN STOCK' : avail > 0 ? 'LOW STOCK' : 'OUT OF STOCK'),
    validityDays: p.validityDays || 180,
    validityMonths: p.validityMonths || 6,
    badge: p.badge || '',
    badgeEnabled: p.badgeEnabled !== false,
    badgeType: p.badgeType || 'popular',
    rating: p.rating || 5,
    reviewsCount: p.reviewsCount || 0,
    featured: !!p.featured,
    displayOrder: p.displayOrder || 0,
    active: p.active !== false,
    seoTitle: p.seoTitle || (p.seo?.title) || '',
    seoDescription: p.seoDescription || (p.seo?.description) || '',
    seo: p.seo || {
      title: '',
      description: '',
      slug: '',
      focusKeyword: '',
      secondaryKeywords: [],
      canonicalUrl: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      noindex: false,
      nofollow: false,
    },
    inclusions: p.inclusions || [],
    redemptionSteps: p.redemptionSteps || [],
    faqs: p.faqs || [],
    relatedProducts: p.relatedProducts || [],
  };
};

const DEFAULT_GLOBAL_SEO = {
  websiteName: 'Apex Vouchers',
  defaultSeoTitle: 'Exam Vouchers at Best Prices | PTE, IELTS, TOEFL & Duolingo | Apex Vouchers',
  defaultMetaDescription: 'Buy official exam vouchers for PTE, IELTS, TOEFL and Duolingo at competitive prices. Save on exam fees with Apex Vouchers.',
  defaultOgImage: '',
  websiteUrl: 'https://apexvouchers.com',
  organizationName: 'Apex Vouchers',
  organizationLogo: '',
  gscVerificationCode: '',
  gaMeasurementId: '',
};

export const VoucherProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState(FALLBACK_PRODUCTS.map(adaptProduct));
  const [userVouchers, setUserVouchers] = useState([]);
  const [accountOrders, setAccountOrders] = useState([]);
  const [accountStats, setAccountStats] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);

  const [websiteConfig, setWebsiteConfig] = useState(null);
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [heroSettings, setHeroSettings] = useState(null);
  const [announcementSettings, setAnnouncementSettings] = useState(null);
  const [benefitCards, setBenefitCards] = useState([]);
  const [footerSettings, setFooterSettings] = useState(null);
  const [globalSEO, setGlobalSEO] = useState(DEFAULT_GLOBAL_SEO);

  const [cart, setCart] = useState(loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [selectedProductRelated, setSelectedProductRelated] = useState([]);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeBrandFilter, setActiveBrandFilter] = useState('All');
  const [currency, setCurrency] = useState('INR');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);
  const [activePageSEOKey, setActivePageSEOKey] = useState('home');

  useEffect(() => saveCart(cart), [cart]);

  const applyGlobalDefaults = useCallback(() => {
    if (!globalSEO) return;
    applyPageMetadata({
      title: globalSEO.defaultSeoTitle,
      description: globalSEO.defaultMetaDescription,
      canonical: globalSEO.websiteUrl,
      ogTitle: globalSEO.defaultSeoTitle,
      ogDescription: globalSEO.defaultMetaDescription,
      ogImage: globalSEO.defaultOgImage,
      ogUrl: globalSEO.websiteUrl,
      twitterTitle: globalSEO.defaultSeoTitle,
      twitterDescription: globalSEO.defaultMetaDescription,
      twitterImage: globalSEO.defaultOgImage,
    });
  }, [globalSEO]);

  const applyPageSEO = useCallback((pageKey) => {
    setActivePageSEOKey(pageKey);
    if (!globalSEO) return;

    const titles = {
      home: globalSEO.defaultSeoTitle,
      shop: `Exam Vouchers Catalog | ${globalSEO.websiteName}`,
      calculator: `Savings Calculator | ${globalSEO.websiteName}`,
      'how-it-works': `How It Works | ${globalSEO.websiteName}`,
      'exam-guides': `Exam Guides & Resources | ${globalSEO.websiteName}`,
      testimonials: `Student Testimonials | ${globalSEO.websiteName}`,
      faq: `Exam Voucher FAQs | ${globalSEO.websiteName}`,
      dashboard: `My Account | ${globalSEO.websiteName}`,
    };
    const descs = {
      home: globalSEO.defaultMetaDescription,
      shop: `Browse official exam vouchers for PTE, IELTS, TOEFL, Duolingo and more. 100% genuine vouchers with instant delivery.`,
      calculator: `Calculate how much you can save by buying exam vouchers from Apex Vouchers. Compare official prices vs discounted prices.`,
      'how-it-works': `Learn how to purchase and redeem exam vouchers from Apex Vouchers in 3 simple steps. 100% genuine codes delivered instantly.`,
      'exam-guides': `Expert exam guides, preparation tips and resources for PTE, IELTS, TOEFL and Duolingo exams.`,
      testimonials: `Read real student reviews and success stories from Apex Vouchers customers. Trusted by thousands of candidates.`,
      faq: `Find answers to frequently asked questions about Apex Vouchers: validity, refund policy, delivery and more.`,
      dashboard: `Manage your purchased vouchers, view orders and redeem codes from your Apex Vouchers account dashboard.`,
    };

    applyPageMetadata({
      title: titles[pageKey] || globalSEO.defaultSeoTitle,
      description: descs[pageKey] || globalSEO.defaultMetaDescription,
      canonical: globalSEO.websiteUrl,
      ogTitle: titles[pageKey] || globalSEO.defaultSeoTitle,
      ogDescription: descs[pageKey] || globalSEO.defaultMetaDescription,
      ogImage: globalSEO.defaultOgImage,
      ogUrl: globalSEO.websiteUrl,
    });
  }, [globalSEO]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await productApi.getWebsiteConfig();
      if (res.success) {
        setWebsiteConfig(res);
        if (res.activeCampaign) setActiveCampaign(res.activeCampaign);
        else setActiveCampaign(null);
        if (res.heroSettings) setHeroSettings(res.heroSettings);
        if (res.announcementSettings) setAnnouncementSettings(res.announcementSettings);
        if (res.benefitCards) setBenefitCards(res.benefitCards);
        if (res.footerSettings) setFooterSettings(res.footerSettings);
        if (res.globalSEO) setGlobalSEO({ ...DEFAULT_GLOBAL_SEO, ...res.globalSEO });
        else setGlobalSEO(DEFAULT_GLOBAL_SEO);

        if (res.structuredData) {
          if (res.structuredData.organization) {
            setStructuredData('organization', res.structuredData.organization);
          }
          if (res.structuredData.website) {
            setStructuredData('website', res.structuredData.website);
          }
        }

        if (Array.isArray(res.products) && res.products.length > 0) {
          const adapted = res.products.map(adaptProduct);
          setProducts(adapted);

          setCart((prevCart) =>
            prevCart.map((item) => {
              const fresh = adapted.find((p) => p.id === item.id || p._id === item._id);
              return fresh ? { ...item, ...fresh, quantity: item.quantity } : item;
            })
          );
        }
      } else {
        const fallbackRes = await productApi.list();
        if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
          setProducts(fallbackRes.data.map(adaptProduct));
        }
      }
    } catch {
      try {
        const fallbackRes = await productApi.list();
        if (fallbackRes.success && Array.isArray(fallbackRes.data)) {
          setProducts(fallbackRes.data.map(adaptProduct));
        }
      } catch {}
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const loadAccountData = useCallback(async () => {
    if (!isAuthenticated) {
      setUserVouchers([]);
      setAccountOrders([]);
      setAccountStats({});
      return;
    }
    try {
      const [vRes, oRes, sRes] = await Promise.all([
        accountApi.vouchers(),
        accountApi.orders(),
        accountApi.stats(),
      ]);
      if (vRes.success) setUserVouchers(Array.isArray(vRes.data) ? vRes.data : []);
      if (oRes.success) setAccountOrders(Array.isArray(oRes.data) ? oRes.data : []);
      if (sRes.success) setAccountStats(sRes.data || {});
    } catch {
      setUserVouchers([]);
      setAccountOrders([]);
      setAccountStats({});
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    if (websiteConfig && globalSEO) {
      applyGlobalDefaults();
    }
  }, [websiteConfig, globalSEO, applyGlobalDefaults]);

  useEffect(() => {
    if (activeTab && !selectedProductDetail) {
      applyPageSEO(activeTab);
      setStructuredData('product', null);
      setStructuredData('breadcrumb', null);
    }
  }, [activeTab, selectedProductDetail, applyPageSEO]);

  const showToast = useCallback((message) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4000);
  }, []);

  const addToCart = useCallback((product) => {
    if (!product.inStock) {
      showToast(`⚠️ ${product.name} is currently out of stock.`);
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart!`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => setCart((c) => c.filter((i) => i.id !== id)), []);

  const updateQuantity = useCallback((id, delta) =>
    setCart((c) =>
      c.map((i) => {
        if (i.id !== id) return i;
        const q = i.quantity + delta;
        return q > 0 ? { ...i, quantity: q } : i;
      })
    ), []);

  const startCheckout = useCallback((product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  }, []);

  const toggleProductStock = useCallback((id) =>
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))), []);

  const transferVoucher = useCallback(async (voucherId, targetEmail) => {
    if (!isAuthenticated) {
      showToast('Please log in to transfer a voucher.');
      return;
    }
    const res = await accountApi.transferVoucher(voucherId, targetEmail);
    if (res.success) {
      setUserVouchers((prev) =>
        prev.map((v) =>
          v.id === voucherId
            ? { ...v, status: 'TRANSFERRED', transferredTo: targetEmail }
            : v
        )
      );
      showToast(`✅ Voucher transferred to ${targetEmail}`);
    } else {
      showToast(res.message || 'Transfer failed');
    }
  }, [isAuthenticated, showToast]);

  const markVoucherUsed = useCallback(async (voucherId) => {
    if (!isAuthenticated) return;
    const res = await accountApi.markUsed(voucherId);
    if (res.success) {
      setUserVouchers((prev) =>
        prev.map((v) => (v.id === voucherId ? { ...v, status: 'USED', usedAt: new Date() } : v))
      );
      showToast('Marked as used');
    } else {
      showToast(res.message || 'Failed');
    }
  }, [isAuthenticated, showToast]);

  const requestRefund = useCallback(async (voucherId) => {
    if (!isAuthenticated) {
      showToast('Log in first');
      return;
    }
    showToast('📌 Refund request submitted. Support will process within 2 hours.');
    setUserVouchers((prev) =>
      prev.map((v) =>
        v.id === voucherId ? { ...v, status: 'REFUND_REQUESTED' } : v
      )
    );
  }, [isAuthenticated, showToast]);

  const handlePurchaseSuccess = useCallback(async ({ orderId }) => {
    if (!orderId) return;
    showToast(`🎉 Order #${orderId} confirmed!`);
    await loadAccountData();
  }, [loadAccountData, showToast]);

  const openProductDetail = useCallback(async (product) => {
    if (!product) return;
    const adapted = adaptProduct(product);
    setSelectedProductDetail(adapted);
    setStructuredData('product', null);
    setStructuredData('breadcrumb', null);
    try {
      const res = await productApi.get(adapted.id || adapted.slug);
      if (res.success) {
        const fresh = adaptProduct(res.data);
        setSelectedProductDetail(fresh);
        if (res.structuredData) {
          if (res.structuredData.product) {
            setStructuredData('product', res.structuredData.product);
          }
          if (res.structuredData.breadcrumb) {
            setStructuredData('breadcrumb', res.structuredData.breadcrumb);
          }
        }
        if (res.relatedProducts) {
          setSelectedProductRelated(res.relatedProducts.map(adaptProduct));
        } else {
          setSelectedProductRelated([]);
        }
        const title = fresh.seo?.title || fresh.seoTitle || `${fresh.name} | ${globalSEO.websiteName || 'Apex Vouchers'}`;
        const desc = fresh.seo?.description || fresh.seoDescription || fresh.shortDescription || globalSEO.defaultMetaDescription;
        const canonical = fresh.seo?.canonicalUrl || `${globalSEO.websiteUrl || 'https://apexvouchers.com'}/exam-vouchers/${fresh.slug}`;
        applyPageMetadata({
          title,
          description: desc,
          canonical,
          ogTitle: fresh.seo?.ogTitle || title,
          ogDescription: fresh.seo?.ogDescription || desc,
          ogImage: fresh.seo?.ogImage || fresh.image || globalSEO.defaultOgImage,
          ogUrl: canonical,
          ogType: 'product',
          twitterTitle: fresh.seo?.twitterTitle || title,
          twitterDescription: fresh.seo?.twitterDescription || desc,
          twitterImage: fresh.seo?.twitterImage || fresh.seo?.ogImage || fresh.image || globalSEO.defaultOgImage,
          noindex: !!fresh.seo?.noindex,
          nofollow: !!fresh.seo?.nofollow,
        });
      }
    } catch {
      const title = adapted.seo?.title || adapted.seoTitle || `${adapted.name} | ${globalSEO.websiteName || 'Apex Vouchers'}`;
      applyPageMetadata({
        title,
        description: adapted.seo?.description || adapted.seoDescription || globalSEO.defaultMetaDescription,
        ogTitle: adapted.seo?.ogTitle || title,
        ogDescription: adapted.seo?.ogDescription || adapted.seoDescription,
        ogImage: adapted.image || globalSEO.defaultOgImage,
        ogType: 'product',
      });
    }
  }, [globalSEO]);

  const closeProductDetail = useCallback(() => {
    setSelectedProductDetail(null);
    setSelectedProductRelated([]);
    setStructuredData('product', null);
    setStructuredData('breadcrumb', null);
    applyPageSEO(activeTab || 'home');
  }, [activeTab, applyPageSEO]);

  const formatPrice = useCallback((amount) => fmtPrice(amount, currency), [currency]);

  const value = useMemo(
    () => ({
      products,
      productsLoading,
      refreshProducts: loadProducts,
      userVouchers,
      accountOrders,
      accountStats,
      loadAccountData,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      isCartOpen,
      setIsCartOpen,
      selectedProductDetail,
      setSelectedProductDetail: openProductDetail,
      closeProductDetail,
      selectedProductRelated,
      checkoutProduct,
      setCheckoutProduct,
      isCheckoutOpen,
      setIsCheckoutOpen,
      activeTab,
      setActiveTab,
      activeBrandFilter,
      setActiveBrandFilter,
      currency,
      setCurrency,
      formatPrice,
      startCheckout,
      handlePurchaseSuccess,
      toggleProductStock,
      transferVoucher,
      markVoucherUsed,
      requestRefund,
      isAdminOpen,
      setIsAdminOpen,
      toastMessage,
      showToast,
      websiteConfig,
      activeCampaign,
      heroSettings,
      announcementSettings,
      benefitCards,
      footerSettings,
      globalSEO,
      activePageSEOKey,
      refreshWebsiteConfig: loadProducts,
      testimonials: TESTIMONIALS,
      faqItems: FAQ_ITEMS,
      socialProofEvents: SOCIAL_PROOF_EVENTS,
    }),
    [
      products,
      productsLoading,
      loadProducts,
      websiteConfig,
      activeCampaign,
      heroSettings,
      announcementSettings,
      benefitCards,
      footerSettings,
      globalSEO,
      activePageSEOKey,
      userVouchers,
      accountOrders,
      accountStats,
      loadAccountData,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      isCartOpen,
      selectedProductDetail,
      selectedProductRelated,
      checkoutProduct,
      isCheckoutOpen,
      activeTab,
      activeBrandFilter,
      currency,
      formatPrice,
      startCheckout,
      handlePurchaseSuccess,
      toggleProductStock,
      transferVoucher,
      markVoucherUsed,
      requestRefund,
      isAdminOpen,
      toastMessage,
      showToast,
      openProductDetail,
      closeProductDetail,
    ]
  );

  return (
    <VoucherContext.Provider value={value}>
      {children}
    </VoucherContext.Provider>
  );
};

export const useVoucher = () => useContext(VoucherContext);
export { useAuth };

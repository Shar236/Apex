import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS, TESTIMONIALS, FAQ_ITEMS, SOCIAL_PROOF_EVENTS } from '../types/data';
import {
  productApi,
  orderApi,
  accountApi,
  formatPrice as fmtPrice,
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
    logo: p.logo || '',
    image: p.image || '',
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
    seoTitle: p.seoTitle || '',
    seoDescription: p.seoDescription || '',
    inclusions: p.inclusions || [],
    redemptionSteps: p.redemptionSteps || [],
  };
};

export const VoucherProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState(FALLBACK_PRODUCTS.map(adaptProduct));
  const [userVouchers, setUserVouchers] = useState([]);
  const [accountOrders, setAccountOrders] = useState([]);
  const [accountStats, setAccountStats] = useState({});
  const [productsLoading, setProductsLoading] = useState(false);

  const [cart, setCart] = useState(loadCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [activeBrandFilter, setActiveBrandFilter] = useState('All');
  const [currency, setCurrency] = useState('INR');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => saveCart(cart), [cart]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await productApi.list();
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const adapted = res.data.map(adaptProduct);
        setProducts(adapted);

        setCart((prevCart) =>
          prevCart.map((item) => {
            const fresh = adapted.find((p) => p.id === item.id || p._id === item._id);
            return fresh ? { ...item, ...fresh, quantity: item.quantity } : item;
          })
        );

        setSelectedProductDetail((prev) => {
          if (!prev) return null;
          const fresh = adapted.find((p) => p.id === prev.id || p._id === prev._id);
          return fresh ? { ...prev, ...fresh } : prev;
        });

        setCheckoutProduct((prev) => {
          if (!prev) return null;
          const fresh = adapted.find((p) => p.id === prev.id || p._id === prev._id);
          return fresh ? { ...prev, ...fresh } : prev;
        });
      }
    } catch {
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
      setSelectedProductDetail,
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
      testimonials: TESTIMONIALS,
      faqItems: FAQ_ITEMS,
      socialProofEvents: SOCIAL_PROOF_EVENTS,
    }),
    [
      products,
      productsLoading,
      loadProducts,
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

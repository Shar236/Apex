import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS as INITIAL_PRODUCTS, SEEDED_USER_VOUCHERS } from '../types/data';

const VoucherContext = createContext();

export const VoucherProvider = ({ children }) => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [userVouchers, setUserVouchers] = useState(SEEDED_USER_VOUCHERS);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home', 'shop', 'calculator', 'dashboard', 'how-it-works', 'support'
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const [usdRate] = useState(83.5);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Show temporary toast message
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Add item to cart
  const addToCart = (product) => {
    if (!product.inStock) {
      showToast(`⚠️ ${product.name} is currently out of stock.`);
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    showToast(`Added ${product.name} to cart!`);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return newQty > 0 ? { ...item, quantity: newQty } : item;
      }
      return item;
    }));
  };

  // Quick buy single product
  const startCheckout = (product) => {
    setCheckoutProduct(product);
    setIsCheckoutOpen(true);
  };

  // Process purchase completion
  const handlePurchaseSuccess = (purchasedItem, customerDetails) => {
    const newVoucherCode = `APEX-${purchasedItem.brand.substring(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    const today = new Date();
    const expiry = new Date();
    expiry.setMonth(today.getMonth() + 6);

    const newVoucher = {
      id: `ord-${Date.now()}`,
      productName: purchasedItem.name,
      code: newVoucherCode,
      purchaseDate: today.toISOString().split('T')[0],
      expiryDate: expiry.toISOString().split('T')[0],
      daysRemaining: 180,
      status: "Active",
      originalPrice: purchasedItem.originalPrice,
      paidPrice: purchasedItem.discountedPrice,
      savings: purchasedItem.savings,
      inclusions: purchasedItem.inclusions || ["Official Exam Voucher Code", "Priority Support"]
    };

    setUserVouchers(prev => [newVoucher, ...prev]);
    showToast(`🎉 Order confirmed! Voucher code sent to ${customerDetails.email || customerDetails.phone || 'your account'}.`);
  };

  // Toggle Stock state for Admin Demo
  const toggleProductStock = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, inStock: !p.inStock } : p));
  };

  // Voucher Dashboard actions
  const transferVoucher = (voucherId, targetEmail) => {
    setUserVouchers(userVouchers.map(v => {
      if (v.id === voucherId) {
        return { ...v, status: 'Transferred', transferredTo: targetEmail };
      }
      return v;
    }));
    showToast(`✅ Voucher successfully transferred to ${targetEmail}`);
  };

  const requestRefund = (voucherId) => {
    setUserVouchers(userVouchers.map(v => {
      if (v.id === voucherId) {
        return { ...v, status: 'Refund Requested' };
      }
      return v;
    }));
    showToast(`📌 Refund request submitted for voucher. Our support team will process it within 2 hours.`);
  };

  // Format currency helper
  const formatPrice = (amount) => {
    if (currency === 'USD') {
      const usdVal = (amount / usdRate).toFixed(2);
      return `$${usdVal}`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <VoucherContext.Provider value={{
      products,
      userVouchers,
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
      currency,
      setCurrency,
      formatPrice,
      startCheckout,
      handlePurchaseSuccess,
      toggleProductStock,
      transferVoucher,
      requestRefund,
      isAdminOpen,
      setIsAdminOpen,
      toastMessage,
      showToast
    }}>
      {children}
    </VoucherContext.Provider>
  );
};

export const useVoucher = () => useContext(VoucherContext);

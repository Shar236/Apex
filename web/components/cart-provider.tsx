'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { formatPrice as fmtPrice } from '@/lib/api';
import type { Product } from '@/lib/types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextValue {
  cart: CartItem[];
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (product: Product) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  formatPrice: (amount: number | null | undefined, currency?: 'INR' | 'USD') => string;
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = 'apex.cart';

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = (cart: CartItem[]) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // storage unavailable — cart still works for this page load
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    // Hydrate the cart from localStorage after mount. Lazy init would diverge
    // from the server render ([]) and mismatch the cart-count badge on hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCart(loadCart());
  }, []);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    const t = setTimeout(() => setToastMessage(null), 2600);
    return () => clearTimeout(t);
  }, []);

  const addToCart = useCallback(
    (product: Product) => {
      const id = (product._id || product.id) as string;
      const variantKey = product.selectedDuration?.key ? `${id}::${product.selectedDuration.key}` : id;
      setCart((prev) => {
        const existing = prev.find((i) => ((i._id || i.id) as string) === id && (i.selectedDuration?.key ? `${id}::${i.selectedDuration.key}` : id) === variantKey);
        if (existing) {
          return prev.map((i) => ((i._id || i.id) as string) === id && (i.selectedDuration?.key ? `${id}::${i.selectedDuration.key}` : id) === variantKey ? { ...i, quantity: i.quantity + 1 } : i);
        }
        return [...prev, { ...product, quantity: 1 }];
      });
      const suffix = product.selectedDuration?.label ? ` (${product.selectedDuration.label})` : '';
      showToast(`Added ${product.name}${suffix} to cart!`);
    },
    [showToast]
  );

  const removeFromCart = useCallback((id: string) => {
    setCart((c) => c.filter((i) => (i._id || i.id) !== id));
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setCart((c) =>
      c.map((i) => {
        if ((i._id || i.id) !== id) return i;
        const q = i.quantity + delta;
        return q > 0 ? { ...i, quantity: q } : i;
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, i) => s + (i.quantity || 1), 0), [cart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        formatPrice: fmtPrice,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
};

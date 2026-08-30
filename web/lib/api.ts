import { siteConfig } from './config';

const TOKEN_KEY = 'apex.token';
const USER_KEY = 'apex.user';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string;
  status?: number;
  [key: string]: unknown;
}

export const apiBase = () => siteConfig.apiUrl;

const storage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
};

export const getToken = (): string | null => {
  try {
    return storage()?.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};

export const setToken = (t: string | null) => {
  try {
    if (t) storage()?.setItem(TOKEN_KEY, t);
    else storage()?.removeItem(TOKEN_KEY);
  } catch {
    // storage unavailable — auth still works for this page load via in-memory state
  }
};

export const getStoredUser = <T = unknown>(): T | null => {
  try {
    const raw = storage()?.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

export const setStoredUser = (u: unknown) => {
  try {
    if (u) storage()?.setItem(USER_KEY, JSON.stringify(u));
    else storage()?.removeItem(USER_KEY);
  } catch {
    // storage unavailable
  }
};

export const clearAuth = () => {
  try {
    storage()?.removeItem(TOKEN_KEY);
    storage()?.removeItem(USER_KEY);
  } catch {
    // storage unavailable
  }
};

const parseJSON = async (resp: Response): Promise<Record<string, unknown>> => {
  const text = await resp.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text || 'Invalid server response' };
  }
};

/**
 * The single HTTP client for the whole app — usable from both Server
 * Components (public, unauthenticated reads; no `window`/localStorage there,
 * guarded above) and Client Components (authenticated requests via the
 * bearer token). Mirrors the response contract the Express API already uses:
 * { success, data, message, code }.
 */
export const request = async <T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const fullUrl = url.startsWith('http') ? url : `${apiBase()}${url}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let resp: Response;
  try {
    resp = await fetch(fullUrl, { ...options, headers });
  } catch (err) {
    return {
      success: false,
      message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
      code: 'NETWORK',
    };
  }

  const data = await parseJSON(resp);
  if (!resp.ok || data.success === false) {
    return {
      success: false,
      message: (data?.message as string) || `Request failed (${resp.status})`,
      code: (data?.code as string) || String(resp.status),
      status: resp.status,
      data: data as T,
    };
  }
  return { success: true, data: (data?.data ?? data) as T, ...data };
};

export const authApi = {
  register: (data: unknown) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyRegistrationOtp: (email: string, otp: string) =>
    request('/api/auth/register/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resendRegistrationOtp: (email: string) =>
    request('/api/auth/register/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  login: (data: unknown) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email: string) =>
    request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) =>
    request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  me: () => request('/api/auth/me'),
};

export const productApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request(`/api/products/${id}`),
  getWebsiteConfig: () => request('/api/products/website-config'),
  getPublicSEO: () => request('/api/seo/public'),
};

export const accountApi = {
  me: () => request('/api/account'),
  updateProfile: (data: unknown) => request('/api/account/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadAvatar: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = getToken();
    try {
      const resp = await fetch(`${apiBase()}/api/account/profile/avatar`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok || data.success === false) {
        return { success: false, message: data?.message || `Upload failed (${resp.status})` };
      }
      return { success: true, ...data };
    } catch (err) {
      return { success: false, message: `Network error: ${err instanceof Error ? err.message : String(err)}` };
    }
  },
  removeAvatar: () => request('/api/account/profile/avatar', { method: 'DELETE' }),
  sendEmailOtp: (newEmail: string) =>
    request('/api/account/email/send-otp', { method: 'POST', body: JSON.stringify({ newEmail }) }),
  verifyEmailOtp: (otp: string) =>
    request('/api/account/email/verify-otp', { method: 'POST', body: JSON.stringify({ otp }) }),
  updatePhone: (phone: string, phoneCountry: string, currentPassword: string) =>
    request('/api/account/phone', {
      method: 'PATCH',
      body: JSON.stringify({ phone, phoneCountry, currentPassword }),
    }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request('/api/account/password/change', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
  logout: () => request('/api/account/logout', { method: 'POST' }),
  stats: () => request('/api/account/stats'),
  orders: () => request('/api/account/orders'),
  vouchers: () => request('/api/account/vouchers'),
  fulfillments: () => request('/api/account/fulfillments'),
  transferVoucher: (id: string, targetEmail: string) =>
    request(`/api/account/vouchers/${id}/transfer`, { method: 'PATCH', body: JSON.stringify({ targetEmail }) }),
  markUsed: (id: string) => request(`/api/account/vouchers/${id}/used`, { method: 'PATCH' }),
  validatePromo: (payload: unknown) =>
    request('/api/account/validate-promo', { method: 'POST', body: JSON.stringify(payload) }),
};

export const orderApi = {
  create: (payload: unknown) => request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id: string) => request(`/api/orders/${id}`),
};

export const paymentApi = {
  // Publishable Razorpay config for the browser (key id only — no secret).
  getConfig: () => request('/api/payments/config'),
  // Create the internal order + a Razorpay order for the server-calculated total.
  createOrder: (payload: unknown) => request('/api/payments/order', { method: 'POST', body: JSON.stringify(payload) }),
  // Verify the Razorpay Checkout result on the server (signature + gateway re-check).
  verify: (payload: unknown) => request('/api/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),
  // Self-heal: ask the server to check the gateway for a captured payment and
  // fulfil the order (used when the Checkout callback never fired). Idempotent.
  reconcile: (orderId: string) => request(`/api/payments/reconcile/${orderId}`, { method: 'POST' }),
  // Server truth about an order (also opportunistically self-heals a PENDING order).
  getStatus: (orderId: string) => request(`/api/payments/order/${orderId}`),
};

export const seoApi = {
  overview: () => request('/api/seo/overview'),
  analyzeInline: (payload: unknown) => request('/api/seo/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  analyzeProduct: (id: string) => request(`/api/seo/analyze/product/${id}`),
  updateProductSEO: (id: string, data: unknown) =>
    request(`/api/seo/products/${id}/seo`, { method: 'PATCH', body: JSON.stringify(data) }),
  pages: () => request('/api/seo/pages'),
  getPage: (pageKey: string) => request(`/api/seo/pages/${pageKey}`),
  updatePage: (pageKey: string, data: unknown) =>
    request(`/api/seo/pages/${pageKey}`, { method: 'PATCH', body: JSON.stringify(data) }),
  redirects: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/seo/redirects${qs ? `?${qs}` : ''}`);
  },
  createRedirect: (data: unknown) => request('/api/seo/redirects', { method: 'POST', body: JSON.stringify(data) }),
  updateRedirect: (id: string, data: unknown) =>
    request(`/api/seo/redirects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRedirect: (id: string) => request(`/api/seo/redirects/${id}`, { method: 'DELETE' }),
  globalSettings: () => request('/api/seo/global-settings'),
  updateGlobalSettings: (data: unknown) =>
    request('/api/seo/global-settings', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Blog HTTP layer lives in lib/blog-api.ts (mirrors the Vite app's src/blogs/lib/blogApi.js).

export const adminApi = {
  dashboard: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/dashboard${qs ? `?${qs}` : ''}`);
  },
  users: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },
  user: (id: string) => request(`/api/admin/users/${id}`),
  setUserStatus: (id: string, status: string) =>
    request(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  products: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id: string) => request(`/api/admin/products/${id}`),
  createProduct: (data: unknown) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: string, data: unknown) =>
    request(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  quickUpdatePrice: (id: string, payload: unknown) =>
    request(`/api/admin/products/${id}/price`, { method: 'PATCH', body: JSON.stringify(payload) }),
  quickUpdateStatus: (id: string, active: boolean) =>
    request(`/api/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  quickUpdateFeatured: (id: string, featured: boolean) =>
    request(`/api/admin/products/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  deleteProduct: (id: string) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
  duplicateProduct: (id: string) => request(`/api/admin/products/${id}/duplicate`, { method: 'POST' }),
  archiveProduct: (id: string) => request(`/api/admin/products/${id}/archive`, { method: 'PATCH' }),
  restoreProduct: (id: string) => request(`/api/admin/products/${id}/restore`, { method: 'PATCH' }),
  reorderProducts: (items: unknown) =>
    request('/api/admin/products/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  getProductInventory: (id: string) => request(`/api/admin/products/${id}/inventory`),
  uploadProductLogo: async (file: File): Promise<ApiResponse> => {
    const formData = new FormData();
    formData.append('logo', file);
    const token = getToken();
    const resp = await fetch(`${apiBase()}/api/admin/products/logo-upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok || data.success === false) {
      return { success: false, message: data?.message || `Upload failed (${resp.status})` };
    }
    return { success: true, ...data };
  },
  vouchers: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/vouchers${qs ? `?${qs}` : ''}`);
  },
  voucherSummaryByProduct: () => request('/api/admin/vouchers/summary-by-product'),
  revealVoucherCode: (id: string) => request(`/api/admin/vouchers/${id}/reveal`),
  notifications: () => request('/api/admin/notifications'),
  addVouchers: (payload: unknown) => request('/api/admin/vouchers', { method: 'POST', body: JSON.stringify(payload) }),
  addVouchersBulk: (payload: unknown) =>
    request('/api/admin/vouchers/bulk', { method: 'POST', body: JSON.stringify(payload) }),
  updateVoucher: (id: string, data: unknown) =>
    request(`/api/admin/vouchers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  orders: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/orders${qs ? `?${qs}` : ''}`);
  },
  order: (id: string) => request(`/api/admin/orders/${id}`),
  updateOrderStatus: (id: string, payload: unknown) =>
    request(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  resendOrderEmail: (id: string) => request(`/api/admin/orders/${id}/resend-email`, { method: 'POST' }),
  promotions: () => request('/api/admin/promotions'),
  createPromotion: (data: unknown) => request('/api/admin/promotions', { method: 'POST', body: JSON.stringify(data) }),
  updatePromotion: (id: string, data: unknown) =>
    request(`/api/admin/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePromotion: (id: string) => request(`/api/admin/promotions/${id}`, { method: 'DELETE' }),
  campaigns: () => request('/api/admin/campaigns'),
  createCampaign: (data: unknown) => request('/api/admin/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id: string, data: unknown) =>
    request(`/api/admin/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCampaign: (id: string) => request(`/api/admin/campaigns/${id}`, { method: 'DELETE' }),
  toggleCampaign: (id: string) => request(`/api/admin/campaigns/${id}/toggle`, { method: 'POST' }),
  getWebsiteSettings: () => request('/api/admin/website-settings'),
  updateWebsiteSettings: (data: unknown) =>
    request('/api/admin/website-settings', { method: 'PATCH', body: JSON.stringify(data) }),
  auditLogs: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/audit-logs${qs ? `?${qs}` : ''}`);
  },
  downloadExport: async (
    resource: string,
    unmasked = false,
    params: Record<string, string> = {}
  ): Promise<ApiResponse> => {
    const token = getToken();
    const queryParams: Record<string, string> = { ...params };
    if (unmasked) queryParams.unmasked = 'true';
    const qs = new URLSearchParams(queryParams).toString();
    const url = `${apiBase()}/api/admin/export/${resource}${qs ? `?${qs}` : ''}`;
    const resp = await fetch(url, { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } });
    if (!resp.ok) return { success: false, message: 'Export failed' };
    const text = await resp.text();
    const blob = new Blob([text], { type: 'text/csv' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `apex_${resource}_export.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return { success: true };
  },
  videos: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/reels${qs ? `?${qs}` : ''}`);
  },
  reels: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/reels${qs ? `?${qs}` : ''}`);
  },
  getVideo: (id: string) => request(`/api/admin/reels/${id}`),
  getReel: (id: string) => request(`/api/admin/reels/${id}`),
  createVideo: (data: unknown) => request('/api/admin/reels', { method: 'POST', body: JSON.stringify(data) }),
  createReel: (data: unknown) => request('/api/admin/reels', { method: 'POST', body: JSON.stringify(data) }),
  updateVideo: (id: string, data: unknown) =>
    request(`/api/admin/reels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateReel: (id: string, data: unknown) =>
    request(`/api/admin/reels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  quickToggleFeaturedVideo: (id: string, featured: boolean) =>
    request(`/api/admin/reels/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  quickToggleFeaturedReel: (id: string, featured: boolean) =>
    request(`/api/admin/reels/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  quickTogglePublishVideo: (id: string, published: boolean) =>
    request(`/api/admin/reels/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ published }) }),
  quickTogglePublishReel: (id: string, published: boolean) =>
    request(`/api/admin/reels/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ published }) }),
  quickUpdateOrder: (id: string, order: number) =>
    request(`/api/admin/reels/${id}/order`, { method: 'PATCH', body: JSON.stringify({ order }) }),
  bulkReorderReels: (items: unknown) =>
    request('/api/admin/reels/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  deleteVideo: (id: string) => request(`/api/admin/reels/${id}`, { method: 'DELETE' }),
  deleteReel: (id: string) => request(`/api/admin/reels/${id}`, { method: 'DELETE' }),
  updateVideoSettings: (data: unknown) => request('/api/admin/reels/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  updateReelSettings: (data: unknown) => request('/api/admin/reels/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadMedia: async (formData: FormData) => {
    const token = getToken();
    const resp = await fetch(`${apiBase()}/api/admin/reels/upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    return resp.json();
  },
  awards: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/awards${qs ? `?${qs}` : ''}`);
  },
  getAward: (id: string) => request(`/api/admin/awards/${id}`),
  createAward: (data: unknown) => request('/api/admin/awards', { method: 'POST', body: JSON.stringify(data) }),
  updateAward: (id: string, data: unknown) =>
    request(`/api/admin/awards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  quickToggleFeaturedAward: (id: string, featured: boolean) =>
    request(`/api/admin/awards/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  quickToggleStatusAward: (id: string, status: string) =>
    request(`/api/admin/awards/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  bulkReorderAwards: (items: unknown) =>
    request('/api/admin/awards/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  deleteAward: (id: string) => request(`/api/admin/awards/${id}`, { method: 'DELETE' }),
  uploadAwardMedia: async (formData: FormData) => {
    const token = getToken();
    const resp = await fetch(`${apiBase()}/api/admin/awards/upload`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    });
    return resp.json();
  },
  seo: seoApi,
  // adminApi.blog lives in lib/blog-api.ts.
  pteBookings: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/pte-bookings${qs ? `?${qs}` : ''}`);
  },
  getPTEBooking: (id: string) => request(`/api/admin/pte-bookings/${id}`),
  updatePTEBooking: (id: string, data: unknown) =>
    request(`/api/admin/pte-bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  voucherRequests: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/voucher-requests${qs ? `?${qs}` : ''}`);
  },
  getVoucherRequest: (id: string) => request(`/api/admin/voucher-requests/${id}`),
  updateVoucherRequest: (id: string, data: unknown) =>
    request(`/api/admin/voucher-requests/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  fulfillments: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/fulfillments${qs ? `?${qs}` : ''}`);
  },
  deliverFulfillment: (id: string, code: string) =>
    request(`/api/admin/fulfillments/${id}/deliver`, { method: 'POST', body: JSON.stringify({ code }) }),
  cancelFulfillment: (id: string, reason = '') =>
    request(`/api/admin/fulfillments/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
};

export const pteBookingApi = {
  submit: (payload: unknown) => request('/api/pte-booking-requests', { method: 'POST', body: JSON.stringify(payload) }),
  mine: () => request('/api/pte-bookings/mine'),
};

export const voucherRequestApi = {
  // Customer: request a voucher that currently has zero available codes.
  submit: (productId: string) =>
    request('/api/voucher-requests', { method: 'POST', body: JSON.stringify({ productId }) }),
  // Customer: my own voucher requests.
  mine: () => request('/api/voucher-requests/mine'),
};

export const videoApi = {
  list: () => request('/api/reels'),
  get: (id: string) => request(`/api/reels/${id}`),
  incrementView: (id: string) => request(`/api/reels/${id}/view`, { method: 'POST' }),
};

export const reelApi = videoApi;

export const awardApi = {
  list: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/awards${qs ? `?${qs}` : ''}`);
  },
};

export const formatPrice = (amount: number | null | undefined, currency: 'INR' | 'USD' = 'INR'): string => {
  if (currency === 'USD') {
    const val = (Number(amount) / 83.5).toFixed(2);
    return `$${val}`;
  }
  if (amount == null) return '—';
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

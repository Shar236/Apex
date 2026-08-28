const TOKEN_KEY = 'apex.token';
const USER_KEY = 'apex.user';

export const apiBase = () => {
  if (typeof window !== 'undefined' && import.meta.env?.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '');
  }
  return '';
};

const storage = () => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
};

export const getToken = () => {
  try {
    return storage()?.getItem(TOKEN_KEY) || null;
  } catch {
    return null;
  }
};
export const setToken = (t) => {
  try {
    if (t) storage()?.setItem(TOKEN_KEY, t);
    else storage()?.removeItem(TOKEN_KEY);
  } catch {}
};
export const getStoredUser = () => {
  try {
    const raw = storage()?.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};
export const setStoredUser = (u) => {
  try {
    if (u) storage()?.setItem(USER_KEY, JSON.stringify(u));
    else storage()?.removeItem(USER_KEY);
  } catch {}
};
export const clearAuth = () => {
  try {
    storage()?.removeItem(TOKEN_KEY);
    storage()?.removeItem(USER_KEY);
  } catch {}
};

const parseJSON = async (resp) => {
  const text = await resp.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { success: false, message: text || 'Invalid server response' };
  }
};

export const request = async (url, options = {}) => {
  const base = apiBase();
  const fullUrl = url.startsWith('http') ? url : `${base}${url}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let resp;
  try {
    resp = await fetch(fullUrl, { ...options, headers });
  } catch (err) {
    return { success: false, message: `Network error: ${err.message}`, code: 'NETWORK' };
  }

  const data = await parseJSON(resp);
  if (!resp.ok || data.success === false) {
    return {
      success: false,
      message: data?.message || `Request failed (${resp.status})`,
      code: data?.code || String(resp.status),
      status: resp.status,
      data,
    };
  }
  return { success: true, data: data?.data ?? data, user: data?.user ?? data?.data, ...data };
};

export const setMetaTag = (name, content, attr = 'name') => {
  if (typeof document === 'undefined' || !content) return;
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export const setLinkTag = (rel, href) => {
  if (typeof document === 'undefined') return;
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

const jsonLdStore = { ids: new Set() };

export const setStructuredData = (id, jsonLd) => {
  if (typeof document === 'undefined') return;
  const scriptId = `ld-json-${id}`;
  let script = document.getElementById(scriptId);
  if (!jsonLd) {
    if (script) script.remove();
    jsonLdStore.ids.delete(scriptId);
    return;
  }
  if (!script) {
    script = document.createElement('script');
    script.setAttribute('type', 'application/ld+json');
    script.id = scriptId;
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(jsonLd);
  jsonLdStore.ids.add(scriptId);
};

export const applyPageMetadata = (options = {}) => {
  if (typeof document === 'undefined') return;
  const {
    title,
    description,
    canonical,
    ogTitle,
    ogDescription,
    ogImage,
    ogUrl,
    ogType = 'website',
    twitterTitle,
    twitterDescription,
    twitterImage,
    twitterCard = 'summary_large_image',
    noindex = false,
    nofollow = false,
  } = options;

  if (title) document.title = title;
  if (description) setMetaTag('description', description);
  if (canonical) setLinkTag('canonical', canonical);

  if (ogTitle) setMetaTag('og:title', ogTitle, 'property');
  if (ogDescription) setMetaTag('og:description', ogDescription, 'property');
  if (ogImage) setMetaTag('og:image', ogImage, 'property');
  if (ogUrl) setMetaTag('og:url', ogUrl, 'property');
  setMetaTag('og:type', ogType, 'property');

  if (twitterTitle) setMetaTag('twitter:title', twitterTitle);
  if (twitterDescription) setMetaTag('twitter:description', twitterDescription);
  if (twitterImage) setMetaTag('twitter:image', twitterImage);
  setMetaTag('twitter:card', twitterCard);

  const robots = [noindex ? 'noindex' : 'index', nofollow ? 'nofollow' : 'follow'].join(', ');
  setMetaTag('robots', robots);
};

export const authApi = {
  register: (data) => request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  verifyRegistrationOtp: (email, otp) =>
    request('/api/auth/register/verify-otp', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  resendRegistrationOtp: (email) =>
    request('/api/auth/register/resend-otp', { method: 'POST', body: JSON.stringify({ email }) }),
  login: (data) => request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  forgotPassword: (email) => request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  resetPassword: (token, password) => request('/api/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) }),
  me: () => request('/api/auth/me'),
};

export const productApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/products${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/api/products/${id}`),
  getWebsiteConfig: () => request('/api/products/website-config'),
  getPublicSEO: () => request('/api/seo/public'),
};

export const accountApi = {
  me: () => request('/api/account'),
  updateProfile: (data) => request('/api/account/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const token = getToken();
    try {
      const resp = await fetch(`${apiBase()}/api/account/profile/avatar`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await resp.json();
      if (!resp.ok || data.success === false) {
        return { success: false, message: data?.message || `Upload failed (${resp.status})` };
      }
      return { success: true, ...data };
    } catch (err) {
      return { success: false, message: `Network error: ${err.message}` };
    }
  },
  removeAvatar: () => request('/api/account/profile/avatar', { method: 'DELETE' }),
  sendEmailOtp: (newEmail) =>
    request('/api/account/email/send-otp', { method: 'POST', body: JSON.stringify({ newEmail }) }),
  verifyEmailOtp: (otp) =>
    request('/api/account/email/verify-otp', { method: 'POST', body: JSON.stringify({ otp }) }),
  updatePhone: (phone, phoneCountry, currentPassword) =>
    request('/api/account/phone', { method: 'PATCH', body: JSON.stringify({ phone, phoneCountry, currentPassword }) }),
  changePassword: (currentPassword, newPassword) =>
    request('/api/account/password/change', { method: 'POST', body: JSON.stringify({ currentPassword, newPassword }) }),
  logout: () => request('/api/account/logout', { method: 'POST' }),
  stats: () => request('/api/account/stats'),
  orders: () => request('/api/account/orders'),
  vouchers: () => request('/api/account/vouchers'),
  transferVoucher: (id, targetEmail) =>
    request(`/api/account/vouchers/${id}/transfer`, { method: 'PATCH', body: JSON.stringify({ targetEmail }) }),
  markUsed: (id) => request(`/api/account/vouchers/${id}/used`, { method: 'PATCH' }),
  validatePromo: (payload) =>
    request('/api/account/validate-promo', { method: 'POST', body: JSON.stringify(payload) }),
};

export const orderApi = {
  create: (payload) => request('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
  get: (id) => request(`/api/orders/${id}`),
  simulatePay: (id, payload = {}) =>
    request(`/api/orders/${id}/pay`, { method: 'POST', body: JSON.stringify(payload) }),
};

export const paymentApi = {
  createCashfreeOrder: (payload) =>
    request('/api/payments/cashfree/create-order', { method: 'POST', body: JSON.stringify(payload) }),
  getCashfreeStatus: (orderId, simulateSuccess = false) =>
    request(`/api/payments/cashfree/status/${orderId}${simulateSuccess ? '?simulateSuccess=true' : ''}`),
};

export const seoApi = {
  overview: () => request('/api/seo/overview'),
  analyzeInline: (payload) => request('/api/seo/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  analyzeProduct: (id) => request(`/api/seo/analyze/product/${id}`),
  updateProductSEO: (id, data) => request(`/api/seo/products/${id}/seo`, { method: 'PATCH', body: JSON.stringify(data) }),
  pages: () => request('/api/seo/pages'),
  getPage: (pageKey) => request(`/api/seo/pages/${pageKey}`),
  updatePage: (pageKey, data) => request(`/api/seo/pages/${pageKey}`, { method: 'PATCH', body: JSON.stringify(data) }),
  redirects: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/seo/redirects${qs ? `?${qs}` : ''}`);
  },
  createRedirect: (data) => request('/api/seo/redirects', { method: 'POST', body: JSON.stringify(data) }),
  updateRedirect: (id, data) => request(`/api/seo/redirects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRedirect: (id) => request(`/api/seo/redirects/${id}`, { method: 'DELETE' }),
  globalSettings: () => request('/api/seo/global-settings'),
  updateGlobalSettings: (data) => request('/api/seo/global-settings', { method: 'PATCH', body: JSON.stringify(data) }),
};

// Blog HTTP layer lives in src/blogs/lib/blogApi.js (the whole blog system is
// under src/blogs/). Import { blogApi, publicBlogApi } from there directly.

export const adminApi = {
  dashboard: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/dashboard${qs ? `?${qs}` : ''}`);
  },
  users: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/users${qs ? `?${qs}` : ''}`);
  },
  user: (id) => request(`/api/admin/users/${id}`),
  setUserStatus: (id, status) =>
    request(`/api/admin/users/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  products: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/products${qs ? `?${qs}` : ''}`);
  },
  getProduct: (id) => request(`/api/admin/products/${id}`),
  createProduct: (data) => request('/api/admin/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id, data) => request(`/api/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  quickUpdatePrice: (id, payload) => request(`/api/admin/products/${id}/price`, { method: 'PATCH', body: JSON.stringify(payload) }),
  quickUpdateStatus: (id, active) => request(`/api/admin/products/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  quickUpdateFeatured: (id, featured) => request(`/api/admin/products/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  deleteProduct: (id) => request(`/api/admin/products/${id}`, { method: 'DELETE' }),
  duplicateProduct: (id) => request(`/api/admin/products/${id}/duplicate`, { method: 'POST' }),
  archiveProduct: (id) => request(`/api/admin/products/${id}/archive`, { method: 'PATCH' }),
  restoreProduct: (id) => request(`/api/admin/products/${id}/restore`, { method: 'PATCH' }),
  reorderProducts: (items) => request('/api/admin/products/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  getProductInventory: (id) => request(`/api/admin/products/${id}/inventory`),
  uploadProductLogo: async (file) => {
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
  vouchers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/vouchers${qs ? `?${qs}` : ''}`);
  },
  voucherSummaryByProduct: () => request('/api/admin/vouchers/summary-by-product'),
  revealVoucherCode: (id) => request(`/api/admin/vouchers/${id}/reveal`),
  notifications: () => request('/api/admin/notifications'),
  addVouchers: (payload) => request('/api/admin/vouchers', { method: 'POST', body: JSON.stringify(payload) }),
  addVouchersBulk: (payload) => request('/api/admin/vouchers/bulk', { method: 'POST', body: JSON.stringify(payload) }),
  updateVoucher: (id, data) => request(`/api/admin/vouchers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  orders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/orders${qs ? `?${qs}` : ''}`);
  },
  order: (id) => request(`/api/admin/orders/${id}`),
  updateOrderStatus: (id, payload) =>
    request(`/api/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  resendOrderEmail: (id) => request(`/api/admin/orders/${id}/resend-email`, { method: 'POST' }),
  promotions: () => request('/api/admin/promotions'),
  createPromotion: (data) => request('/api/admin/promotions', { method: 'POST', body: JSON.stringify(data) }),
  updatePromotion: (id, data) => request(`/api/admin/promotions/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePromotion: (id) => request(`/api/admin/promotions/${id}`, { method: 'DELETE' }),
  campaigns: () => request('/api/admin/campaigns'),
  createCampaign: (data) => request('/api/admin/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  updateCampaign: (id, data) => request(`/api/admin/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCampaign: (id) => request(`/api/admin/campaigns/${id}`, { method: 'DELETE' }),
  toggleCampaign: (id) => request(`/api/admin/campaigns/${id}/toggle`, { method: 'POST' }),
  getWebsiteSettings: () => request('/api/admin/website-settings'),
  updateWebsiteSettings: (data) => request('/api/admin/website-settings', { method: 'PATCH', body: JSON.stringify(data) }),
  auditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/audit-logs${qs ? `?${qs}` : ''}`);
  },
  downloadExport: async (resource, unmasked = false, params = {}) => {
    const token = getToken();
    const queryParams = { ...params };
    if (unmasked) queryParams.unmasked = 'true';
    const qs = new URLSearchParams(queryParams).toString();
    const url = `${apiBase()}/api/admin/export/${resource}${qs ? `?${qs}` : ''}`;
    const resp = await fetch(url, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
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
  videos: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/reels${qs ? `?${qs}` : ''}`);
  },
  reels: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/reels${qs ? `?${qs}` : ''}`);
  },
  getVideo: (id) => request(`/api/admin/reels/${id}`),
  getReel: (id) => request(`/api/admin/reels/${id}`),
  createVideo: (data) => request('/api/admin/reels', { method: 'POST', body: JSON.stringify(data) }),
  createReel: (data) => request('/api/admin/reels', { method: 'POST', body: JSON.stringify(data) }),
  updateVideo: (id, data) => request(`/api/admin/reels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  updateReel: (id, data) => request(`/api/admin/reels/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  quickToggleFeaturedVideo: (id, featured) => request(`/api/admin/reels/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  quickToggleFeaturedReel: (id, featured) => request(`/api/admin/reels/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  quickTogglePublishVideo: (id, published) => request(`/api/admin/reels/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ published }) }),
  quickTogglePublishReel: (id, published) => request(`/api/admin/reels/${id}/publish`, { method: 'PATCH', body: JSON.stringify({ published }) }),
  quickUpdateOrder: (id, order) => request(`/api/admin/reels/${id}/order`, { method: 'PATCH', body: JSON.stringify({ order }) }),
  bulkReorderReels: (items) => request('/api/admin/reels/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  deleteVideo: (id) => request(`/api/admin/reels/${id}`, { method: 'DELETE' }),
  deleteReel: (id) => request(`/api/admin/reels/${id}`, { method: 'DELETE' }),
  updateVideoSettings: (data) => request('/api/admin/reels/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  updateReelSettings: (data) => request('/api/admin/reels/settings', { method: 'PATCH', body: JSON.stringify(data) }),
  uploadMedia: async (formData) => {
    const token = getToken();
    const resp = await fetch(`${apiBase()}/api/admin/reels/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return await resp.json();
  },
  awards: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/awards${qs ? `?${qs}` : ''}`);
  },
  getAward: (id) => request(`/api/admin/awards/${id}`),
  createAward: (data) => request('/api/admin/awards', { method: 'POST', body: JSON.stringify(data) }),
  updateAward: (id, data) => request(`/api/admin/awards/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  quickToggleFeaturedAward: (id, featured) =>
    request(`/api/admin/awards/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
  quickToggleStatusAward: (id, status) =>
    request(`/api/admin/awards/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  bulkReorderAwards: (items) => request('/api/admin/awards/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),
  deleteAward: (id) => request(`/api/admin/awards/${id}`, { method: 'DELETE' }),
  uploadAwardMedia: async (formData) => {
    const token = getToken();
    const resp = await fetch(`${apiBase()}/api/admin/awards/upload`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    return await resp.json();
  },
  seo: seoApi,
  blog: blogApi,
  pteBookings: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/pte-bookings${qs ? `?${qs}` : ''}`);
  },
  getPTEBooking: (id) => request(`/api/admin/pte-bookings/${id}`),
  updatePTEBooking: (id, data) => request(`/api/admin/pte-bookings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const pteBookingApi = {
  submit: (payload) => request('/api/pte-booking-requests', { method: 'POST', body: JSON.stringify(payload) }),
  mine: () => request('/api/pte-bookings/mine'),
};

export const videoApi = {
  list: () => request('/api/reels'),
  get: (id) => request(`/api/reels/${id}`),
  incrementView: (id) => request(`/api/reels/${id}/view`, { method: 'POST' }),
};

export const reelApi = videoApi;

export const awardApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/awards${qs ? `?${qs}` : ''}`);
  },
};

export const formatPrice = (amount, currency = 'INR') => {
  if (currency === 'USD') {
    const val = (amount / 83.5).toFixed(2);
    return `$${val}`;
  }
  if (amount == null) return '—';
  return `₹${Number(amount).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

import { request, apiBase, getToken } from '../../lib/api';

/**
 * Blog HTTP layer. Every blog network call the app makes lives here.
 *
 *   blogApi        → admin endpoints  (/api/admin/blogs/*)  — auth required
 *   publicBlogApi  → public endpoints (/api/blog/*)         — no auth
 *
 * Built on the shared `request` helper from lib/api.js (base URL, auth header,
 * JSON parsing, uniform `{ success, data, message }` shape).
 */

export const blogApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/admin/blogs${qs ? `?${qs}` : ''}`);
  },
  get: (id) => request(`/api/admin/blogs/${id}`),
  create: (data) => request('/api/admin/blogs', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/api/admin/blogs/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  trash: (id) => request(`/api/admin/blogs/${id}`, { method: 'DELETE' }),
  publish: (id) => request(`/api/admin/blogs/${id}/publish`, { method: 'POST' }),
  unpublish: (id) => request(`/api/admin/blogs/${id}/unpublish`, { method: 'POST' }),
  schedule: (id, scheduledAt) => request(`/api/admin/blogs/${id}/schedule`, { method: 'POST', body: JSON.stringify({ scheduledAt }) }),
  duplicate: (id) => request(`/api/admin/blogs/${id}/duplicate`, { method: 'POST' }),
  restore: (id) => request(`/api/admin/blogs/${id}/restore`, { method: 'POST' }),
  permanentDelete: (id) => request(`/api/admin/blogs/${id}/permanent`, { method: 'DELETE' }),
  revisions: (id) => request(`/api/admin/blogs/${id}/revisions`),
  restoreRevision: (id, revisionId) => request(`/api/admin/blogs/${id}/revisions/${revisionId}/restore`, { method: 'POST' }),
  preview: (id) => request(`/api/admin/blogs/${id}/preview`),
  analyzeSeo: (id) => request(`/api/admin/blogs/${id}/seo-analysis`),
  improveSeo: (id) => request(`/api/admin/blogs/${id}/improve-seo`, { method: 'POST' }),
  internalLinkSuggestions: (q, excludeId) => {
    const qs = new URLSearchParams({ q: q || '', ...(excludeId ? { excludeId } : {}) }).toString();
    return request(`/api/admin/blogs/internal-link-suggestions?${qs}`);
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = getToken();
    const resp = await fetch(`${apiBase()}/api/admin/blogs/upload-image`, {
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
};

export const publicBlogApi = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/blog${qs ? `?${qs}` : ''}`);
  },
  get: (slug) => request(`/api/blog/${slug}`),
  categories: () => request('/api/blog/categories'),
};

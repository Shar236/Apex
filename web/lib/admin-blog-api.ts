import { request, apiBase, getToken, type ApiResponse } from './api';
import type { BlogPost } from './blog-types';

/**
 * Admin Blog CMS client — talks ONLY to the existing Express endpoints under
 * /api/admin/blogs (all `protectAdmin`). No blog logic lives in Next.js.
 */

const BASE = '/api/admin/blogs';

export interface BlogSeoAnalysis {
  score: number;
  grade: string;
  checks?: { label: string; passed: boolean; weight?: number; detail?: string }[];
  recommendations?: { text: string; fix: string; priority: string }[];
  metrics?: Record<string, number | string>;
  safetyWarnings?: { level: string; message: string }[];
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
}

export const adminBlogApi = {
  list: (params: { search?: string; status?: string; category?: string; sort?: string } = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v) as [string, string][]).toString();
    return request<BlogPost[]>(`${BASE}${qs ? `?${qs}` : ''}`);
  },
  create: (payload: Partial<BlogPost>) => request<BlogPost>(BASE, { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: string, payload: Partial<BlogPost> & { __autosave?: boolean }) =>
    request<BlogPost>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  publish: (id: string) => request<BlogPost>(`${BASE}/${id}/publish`, { method: 'POST' }),
  unpublish: (id: string) => request<BlogPost>(`${BASE}/${id}/unpublish`, { method: 'POST' }),
  duplicate: (id: string) => request<BlogPost>(`${BASE}/${id}/duplicate`, { method: 'POST' }),
  trash: (id: string) => request<BlogPost>(`${BASE}/${id}`, { method: 'DELETE' }),
  restore: (id: string) => request<BlogPost>(`${BASE}/${id}/restore`, { method: 'POST' }),
  permanentDelete: (id: string) => request(`${BASE}/${id}/permanent`, { method: 'DELETE' }),

  preview: (id: string) =>
    request<BlogPost>(`${BASE}/${id}/preview`) as Promise<
      ApiResponse<BlogPost> & { relatedPosts?: BlogPost[]; structuredData?: unknown }
    >,
  seoAnalysis: (id: string) => request<BlogSeoAnalysis>(`${BASE}/${id}/seo-analysis`),

  uploadImage: async (file: File): Promise<ApiResponse<never> & UploadedImage> => {
    const fd = new FormData();
    fd.append('image', file);
    const token = getToken();
    try {
      const resp = await fetch(`${apiBase()}${BASE}/upload-image`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: fd,
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok || data.success === false) {
        return { success: false, message: data?.message || `Upload failed (${resp.status})` } as ApiResponse<never> & UploadedImage;
      }
      return { success: true, ...data };
    } catch (err) {
      return { success: false, message: `Network error: ${err instanceof Error ? err.message : String(err)}` } as ApiResponse<never> & UploadedImage;
    }
  },

  /** Ask Next.js to drop its cached copies of /blog and this article now. */
  revalidatePublic: async (slugs: string[] = []) => {
    const token = getToken();
    try {
      await fetch('/api/revalidate/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ slugs }),
      });
    } catch {
      /* non-fatal — the 5-minute ISR window still refreshes public pages */
    }
  },
};

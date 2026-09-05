'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Search as SearchIcon, Package, FileSpreadsheet, FileText, ArrowLeftRight, Settings2, Code2,
  ExternalLink, RefreshCw, Edit2, Plus, Trash2, Info, Save, AlertOctagon, AlertTriangle, LayoutDashboard, Search,
} from 'lucide-react';
import { seoApi, adminApi } from '@/lib/api';
import { StatCard, Pill, Th, Td, Empty, FormCard, Field, Label, TextArea, Check } from '@/components/admin/admin-ui';
import { notify } from '@/components/ui/toast';
import { useConfirm } from '@/components/ui/use-confirm';

interface SEOOverview {
  overallHealth?: { score?: number; grade?: string; analyzedCount?: number };
  counts?: { products?: number; pages?: number; blogPosts?: number; redirects?: number };
  gradeDistribution?: Record<string, number>;
  issuesCount?: number;
  warningsCount?: number;
  topIssues?: Array<{ text?: string } | string>;
  topWarnings?: Array<{ text?: string } | string>;
  duplicates?: { seoTitles?: Array<{ value: string; items?: unknown[] }>; metaDescriptions?: Array<{ value: string; items?: unknown[] }> };
  productScores?: Array<{ id?: string; _id?: string; name: string; slug?: string; active?: boolean; analysis?: { score?: number; grade?: string; gradeColor?: string; checks?: Array<{ key: string; status: string }> } }>;
}

interface SEOPage {
  pageKey: string;
  pageTitle?: string;
  routePath?: string;
  content?: string;
  seo?: { title?: string; description?: string; noindex?: boolean; nofollow?: boolean; focusKeyword?: string; canonicalUrl?: string; ogTitle?: string; ogImage?: string; ogDescription?: string };
}

interface RedirectRow {
  _id: string;
  sourcePath: string;
  targetPath: string;
  /** Number in the Redirect model (301 | 302) — compared via String() in the UI. */
  type: number | string;
  hits?: number;
  lastHitAt?: string;
  entityType?: string;
  enabled?: boolean;
}

function CharCounter({ value, idealMin, idealMax, max }: { value?: string; idealMin: number; idealMax: number; max: number }) {
  const len = (value || '').length;
  const color = len < idealMin ? 'text-amber-500' : len <= idealMax ? 'text-emerald-600' : len <= max ? 'text-sky-600' : 'text-rose-500';
  return <span className={`text-[10px] font-mono font-bold ${color}`}>{len} chars (ideal {idealMin}–{idealMax})</span>;
}

function GooglePreview({ title, description, url }: { title?: string; description?: string; url: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-[#EAEAEA] dark:bg-[#0E0E0E] dark:border-[#292929] space-y-1">
      <div className="text-[11px] text-[#1a0dab] dark:text-[#8ab4f8]">{url}</div>
      <div className="text-lg text-[#1a0dab] dark:text-[#8ab4f8] leading-tight font-medium">{title || 'Untitled'}</div>
      <div className="text-[12px] text-[#4d5156] dark:text-[#bdc1c6] leading-snug">{description || 'No meta description — add one for better search visibility.'}</div>
    </div>
  );
}

function SEOScoreBadge({ score, grade, gradeColor, size = 'md' }: { score: number; grade?: string; gradeColor?: string; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-xl font-black ${size === 'sm' ? 'w-11 h-8 text-[11px]' : 'w-14 h-10 text-sm'}`}
      style={{ background: `${gradeColor || '#10B981'}18`, color: gradeColor || '#10B981', border: `1px solid ${gradeColor || '#10B981'}44` }}
    >
      {score}/100{grade ? ` ${grade}` : ''}
    </span>
  );
}

export function SEOManager() {
  const confirm = useConfirm();
  const [subTab, setSubTab] = useState('overview');
  const [overviewData, setOverviewData] = useState<SEOOverview | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  const [pageRows, setPageRows] = useState<SEOPage[]>([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [editingPage, setEditingPage] = useState<SEOPage | null>(null);
  const [pageDraft, setPageDraft] = useState({ pageTitle: '', routePath: '', content: '', seo: {} as SEOPage['seo'] });

  const [redirectRows, setRedirectRows] = useState<RedirectRow[]>([]);
  const [redirectsLoading, setRedirectsLoading] = useState(false);
  const [redirectModalOpen, setRedirectModalOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<RedirectRow | null>(null);
  const [redirectDraft, setRedirectDraft] = useState({ sourcePath: '', targetPath: '', type: '301', enabled: true, notes: '' });
  const [redirectSearch, setRedirectSearch] = useState('');

  const [globalForm, setGlobalForm] = useState<Record<string, string>>({});
  const [globalLoading, setGlobalLoading] = useState(true);
  const [globalSaving, setGlobalSaving] = useState(false);

  const subTabs = [
    { id: 'overview', label: 'SEO Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'products', label: 'Products SEO', icon: <Package className="w-4 h-4" /> },
    { id: 'pages', label: 'Pages SEO', icon: <FileSpreadsheet className="w-4 h-4" /> },
    { id: 'redirects', label: 'Redirect Manager', icon: <ArrowLeftRight className="w-4 h-4" /> },
    { id: 'global', label: 'Global Settings', icon: <Settings2 className="w-4 h-4" /> },
    { id: 'sitemap', label: 'Sitemap & Robots', icon: <Code2 className="w-4 h-4" /> },
  ];

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    try {
      const res = await seoApi.overview();
      if (res?.success) setOverviewData(res.data as SEOOverview);
    } catch {
      setOverviewData(null);
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadPages = useCallback(async () => {
    setPagesLoading(true);
    try {
      const res = await seoApi.pages();
      if (res?.success) setPageRows((res.data as SEOPage[]) || []);
    } finally {
      setPagesLoading(false);
    }
  }, []);

  const loadRedirects = useCallback(async () => {
    setRedirectsLoading(true);
    try {
      const res = await seoApi.redirects(redirectSearch ? { search: redirectSearch } : {});
      if (res?.success) setRedirectRows((res.data as RedirectRow[]) || []);
    } finally {
      setRedirectsLoading(false);
    }
  }, [redirectSearch]);

  const loadGlobal = useCallback(async () => {
    setGlobalLoading(true);
    try {
      const res = await seoApi.globalSettings();
      if (res?.success) setGlobalForm((res.data as Record<string, string>) || {});
    } finally {
      setGlobalLoading(false);
    }
  }, []);

  useEffect(() => {
    if (subTab === 'overview') loadOverview();
    if (subTab === 'pages') loadPages();
    if (subTab === 'redirects') loadRedirects();
    if (subTab === 'global') loadGlobal();
  }, [subTab, loadOverview, loadPages, loadRedirects, loadGlobal]);

  useEffect(() => {
    if (subTab === 'redirects') {
      const t = setTimeout(loadRedirects, 250);
      return () => clearTimeout(t);
    }
  }, [redirectSearch, subTab, loadRedirects]);

  const startEditPage = async (row: SEOPage) => {
    try {
      const res = await seoApi.getPage(row.pageKey);
      if (res?.success) {
        const data = res.data as SEOPage;
        setEditingPage(data);
        setPageDraft({
          pageTitle: data?.pageTitle || row.pageTitle || '',
          routePath: data?.routePath || row.routePath || '',
          content: data?.content || '',
          seo: { ...(data?.seo || {}) },
        });
      }
    } catch {
      notify.error('Failed to load page SEO');
    }
  };

  const savePageSEO = async () => {
    try {
      const res = await seoApi.updatePage(editingPage!.pageKey, pageDraft);
      if (res?.success) {
        notify.success('Page SEO saved!');
        setEditingPage(null);
        loadPages();
      } else notify.error((res?.message as string) || 'Failed');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const startEditRedirect = (r: RedirectRow | null = null) => {
    setEditingRedirect(r);
    setRedirectDraft({
      sourcePath: r?.sourcePath || '',
      targetPath: r?.targetPath || '',
      type: String(r?.type || '301'),
      enabled: r?.enabled !== false,
      notes: '',
    });
    setRedirectModalOpen(true);
  };

  const saveRedirect = async () => {
    try {
      let res;
      if (editingRedirect?._id) res = await seoApi.updateRedirect(editingRedirect._id, redirectDraft);
      else res = await seoApi.createRedirect(redirectDraft);
      if (res?.success) {
        setRedirectModalOpen(false);
        setEditingRedirect(null);
        loadRedirects();
        notify.success('Redirect saved');
      } else notify.error((res?.message as string) || 'Failed');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const deleteRedirect = async (r: RedirectRow) => {
    if (!(await confirm({ title: `Delete redirect from ${r.sourcePath}?` }))) return;
    try {
      const res = await seoApi.deleteRedirect(r._id);
      if (res?.success) loadRedirects();
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed');
    }
  };

  const saveGlobal = async () => {
    setGlobalSaving(true);
    try {
      const res = await seoApi.updateGlobalSettings(globalForm);
      if (res?.success) {
        notify.success('Global SEO settings saved!');
        loadGlobal();
      } else notify.error((res?.message as string) || 'Failed');
    } catch (err) {
      notify.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setGlobalSaving(false);
    }
  };

  const gradeBar = (g: string) => overviewData?.gradeDistribution?.[g] || 0;
  const total = overviewData?.overallHealth?.analyzedCount || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6C3CE0]/10 text-[#6C3CE0] font-black text-[11px] border border-[#6C3CE0]/20 mb-2">
            <SearchIcon className="w-3.5 h-3.5" /> SEO MANAGER
          </span>
          <h1 className="font-heading font-black text-2xl sm:text-3xl tracking-tight">Search Visibility Control Center</h1>
          <p className="text-xs font-bold text-neutral-500 dark:text-[#B5B5B5]">Configure product/page SEO, structured data, redirects, global defaults, sitemap and robots.txt.</p>
        </div>
        <div className="flex items-center gap-2">
          <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-[11px] inline-flex items-center gap-1.5 hover:border-[#6C3CE0] hover:text-[#6C3CE0]">
            <ExternalLink className="w-3.5 h-3.5" /> sitemap.xml
          </a>
          <a href="/robots.txt" target="_blank" rel="noreferrer" className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-[11px] inline-flex items-center gap-1.5 hover:border-[#6C3CE0] hover:text-[#6C3CE0]">
            <ExternalLink className="w-3.5 h-3.5" /> robots.txt
          </a>
          <button onClick={loadOverview} className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] font-black text-[11px] inline-flex items-center gap-1.5 hover:border-brand-pink">
            <RefreshCw className={`w-4 h-4 ${loadingOverview ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto gap-1 p-1.5 bg-white dark:bg-[#161616] rounded-2xl border border-[#EAEAEA] dark:border-[#292929]">
        {subTabs.map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)} className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[11px] font-black whitespace-nowrap transition cursor-pointer ${subTab === t.id ? 'bg-brand-pink text-white shadow-sm' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#262626]'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <StatCard label="Overall SEO Health" value={`${overviewData?.overallHealth?.score ?? 0}/100`} icon={<SearchIcon className="w-4 h-4" />} tint="#6C3CE0" sub={`Grade: ${overviewData?.overallHealth?.grade || '—'}`} />
            <StatCard label="Analyzed Products" value={overviewData?.counts?.products || 0} icon={<Package className="w-4 h-4" />} tint="#10B981" />
            <StatCard label="SEO Pages" value={overviewData?.counts?.pages || 0} icon={<FileSpreadsheet className="w-4 h-4" />} tint="#0EA5E9" />
            <StatCard label="Blog Posts" value={overviewData?.counts?.blogPosts || 0} icon={<FileText className="w-4 h-4" />} tint="#F59E0B" />
            <StatCard label="Active Redirects" value={overviewData?.counts?.redirects || 0} icon={<ArrowLeftRight className="w-4 h-4" />} tint="#EC4899" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-5">
              <div>
                <h3 className="font-black text-sm mb-3">Grade Distribution</h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'Excellent', min: 90, tint: '#10B981', count: gradeBar('Excellent') },
                    { name: 'Good', min: 75, tint: '#34D399', count: gradeBar('Good') },
                    { name: 'Okay', min: 60, tint: '#0EA5E9', count: gradeBar('Okay') },
                    { name: 'Needs Improvement', min: 40, tint: '#F59E0B', count: gradeBar('Needs Improvement') },
                    { name: 'Poor', min: 0, tint: '#EF4444', count: gradeBar('Poor') },
                  ].map((row) => {
                    const pct = Math.min(100, Math.round((row.count / total) * 100));
                    return (
                      <div key={row.name} className="flex items-center gap-3">
                        <span className="text-[10px] font-black w-40 shrink-0">{row.name} ({row.min}+)</span>
                        <div className="flex-1 h-4 rounded-full bg-neutral-100 dark:bg-[#262626] overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: row.tint }} />
                        </div>
                        <span className="text-[10px] font-mono font-bold w-10 text-right text-neutral-500">{row.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#EAEAEA] dark:border-[#292929]">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Issues ({overviewData?.issuesCount || 0})</h4>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(overviewData?.topIssues || []).slice(0, 25).map((it, i) => {
                      const text = typeof it === 'string' ? it : it.text || '';
                      return (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40">
                          <AlertOctagon className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                          <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug flex-1">{text}</div>
                        </div>
                      );
                    })}
                    {!overviewData?.topIssues?.length && <div className="text-[10px] font-bold text-emerald-600">✓ No critical issues detected.</div>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-black text-xs uppercase tracking-wider text-amber-600 dark:text-amber-400">Warnings ({overviewData?.warningsCount || 0})</h4>
                  </div>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {(overviewData?.topWarnings || []).slice(0, 25).map((it, i) => {
                      const text = typeof it === 'string' ? it : it.text || '';
                      return (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                          <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300 leading-snug flex-1">{text}</div>
                        </div>
                      );
                    })}
                    {!overviewData?.topWarnings?.length && <div className="text-[10px] font-bold text-neutral-400">No warnings.</div>}
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-3xl p-5 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-4">
              <h3 className="font-black text-sm">Duplicate Detection</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Duplicate SEO Titles</span>
                    <span className={`text-[10px] font-black ${(overviewData?.duplicates?.seoTitles?.length || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{overviewData?.duplicates?.seoTitles?.length || 0} groups</span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {(overviewData?.duplicates?.seoTitles || []).map((g, i) => (
                      <div key={i} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug">
                        <span className="font-mono line-clamp-1">{g.value}</span>
                        <div className="text-[9px] opacity-70 mt-0.5">{g.items?.length || 0} items</div>
                      </div>
                    ))}
                    {!overviewData?.duplicates?.seoTitles?.length && <div className="text-[10px] font-bold text-emerald-600">✓ All unique</div>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Duplicate Meta Descriptions</span>
                    <span className={`text-[10px] font-black ${(overviewData?.duplicates?.metaDescriptions?.length || 0) > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{overviewData?.duplicates?.metaDescriptions?.length || 0} groups</span>
                  </div>
                  <div className="space-y-1.5 max-h-28 overflow-y-auto">
                    {(overviewData?.duplicates?.metaDescriptions || []).map((g, i) => (
                      <div key={i} className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-[10px] font-bold text-rose-700 dark:text-rose-300 leading-snug">
                        <span className="font-mono line-clamp-2">{g.value}</span>
                        <div className="text-[9px] opacity-70 mt-0.5">{g.items?.length || 0} items</div>
                      </div>
                    ))}
                    {!overviewData?.duplicates?.metaDescriptions?.length && <div className="text-[10px] font-bold text-emerald-600">✓ All unique</div>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {subTab === 'products' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
                  <tr>
                    <Th>Product</Th>
                    <Th>Slug</Th>
                    <Th className="text-center">Apex SEO Score</Th>
                    <Th className="text-center">Indexable</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {loadingOverview && Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>
                  ))}
                  {!loadingOverview && (overviewData?.productScores || []).map((ps) => {
                    const a = ps.analysis || {};
                    const colorMap: Record<string, string> = { green: '#10B981', yellow: '#F59E0B', red: '#EF4444' };
                    const editProductSEO = async () => {
                      const id = ps.id || ps._id;
                      if (!id) return;
                      const res = await adminApi.getProduct(id);
                      if (!res.success) return;
                      const p = res.data as { _id: string; name: string; slug?: string; seo?: Record<string, unknown> };
                      // The seo subdocument stores title/description (Product.js seoSchema);
                      // reading seoTitle/seoDescription here always prefilled blanks.
                      const payload = {
                        seoTitle: (p.seo?.title as string) || undefined,
                        seoDescription: (p.seo?.description as string) || undefined,
                        ogImage: p.seo?.ogImage as string | undefined,
                      };
                      const title = prompt('SEO Title (leave empty to clear):', payload.seoTitle || '') ?? null;
                      if (title === null) return;
                      const description = prompt('Meta Description (leave empty to clear):', payload.seoDescription || '') ?? null;
                      if (description === null) return;
                      const ogImage = prompt('OG Image URL (leave empty to clear):', payload.ogImage || '') ?? null;
                      if (ogImage === null) return;
                      const res2 = await seoApi.updateProductSEO(id, {
                        seo: {
                          title: title || undefined,
                          description: description || undefined,
                          ogImage: ogImage || undefined,
                        },
                      });
                      if (res2?.success) {
                        notify.success('Product SEO saved!');
                        loadOverview();
                      } else notify.error((res2?.message as string) || 'Failed to save');
                    };
                    return (
                      <tr key={ps.id || ps._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center font-black text-[9px] text-brand-pink">APX</div>
                            <div>
                              <div className="font-black text-sm">{ps.name}</div>
                              <div className="text-[10px] font-bold text-neutral-400">{ps.slug}</div>
                            </div>
                          </div>
                        </Td>
                        <Td><span className="font-mono text-[10px]">{ps.slug}</span></Td>
                        <Td className="text-center">
                          <div className="flex justify-center"><SEOScoreBadge score={a.score || 0} grade={a.grade} gradeColor={colorMap[a.gradeColor || ''] || a.gradeColor || '#10B981'} size="sm" /></div>
                        </Td>
                        <Td className="text-center whitespace-nowrap">{ps.active ? <Pill text="INDEXABLE" tint="emerald" /> : <Pill text="INACTIVE" tint="neutral" />}</Td>
                        <Td className="text-right whitespace-nowrap">
                          <button onClick={editProductSEO} className="px-3 py-1.5 rounded-xl bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20 font-black text-[10px] inline-flex items-center gap-1 hover:bg-[#6C3CE0] hover:text-white transition cursor-pointer">
                            <Edit2 className="w-3 h-3" /> Edit SEO
                          </button>
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!loadingOverview && !(overviewData?.productScores?.length) && <Empty title="No products analyzed yet" desc="Add products in Products & Pricing tab, then come back to configure SEO." />}
          </div>
        </div>
      )}

      {subTab === 'pages' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
                  <tr>
                    <Th>Page</Th>
                    <Th>Route</Th>
                    <Th>SEO Title</Th>
                    <Th>Meta Description</Th>
                    <Th className="text-center">Indexable</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {pagesLoading && Array.from({ length: 5 }).map((_, i) => <tr key={i}><td colSpan={6} className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>)}
                  {!pagesLoading && pageRows.map((p) => (
                    <tr key={p.pageKey} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                      <Td>
                        <div className="font-black text-sm capitalize">{p.pageTitle || p.pageKey}</div>
                        <div className="text-[10px] font-bold text-neutral-400 font-mono">{p.pageKey}</div>
                      </Td>
                      <Td><span className="font-mono text-[10px]">{p.routePath || '/'}</span></Td>
                      <Td className="max-w-sm"><div className="line-clamp-2 text-[11px] leading-snug">{p.seo?.title || <span className="text-neutral-400 italic">not set</span>}</div></Td>
                      <Td className="max-w-sm"><div className="line-clamp-2 text-[11px] leading-snug text-neutral-500">{p.seo?.description || <span className="text-neutral-400 italic">not set</span>}</div></Td>
                      <Td className="text-center whitespace-nowrap">{p.seo?.noindex ? <Pill text="NOINDEX" tint="rose" /> : <Pill text="INDEXABLE" tint="emerald" />}</Td>
                      <Td className="text-right whitespace-nowrap">
                        <button onClick={() => startEditPage(p)} className="px-3 py-1.5 rounded-xl bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20 font-black text-[10px] inline-flex items-center gap-1 hover:bg-[#6C3CE0] hover:text-white transition cursor-pointer">
                          <Edit2 className="w-3 h-3" /> Edit SEO
                        </button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!pagesLoading && pageRows.length === 0 && <Empty title="No page SEO entries" />}
          </div>

          {editingPage && (
            <FormCard title={`Edit Page SEO — ${editingPage.pageTitle || editingPage.pageKey}`} onClose={() => setEditingPage(null)} onSave={savePageSEO}>
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Route Path" value={pageDraft.routePath} onChange={(v) => setPageDraft({ ...pageDraft, routePath: v })} placeholder="/about" />
                  <Field label="Page Display Title" value={pageDraft.pageTitle} onChange={(v) => setPageDraft({ ...pageDraft, pageTitle: v })} placeholder="About Apex Vouchers" />
                </div>
                <div>
                  <Label>SEO Title</Label>
                  <input value={pageDraft.seo?.title || ''} onChange={(e) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, title: e.target.value } })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
                  <CharCounter value={pageDraft.seo?.title} idealMin={30} idealMax={60} max={100} />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <textarea rows={3} value={pageDraft.seo?.description || ''} onChange={(e) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, description: e.target.value } })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink" />
                  <CharCounter value={pageDraft.seo?.description} idealMin={80} idealMax={160} max={250} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Focus Keyword" value={pageDraft.seo?.focusKeyword || ''} onChange={(v) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, focusKeyword: v } })} />
                  <Field label="Canonical URL (optional)" value={pageDraft.seo?.canonicalUrl || ''} onChange={(v) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, canonicalUrl: v } })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="OG Title" value={pageDraft.seo?.ogTitle || ''} onChange={(v) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, ogTitle: v } })} />
                  <Field label="OG Image URL" value={pageDraft.seo?.ogImage || ''} onChange={(v) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, ogImage: v } })} />
                </div>
                <TextArea label="OG Description" value={pageDraft.seo?.ogDescription || ''} onChange={(v) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, ogDescription: v } })} rows={2} />
                <div className="flex flex-wrap gap-3 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40">
                  <Check label="Noindex" checked={!!pageDraft.seo?.noindex} onChange={(v) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, noindex: v } })} />
                  <Check label="Nofollow" checked={!!pageDraft.seo?.nofollow} onChange={(v) => setPageDraft({ ...pageDraft, seo: { ...pageDraft.seo, nofollow: v } })} />
                </div>
                <div>
                  <h4 className="font-black text-xs uppercase tracking-wider text-neutral-500 mb-3">Preview</h4>
                  <GooglePreview title={pageDraft.seo?.title || editingPage.pageTitle} description={pageDraft.seo?.description} url={`https://apexvouchers.com${pageDraft.routePath || '/'}`} />
                </div>
              </div>
            </FormCard>
          )}
        </div>
      )}

      {subTab === 'redirects' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400" />
              <input value={redirectSearch} onChange={(e) => setRedirectSearch(e.target.value)} placeholder="Search source / target path..." className="bg-transparent outline-none text-xs font-bold w-full text-neutral-900 dark:text-white" />
            </div>
            <button onClick={() => startEditRedirect()} className="px-5 py-2.5 rounded-2xl btn-pink text-white font-black text-xs shadow-lg inline-flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> Add Redirect
            </button>
          </div>
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-bold">
                <thead className="bg-neutral-50 dark:bg-[#0E0E0E] text-neutral-500">
                  <tr>
                    <Th>Source Path</Th>
                    <Th>Target Path</Th>
                    <Th className="text-center">Type</Th>
                    <Th className="text-center">Hits</Th>
                    <Th className="text-center">Origin</Th>
                    <Th className="text-center">Status</Th>
                    <Th className="text-right">Actions</Th>
                  </tr>
                </thead>
                <tbody>
                  {redirectsLoading && Array.from({ length: 4 }).map((_, i) => <tr key={i}><td colSpan={7} className="p-4"><div className="h-10 bg-neutral-100 dark:bg-[#292929] rounded-xl animate-pulse" /></td></tr>)}
                  {!redirectsLoading && redirectRows.map((r) => (
                    <tr key={r._id} className="border-t border-[#EAEAEA] dark:border-[#292929] hover:bg-neutral-50/50 dark:hover:bg-[#111111]">
                      <Td><span className="font-mono text-[11px]">{r.sourcePath}</span></Td>
                      <Td><span className="font-mono text-[11px]">{r.targetPath}</span></Td>
                      <Td className="text-center whitespace-nowrap">
                        {/* type is a Number in the Redirect model — string comparison labeled every 301 as Temporary */}
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${String(r.type) === '301' ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300' : 'bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300'}`}>{r.type} {String(r.type) === '301' ? '(Permanent)' : '(Temporary)'}</span>
                      </Td>
                      <Td className="text-center tabular-nums">{r.hits || 0}</Td>
                      <Td className="text-center whitespace-nowrap">
                        {r.entityType === 'auto' ? <span className="inline-block px-2 py-0.5 rounded bg-[#6C3CE0]/10 text-[#6C3CE0] border border-[#6C3CE0]/20 text-[10px] font-black">AUTO</span> : <span className="text-[10px] text-neutral-500">MANUAL</span>}
                      </Td>
                      <Td className="text-center whitespace-nowrap">{r.enabled ? <Pill text="ACTIVE" tint="emerald" /> : <Pill text="DISABLED" tint="neutral" />}</Td>
                      <Td className="text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5 justify-end">
                          <button onClick={() => startEditRedirect(r)} className="px-2.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border border-sky-200 text-[10px] font-black inline-flex items-center gap-1 cursor-pointer">
                            <Edit2 className="w-3 h-3" /> Edit
                          </button>
                          <button onClick={() => deleteRedirect(r)} className="p-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!redirectsLoading && redirectRows.length === 0 && <Empty title="No redirects yet" desc="Redirects are auto-created when you change a product URL slug. Add manual redirects here for legacy URLs." />}
          </div>

          {redirectModalOpen && (
            <FormCard title={editingRedirect?._id ? 'Edit Redirect' : 'Add Redirect'} onClose={() => { setRedirectModalOpen(false); setEditingRedirect(null); }} onSave={saveRedirect}>
              <div className="space-y-5">
                <div className="p-3 rounded-xl bg-[#6C3CE0]/10 dark:bg-[#1e1638] border border-[#6C3CE0]/20 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#6C3CE0] shrink-0 mt-0.5" />
                  <div className="text-[10px] font-bold text-[#6C3CE0] dark:text-[#8B5CF6] leading-snug">
                    Enter paths only, no domain. Source must be unique. Example: <span className="font-mono bg-white dark:bg-[#161616] px-1.5 py-0.5 rounded">/old-page</span> → <span className="font-mono bg-white dark:bg-[#161616] px-1.5 py-0.5 rounded">/new-page</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Source Path (from) *" value={redirectDraft.sourcePath} onChange={(v) => setRedirectDraft({ ...redirectDraft, sourcePath: v.startsWith('/') ? v : '/' + v })} placeholder="/old-slug" />
                  <Field label="Target Path (to) *" value={redirectDraft.targetPath} onChange={(v) => setRedirectDraft({ ...redirectDraft, targetPath: v.startsWith('/') || v.startsWith('http') ? v : '/' + v })} placeholder="/new-slug or https://..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Redirect Type</Label>
                    <select value={redirectDraft.type} onChange={(e) => setRedirectDraft({ ...redirectDraft, type: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink">
                      <option value="301">301 — Permanent (SEO friendly)</option>
                      <option value="302">302 — Temporary</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6 gap-3">
                    <Check label="Enabled" checked={!!redirectDraft.enabled} onChange={(v) => setRedirectDraft({ ...redirectDraft, enabled: v })} />
                  </div>
                </div>
                <TextArea label="Notes (optional, admin-only)" value={redirectDraft.notes} onChange={(v) => setRedirectDraft({ ...redirectDraft, notes: v })} rows={2} />
              </div>
            </FormCard>
          )}
        </div>
      )}

      {subTab === 'global' && (
        <div className="space-y-5">
          <div className="rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-black text-lg mb-1">Global SEO Defaults</h3>
                <p className="text-[11px] font-bold text-neutral-500 max-w-xl">Used as safe fallbacks when individual products/pages don&apos;t have custom SEO metadata.</p>
              </div>
              <button onClick={saveGlobal} disabled={globalSaving || globalLoading} className="px-5 py-2.5 rounded-2xl btn-pink text-white font-black text-xs shadow-lg inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer">
                <Save className="w-4 h-4" /> {globalSaving ? 'Saving…' : 'Save Global SEO'}
              </button>
            </div>
            {globalLoading ? <div className="h-96 rounded-2xl bg-neutral-100 dark:bg-[#262626] animate-pulse" /> : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="space-y-4">
                  <Field label="Website Name" value={globalForm.websiteName || ''} onChange={(v) => setGlobalForm({ ...globalForm, websiteName: v })} placeholder="Apex Vouchers" />
                  <Field label="Default SEO Title" value={globalForm.defaultSeoTitle || ''} onChange={(v) => setGlobalForm({ ...globalForm, defaultSeoTitle: v })} placeholder="Exam Vouchers at Best Prices | Apex Vouchers" />
                  <TextArea label="Default Meta Description" value={globalForm.defaultMetaDescription || ''} onChange={(v) => setGlobalForm({ ...globalForm, defaultMetaDescription: v })} rows={3} />
                  <Field label="Website URL (Canonical Base)" value={globalForm.websiteUrl || ''} onChange={(v) => setGlobalForm({ ...globalForm, websiteUrl: v })} placeholder="https://apexvouchers.com" />
                </div>
                <div className="space-y-4">
                  <Field label="Default OG Image URL (1200×630)" value={globalForm.defaultOgImage || ''} onChange={(v) => setGlobalForm({ ...globalForm, defaultOgImage: v })} placeholder="https://..." />
                  <Field label="Default Social Sharing Image" value={globalForm.defaultSocialImage || ''} onChange={(v) => setGlobalForm({ ...globalForm, defaultSocialImage: v })} />
                  <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]" />
                  <Field label="Organization / Brand Name" value={globalForm.organizationName || ''} onChange={(v) => setGlobalForm({ ...globalForm, organizationName: v })} placeholder="Apex Vouchers" />
                  <Field label="Organization Logo URL" value={globalForm.organizationLogo || ''} onChange={(v) => setGlobalForm({ ...globalForm, organizationLogo: v })} placeholder="https://.../logo.png" />
                  <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#292929]" />
                  <Field label="Google Search Console (Verification Meta content)" value={globalForm.gscVerificationCode || ''} onChange={(v) => setGlobalForm({ ...globalForm, gscVerificationCode: v })} placeholder="google-site-verification value" />
                  <Field label="Google Analytics 4 Measurement ID" value={globalForm.gaMeasurementId || ''} onChange={(v) => setGlobalForm({ ...globalForm, gaMeasurementId: v })} placeholder="G-XXXXXXXXXX" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {subTab === 'sitemap' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981]"><Code2 className="w-5 h-5" /></div>
                <div>
                  <h3 className="font-black text-sm">Dynamic sitemap.xml</h3>
                  <p className="text-[11px] font-bold text-neutral-500">Live-generated. Auto-includes products, pages, blog posts.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] font-mono text-[10px] break-all"><span className="text-emerald-600 dark:text-emerald-400">GET</span> /sitemap.xml — content-type: application/xml</div>
              <ul className="space-y-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2"><Pill text="✓" tint="emerald" /> Static routes (homepage, how-it-works, etc.)</li>
                <li className="flex items-center gap-2"><Pill text="✓" tint="emerald" /> Active products: /exam-vouchers/{'{slug}'}</li>
                <li className="flex items-center gap-2"><Pill text="✓" tint="emerald" /> Pages SEO entries</li>
                <li className="flex items-center gap-2"><Pill text="✓" tint="emerald" /> Published blog posts</li>
                <li className="flex items-center gap-2"><Pill text="✓" tint="emerald" /> Respects noindex flags</li>
              </ul>
              <a href="/sitemap.xml" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10B981] text-white font-black text-xs hover:brightness-110 transition">
                <ExternalLink className="w-3.5 h-3.5" /> Open sitemap.xml
              </a>
            </div>
            <div className="rounded-3xl p-6 bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center text-[#0EA5E9]"><ShieldCheckIcon /></div>
                <div>
                  <h3 className="font-black text-sm">robots.txt</h3>
                  <p className="text-[11px] font-bold text-neutral-500">Rules for search engine crawlers. Sitemap URL included.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] font-mono text-[10px] break-all"><span className="text-sky-600 dark:text-sky-400">GET</span> /robots.txt — content-type: text/plain</div>
              <ul className="space-y-1.5 text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                <li className="flex items-center gap-2"><Pill text="✓" tint="emerald" /> Allow: / (public content)</li>
                <li className="flex items-center gap-2"><Pill text="✕" tint="rose" /> Disallow: /admin</li>
                <li className="flex items-center gap-2"><Pill text="✕" tint="rose" /> Disallow: /account</li>
                <li className="flex items-center gap-2"><Pill text="✕" tint="rose" /> Disallow: /checkout</li>
                <li className="flex items-center gap-2"><Pill text="✕" tint="rose" /> Disallow: /payment</li>
                <li className="flex items-center gap-2"><Pill text="✓" tint="emerald" /> Sitemap reference included</li>
              </ul>
              <a href="/robots.txt" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0EA5E9] text-white font-black text-xs hover:brightness-110 transition">
                <ExternalLink className="w-3.5 h-3.5" /> Open robots.txt
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ShieldCheckIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

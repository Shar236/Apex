'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft, Save, Send, EyeOff, Eye, Trash2, Loader2, Plus, X,
  Upload, Sparkles, ChevronDown, AlertTriangle,
} from 'lucide-react';
import { adminBlogApi, type BlogSeoAnalysis } from '@/lib/admin-blog-api';
import { Field, Label, TextArea, Check } from '@/components/admin/admin-ui';
import { BlogRichEditor } from '@/components/admin/blog-rich-editor';
import type { BlogPost, BlogFaq } from '@/lib/blog-types';
import { useConfirm } from '@/components/ui/use-confirm';

const CATEGORIES = ['Exam Guide', 'PTE', 'IELTS', 'TOEFL', 'Duolingo', 'GRE', 'Study Abroad', 'Visa & Immigration', 'News'];

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');

type Draft = Omit<Partial<BlogPost>, 'faqs' | 'tags' | 'relatedPosts'> & { faqs: BlogFaq[]; tags: string[]; relatedPosts: string[] };

const toDraft = (p?: BlogPost | null): Draft => ({
  _id: p?._id,
  title: p?.title || '',
  slug: p?.slug || '',
  excerpt: p?.excerpt || '',
  content: p?.content || '',
  category: p?.category || 'Exam Guide',
  author: p?.author || 'Apex Vouchers',
  authorBio: p?.authorBio || '',
  reviewer: p?.reviewer || '',
  coverImage: p?.coverImage || '',
  coverImagePublicId: (p as { coverImagePublicId?: string })?.coverImagePublicId || '',
  coverImageAlt: p?.coverImageAlt || '',
  coverImageCaption: p?.coverImageCaption || '',
  featured: !!p?.featured,
  contentSource: p?.contentSource || 'cms',
  tags: p?.tags || [],
  faqs: (p?.faqs || []).map((f) => ({ question: f.question, answer: f.answer })),
  relatedPosts: ((p?.relatedPosts as unknown as string[]) || []).map((r) => (typeof r === 'string' ? r : (r as { _id: string })._id)),
  seo: {
    title: p?.seo?.title || '',
    description: p?.seo?.description || '',
    focusKeyword: (p?.seo as { focusKeyword?: string })?.focusKeyword || '',
    canonicalUrl: p?.seo?.canonicalUrl || '',
    ogTitle: p?.seo?.ogTitle || '',
    ogDescription: p?.seo?.ogDescription || '',
    ogImage: p?.seo?.ogImage || '',
    noindex: !!p?.seo?.noindex,
    nofollow: !!p?.seo?.nofollow,
  },
});

function Section({ title, children, defaultOpen = true, badge }: { title: string; children: React.ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-3xl border border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#161616] overflow-hidden">
      <button type="button" onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between px-5 py-4">
        <span className="font-black text-sm flex items-center gap-2">
          {title}
          {badge ? <span className="px-2 py-0.5 rounded-full bg-brand-pink/10 text-brand-pink text-[10px] font-black">{badge}</span> : null}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? <div className="px-5 pb-5 space-y-4">{children}</div> : null}
    </div>
  );
}

export function BlogEditor({ post, onClose, onSaved }: { post: BlogPost | null; onClose: () => void; onSaved: () => void }) {
  const confirm = useConfirm();
  const [draft, setDraft] = useState<Draft>(() => toDraft(post));
  const [id, setId] = useState<string | undefined>(post?._id);
  const [status, setStatus] = useState<string>(post?.status || 'draft');
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [seo, setSeo] = useState<BlogSeoAnalysis | null>(null);
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [tagInput, setTagInput] = useState('');
  const slugTouched = useRef(!!post?.slug);
  const coverRef = useRef<HTMLInputElement | null>(null);

  const isCode = draft.contentSource === 'code';

  useEffect(() => {
    adminBlogApi.list({ sort: '-createdAt' }).then((r) => setAllPosts((r.data as BlogPost[]) || []));
  }, []);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setSeoField = (k: string, v: unknown) => setDraft((d) => ({ ...d, seo: { ...d.seo, [k]: v } }));

  useEffect(() => {
    if (!slugTouched.current) set('slug', slugify(draft.title || ''));
  }, [draft.title]);

  const flash = (kind: 'ok' | 'err', text: string) => {
    setMsg({ kind, text });
    window.setTimeout(() => setMsg(null), 4000);
  };

  const payload = useCallback((): Partial<BlogPost> => ({
    title: draft.title,
    slug: draft.slug,
    excerpt: draft.excerpt,
    content: draft.content,
    category: draft.category,
    author: draft.author,
    authorBio: draft.authorBio,
    reviewer: draft.reviewer,
    coverImage: draft.coverImage,
    coverImagePublicId: draft.coverImagePublicId as string,
    coverImageAlt: draft.coverImageAlt,
    coverImageCaption: draft.coverImageCaption,
    featured: draft.featured,
    contentSource: draft.contentSource,
    tags: draft.tags,
    faqs: draft.faqs.filter((f) => f.question.trim() && f.answer.trim()),
    relatedPosts: draft.relatedPosts,
    seo: draft.seo,
  }), [draft]);

  const persist = useCallback(async (): Promise<string | null> => {
    if (!draft.title?.trim()) {
      flash('err', 'A title is required.');
      return null;
    }
    if (id) {
      const r = await adminBlogApi.update(id, payload());
      if (!r.success) {
        flash('err', r.message || 'Save failed');
        return null;
      }
      return id;
    }
    const r = await adminBlogApi.create(payload());
    if (!r.success || !r.data?._id) {
      flash('err', r.message || 'Create failed');
      return null;
    }
    setId(r.data._id);
    setStatus(r.data.status || 'draft');
    return r.data._id;
  }, [draft.title, id, payload]);

  const doSave = async () => {
    setBusy('save');
    const savedId = await persist();
    setBusy(null);
    if (savedId) {
      flash('ok', 'Saved.');
      onSaved();
      if (status === 'published') adminBlogApi.revalidatePublic([draft.slug || '']);
    }
  };

  const doPublish = async () => {
    setBusy('publish');
    const savedId = await persist();
    if (!savedId) return setBusy(null);
    const r = await adminBlogApi.publish(savedId);
    setBusy(null);
    if (!r.success) return flash('err', r.message || 'Publish failed');
    setStatus('published');
    flash('ok', 'Published — live on /blog.');
    onSaved();
    adminBlogApi.revalidatePublic([draft.slug || '']);
  };

  const doUnpublish = async () => {
    if (!id) return;
    setBusy('unpublish');
    const r = await adminBlogApi.unpublish(id);
    setBusy(null);
    if (!r.success) return flash('err', r.message || 'Unpublish failed');
    setStatus('unpublished');
    flash('ok', 'Unpublished — no longer public.');
    onSaved();
    adminBlogApi.revalidatePublic([draft.slug || '']);
  };

  const doTrash = async () => {
    if (!id) return onClose();
    if (!(await confirm({ title: `Move "${draft.title}" to Trash? It will be removed from the public blog. You can restore it later.` }))) return;
    setBusy('trash');
    const r = await adminBlogApi.trash(id);
    setBusy(null);
    if (!r.success) return flash('err', r.message || 'Delete failed');
    adminBlogApi.revalidatePublic([draft.slug || '']);
    onSaved();
    onClose();
  };

  const doPreview = async () => {
    setBusy('preview');
    const savedId = await persist();
    setBusy(null);
    if (savedId) window.open(`/admin/blog-preview/${savedId}`, '_blank', 'noopener');
  };

  const runSeo = async () => {
    const savedId = await persist();
    if (!savedId) return;
    setBusy('seo');
    const r = await adminBlogApi.seoAnalysis(savedId);
    setBusy(null);
    if (r.success && r.data) setSeo(r.data);
    else flash('err', r.message || 'SEO analysis failed');
  };

  const uploadCover = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy('cover');
    const r = await adminBlogApi.uploadImage(file);
    setBusy(null);
    if (!r.success || !r.url) return flash('err', r.message || 'Cover upload failed');
    setDraft((d) => ({ ...d, coverImage: r.url, coverImagePublicId: r.publicId }));
    flash('ok', 'Cover image uploaded to Cloudinary.');
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !draft.tags.includes(t)) set('tags', [...draft.tags, t]);
    setTagInput('');
  };

  const relatedOptions = useMemo(() => allPosts.filter((p) => p._id !== id), [allPosts, id]);
  const scoreColor = seo ? (seo.score >= 75 ? 'text-emerald-600' : seo.score >= 50 ? 'text-amber-600' : 'text-rose-600') : '';

  return (
    <div className="space-y-5 pb-24">
      {/* sticky action bar */}
      <div className="sticky top-0 z-20 -mx-4 sm:-mx-6 lg:-mx-10 px-4 sm:px-6 lg:px-10 py-3 bg-[#F3EEFF]/80 dark:bg-[#06070B]/90 backdrop-blur border-b border-[#EAEAEA] dark:border-[#222] flex flex-wrap items-center gap-2">
        <button onClick={onClose} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black">
          <ArrowLeft className="w-4 h-4" /> Blog list
        </button>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${status === 'published' ? 'bg-emerald-100 text-emerald-700' : status === 'scheduled' ? 'bg-sky-100 text-sky-700' : status === 'trash' ? 'bg-rose-100 text-rose-700' : 'bg-neutral-200 text-neutral-600'}`}>
          {status}
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button onClick={doPreview} disabled={!!busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black disabled:opacity-50">
            {busy === 'preview' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />} Preview
          </button>
          <button onClick={doSave} disabled={!!busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] text-xs font-black disabled:opacity-50">
            {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save {status === 'published' ? '' : 'Draft'}
          </button>
          {status === 'published' ? (
            <button onClick={doUnpublish} disabled={!!busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 text-white text-xs font-black disabled:opacity-50">
              {busy === 'unpublish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <EyeOff className="w-4 h-4" />} Unpublish
            </button>
          ) : (
            <button onClick={doPublish} disabled={!!busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-pink text-white text-xs font-black shadow-lg disabled:opacity-50">
              {busy === 'publish' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Publish
            </button>
          )}
          <button onClick={doTrash} disabled={!!busy} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-200 dark:border-rose-900/40 text-xs font-black disabled:opacity-50">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {msg ? (
        <div className={`px-4 py-3 rounded-xl text-xs font-bold ${msg.kind === 'ok' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {msg.text}
        </div>
      ) : null}

      {isCode ? (
        <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-[12px] font-bold text-amber-800 dark:text-amber-300 flex gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>This is a <b>code-based</b> article — its body renders from a registered React component keyed by slug. Edit title / SEO / FAQ / related here; the content field below is ignored for the public page, and the slug must stay registered in code.</span>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-[1fr_20rem] gap-5">
        <div className="space-y-5">
          <Section title="Basics">
            <Field label="Title" value={draft.title} onChange={(v) => set('title', v)} required placeholder="How to Prepare for PTE Academic" />
            <label className="block">
              <Label>Slug</Label>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-400">/blog/</span>
                <input
                  value={draft.slug}
                  onChange={(e) => { slugTouched.current = true; set('slug', slugify(e.target.value)); }}
                  className="flex-1 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold focus:outline-none focus:border-brand-pink"
                />
              </div>
            </label>
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <Label>Category</Label>
                <select value={draft.category} onChange={(e) => set('category', e.target.value)} className="w-full px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold">
                  {[...new Set([draft.category || 'Exam Guide', ...CATEGORIES])].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <Field label="Author" value={draft.author} onChange={(v) => set('author', v)} />
            </div>
            <TextArea label="Excerpt (listing + meta fallback)" value={draft.excerpt} onChange={(v) => set('excerpt', v)} rows={2} />
            <div className="flex flex-wrap gap-3">
              <Check label="Featured article" checked={!!draft.featured} onChange={(v) => set('featured', v)} />
              <label className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                <span className="text-xs font-black text-neutral-500">Renders from</span>
                <select value={draft.contentSource} onChange={(e) => set('contentSource', e.target.value as 'cms' | 'code')} className="bg-transparent text-xs font-black focus:outline-none">
                  <option value="cms">CMS content</option>
                  <option value="code">Code component</option>
                </select>
              </label>
            </div>
          </Section>

          <Section title="Content" badge={isCode ? 'code — ignored on site' : undefined}>
            <BlogRichEditor value={draft.content || ''} onChange={(v) => set('content', v)} disabled={isCode} />
          </Section>

          <Section title="FAQ" badge={draft.faqs.length ? String(draft.faqs.length) : undefined}>
            {draft.faqs.map((f, i) => (
              <div key={i} className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    value={f.question}
                    placeholder="Question"
                    onChange={(e) => set('faqs', draft.faqs.map((x, j) => (j === i ? { ...x, question: e.target.value } : x)))}
                    className="flex-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold"
                  />
                  <button onClick={() => set('faqs', draft.faqs.filter((_, j) => j !== i))} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"><X className="w-4 h-4" /></button>
                </div>
                <textarea
                  value={f.answer}
                  placeholder="Answer"
                  rows={2}
                  onChange={(e) => set('faqs', draft.faqs.map((x, j) => (j === i ? { ...x, answer: e.target.value } : x)))}
                  className="w-full px-3 py-2 rounded-lg bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-medium"
                />
              </div>
            ))}
            <button onClick={() => set('faqs', [...draft.faqs, { question: '', answer: '' }])} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black">
              <Plus className="w-4 h-4" /> Add FAQ
            </button>
          </Section>

          <Section title="Related articles" defaultOpen={false} badge={draft.relatedPosts.length ? String(draft.relatedPosts.length) : undefined}>
            <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
              {relatedOptions.map((p) => (
                <label key={p._id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-[#0E0E0E] cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-brand-pink"
                    checked={draft.relatedPosts.includes(p._id)}
                    onChange={(e) => set('relatedPosts', e.target.checked ? [...draft.relatedPosts, p._id] : draft.relatedPosts.filter((x) => x !== p._id))}
                  />
                  <span className="text-xs font-bold truncate">{p.title}</span>
                  <span className="ml-auto text-[10px] font-black text-neutral-400">{p.category}</span>
                </label>
              ))}
            </div>
          </Section>
        </div>

        {/* sidebar */}
        <div className="space-y-5">
          <Section title="Featured image">
            {draft.coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.coverImage} alt={draft.coverImageAlt || ''} className="w-full aspect-[1200/630] object-cover rounded-2xl border border-[#EAEAEA] dark:border-[#292929]" />
            ) : (
              <div className="w-full aspect-[1200/630] rounded-2xl border border-dashed border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center text-xs font-bold text-neutral-400">No cover</div>
            )}
            <button onClick={() => coverRef.current?.click()} disabled={busy === 'cover'} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-black disabled:opacity-50">
              {busy === 'cover' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} {draft.coverImage ? 'Replace' : 'Upload'} (Cloudinary)
            </button>
            <input ref={coverRef} type="file" accept="image/*" hidden onChange={uploadCover} />
            <Field label="Alt text" value={draft.coverImageAlt} onChange={(v) => set('coverImageAlt', v)} />
            <Field label="Caption" value={draft.coverImageCaption} onChange={(v) => set('coverImageCaption', v)} />
          </Section>

          <Section title="Tags">
            <div className="flex flex-wrap gap-1.5">
              {draft.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-pink/10 text-brand-pink text-[11px] font-black">
                  {t}<button onClick={() => set('tags', draft.tags.filter((x) => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag + Enter" className="flex-1 px-3 py-2 rounded-lg bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-sm font-bold" />
              <button onClick={addTag} className="px-3 rounded-lg bg-neutral-100 dark:bg-[#262626] text-xs font-black">Add</button>
            </div>
          </Section>

          <Section title="SEO">
            <Field label="SEO title" value={draft.seo?.title} onChange={(v) => setSeoField('title', v)} placeholder={draft.title} />
            <TextArea label="Meta description" value={draft.seo?.description} onChange={(v) => setSeoField('description', v)} rows={3} />
            <Field label="Focus keyword" value={(draft.seo as { focusKeyword?: string })?.focusKeyword} onChange={(v) => setSeoField('focusKeyword', v)} />
            <Field label="Canonical URL" value={draft.seo?.canonicalUrl} onChange={(v) => setSeoField('canonicalUrl', v)} />
            <Field label="OG title" value={draft.seo?.ogTitle} onChange={(v) => setSeoField('ogTitle', v)} />
            <TextArea label="OG description" value={draft.seo?.ogDescription} onChange={(v) => setSeoField('ogDescription', v)} rows={2} />
            <Field label="OG image URL" value={draft.seo?.ogImage} onChange={(v) => setSeoField('ogImage', v)} placeholder={draft.coverImage} />
            <div className="flex gap-3">
              <Check label="noindex" checked={!!draft.seo?.noindex} onChange={(v) => setSeoField('noindex', v)} />
              <Check label="nofollow" checked={!!draft.seo?.nofollow} onChange={(v) => setSeoField('nofollow', v)} />
            </div>
            <button onClick={runSeo} disabled={!!busy} className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-black disabled:opacity-50">
              {busy === 'seo' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Analyze SEO
            </button>
            {seo ? (
              <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-3 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className={`font-heading font-black text-2xl ${scoreColor}`}>{seo.score}</span>
                  <span className="text-[11px] font-black text-neutral-400">/100 · {seo.grade}</span>
                </div>
                {(seo.recommendations || []).slice(0, 6).map((r, i) => (
                  <p key={i} className="text-[11px] font-bold text-neutral-500 leading-snug">• {r.text}</p>
                ))}
                {(seo.safetyWarnings || []).map((w, i) => (
                  <p key={`w${i}`} className="text-[11px] font-black text-rose-600 leading-snug">⚠ {w.message}</p>
                ))}
              </div>
            ) : null}
          </Section>
        </div>
      </div>
    </div>
  );
}

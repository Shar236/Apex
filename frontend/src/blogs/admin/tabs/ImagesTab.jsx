import React, { useMemo, useState } from 'react';
import {
  ImageIcon, Upload, Trash2, Plus, Copy, Check, RefreshCw, ExternalLink,
  CheckCircle2, AlertTriangle, FileWarning,
} from 'lucide-react';
import { Field, Label, Empty } from '../ui.jsx';
import { detectArticleImages, updateArticleImageAttrs } from '../../lib/articleContent.js';

const fmtBytes = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};
const fmtExt = (url) => (url || '').split('.').pop()?.split('?')[0]?.toUpperCase().slice(0, 4) || '—';
const normUrl = (u) => String(u || '').trim().replace(/\/upload\/[^/]*\//, '/upload/');

function CopyBtn({ text }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1200); } catch { /* */ } }}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 dark:bg-[#222] text-[10px] font-black cursor-pointer"
    >
      {ok ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> URL</>}
    </button>
  );
}

export default function ImagesTab({ draft, setField, onFeaturedUploadRequest, onUploadRequest, onReplaceRequest }) {
  const registry = draft.images || [];
  const [broken, setBroken] = useState(() => new Set());
  const markBroken = (src) => setBroken((s) => new Set(s).add(src));

  // Images the article ACTUALLY references, scanned live from the HTML — these
  // are article content and must be detected here, never removed for not having
  // been uploaded through this tab (items 14–18 / 36 / 41).
  const contentImages = useMemo(() => detectArticleImages(draft.content), [draft.content]);
  const regByUrl = useMemo(() => {
    const m = new Map();
    registry.forEach((r) => m.set(normUrl(r.url), r));
    return m;
  }, [registry]);

  const used = contentImages.map((det) => ({ ...det, meta: regByUrl.get(normUrl(det.src)) || null }));
  const unusedUploads = registry.filter(
    (r) => r.url && !contentImages.some((d) => normUrl(d.src) === normUrl(r.url)),
  );

  const summary = {
    total: used.length + unusedUploads.length + (draft.coverImage ? 1 : 0),
    featured: draft.coverImage ? 1 : 0,
    inArticle: used.length,
    missingAlt: used.filter((u) => !u.alt?.trim()).length + (draft.coverImage && !draft.coverImageAlt?.trim() ? 1 : 0),
    broken: used.filter((u) => broken.has(u.src)).length,
  };

  // ── registry helpers (metadata store, keyed by URL) ──────────────────────
  const upsertRegistry = (src, patch) => {
    const next = [...registry];
    const idx = next.findIndex((r) => normUrl(r.url) === normUrl(src));
    if (idx >= 0) next[idx] = { ...next[idx], ...patch };
    else next.push({ url: src, publicId: '', filename: '', alt: '', title: '', caption: '', description: '', width: 0, height: 0, bytes: 0, ...patch });
    setField('images', next);
  };
  const removeRegistry = (src) => setField('images', registry.filter((r) => normUrl(r.url) !== normUrl(src)));

  // ── in-article image edits — rewrite the <img> in the HTML + mirror to reg ─
  const setArticleImgAttr = (src, attr, value) => {
    setField('content', updateArticleImageAttrs(draft.content, src, { [attr]: value }));
    upsertRegistry(src, { [attr]: value });
  };

  const updateFeatured = (patch) => Object.entries(patch).forEach(([k, v]) => setField(k, v));

  return (
    <div className="space-y-6">
      {/* ── Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          ['Total', summary.total, ''],
          ['Featured', `${summary.featured}/1`, ''],
          ['In article', summary.inArticle, ''],
          ['Missing ALT', summary.missingAlt, summary.missingAlt ? 'text-amber-600' : 'text-emerald-600'],
          ['Not loading', summary.broken, summary.broken ? 'text-rose-600' : 'text-emerald-600'],
        ].map(([label, val, cls]) => (
          <div key={label} className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-center">
            <div className={`font-black text-lg tabular-nums ${cls}`}>{val}</div>
            <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Featured image ── */}
      <div>
        <Label>Featured Image</Label>
        <div className="flex gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
          <div className="w-28 h-28 rounded-xl overflow-hidden bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shrink-0 flex items-center justify-center">
            {draft.coverImage ? <img src={draft.coverImage} alt={draft.coverImageAlt} className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-neutral-300" />}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={onFeaturedUploadRequest} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-neutral-100 dark:bg-[#222] text-xs font-black cursor-pointer"><Upload className="w-3.5 h-3.5" /> {draft.coverImage ? 'Replace' : 'Upload'}</button>
              {draft.coverImage && <CopyBtn text={draft.coverImage} />}
              {draft.coverImage && <a href={draft.coverImage} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 dark:bg-[#222] text-[10px] font-black cursor-pointer"><ExternalLink className="w-3 h-3" /> Open</a>}
              {draft.coverImage && <button onClick={() => updateFeatured({ coverImage: '', coverImagePublicId: '' })} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Remove</button>}
            </div>
            <Field label="ALT Text" value={draft.coverImageAlt} onChange={(v) => setField('coverImageAlt', v)} placeholder="Describe the image naturally" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Field label="Title" value={draft.coverImageTitle} onChange={(v) => setField('coverImageTitle', v)} />
              <Field label="Caption" value={draft.coverImageCaption} onChange={(v) => setField('coverImageCaption', v)} />
              <Field label="Description" value={draft.coverImageDescription} onChange={(v) => setField('coverImageDescription', v)} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Images used in the article (detected from the HTML) ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>Images Used In This Article ({used.length})</Label>
          <button onClick={() => onUploadRequest()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer"><Plus className="w-3.5 h-3.5" /> Upload & insert</button>
        </div>
        <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] mb-2">
          Auto-detected from the article HTML — including images that were pasted in. Editing ALT here updates the image in the article. Removing an image is done from the Content tab.
        </p>
        {used.length === 0 && <Empty title="No images in the article body yet" desc="Insert one from the Content tab, or paste HTML that contains images." />}
        <div className="space-y-3">
          {used.map((img, idx) => {
            const altOk = !!img.alt?.trim();
            const isBroken = broken.has(img.src);
            const isCloudinary = /res\.cloudinary\.com/.test(img.src);
            return (
              <div key={`${img.src}-${idx}`} className={`p-3 rounded-2xl border ${isBroken ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900' : 'bg-neutral-50 dark:bg-[#0E0E0E] border-[#EAEAEA] dark:border-[#292929]'}`}>
                <div className="flex gap-3">
                  <img
                    src={img.src}
                    alt={img.alt}
                    onError={() => markBroken(img.src)}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 bg-white dark:bg-[#161616]"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 min-w-0">
                    <Field label="ALT Text" value={img.alt} onChange={(v) => setArticleImgAttr(img.src, 'alt', v)} placeholder="Describe the image naturally" />
                    <Field label="Title (tooltip)" value={img.title} onChange={(v) => setArticleImgAttr(img.src, 'title', v)} />
                    <Field label="Caption (SEO / DAM note)" value={img.meta?.caption || ''} onChange={(v) => upsertRegistry(img.src, { caption: v })} />
                    <Field label="Description (SEO / DAM note)" value={img.meta?.description || ''} onChange={(v) => upsertRegistry(img.src, { description: v })} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
                  <CopyBtn text={img.src} />
                  <a href={img.src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 dark:bg-[#222] text-[10px] font-black"><ExternalLink className="w-3 h-3" /> Open</a>
                  <span className="text-[10px] font-bold text-neutral-400">
                    {img.width && img.height ? `${img.width}×${img.height}` : 'dimensions —'} · {fmtExt(img.src)}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black ${altOk ? 'text-emerald-600' : 'text-amber-600'}`}>{altOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} ALT</span>
                  {isCloudinary && <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Cloudinary f_auto</span>}
                  {isBroken && <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600"><FileWarning className="w-3 h-3" /> not loading — check the URL</span>}
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600"><CheckCircle2 className="w-3 h-3" /> lazy</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Uploaded but not used in the body ── */}
      {unusedUploads.length > 0 && (
        <div>
          <Label>Uploaded — Not In The Article Body ({unusedUploads.length})</Label>
          <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] mb-2">
            Kept for reference / re-use. These are not deleted automatically. Insert one from the Content tab, or clear it if it was a mistake.
          </p>
          <div className="space-y-3">
            {unusedUploads.map((img, idx) => (
              <div key={`${img.url}-${idx}`} className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                <div className="flex gap-3">
                  <img src={img.url} alt={img.alt} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 min-w-0">
                    <Field label="ALT Text" value={img.alt} onChange={(v) => upsertRegistry(img.url, { alt: v })} />
                    <Field label="Title" value={img.title} onChange={(v) => upsertRegistry(img.url, { title: v })} />
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <button onClick={async () => { const res = await onReplaceRequest?.(); if (res?.url) upsertRegistry(img.url, { url: res.url, publicId: res.publicId, width: res.width, height: res.height, bytes: res.bytes, filename: res.filename }); }} title="Replace file" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeRegistry(img.url)} title="Remove from registry" className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
                  <CopyBtn text={img.url} />
                  <span className="text-[10px] font-bold text-neutral-400">{img.width && img.height ? `${img.width}×${img.height}` : '—'} · {fmtBytes(img.bytes)} · {fmtExt(img.url)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

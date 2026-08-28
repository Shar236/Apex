import React, { useState } from 'react';
import {
  ImageIcon, Upload, Trash2, Plus, Copy, Check, RefreshCw, ExternalLink,
  CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { Field, Label, Empty } from '../ui.jsx';

const fmtBytes = (b) => {
  if (!b) return '—';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};
const fmtExt = (url) => (url || '').split('.').pop()?.split('?')[0]?.toUpperCase().slice(0, 4) || '—';

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
  const images = draft.images || [];
  const summary = {
    total: images.length + (draft.coverImage ? 1 : 0),
    featured: draft.coverImage ? 1 : 0,
    content: images.length,
    missingAlt: images.filter((i) => !i.alt || !i.alt.trim()).length + (draft.coverImage && !draft.coverImageAlt?.trim() ? 1 : 0),
    missingCaption: images.filter((i) => !i.caption || !i.caption.trim()).length,
  };

  const updateImage = (idx, patch) => {
    const next = [...images];
    next[idx] = { ...next[idx], ...patch };
    setField('images', next);
  };
  const removeImage = (idx) => setField('images', images.filter((_, i) => i !== idx));
  const replaceImage = async (idx) => {
    const res = await onReplaceRequest?.();
    if (res?.url) updateImage(idx, { url: res.url, publicId: res.publicId, width: res.width, height: res.height, bytes: res.bytes, filename: res.filename });
  };

  return (
    <div className="space-y-6">
      {/* ── Summary ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          ['Total', summary.total, ''],
          ['Featured', `${summary.featured}/1`, ''],
          ['Content', summary.content, ''],
          ['Missing ALT', summary.missingAlt, summary.missingAlt ? 'text-amber-600' : 'text-emerald-600'],
          ['No caption', summary.missingCaption, summary.missingCaption ? 'text-neutral-500' : 'text-emerald-600'],
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
              {draft.coverImage && <button onClick={() => { setField('coverImage', ''); setField('coverImagePublicId', ''); }} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Remove</button>}
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

      {/* ── In-article images ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <Label>In-Article Images ({images.length})</Label>
          <button onClick={() => onUploadRequest()} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Image</button>
        </div>
        {images.length === 0 && <Empty title="No in-article images yet" desc="Insert images from the Content tab — they appear here for ALT / caption / SEO editing." />}
        <div className="space-y-3">
          {images.map((img, idx) => {
            const altOk = !!img.alt?.trim();
            const capOk = !!img.caption?.trim();
            const big = img.bytes > 250 * 1024;
            return (
              <div key={idx} className="p-3 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                <div className="flex gap-3">
                  <img src={img.url} alt={img.alt} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Field label="ALT Text" value={img.alt} onChange={(v) => updateImage(idx, { alt: v })} />
                    <Field label="Title" value={img.title} onChange={(v) => updateImage(idx, { title: v })} />
                    <Field label="Caption" value={img.caption} onChange={(v) => updateImage(idx, { caption: v })} />
                    <Field label="Description" value={img.description} onChange={(v) => updateImage(idx, { description: v })} />
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <button onClick={() => replaceImage(idx)} title="Replace" className="p-2 rounded-lg bg-neutral-100 dark:bg-[#222] cursor-pointer"><RefreshCw className="w-3.5 h-3.5" /></button>
                    <button onClick={() => removeImage(idx)} title="Remove from registry" className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap mt-2 pt-2 border-t border-[#EAEAEA] dark:border-[#292929]">
                  <CopyBtn text={img.url} />
                  <a href={img.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-100 dark:bg-[#222] text-[10px] font-black"><ExternalLink className="w-3 h-3" /> Open</a>
                  <span className="text-[10px] font-bold text-neutral-400">
                    {img.width && img.height ? `${img.width}×${img.height}` : 'dimensions —'} · {fmtBytes(img.bytes)} · {fmtExt(img.url)}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black ${altOk ? 'text-emerald-600' : 'text-amber-600'}`}>{altOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} ALT</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-black ${capOk ? 'text-emerald-600' : 'text-neutral-400'}`}>{capOk ? <CheckCircle2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />} caption</span>
                  {big && <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-600"><AlertTriangle className="w-3 h-3" /> &gt;250 KB</span>}
                  <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600"><CheckCircle2 className="w-3 h-3" /> lazy</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

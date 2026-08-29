import React, { useEffect, useState } from 'react';
import { X, Search, ExternalLink, Trash2, AlertTriangle } from 'lucide-react';
import { blogApi } from '../../lib/blogApi.js';
import { buildRel, linkHrefError } from './linkCommands.js';

/**
 * Link dialog: URL + link text + open-in-new-tab + rel, plus a search over real
 * internal pages (blogApi.internalLinkSuggestions). The actual editor mutation
 * runs through `onApply` (linkCommands.applyLink) so the selection is restored
 * even though focus is now in this modal, and links never nest.
 */
export default function LinkDialog({ editor, excludeId, savedRange, onApply, onClose }) {
  // Prefer the live selection; fall back to the range saved before the modal opened.
  const liveSel = editor
    ? editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to, ' ')
    : '';
  const savedSel = editor && savedRange && savedRange.from !== savedRange.to
    ? editor.state.doc.textBetween(savedRange.from, savedRange.to, ' ')
    : '';
  const selectionText = liveSel || savedSel;
  const existing = editor?.getAttributes('link') || {};

  const [url, setUrl] = useState(existing.href || '');
  const [text, setText] = useState(selectionText || '');
  const [newTab, setNewTab] = useState(existing.target === '_blank');
  const [nofollow, setNofollow] = useState(/nofollow/.test(existing.rel || ''));
  const [sponsored, setSponsored] = useState(/sponsored/.test(existing.rel || ''));
  const [ugc, setUgc] = useState(/ugc/.test(existing.rel || ''));
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!q.trim()) { setResults([]); return undefined; }
    const t = setTimeout(async () => {
      const res = await blogApi.internalLinkSuggestions(q, excludeId);
      if (res.success) setResults(res.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [q, excludeId]);

  const apply = () => {
    const err = linkHrefError(url);
    if (err) { setError(err); return; }
    const target = newTab ? '_blank' : null;
    const rel = buildRel({ target, nofollow, sponsored, ugc });
    const res = onApply?.({ href: url.trim(), text, target, rel });
    if (res && res.ok === false) { setError(res.error || 'Could not insert the link.'); return; }
    onClose();
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  const noSelectionHint = !selectionText && !existing.href;

  return (
    <div className="ae-modal-backdrop" onMouseDown={onClose}>
      <div className="ae-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-heading font-black text-sm">{existing.href ? 'Edit link' : 'Insert link'}</h3>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#222] cursor-pointer"><X className="w-4 h-4" /></button>
        </div>

        {noSelectionHint && (
          <p className="mb-3 text-[11px] font-bold text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] rounded-lg px-2.5 py-2">
            No text is selected — the link text below will be inserted at the cursor.
          </p>
        )}

        <label className="block mb-3">
          <span className="ae-label">URL</span>
          <input autoFocus value={url} onChange={(e) => { setUrl(e.target.value); setError(''); }} placeholder="https://…  or  /exam-vouchers/…" className="ae-input" />
        </label>
        <label className="block mb-3">
          <span className="ae-label">Link text</span>
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Shown text (defaults to the URL / selection)" className="ae-input" />
        </label>
        <div className="flex items-center gap-x-4 gap-y-1.5 mb-3 text-xs font-bold flex-wrap">
          <label className="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} /> Open in new tab</label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={nofollow} onChange={(e) => setNofollow(e.target.checked)} /> nofollow</label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={sponsored} onChange={(e) => setSponsored(e.target.checked)} /> sponsored</label>
          <label className="inline-flex items-center gap-1.5 cursor-pointer"><input type="checkbox" checked={ugc} onChange={(e) => setUgc(e.target.checked)} /> ugc</label>
        </div>
        {newTab && <p className="text-[10px] font-bold text-neutral-400 mb-3">rel=&quot;noopener noreferrer&quot; is added automatically for new-tab links.</p>}

        {error && (
          <p className="mb-3 text-[11px] font-black text-rose-600 dark:text-rose-400 inline-flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> {error}</p>
        )}

        <div className="ae-label mb-1.5">Or link to a page on this site</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] mb-2">
          <Search className="w-4 h-4 text-neutral-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products, pages, posts…" className="bg-transparent outline-none text-xs font-bold w-full" />
        </div>
        {results.length > 0 && (
          <div className="max-h-40 overflow-y-auto space-y-1.5 mb-2">
            {results.map((r, i) => (
              <button key={i} type="button" onClick={() => { setUrl(r.url); setError(''); if (!text) setText(r.title); setQ(''); setResults([]); }} className="w-full text-left p-2 rounded-lg bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink cursor-pointer">
                <div className="font-black text-xs line-clamp-1">{r.title}</div>
                <div className="text-[10px] font-bold text-neutral-400 line-clamp-1">{r.url} · {r.type}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-4">
          {existing.href ? (
            <button type="button" onClick={removeLink} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
          ) : <span />}
          <button type="button" onClick={apply} disabled={!url.trim()} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl btn-pink text-white text-xs font-black cursor-pointer disabled:opacity-40"><ExternalLink className="w-3.5 h-3.5" /> {existing.href ? 'Update link' : 'Apply link'}</button>
        </div>
      </div>
    </div>
  );
}

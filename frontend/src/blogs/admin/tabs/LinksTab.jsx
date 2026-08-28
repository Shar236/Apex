import React, { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink, Trash2, Edit2, AlertTriangle, CheckCircle2, ArrowUpRight, CornerDownRight } from 'lucide-react';
import { blogApi } from '../../lib/blogApi.js';
import { Label, Empty } from '../ui.jsx';

const STATIC_ROUTES = ['/', '/blog', '/exam-booking', '/about', '/contact', '/faq', '/privacy', '/terms', '/refund-policy'];

const parseLinks = (html) => {
  const out = [];
  const re = /<a\s+[^>]*href=["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html || '')) !== null) {
    const attrs = m[2] || '';
    out.push({
      href: m[1],
      text: m[3].replace(/<[^>]*>/g, '').trim(),
      rel: (attrs.match(/rel=["']([^"']*)["']/i) || [])[1] || '',
      target: /target=["']_blank["']/i.test(attrs) ? '_blank' : '',
      internal: m[1].startsWith('/'),
    });
  }
  return out;
};

export default function LinksTab({ draft, id, editorInstance, onEditLink }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [routeSet, setRouteSet] = useState(null);

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await blogApi.internalLinkSuggestions(q, id);
      if (res.success) setResults(res.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [q, id]);

  // Fetch the full route set once for broken-link detection + suggestions.
  useEffect(() => {
    blogApi.internalLinkSuggestions('', id).then((res) => {
      if (res.success) {
        const s = new Set(STATIC_ROUTES);
        (res.data || []).forEach((r) => s.add(r.url.split('#')[0]));
        setRouteSet(s);
      }
    });
  }, [id]);

  const links = useMemo(() => parseLinks(draft.content), [draft.content]);
  const internal = links.filter((l) => l.internal);
  const external = links.filter((l) => /^https?:\/\//i.test(l.href));
  const broken = routeSet ? internal.filter((l) => !routeSet.has(l.href.split('#')[0])) : [];

  const linkedHrefs = new Set(links.map((l) => l.href));
  const suggestions = (results.length ? results : [])
    .filter((r) => !linkedHrefs.has(r.url))
    .slice(0, 6);

  const insertAtCursor = (item) => {
    if (!editorInstance) return;
    const { from, to } = editorInstance.state.selection;
    if (from === to) {
      editorInstance.chain().focus().insertContent(`<a href="${item.url}">${item.title}</a>`).run();
    } else {
      editorInstance.chain().focus().extendMarkRange('link').setLink({ href: item.url }).run();
    }
  };

  const removeArticleLink = (link) => {
    if (!editorInstance) { alert('Open the Content tab first.'); return; }
    // Select the anchor by matching its href, then unset the link mark.
    const { doc } = editorInstance.state;
    let found = null;
    doc.descendants((node, pos) => {
      if (found) return false;
      const mark = node.marks?.find((mk) => mk.type.name === 'link' && mk.attrs.href === link.href);
      if (mark) found = { from: pos, to: pos + node.nodeSize };
      return true;
    });
    if (found) {
      editorInstance.chain().focus().setTextSelection(found).extendMarkRange('link').unsetLink().run();
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Analysis ── */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-center">
          <div className="font-black text-lg tabular-nums">{internal.length}</div>
          <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Internal</div>
        </div>
        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] text-center">
          <div className="font-black text-lg tabular-nums">{external.length}</div>
          <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">External</div>
        </div>
        <div className={`p-3 rounded-xl border text-center ${broken.length ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900' : 'bg-neutral-50 dark:bg-[#0E0E0E] border-[#EAEAEA] dark:border-[#292929]'}`}>
          <div className={`font-black text-lg tabular-nums ${broken.length ? 'text-rose-600' : ''}`}>{routeSet ? broken.length : '—'}</div>
          <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Broken</div>
        </div>
      </div>

      <div>
        <Label>Links in this article ({links.length})</Label>
        {links.length === 0 && <Empty title="No links yet" desc="Select text in the editor and use the link button, or insert one below." />}
        <div className="space-y-1.5">
          {links.map((l, i) => {
            const isBroken = l.internal && routeSet && !routeSet.has(l.href.split('#')[0]);
            return (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
                {l.internal ? <CornerDownRight className="w-3.5 h-3.5 text-brand-pink shrink-0" /> : <ArrowUpRight className="w-3.5 h-3.5 text-sky-500 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-neutral-900 dark:text-white line-clamp-1">{l.text || '(no anchor text)'}</div>
                  <div className={`text-[10px] font-bold line-clamp-1 ${isBroken ? 'text-rose-600' : 'text-neutral-400'}`}>
                    {l.href}{l.target === '_blank' ? ' · new tab' : ''}{l.rel ? ` · ${l.rel}` : ''}
                  </div>
                </div>
                {isBroken && <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-600 shrink-0"><AlertTriangle className="w-3 h-3" /> broken</span>}
                <button onClick={() => onEditLink?.(l)} title="Edit" className="p-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] cursor-pointer shrink-0"><Edit2 className="w-3 h-3" /></button>
                <button onClick={() => removeArticleLink(l)} title="Remove link" className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 cursor-pointer shrink-0"><Trash2 className="w-3 h-3" /></button>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Insert a link to a page on this site</Label>
        <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] mb-2">Only URLs that actually exist are suggested. Select text in the Content tab first to link it; otherwise the title is inserted.</p>
        <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] mb-2">
          <Search className="w-4 h-4 text-neutral-400" />
          <input placeholder="Search products, pages, blog posts…" value={q} onChange={(e) => setQ(e.target.value)} className="bg-transparent outline-none text-xs font-bold w-full" />
        </div>
        <div className="space-y-1.5 max-h-56 overflow-y-auto">
          {results.map((r, idx) => (
            <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929]">
              <div className="min-w-0">
                <div className="font-black text-xs line-clamp-1">{r.title}</div>
                <div className="text-[10px] font-bold text-neutral-400 line-clamp-1">{r.url} · {r.type}</div>
              </div>
              <button onClick={() => insertAtCursor(r)} className="shrink-0 px-3 py-1.5 rounded-lg btn-pink text-white text-[10px] font-black cursor-pointer">Insert</button>
            </div>
          ))}
          {results.length === 0 && <Empty title="No matches" desc="Try a different search term." />}
        </div>
      </div>

      {suggestions.length > 0 && (
        <div>
          <Label>Suggested internal links (not yet used)</Label>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => insertAtCursor(s)} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-black border bg-neutral-50 dark:bg-[#0E0E0E] border-[#EAEAEA] dark:border-[#292929] hover:border-brand-pink cursor-pointer">
                {s.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

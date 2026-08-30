import React, { useEffect, useMemo, useState } from 'react';
import { Search, ExternalLink, Trash2, Edit2, AlertTriangle, CheckCircle2, ArrowUpRight, CornerDownRight } from 'lucide-react';
import { blogApi } from '../../lib/blogApi.js';
import { Label, Empty } from '../ui.jsx';

// Real routes from App.jsx (exact) + dynamic sections (prefix). An internal link
// is only ever flagged "broken" when it matches NONE of these AND is absent from
// the live server route index — a valid relative path is never a false positive.
const STATIC_ROUTES = new Set([
  '/', '/exam-booking', '/blog', '/guides', '/exam-guides',
  '/refund-policy', '/policies/refund-cancellation', '/voucher-refund-policy',
  '/how-to-reschedule-cancel-pte-exam', '/pte-rescheduling-guide', '/reschedule-pte-exam',
  '/terms', '/terms-and-conditions', '/terms-of-service',
  '/privacy', '/privacy-policy',
  '/login', '/admin/login', '/register', '/forgot-password', '/reset-password',
  '/payment/return', '/account', '/about', '/contact', '/faq',
]);
const DYNAMIC_PREFIXES = ['/exam-vouchers/', '/blog/', '/admin/'];

const isKnownRoute = (href, routeSet) => {
  const path = String(href || '').split('#')[0].split('?')[0].replace(/\/$/, '') || '/';
  if (path === '' || path === '/') return true;
  if (STATIC_ROUTES.has(path) || STATIC_ROUTES.has(`${path}/`)) return true;
  if (DYNAMIC_PREFIXES.some((p) => path.startsWith(p) && path.length > p.length)) return true;
  if (routeSet && routeSet.has(path)) return true;
  return false;
};

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

export default function LinksTab({ draft, id, editorApi, onEditLink }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [routeSet, setRouteSet] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const t = setTimeout(async () => {
      const res = await blogApi.internalLinkSuggestions(q, id);
      if (res.success) setResults(res.data || []);
    }, 250);
    return () => clearTimeout(t);
  }, [q, id]);

  // Fetch the server route index once — augments the known static/dynamic routes
  // for broken-link detection and powers the suggestions list.
  useEffect(() => {
    blogApi.internalLinkSuggestions('', id).then((res) => {
      if (res.success) {
        const s = new Set();
        (res.data || []).forEach((r) => s.add(r.url.split('#')[0].split('?')[0].replace(/\/$/, '')));
        setRouteSet(s);
      }
    });
  }, [id]);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  // Counts recompute straight from the current article HTML — no save/refresh.
  const links = useMemo(() => parseLinks(draft.content), [draft.content]);
  const internal = links.filter((l) => l.internal);
  const external = links.filter((l) => /^https?:\/\//i.test(l.href));
  const isBrokenLink = (l) => l.internal && !isKnownRoute(l.href, routeSet);
  const broken = links.filter(isBrokenLink);

  const linkedHrefs = new Set(links.map((l) => l.href));
  const suggestions = (results.length ? results : [])
    .filter((r) => !linkedHrefs.has(r.url))
    .slice(0, 6);

  const insertAtCursor = (item) => {
    if (!editorApi?.applyLink) { setNotice('Open the Content tab once so the editor is ready, then try again.'); return; }
    // Selected text in the editor → wrap it. No selection → the page title is
    // inserted as the link text (consistent, documented behaviour — item 12).
    const res = editorApi.applyLink({ href: item.url, text: item.title });
    if (res?.ok === false) { setNotice(res.error || 'Could not insert the link.'); return; }
    setNotice(
      res?.inserted === 'text'
        ? `Inserted “${item.title}” as a link at the cursor.`
        : `Linked the selected text to ${item.url}.`,
    );
  };

  const removeArticleLink = (link) => {
    if (!editorApi?.removeLink) { setNotice('Open the Content tab once so the editor is ready.'); return; }
    if (editorApi.removeLink(link.href)) setNotice('Link removed.');
  };

  return (
    <div className="space-y-6">
      {notice && (
        <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-black">
          {notice}
        </div>
      )}

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
          <div className={`font-black text-lg tabular-nums ${broken.length ? 'text-rose-600' : ''}`}>{broken.length}</div>
          <div className="text-[9px] font-black uppercase tracking-wider text-neutral-400">Broken</div>
        </div>
      </div>

      <div>
        <Label>Links in this article ({links.length})</Label>
        {links.length === 0 && <Empty title="No links yet" desc="Select text in the editor and use the link button, or insert one below." />}
        <div className="space-y-1.5">
          {links.map((l, i) => {
            const isBroken = isBrokenLink(l);
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

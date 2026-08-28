import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

const VOID = new Set(['img', 'hr', 'br']);
const INLINE = new Set(['a', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'br', 'code']);

/** Very small, dependency-free HTML pretty-printer for the read-only HTML view. */
function formatHtml(html) {
  if (!html) return '';
  const tokens = html.replace(/>\s+</g, '><').match(/<[^>]+>|[^<]+/g) || [];
  let depth = 0;
  const out = [];
  for (const tok of tokens) {
    if (tok.startsWith('</')) {
      const tag = tok.slice(2, -1).toLowerCase();
      if (!INLINE.has(tag)) depth = Math.max(0, depth - 1);
      out.push(`${'  '.repeat(depth)}${tok}`);
    } else if (tok.startsWith('<')) {
      const tag = (tok.match(/^<([a-z0-9]+)/i)?.[1] || '').toLowerCase();
      const selfClose = tok.endsWith('/>') || VOID.has(tag);
      out.push(`${'  '.repeat(depth)}${tok}`);
      if (!selfClose && !INLINE.has(tag)) depth += 1;
    } else {
      out.push(`${'  '.repeat(depth)}${tok.trim()}`);
    }
  }
  return out.filter((l) => l.trim()).join('\n');
}

/** Read-only view of the generated HTML with a Copy button. */
export default function HtmlView({ html }) {
  const [copied, setCopied] = useState(false);
  const pretty = formatHtml(html);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(html || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked — no-op */ }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={copy}
        className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer z-10"
      >
        {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy HTML</>}
      </button>
      <pre className="ae-html max-h-[70vh] overflow-auto text-[12px] leading-relaxed p-4 rounded-2xl bg-neutral-50 dark:bg-[#0E0E0E] border border-[#EAEAEA] dark:border-[#292929] whitespace-pre">
        <code>{pretty || '<!-- empty -->'}</code>
      </pre>
    </div>
  );
}

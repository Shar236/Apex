import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { css as cssLang } from '@codemirror/lang-css';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { splitPastedArticle } from '../../lib/articleContent.js';

const VOID = new Set(['img', 'hr', 'br']);
const INLINE = new Set(['a', 'strong', 'b', 'em', 'i', 'u', 's', 'span', 'br', 'code']);

/** Small dependency-free HTML pretty-printer for display + reformatting. */
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

/** One debounced CodeMirror pane that syncs external → local while idle. */
function SourcePane({ label, value, language, onCommit, placeholder }) {
  const [text, setText] = useState(() => value || '');
  const timer = useRef(null);
  const dirtyRef = useRef(false);

  useEffect(() => {
    if (!dirtyRef.current) setText(value || '');
  }, [value]);

  const handle = (val) => {
    setText(val);
    dirtyRef.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { onCommit(val); dirtyRef.current = false; }, 500);
  };
  const flush = () => {
    clearTimeout(timer.current);
    if (dirtyRef.current) { onCommit(text); dirtyRef.current = false; }
  };

  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400 mb-1">{label}</div>
      <div className="rounded-2xl overflow-hidden border border-[#EAEAEA] dark:border-[#292929]" onBlur={flush}>
        <CodeMirror
          value={text}
          height={language === 'css' ? '22vh' : '46vh'}
          extensions={language === 'css' ? [cssLang()] : [htmlLang()]}
          onChange={handle}
          placeholder={placeholder}
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true }}
          theme={typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        />
      </div>
    </div>
  );
}

/**
 * Editable HTML source with a separate CSS section.
 *
 * The HTML pane accepts pasted `<style>` / full `<!DOCTYPE html>` documents and
 * auto-extracts the CSS into the CSS pane. Both panes debounce back into the
 * article. The server sanitizes HTML + scopes CSS on save.
 */
export default function HtmlView({ html, css, onChange, onCssChange }) {
  const [copied, setCopied] = useState(false);

  const commitHtml = (val) => {
    const { html: cleanHtml, css: extracted } = splitPastedArticle(val, css || '');
    if (onCssChange && extracted !== (css || '')) onCssChange(extracted);
    onChange?.(cleanHtml);
  };

  const reformat = () => onChange?.(formatHtml(html));

  const copy = async () => {
    try {
      const bundle = css ? `<style>\n${css}\n</style>\n${html || ''}` : (html || '');
      await navigator.clipboard.writeText(bundle);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* */ }
  };

  return (
    <div className="relative space-y-3">
      <div className="absolute top-0 right-0 z-10 flex gap-1.5">
        <button type="button" onClick={reformat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> Reformat HTML</button>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer">
          {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy all</>}
        </button>
      </div>

      <SourcePane
        label="Article HTML"
        value={formatHtml(html)}
        language="html"
        onCommit={commitHtml}
        placeholder="<h2>Section…</h2>"
      />
      <SourcePane
        label="Article CSS — scoped to this article on save (cannot affect the rest of the site)"
        value={css || ''}
        language="css"
        onCommit={(val) => onCssChange?.(val)}
        placeholder=".my-table th { background: #FFF0F5; }"
      />
      <p className="text-[10px] font-bold text-neutral-400">
        Paste a full HTML document or a block with <code>&lt;style&gt;</code> into the HTML box — the CSS is moved here automatically.
        On save the server removes disallowed tags/attributes and scopes every CSS selector under this article.
      </p>
    </div>
  );
}

import React, { useEffect, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { html as htmlLang } from '@codemirror/lang-html';
import { Copy, Check, RotateCcw } from 'lucide-react';

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

/**
 * Editable HTML source. Typing here is debounced back into the visual editor via
 * `onChange`. Switching away / clicking "Reformat" re-pretty-prints.
 */
export default function HtmlView({ html, onChange }) {
  const [text, setText] = useState(() => formatHtml(html));
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const dirtyRef = useRef(false);

  // Pull external changes in only while the user isn't actively editing here.
  useEffect(() => {
    if (!dirtyRef.current) setText(formatHtml(html));
  }, [html]);

  const handle = (val) => {
    setText(val);
    dirtyRef.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => { onChange?.(val); dirtyRef.current = false; }, 500);
  };

  const flush = () => {
    clearTimeout(timer.current);
    if (dirtyRef.current) { onChange?.(text); dirtyRef.current = false; }
  };

  const reformat = () => {
    flush();
    const pretty = formatHtml(text);
    setText(pretty);
    onChange?.(pretty);
  };

  const copy = async () => {
    try { await navigator.clipboard.writeText(html || ''); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* */ }
  };

  return (
    <div className="relative">
      <div className="absolute top-2 right-2 z-10 flex gap-1.5">
        <button type="button" onClick={reformat} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer"><RotateCcw className="w-3.5 h-3.5" /> Reformat</button>
        <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-[#222] text-[11px] font-black cursor-pointer">
          {copied ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
        </button>
      </div>
      <div className="rounded-2xl overflow-hidden border border-[#EAEAEA] dark:border-[#292929]" onBlur={flush}>
        <CodeMirror
          value={text}
          height="60vh"
          extensions={[htmlLang()]}
          onChange={handle}
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true }}
          theme={typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'}
        />
      </div>
      <p className="text-[10px] font-bold text-neutral-400 mt-1.5">Edits here sync to the visual editor. The server sanitizes the HTML on save — disallowed tags/attributes are removed.</p>
    </div>
  );
}

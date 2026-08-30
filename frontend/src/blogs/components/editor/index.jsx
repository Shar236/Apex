import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EditorContent } from '@tiptap/react';
import { AlertTriangle, PenSquare, Eye, Code2, FileText, Clock } from 'lucide-react';
import { useArticleEditor } from './useArticleEditor.js';
import Toolbar from './Toolbar.jsx';
import BubbleToolbar from './BubbleToolbar.jsx';
import TableControls from './TableControls.jsx';
import FigureToolbar from './FigureToolbar.jsx';
import BlockHandle from './BlockHandle.jsx';
import InsertMenu from './InsertMenu.jsx';
import LinkDialog from './LinkDialog.jsx';
import HtmlView from './HtmlView.jsx';
import PreviewView from './PreviewView.jsx';
import { splitPastedArticle } from '../../lib/articleContent.js';
import { applyLink as applyLinkCmd, selectLinkByHref, removeLinkByHref } from './linkCommands.js';
import '../../styles/blog.css'; // article typography for Edit + Preview
import './editor.css';          // editor chrome only

const MODES = [
  { id: 'edit', label: 'Edit', icon: <PenSquare className="w-3.5 h-3.5" /> },
  { id: 'preview', label: 'Preview', icon: <Eye className="w-3.5 h-3.5" /> },
  { id: 'html', label: 'HTML', icon: <Code2 className="w-3.5 h-3.5" /> },
];

const countWords = (html) => {
  const t = (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return t ? t.split(' ').length : 0;
};

/**
 * Visual article builder — the CMS content editor.
 *
 * Article = HTML + CSS. Edit = TipTap block editor, Preview = live prose-blog
 * render with the article's scoped CSS, HTML = editable CodeMirror source with
 * a separate CSS section (kept in two-way sync with the visual editor). Pasted
 * <style> blocks and full `<!DOCTYPE html>` documents are split so the CSS is
 * never dropped.
 *
 * Props:
 *   value / onChange(html)         the current article HTML
 *   css / onCssChange(css)         the current article CSS (unscoped, authored)
 *   onEditorReady(editor, api)     api = { openLinkDialog } — used by the Links tab
 *   images / onImagesChange        the draft.images[] DAM registry
 *   onRequestImageUpload()         existing upload flow → { url, alt }
 *   title / excludeId              for Preview heading + internal-link search
 */
export default function ArticleEditor({
  value, onChange, css = '', onCssChange, onEditorReady, images = [], onImagesChange, onRequestImageUpload, title, excludeId,
}) {
  const [mode, setMode] = useState('edit');
  const [linkOpen, setLinkOpen] = useState(false);
  const lastPushedRef = useRef(value);

  // Ref-stable bridge for <style> pulled out of pasted HTML — merges onto the
  // current CSS so multiple pastes accumulate instead of overwriting.
  const cssRef = useRef({ css, onCssChange });
  cssRef.current = { css, onCssChange };
  const mergeExtractedCss = useCallback((extra) => {
    const { css: current, onCssChange: cb } = cssRef.current;
    if (!extra || !cb) return;
    const merged = [String(current || '').trim(), extra.trim()].filter(Boolean).join('\n\n');
    if (merged !== current) cb(merged);
  }, []);

  const editor = useArticleEditor({ value, onChange, onPasteStyles: mergeExtractedCss });

  // Remember the last non-empty selection so a link inserted from the Links tab
  // (or after the user clicked into a dialog field) still wraps the right text.
  const savedRangeRef = useRef(null);
  useEffect(() => {
    if (!editor) return undefined;
    const remember = () => {
      const { from, to, empty } = editor.state.selection;
      if (!empty) savedRangeRef.current = { from, to };
    };
    editor.on('selectionUpdate', remember);
    editor.on('blur', remember);
    return () => { editor.off('selectionUpdate', remember); editor.off('blur', remember); };
  }, [editor]);

  // Expose the editor + a small imperative API once, when it is ready. The Links
  // tab drives link insertion/edit/removal through this so the logic lives in
  // one place next to the editor instance.
  useEffect(() => {
    if (!editor || !onEditorReady) return;
    onEditorReady(editor, {
      openLinkDialog: () => setLinkOpen(true),
      applyLink: (opts) => applyLinkCmd(editor, savedRangeRef.current, opts),
      selectLink: (href) => selectLinkByHref(editor, href),
      removeLink: (href) => removeLinkByHref(editor, href),
      hasSelection: () => !editor.state.selection.empty || !!savedRangeRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  // External value changes (revision restore, save round-trip, HTML-mode edits)
  // → sync into the editor without fighting the caret.
  useEffect(() => {
    if (!editor) return;
    if (value !== undefined && value !== editor.getHTML() && value !== lastPushedRef.current) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(value || '', { emitUpdate: false });
      try { editor.commands.setTextSelection({ from, to }); } catch { /* out of range */ }
    }
  }, [value, editor]);

  const html = editor ? editor.getHTML() : (value || '');
  const words = useMemo(() => countWords(html), [html]);
  const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;

  if (!editor) {
    return <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] p-8 text-sm font-bold text-neutral-400">Loading editor…</div>;
  }

  const insertImage = async () => {
    const res = await onRequestImageUpload?.();
    if (res?.url) editor.chain().focus().setFigure({ src: res.url, alt: res.alt || '' }).run();
  };

  const insertBelow = (pos) => {
    const node = editor.state.doc.nodeAt(pos);
    const end = node ? pos + node.nodeSize : editor.state.doc.content.size;
    editor.chain().focus().insertContentAt(end, { type: 'paragraph' }).setTextSelection(end + 1).run();
  };

  // HTML source → visual editor. Guarded so it doesn't ping-pong with onUpdate.
  // Any <style> / full document pasted into the HTML box is split out to CSS.
  const applyHtml = (nextHtml) => {
    const { html, css: extractedCss } = splitPastedArticle(nextHtml, cssRef.current.css);
    if (extractedCss !== cssRef.current.css) cssRef.current.onCssChange?.(extractedCss);
    if (html === editor.getHTML()) return;
    lastPushedRef.current = html;
    editor.commands.setContent(html || '', { emitUpdate: true });
  };

  return (
    <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden bg-white dark:bg-[#0E0E0E]">
      <div className="flex items-center justify-between gap-2 p-2 border-b border-[#EAEAEA] dark:border-[#292929] bg-white dark:bg-[#0E0E0E]">
        <div className="flex items-center gap-1">
          {MODES.map((m) => (
            <button key={m.id} type="button" onClick={() => setMode(m.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer transition ${
                mode === m.id ? 'bg-brand-pink text-white' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#222]'
              }`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 pr-1 text-[11px] font-black text-neutral-400">
          <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> {words.toLocaleString()} words</span>
          <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.max(1, Math.ceil(words / 200))} min</span>
        </div>
      </div>

      {h1Count > 1 && mode === 'edit' && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {h1Count} H1 headings — use only one H1 per page. Demote the extras to H2/H3.
        </div>
      )}

      <div className={mode === 'edit' ? 'block' : 'hidden'}>
        <Toolbar editor={editor} onOpenLink={() => setLinkOpen(true)} onInsertImage={insertImage} />
        <div className="ae-editor-host relative">
          <BlockHandle editor={editor} onInsertBelow={insertBelow} />
          <InsertMenu editor={editor} onRequestImage={onRequestImageUpload} />
          <BubbleToolbar editor={editor} onOpenLink={() => setLinkOpen(true)} />
          <TableControls editor={editor} />
          <FigureToolbar editor={editor} images={images} onImagesChange={onImagesChange} />
          <EditorContent editor={editor} />
        </div>
      </div>

      {mode === 'preview' && <PreviewView html={html} css={css} title={title} />}
      {mode === 'html' && (
        <div className="p-3">
          <HtmlView html={html} css={css} onChange={applyHtml} onCssChange={onCssChange} />
        </div>
      )}

      {linkOpen && (
        <LinkDialog
          editor={editor}
          excludeId={excludeId}
          savedRange={savedRangeRef.current}
          onApply={(opts) => applyLinkCmd(editor, savedRangeRef.current, opts)}
          onClose={() => setLinkOpen(false)}
        />
      )}
    </div>
  );
}

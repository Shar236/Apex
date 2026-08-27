import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import {
  Heading1, Heading2, Heading3, Pilcrow, Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Quote, Link2, ImageIcon, Table2, MessageSquareWarning, AlertTriangle,
} from 'lucide-react';

const ToolbarBtn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
      active ? 'bg-brand-pink text-white' : 'bg-neutral-100 dark:bg-[#222] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#2c2c2c]'
    }`}
  >
    {children}
  </button>
);

export default function BlogRichTextEditor({ value, onChange, onEditorReady, onRequestImageUpload }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      ImageExt.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Placeholder.configure({ placeholder: 'Write your article…' }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'prose-blog min-h-[320px] max-w-none px-4 py-3 focus:outline-none text-sm leading-relaxed text-neutral-800 dark:text-neutral-100',
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  useEffect(() => {
    if (editor && onEditorReady) onEditorReady(editor);
  }, [editor]);

  // Keep external value changes (e.g. loading a revision) in sync without fighting user typing
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      const { from, to } = editor.state.selection;
      editor.commands.setContent(value || '', { emitUpdate: false });
      try { editor.commands.setTextSelection({ from, to }); } catch {}
    }
  }, [value]);

  if (!editor) return null;

  const h1Count = (editor.getHTML().match(/<h1[^>]*>/gi) || []).length;

  const setLink = () => {
    const prev = editor.getAttributes('link').href;
    const url = window.prompt('Link URL', prev || 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertCallout = () => {
    editor.chain().focus().insertContent(
      '<div class="callout" data-callout="note"><p>📌 <strong>Note:</strong> Add your callout text here.</p></div><p></p>'
    ).run();
  };

  const insertImage = async () => {
    if (!onRequestImageUpload) return;
    const result = await onRequestImageUpload();
    if (result?.url) {
      editor.chain().focus().setImage({ src: result.url, alt: result.alt || '' }).run();
    }
  };

  return (
    <div className="rounded-2xl border border-[#EAEAEA] dark:border-[#292929] overflow-hidden bg-white dark:bg-[#0E0E0E]">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#161616]">
        <ToolbarBtn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="w-4 h-4" /></ToolbarBtn>
        <div className="w-px h-6 bg-[#EAEAEA] dark:bg-[#292929] mx-1" />
        <ToolbarBtn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-4 h-4" /></ToolbarBtn>
        <div className="w-px h-6 bg-[#EAEAEA] dark:bg-[#292929] mx-1" />
        <ToolbarBtn title="Bullet List" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Numbered List" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></ToolbarBtn>
        <div className="w-px h-6 bg-[#EAEAEA] dark:bg-[#292929] mx-1" />
        <ToolbarBtn title="Link" active={editor.isActive('link')} onClick={setLink}><Link2 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Insert Image" onClick={insertImage}><ImageIcon className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn title="Callout / Notice Box" onClick={insertCallout}><MessageSquareWarning className="w-4 h-4" /></ToolbarBtn>
      </div>

      {h1Count > 1 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-bold">
          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
          {h1Count} H1 headings found in this article — use only one H1 per page. Demote the extras to H2/H3.
        </div>
      )}

      <EditorContent editor={editor} />
    </div>
  );
}

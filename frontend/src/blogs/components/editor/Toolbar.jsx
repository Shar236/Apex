import React from 'react';
import {
  Heading1, Heading2, Heading3, Pilcrow, Bold, Italic, Underline as UnderlineIcon,
  List, ListOrdered, Quote, Link2, ImageIcon, Table2, MessageSquareWarning, Minus,
  Undo2, Redo2,
} from 'lucide-react';

const Btn = ({ onClick, active, disabled, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-lg transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
      active
        ? 'bg-brand-pink text-white'
        : 'bg-neutral-100 dark:bg-[#222] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-[#2c2c2c]'
    }`}
  >
    {children}
  </button>
);
const Sep = () => <div className="w-px h-6 bg-[#EAEAEA] dark:bg-[#292929] mx-1" />;

/** Persistent formatting toolbar. Every button is wired to a live command. */
export default function Toolbar({ editor, onOpenLink, onInsertImage }) {
  if (!editor) return null;
  const can = editor.can();

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[#EAEAEA] dark:border-[#292929] bg-neutral-50 dark:bg-[#161616] sticky top-0 z-10">
      <Btn title="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="w-4 h-4" /></Btn>
      <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-4 h-4" /></Btn>
      <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-4 h-4" /></Btn>
      <Btn title="Paragraph" active={editor.isActive('paragraph')} onClick={() => editor.chain().focus().setParagraph().run()}><Pilcrow className="w-4 h-4" /></Btn>
      <Sep />
      <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-4 h-4" /></Btn>
      <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-4 h-4" /></Btn>
      <Btn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-4 h-4" /></Btn>
      <Sep />
      <Btn title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="w-4 h-4" /></Btn>
      <Btn title="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></Btn>
      <Btn title="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="w-4 h-4" /></Btn>
      <Sep />
      <Btn title="Link" active={editor.isActive('link')} onClick={onOpenLink}><Link2 className="w-4 h-4" /></Btn>
      <Btn title="Insert image" onClick={onInsertImage}><ImageIcon className="w-4 h-4" /></Btn>
      <Btn title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><Table2 className="w-4 h-4" /></Btn>
      <Btn title="Callout / info box" active={editor.isActive('callout')} onClick={() => editor.chain().focus().toggleCallout('note').run()}><MessageSquareWarning className="w-4 h-4" /></Btn>
      <Btn title="Separator" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></Btn>
      <Sep />
      <Btn title="Undo" disabled={!can.undo?.()} onClick={() => editor.chain().focus().undo().run()}><Undo2 className="w-4 h-4" /></Btn>
      <Btn title="Redo" disabled={!can.redo?.()} onClick={() => editor.chain().focus().redo().run()}><Redo2 className="w-4 h-4" /></Btn>
    </div>
  );
}

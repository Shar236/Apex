import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import { Bold, Italic, Underline as UnderlineIcon, Link2, Heading2, Heading3 } from 'lucide-react';

const Btn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`ae-bubble__btn ${active ? 'ae-bubble__btn--active' : ''}`}
  >
    {children}
  </button>
);

/** Inline formatting toolbar shown on a non-empty text selection. */
export default function BubbleToolbar({ editor, onOpenLink }) {
  if (!editor) return null;
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="aeBubbleToolbar"
      shouldShow={({ editor: ed, from, to }) =>
        from !== to && !ed.isActive('table') && !ed.isActive('figure')
      }
      options={{ placement: 'top', offset: 8 }}
      className="ae-bubble"
    >
      <Btn title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="w-3.5 h-3.5" /></Btn>
      <Btn title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="w-3.5 h-3.5" /></Btn>
      <Btn title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="w-3.5 h-3.5" /></Btn>
      <span className="ae-bubble__sep" />
      <Btn title="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="w-3.5 h-3.5" /></Btn>
      <Btn title="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="w-3.5 h-3.5" /></Btn>
      <span className="ae-bubble__sep" />
      <Btn title="Link" active={editor.isActive('link')} onClick={onOpenLink}><Link2 className="w-3.5 h-3.5" /></Btn>
    </BubbleMenu>
  );
}

import React, { useState } from 'react';
import {
  Type, Heading1, Heading2, Heading3, ImageIcon, Table2, List, ListOrdered,
  Quote, MessageSquareWarning, Minus,
} from 'lucide-react';

/**
 * The block palette shown by the hover-'+' FloatingMenu and the drag-handle
 * "add block below" action. Pure command dispatch — every entry produces
 * semantic HTML through the editor schema.
 *
 * `at` (optional) is a doc position to insert at; when omitted the block is
 * created at the current selection.
 */
export default function BlockPicker({ editor, at, onRequestImage, onDone }) {
  const [headingOpen, setHeadingOpen] = useState(false);

  if (!editor) return null;

  const chain = () => {
    const c = editor.chain().focus();
    return at == null ? c : c.setTextSelection(at);
  };
  const run = (fn) => { fn(); onDone && onDone(); };

  const insertImage = async () => {
    const res = await onRequestImage?.();
    if (res?.url) run(() => chain().setFigure({ src: res.url, alt: res.alt || '' }).run());
    else onDone && onDone();
  };

  const Item = ({ icon, label, onClick }) => (
    <button type="button" className="ae-picker__item" onClick={onClick}>
      {icon}<span>{label}</span>
    </button>
  );

  return (
    <div className="ae-picker" role="menu">
      <Item icon={<Type className="w-4 h-4" />} label="Text" onClick={() => run(() => chain().setParagraph().run())} />

      <div className="ae-picker__group">
        <button type="button" className="ae-picker__item" onClick={() => setHeadingOpen((v) => !v)}>
          <Heading2 className="w-4 h-4" /><span>Heading</span>
        </button>
        {headingOpen && (
          <div className="ae-picker__sub">
            <Item icon={<Heading1 className="w-4 h-4" />} label="Heading 1" onClick={() => run(() => chain().toggleHeading({ level: 1 }).run())} />
            <Item icon={<Heading2 className="w-4 h-4" />} label="Heading 2" onClick={() => run(() => chain().toggleHeading({ level: 2 }).run())} />
            <Item icon={<Heading3 className="w-4 h-4" />} label="Heading 3" onClick={() => run(() => chain().toggleHeading({ level: 3 }).run())} />
          </div>
        )}
      </div>

      <Item icon={<ImageIcon className="w-4 h-4" />} label="Image" onClick={insertImage} />
      <Item icon={<Table2 className="w-4 h-4" />} label="Table" onClick={() => run(() => chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run())} />
      <Item icon={<List className="w-4 h-4" />} label="Bullet list" onClick={() => run(() => chain().toggleBulletList().run())} />
      <Item icon={<ListOrdered className="w-4 h-4" />} label="Numbered list" onClick={() => run(() => chain().toggleOrderedList().run())} />
      <Item icon={<Quote className="w-4 h-4" />} label="Quote" onClick={() => run(() => chain().toggleBlockquote().run())} />
      <Item icon={<MessageSquareWarning className="w-4 h-4" />} label="Callout" onClick={() => run(() => chain().setCallout('note').run())} />
      <Item icon={<Minus className="w-4 h-4" />} label="Separator" onClick={() => run(() => chain().setHorizontalRule().run())} />
    </div>
  );
}

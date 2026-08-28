import React, { useEffect, useState } from 'react';
import { BubbleMenu } from '@tiptap/react/menus';

/**
 * Shown while a Figure is selected: edit ALT text (kept in sync with the
 * matching draft.images[] row so the Images tab stays authoritative) and
 * remove the image. The caption is edited inline (it's the node's content).
 */
export default function FigureToolbar({ editor, images = [], onImagesChange }) {
  const [alt, setAlt] = useState('');

  useEffect(() => {
    if (editor?.isActive('figure')) setAlt(editor.getAttributes('figure').alt || '');
  }, [editor?.state.selection]);

  if (!editor) return null;

  const commit = (nextAlt) => {
    setAlt(nextAlt);
    const src = editor.getAttributes('figure').src;
    editor.chain().focus().updateFigure({ alt: nextAlt }).run();
    if (src && onImagesChange) {
      onImagesChange(images.map((im) => (im.url === src ? { ...im, alt: nextAlt } : im)));
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="aeFigureToolbar"
      shouldShow={({ editor: ed }) => ed.isActive('figure')}
      options={{ placement: 'top', offset: 8 }}
      className="ae-figbar"
    >
      <span className="ae-figbar__label">ALT</span>
      <input
        value={alt}
        onChange={(e) => commit(e.target.value)}
        placeholder="Describe the image for SEO & screen readers"
        className="ae-figbar__input"
      />
      <button
        type="button"
        className="ae-figbar__remove"
        onClick={() => editor.chain().focus().deleteSelection().run()}
      >
        Remove
      </button>
    </BubbleMenu>
  );
}

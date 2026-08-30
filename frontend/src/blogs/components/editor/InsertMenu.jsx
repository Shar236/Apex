import React, { useState } from 'react';
import { FloatingMenu } from '@tiptap/react/menus';
import { Plus } from 'lucide-react';
import BlockPicker from './BlockPicker.jsx';

/**
 * The hover / empty-line "+" that opens the block palette — Gutenberg-style.
 * Shows on empty top-level paragraphs (and empty headings).
 */
export default function InsertMenu({ editor, onRequestImage }) {
  const [open, setOpen] = useState(false);
  if (!editor) return null;

  return (
    <FloatingMenu
      editor={editor}
      options={{ placement: 'left-start', offset: 4 }}
      shouldShow={({ state }) => {
        const { $anchor, empty } = state.selection;
        if (!empty) return false;
        return (
          $anchor.depth === 1 &&
          $anchor.parent.isTextblock &&
          $anchor.parent.content.size === 0
        );
      }}
      className="ae-insert"
    >
      <button
        type="button"
        className={`ae-insert__btn ${open ? 'ae-insert__btn--open' : ''}`}
        title="Add a block"
        onClick={() => setOpen((v) => !v)}
      >
        <Plus className="w-4 h-4" />
      </button>
      {open && (
        <BlockPicker
          editor={editor}
          onRequestImage={onRequestImage}
          onDone={() => setOpen(false)}
        />
      )}
    </FloatingMenu>
  );
}

import React, { useState } from 'react';
import { DragHandle } from '@tiptap/extension-drag-handle-react';
import { GripVertical, ArrowUp, ArrowDown, Copy, Trash2, Plus } from 'lucide-react';
import { moveBlock, duplicateBlock, deleteBlock } from './blockActions.js';

/**
 * The drag handle + block menu that appears to the left of the hovered block.
 * Drag to reorder (powered by @tiptap/extension-node-range); click for a small
 * menu: insert-below, move up/down, duplicate, delete.
 */
export default function BlockHandle({ editor, onInsertBelow }) {
  const [pos, setPos] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!editor) return null;

  const act = (fn) => {
    if (pos == null) return;
    fn();
    setMenuOpen(false);
  };

  return (
    <DragHandle
      editor={editor}
      onNodeChange={({ pos: p }) => { setPos(p); setMenuOpen(false); }}
      computePositionConfig={{ placement: 'left-start' }}
    >
      <div className="ae-block-handle">
        <button
          type="button"
          className="ae-block-handle__btn"
          title="Add block below"
          onClick={() => { if (pos != null) onInsertBelow(pos); }}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          className="ae-block-handle__btn ae-block-handle__drag"
          title="Drag to move · click for options"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>

        {menuOpen && (
          <div className="ae-block-menu" role="menu">
            <button type="button" onClick={() => act(() => moveBlock(editor, pos, 'up'))}><ArrowUp className="w-3.5 h-3.5" /> Move up</button>
            <button type="button" onClick={() => act(() => moveBlock(editor, pos, 'down'))}><ArrowDown className="w-3.5 h-3.5" /> Move down</button>
            <button type="button" onClick={() => act(() => duplicateBlock(editor, pos))}><Copy className="w-3.5 h-3.5" /> Duplicate</button>
            <button type="button" className="ae-block-menu__danger" onClick={() => act(() => deleteBlock(editor, pos))}><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          </div>
        )}
      </div>
    </DragHandle>
  );
}

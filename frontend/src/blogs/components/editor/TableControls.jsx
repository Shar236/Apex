import React from 'react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  Rows3, Columns3, Trash2, PanelTop, Grid2x2X,
} from 'lucide-react';

const Btn = ({ onClick, title, children }) => (
  <button type="button" onClick={onClick} title={title} className="ae-tablebar__btn">
    {children}
  </button>
);

/** Floating toolbar shown while the caret is inside a table. */
export default function TableControls({ editor }) {
  if (!editor) return null;
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="aeTableControls"
      shouldShow={({ editor: ed }) => ed.isActive('table')}
      options={{ placement: 'top', offset: 8 }}
      className="ae-tablebar"
    >
      <Btn title="Add row above" onClick={() => editor.chain().focus().addRowBefore().run()}><Rows3 className="w-3.5 h-3.5 rotate-180" /> +row↑</Btn>
      <Btn title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}><Rows3 className="w-3.5 h-3.5" /> +row↓</Btn>
      <Btn title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}><Rows3 className="w-3.5 h-3.5 opacity-50" /> −row</Btn>
      <span className="ae-tablebar__sep" />
      <Btn title="Add column left" onClick={() => editor.chain().focus().addColumnBefore().run()}><Columns3 className="w-3.5 h-3.5" /> +col←</Btn>
      <Btn title="Add column right" onClick={() => editor.chain().focus().addColumnAfter().run()}><Columns3 className="w-3.5 h-3.5" /> +col→</Btn>
      <Btn title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}><Columns3 className="w-3.5 h-3.5 opacity-50" /> −col</Btn>
      <span className="ae-tablebar__sep" />
      <Btn title="Toggle header row" onClick={() => editor.chain().focus().toggleHeaderRow().run()}><PanelTop className="w-3.5 h-3.5" /> header</Btn>
      <Btn title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}><Grid2x2X className="w-3.5 h-3.5" /></Btn>
    </BubbleMenu>
  );
}

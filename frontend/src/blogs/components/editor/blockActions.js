/**
 * Top-level block operations for the drag-handle menu.
 * All operate on the doc child that contains `pos` (depth 1).
 */

const topLevelRange = (editor, pos) => {
  const { doc } = editor.state;
  const $pos = doc.resolve(Math.min(pos, doc.content.size));
  // Walk up to depth 1 (a direct child of the document).
  const depth = $pos.depth === 0 ? 0 : 1;
  const before = $pos.before(depth || 1);
  const node = doc.child($pos.index(0));
  return { from: before, to: before + node.nodeSize, node, index: $pos.index(0) };
};

export const deleteBlock = (editor, pos) => {
  const { from, to } = topLevelRange(editor, pos);
  editor.chain().focus().deleteRange({ from, to }).run();
};

export const duplicateBlock = (editor, pos) => {
  const { to, node } = topLevelRange(editor, pos);
  editor
    .chain()
    .focus()
    .insertContentAt(to, node.toJSON())
    .run();
};

export const moveBlock = (editor, pos, dir) => {
  const { doc } = editor.state;
  const { index } = topLevelRange(editor, pos);
  const target = index + (dir === 'up' ? -1 : 1);
  if (target < 0 || target >= doc.childCount) return;

  const node = doc.child(index);
  const from = positionOfChild(doc, index);
  const to = from + node.nodeSize;

  // Insert position, resolved against the doc *after* this node is removed.
  const tr = editor.state.tr.delete(from, to);
  tr.insert(positionOfChild(tr.doc, target), node);
  editor.view.dispatch(tr.scrollIntoView());
  editor.commands.focus();
};

function positionOfChild(doc, index) {
  let pos = 0;
  for (let i = 0; i < index; i += 1) pos += doc.child(i).nodeSize;
  return pos;
}

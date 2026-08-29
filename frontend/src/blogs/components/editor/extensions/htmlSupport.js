import { Extension, Node, mergeAttributes } from '@tiptap/core';

/**
 * Keep pasted markup faithful across the visual ⇄ HTML round-trip.
 *
 * Article = HTML + CSS: the CSS an admin pastes targets `class` / `id` on the
 * article's elements, so the visual editor must not quietly drop them. TipTap
 * only keeps attributes an extension declares, so:
 *
 *   • PreserveAttributes — adds `class` / `id` / `style` as global attributes on
 *     the standard block + table + media nodes, so they survive editing.
 *   • HtmlBlock — a generic `<div>` / `<section>` container (block content) with
 *     the same attributes, so a wrapper like `<div class="conversion-table">`
 *     isn't unwrapped. Lower parse priority than Callout so `[data-callout]`
 *     boxes still become Callout nodes.
 */

const ATTR = (name) => ({
  default: null,
  parseHTML: (el) => el.getAttribute(name),
  renderHTML: (attrs) => (attrs[name] ? { [name]: attrs[name] } : {}),
});

const PRESERVE_ON = [
  'paragraph', 'heading', 'blockquote', 'bulletList', 'orderedList', 'listItem',
  'codeBlock', 'horizontalRule', 'image', 'figure', 'callout', 'htmlBlock',
  'table', 'tableRow', 'tableHeader', 'tableCell',
];

export const PreserveAttributes = Extension.create({
  name: 'preserveAttributes',
  addGlobalAttributes() {
    return [
      {
        types: PRESERVE_ON,
        attributes: { class: ATTR('class'), id: ATTR('id'), style: ATTR('style') },
      },
    ];
  },
});

export const HtmlBlock = Node.create({
  name: 'htmlBlock',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return { class: ATTR('class'), id: ATTR('id'), style: ATTR('style') };
  },

  parseHTML() {
    return [
      { tag: 'div', priority: 10 },
      { tag: 'section', priority: 10 },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes), 0];
  },
});

export default { PreserveAttributes, HtmlBlock };

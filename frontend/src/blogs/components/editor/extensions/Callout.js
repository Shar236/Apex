import { Node, mergeAttributes } from '@tiptap/core';

const TYPES = ['note', 'warning', 'success'];

/**
 * Callout / info box.
 *
 * Renders: <div class="callout" data-callout="note|warning|success"><p>…</p></div>
 * — the same markup the old raw-HTML "insert callout" button produced and that
 * `blog.css` (.prose-blog div[data-callout]) already styles, so existing posts
 * round-trip and the public page is unchanged.
 *
 * Content is block-level (paragraphs, lists) so the admin edits it inline.
 */
export const Callout = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,
  draggable: true,

  addAttributes() {
    return {
      type: {
        default: 'note',
        parseHTML: (el) => el.getAttribute('data-callout') || 'note',
        renderHTML: (attrs) => ({ 'data-callout': TYPES.includes(attrs.type) ? attrs.type : 'note' }),
      },
    };
  },

  parseHTML() {
    return [
      { tag: 'div.callout' },
      { tag: 'div[data-callout]' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'callout' }), 0];
  },

  addCommands() {
    return {
      setCallout:
        (type = 'note') =>
        ({ commands }) =>
          commands.wrapIn(this.name, { type }),
      toggleCallout:
        (type = 'note') =>
        ({ commands }) =>
          commands.toggleWrap(this.name, { type }),
      setCalloutType:
        (type) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, { type }),
    };
  },
});

export default Callout;

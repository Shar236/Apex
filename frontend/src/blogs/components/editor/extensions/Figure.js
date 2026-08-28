import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Figure — an image with an optional, inline-editable caption.
 *
 * Renders exactly:
 *   <figure><img src alt loading="lazy" /><figcaption>…caption…</figcaption></figure>
 *
 * The node's *content* is the caption (inline), so the admin types the caption
 * straight into the figure. `src`/`alt` are attributes. parseHTML reads them
 * back from any `<figure>` that contains an `<img>`, so save → reopen round-trips
 * and pre-existing `<figure>` markup is preserved.
 */
export const Figure = Node.create({
  name: 'figure',
  group: 'block',
  content: 'inline*',
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      title: { default: null },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'figure',
        // Only claim <figure> elements that actually wrap an image.
        getAttrs: (el) => {
          const img = el.querySelector('img');
          if (!img) return false;
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || '',
            title: img.getAttribute('title') || null,
          };
        },
        contentElement: 'figcaption',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, ...rest } = HTMLAttributes;
    return [
      'figure',
      mergeAttributes(rest),
      ['img', { src, alt: alt || '', title: title || undefined, loading: 'lazy' }],
      ['figcaption', 0],
    ];
  },

  addCommands() {
    return {
      setFigure:
        (attrs) =>
        ({ chain }) =>
          chain()
            .insertContent({ type: this.name, attrs, content: [] })
            .run(),
      updateFigure:
        (attrs) =>
        ({ commands }) =>
          commands.updateAttributes(this.name, attrs),
    };
  },
});

export default Figure;

import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { NodeRange } from '@tiptap/extension-node-range';
import Figure from './extensions/Figure.js';
import Callout from './extensions/Callout.js';

/**
 * Shared TipTap configuration for the visual article builder.
 *
 * StarterKit v3.30 already bundles Link, Underline and HorizontalRule, so those
 * are configured through it rather than added again. Added on top: Image (bare
 * `<img>` round-trip), the Table family, Placeholder, the custom Figure/Callout
 * blocks, and NodeRange (block drag-to-reorder).
 *
 * The content area keeps the `prose-blog` class so Edit mode looks exactly like
 * the published article (blog.css is imported by <ArticleEditor>).
 */
export function useArticleEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer' },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') return 'Heading';
          if (node.type.name === 'figure') return 'Write a caption…';
          return "Write, or press '+' to add a block…";
        },
        includeChildren: true,
      }),
      Image.configure({ HTMLAttributes: { loading: 'lazy' } }),
      Figure,
      Callout,
      Table.configure({ resizable: true, HTMLAttributes: { class: 'table-wrap' } }),
      TableRow,
      TableHeader,
      TableCell,
      NodeRange.configure({ key: null }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose-blog blog-cms-content min-h-[360px] max-w-none px-10 py-6 focus:outline-none',
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  return editor;
}

export default useArticleEditor;

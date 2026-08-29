/**
 * One place for every "turn selection into a link / edit a link / remove a link"
 * operation, so the Toolbar, the Link dialog and the Links tab all behave the
 * same — and so a selection made in the editor survives the user moving focus
 * into a dialog field or switching to the Links tab (items B / C / D / 8–13).
 */

/** Allow site-relative, hash, mailto, tel and http(s). Reject javascript:/data:/vbscript:. */
export const isSafeLinkHref = (href) => {
  const h = String(href || '').trim();
  if (!h) return false;
  if (/^(?:\/|#|mailto:|tel:)/i.test(h)) return true;
  if (/^https?:\/\/[^\s]+$/i.test(h)) return true;
  return false;
};

export const linkHrefError = (href) => {
  const h = String(href || '').trim();
  if (!h) return 'Enter a URL.';
  if (/^\s*(?:javascript|vbscript|data):/i.test(h)) return 'That URL scheme is not allowed.';
  if (!isSafeLinkHref(h)) return 'Use a full https:// URL or a site path starting with “/”.';
  return null;
};

/** rel for a link — noopener noreferrer whenever it opens a new tab. */
export const buildRel = ({ target, nofollow, sponsored, ugc } = {}) => {
  const parts = [];
  if (target === '_blank') parts.push('noopener', 'noreferrer');
  if (nofollow) parts.push('nofollow');
  if (sponsored) parts.push('sponsored');
  if (ugc) parts.push('ugc');
  return [...new Set(parts)].join(' ');
};

const inBounds = (editor, range) => {
  if (!range || range.from == null || range.to == null) return false;
  const max = editor.state.doc.content.size;
  return range.from >= 0 && range.to <= max && range.from !== range.to;
};

/**
 * Resolve the range a link operation should target:
 *   1. the live editor selection, if it isn't collapsed
 *   2. otherwise the last non-empty selection we saved before focus left
 * Returns null when there is genuinely nothing selected.
 */
export const resolveLinkRange = (editor, savedRange) => {
  const sel = editor.state.selection;
  if (!sel.empty) return { from: sel.from, to: sel.to };
  if (inBounds(editor, savedRange)) return { from: savedRange.from, to: savedRange.to };
  return null;
};

/**
 * Insert or update a link.
 * @returns {{ ok: boolean, error?: string, inserted?: 'wrapped'|'text' }}
 */
export const applyLink = (editor, savedRange, { href, text, target, rel } = {}) => {
  if (!editor) return { ok: false, error: 'Editor not ready.' };
  const err = linkHrefError(href);
  if (err) return { ok: false, error: err };

  const attrs = {
    href: String(href).trim(),
    target: target === '_blank' ? '_blank' : null,
    rel: rel || (target === '_blank' ? 'noopener noreferrer' : null),
  };
  const range = resolveLinkRange(editor, savedRange);
  const chain = editor.chain().focus();

  if (!range) {
    const label = (text && text.trim()) || attrs.href;
    // insertContent with a link mark — never nests because there is no selection.
    chain.insertContent({ type: 'text', text: label, marks: [{ type: 'link', attrs }] }).run();
    return { ok: true, inserted: 'text' };
  }

  chain.setTextSelection(range);
  const selectedText = editor.state.doc.textBetween(range.from, range.to, ' ');
  const wantText = text && text.trim() && text.trim() !== selectedText ? text.trim() : null;

  if (wantText) {
    chain
      .insertContent(wantText)
      .setTextSelection({ from: range.from, to: range.from + wantText.length })
      .extendMarkRange('link')
      .unsetLink()      // clear any existing link so we never stack <a><a>
      .setLink(attrs)
      .run();
  } else {
    chain.extendMarkRange('link').unsetLink().setLink(attrs).run();
  }
  return { ok: true, inserted: 'wrapped' };
};

/** Move the selection onto the first link whose href matches, so it can be edited. */
export const selectLinkByHref = (editor, href) => {
  if (!editor) return false;
  const { doc } = editor.state;
  let range = null;
  doc.descendants((node, pos) => {
    if (range) return false;
    const mark = node.marks?.find((mk) => mk.type.name === 'link' && mk.attrs.href === href);
    if (mark) range = { from: pos, to: pos + node.nodeSize };
    return true;
  });
  if (!range) return false;
  editor.chain().focus().setTextSelection(range).extendMarkRange('link').run();
  return true;
};

/** Remove the first link whose href matches (keeps the anchor text as plain text). */
export const removeLinkByHref = (editor, href) => {
  if (!selectLinkByHref(editor, href)) return false;
  editor.chain().focus().extendMarkRange('link').unsetLink().run();
  return true;
};

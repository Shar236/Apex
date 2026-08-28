import React, { useState } from 'react';
import { imageUrl, cldSrcSet } from '../../lib/imageUrl.js';

/**
 * Responsive, lazy figure for code articles.
 *  - required: src, alt, width, height  (width/height prevent layout shift)
 *  - lazy + async by default; pass `priority` for the hero/LCP image
 *  - if the file is missing, shows a labelled placeholder instead of a broken img
 */
export default function ArticleFigure({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
  sizes,
  srcSet,
  className = '',
}) {
  const [failed, setFailed] = useState(false);
  const ratio = width && height ? `${width} / ${height}` : '16 / 9';

  // Cloudinary assets get f_auto,q_auto + a responsive srcset for free; local or
  // external images pass straight through untouched.
  const resolvedSrc = imageUrl(src);
  const autoSrcSet = srcSet || cldSrcSet(src);
  const autoSizes = autoSrcSet
    ? sizes || '(max-width: 768px) 100vw, 800px'
    : undefined;

  return (
    <figure className={`ca-figure ${className}`.trim()}>
      {failed ? (
        <div className="ca-figure__fallback" style={{ aspectRatio: ratio }} role="img" aria-label={alt}>
          <span>{alt}</span>
        </div>
      ) : (
        <img
          src={resolvedSrc}
          srcSet={autoSrcSet || undefined}
          sizes={autoSizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'auto' : 'async'}
          fetchPriority={priority ? 'high' : undefined}
          onError={() => setFailed(true)}
        />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

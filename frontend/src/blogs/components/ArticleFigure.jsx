import React, { useState } from 'react';

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

  return (
    <figure className={`ca-figure ${className}`.trim()}>
      {failed ? (
        <div className="ca-figure__fallback" style={{ aspectRatio: ratio }} role="img" aria-label={alt}>
          <span>{alt}</span>
        </div>
      ) : (
        <img
          src={src}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
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

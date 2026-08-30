'use client';

import { useState } from 'react';
import Image from 'next/image';

/**
 * Responsive, lazy figure for code articles.
 *  - required: src, alt, width, height (prevent layout shift)
 *  - lazy by default; pass `priority` for the hero/LCP image
 *  - if the file is missing, shows a labelled placeholder instead of a broken img
 */
export function ArticleFigure({
  src,
  alt,
  width,
  height,
  caption,
  priority = false,
  className = '',
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ratio = width && height ? `${width} / ${height}` : '16 / 9';

  return (
    <figure className={`ca-figure ${className}`.trim()}>
      {failed || !src ? (
        <div className="ca-figure__fallback" style={{ aspectRatio: ratio }} role="img" aria-label={alt}>
          <span>{alt}</span>
        </div>
      ) : (
        <Image src={src} alt={alt} width={width} height={height} style={{ width: '100%', height: 'auto' }} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} onError={() => setFailed(true)} />
      )}
      {caption ? <figcaption>{caption}</figcaption> : null}
    </figure>
  );
}

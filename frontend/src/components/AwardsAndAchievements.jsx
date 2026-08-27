import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Trophy,
  Play,
  X,
  ExternalLink,
  Calendar,
  Building2,
  Award as AwardIcon,
  ChevronRight,
  Star,
  Sparkles,
  Loader2,
  TriangleAlert,
} from 'lucide-react';
import { awardApi, applyPageMetadata, setStructuredData } from '../lib/api';

const CLOUD_NAME = 'nbcbpuql';
const PAGE_SIZE = 9;

/**
 * Build a Cloudinary responsive image URL for a given width.
 * The server stores f_auto,q_auto URLs; we inject c_limit + w_ for
 * responsive delivery while keeping existing optimization tokens.
 */
export const cloudinaryAwardUrl = (url, width) => {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes('/image/upload/')) return url;
  const cleaned = url.replace('/image/upload/f_auto,q_auto/', '/image/upload/');
  if (new RegExp(`(?:^|,)w_${width}(?![0-9])`, 'i').test(cleaned)) return cleaned;
  return cleaned.replace('/image/upload/', `/image/upload/c_limit,f_auto,q_auto,w_${width}/`);
};

/**
 * Branded inline-SVG placeholder used as the image fallback whenever a
 * Cloudinary image is missing or fails to load. No extra network requests.
 */
const FALLBACK_IMG =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#1a1a1a"/>
          <stop offset="1" stop-color="#2d0a19"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#g)"/>
      <circle cx="400" cy="250" r="120" fill="#FF005C" opacity="0.18"/>
      <circle cx="620" cy="140" r="70" fill="#FF005C" opacity="0.10"/>
      <g transform="translate(340 190) scale(1)">
        <path d="M30 20h100v14H30z" fill="#FF005C"/>
        <path d="M80 20V6h18v14" fill="#FF005C"/>
        <path d="M80 6H62v14h18" fill="#FF005C"/>
        <rect x="62" y="6" width="9" height="9" fill="#FF2A7B"/>
        <rect x="80" y="6" width="9" height="9" fill="#E00052"/>
      </g>
      <g transform="translate(80 20) scale(2)"><text y="28" x="180" fill="#FF005C" font-family="Arial, sans-serif" font-weight="bold">★</text></g>
      <text x="400" y="440" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="#FF005C" font-weight="bold">APEX VOUCHERS</text>
      <text x="400" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#94a3b8">Awards &amp; Achievements</text>
    </svg>`
  );

export const normalizeAward = (a) => ({
  id: a._id || a.id,
  title: a.title || 'Untitled Award',
  description: a.description || '',
  year: a.year || '',
  organization: a.organization || '',
  category: a.category || 'Recognition',
  imageUrl: a.imageUrl || '',
  imageAlt: a.imageAlt || `Award: ${a.title || 'Apex Vouchers achievement'}`,
  videoUrl: a.videoUrl || '',
  videoThumbnail: a.videoThumbnail || '',
  externalLink: a.externalLink || '',
  featured: !!a.featured,
  status: a.status || (a.isActive !== false && a.published !== false ? 'active' : 'inactive'),
});

export const AwardImage = ({ award, width = 800, className = '', eager = false }) => {
  const [src, setSrc] = useState(
    award.imageUrl ? cloudinaryAwardUrl(award.imageUrl, width) : FALLBACK_IMG
  );
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(award.imageUrl ? cloudinaryAwardUrl(award.imageUrl, width) : FALLBACK_IMG);
    setFailed(false);
  }, [award.imageUrl, width]);

  return (
    <img
      src={failed ? FALLBACK_IMG : src}
      alt={award.imageAlt}
      width={width}
      height={Math.round((width * 3) / 4)}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={`${className} ${failed ? 'object-cover' : 'object-cover'}`}
    />
  );
};

export const StatusPill = ({ award }) => {
  if (award.featured) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider shadow-md">
        <Star className="w-3 h-3 fill-current" /> Featured
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/90 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-md">
      <AwardIcon className="w-3 h-3" /> {award.category || 'Recognition'}
    </span>
  );
};

export const AwardCard = ({ award, index, onView, onPlay }) => {
  return (
    <article
      className="group relative flex flex-col rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] card-shadow overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:border-brand-pink/40 animate-fade-up"
      style={{ animationDelay: `${Math.min(index * 70, 420)}ms` }}
    >
      {/* Media */}
      <button
        type="button"
        onClick={() => onView(award)}
        className="relative block w-full aspect-4/3 overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-pink"
        aria-label={`View details of ${award.title}`}
      >
        <AwardImage award={award} width={800} className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-70 transition-opacity duration-300" />

        {/* Play video overlay */}
        {award.videoUrl && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-14 h-14 rounded-full bg-white/90 dark:bg-brand-pink shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Play className="w-6 h-6 text-brand-pink fill-brand-pink dark:text-white dark:fill-white ml-0.5" />
            </span>
          </span>
        )}

        {/* Featured badge */}
        <div className="absolute top-3 left-3"><StatusPill award={award} /></div>
      </button>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 space-y-3">
        <div className="flex items-start gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] border border-brand-pink/20 flex items-center justify-center shrink-0 mt-0.5">
            <Trophy className="w-4 h-4 text-brand-pink" />
          </span>
          <div className="min-w-0">
            <h3 className="font-heading font-black text-base text-neutral-900 dark:text-white leading-tight line-clamp-2">
              {award.title}
            </h3>
            {award.organization && (
              <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] mt-0.5 flex items-center gap-1">
                <Building2 className="w-3 h-3 text-brand-pink" />
                <span className="line-clamp-1">{award.organization}</span>
              </p>
            )}
          </div>
        </div>

        <p className="text-xs font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed line-clamp-2 flex-1">
          {award.description || 'A recognised achievement from the Apex Vouchers journey.'}
        </p>

        <div className="pt-2 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onView(award)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl btn-pink py-2! px-3.5! text-xs! font-black cursor-pointer"
          >
            View Details <ChevronRight className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
          {award.videoUrl && (
            <button
              type="button"
              onClick={() => onPlay(award)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink border border-brand-pink/25 text-xs font-black transition-colors hover:bg-[#FFE0EB] dark:hover:bg-[#3a0f22] cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-brand-pink" /> Play Video
            </button>
          )}
        </div>
      </div>
    </article>
  );
};
export const AwardsAndAchievements = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [featuredCount, setFeaturedCount] = useState(0);
  const [selectedAward, setSelectedAward] = useState(null);
  const [playVideo, setPlayVideo] = useState(null);

  const loadAwards = useCallback(async (nextPage = 1, append = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await awardApi.list({ page: nextPage, limit: PAGE_SIZE });
      if (res.success) {
        const next = (res.data || []).map(normalizeAward);
        setAwards((prev) => (append ? [...prev, ...next] : next));
        setTotal(res.total || 0);
        setFeaturedCount(res.featuredCount || 0);
        setHasMore(!!res.hasMore);
        setPage(nextPage);
      } else {
        setError(res.message || 'Failed to load awards');
        setAwards([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load awards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAwards(1, false);
  }, [loadAwards]);

  // Page metadata + structured data for SEO
  useEffect(() => {
    applyPageMetadata({
      title: 'Awards & Achievements | Apex Vouchers',
      description:
        'Explore the awards, recognitions, certificates and milestones earned by Apex Vouchers — trusted partner for discounted exam vouchers.',
      ogTitle: 'Awards & Achievements | Apex Vouchers',
      ogDescription:
        'Recognitions, certificates and achievements earned by Apex Vouchers on our mission to make exam vouchers affordable.',
      ogType: 'website',
      canonical: `${typeof window !== 'undefined' ? window.location.origin : ''}/awards`,
    });
    setStructuredData('awards-page', {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Apex Vouchers Awards & Achievements',
      itemListElement: awards.slice(0, 12).map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'CreativeWork',
          name: a.title,
          description: a.description,
          datePublished: a.year || undefined,
        },
      })),
    });
    return () => setStructuredData('awards-page', null);
  }, [awards]);

  // Prevent body scroll while a modal is open + Escape to close
  useEffect(() => {
    const anyOpen = !!selectedAward || !!playVideo;
    if (!anyOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelectedAward(null);
        setPlayVideo(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [selectedAward, playVideo]);

  const featured = awards.find((a) => a.featured) || null;

  return (
<section className="relative bg-white dark:bg-[#0A0A0A] text-neutral-900 dark:text-white transition-colors duration-300 overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-pink/8 blur-3xl animate-float-gentle" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-[#6C3CE0]/8 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[11px] font-black uppercase tracking-widest border border-brand-pink/25 mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Our Milestones
          </span>
          <h1 className="font-heading font-black text-3xl sm:text-4xl lg:text-5xl tracking-tight mb-4">
            Awards &amp; <span className="text-gradient-pink">Achievements</span>
          </h1>
          <p className="text-sm sm:text-base font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed">
            Recognitions, honours and milestones earned along the way — proof of our commitment to genuine
            exam vouchers, fast delivery and trusted customer support.
          </p>
        </div>

        {/* Loading state */}
        {loading && awards.length === 0 && (
          <div className="flex items-center justify-center py-20 text-neutral-500 dark:text-neutral-400 gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-brand-pink" />
            <span className="text-sm font-bold">Loading achievements…</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 mx-auto flex items-center justify-center mb-4">
              <TriangleAlert className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="font-heading font-black text-lg mb-1.5">Couldn’t load achievements</h2>
            <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5] mb-5">{error}</p>
            <button onClick={() => loadAwards(1, false)} className="btn-pink text-xs! font-black px-5 py-3! rounded-xl">
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && awards.length === 0 && (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-neutral-100 dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] flex items-center justify-center mx-auto">
              <Trophy className="w-7 h-7 text-neutral-400" />
            </div>
            <p className="font-heading font-black text-lg">New achievements coming soon!</p>
            <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5]">
              We’re adding our latest awards and recognitions here.
            </p>
          </div>
        )}
        {/* Featured spotlight */}
        {featured && awards.length > 1 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-brand-pink fill-brand-pink" />
              <h2 className="font-heading font-black text-lg sm:text-xl">Featured Achievement</h2>
            </div>
            <div
              className="group relative grid md:grid-cols-2 rounded-3xl overflow-hidden border border-brand-pink/25 bg-white dark:bg-[#161616] card-shadow hover:shadow-2xl transition-all duration-300 cursor-pointer animate-fade-up"
              onClick={() => setSelectedAward(featured)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedAward(featured); } }}
            >
              <div className="relative aspect-video md:aspect-auto md:min-h-72 overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E]">
                <AwardImage award={featured} width={1200} eager className="w-full h-full transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 via-black/10 to-transparent" />
                {featured.videoUrl && (
                  <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-brand-pink text-brand-pink dark:text-white text-[11px] font-black shadow-lg">
                    <Play className="w-3.5 h-3.5 fill-current" /> Watch Video
                  </span>
                )}
                <span className="absolute top-4 left-4"><StatusPill award={featured} /></span>
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-10 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {featured.year && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-xs font-black border border-brand-pink/20">
                      <Calendar className="w-3 h-3" /> {featured.year}
                    </span>
                  )}
                  {featured.organization && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-[#262626] text-neutral-600 dark:text-neutral-300 text-xs font-bold">
                      <Building2 className="w-3 h-3" /> {featured.organization}
                    </span>
                  )}
                </div>
                <h3 className="font-heading font-black text-2xl sm:text-3xl leading-tight">{featured.title}</h3>
                <p className="text-sm font-medium text-neutral-500 dark:text-[#B5B5B5] leading-relaxed line-clamp-3">
                  {featured.description}
                </p>
                <div className="pt-1 inline-flex items-center gap-2 text-brand-pink text-sm font-black">
                  View Full Details <ChevronRight className="w-4 h-4" strokeWidth={3} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Awards Grid — 1 / 2 / 3 columns */}
        {!loading && !error && awards.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-7">
              {awards.map((award, idx) => (
                <AwardCard
                  key={award.id}
                  award={award}
                  index={idx}
                  onView={(a) => setSelectedAward(a)}
                  onPlay={(a) => setPlayVideo(a)}
                />
              ))}
            </div>

            {/* Load more */}
            {hasMore && (
              <div className="flex justify-center mt-10">
                <button
                  onClick={() => loadAwards(page + 1, true)}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl btn-secondary text-sm! font-black disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-brand-pink" /> Loading…
                    </>
                  ) : (
                    <>
                      Load More Achievements <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}

            <p className="text-center text-[11px] font-bold text-neutral-400 dark:text-neutral-500 mt-6" aria-live="polite">
              Showing {awards.length} of {total} achievements{featuredCount ? ` • ${featuredCount} featured` : ''}
            </p>
          </>
        )}

        {/* Inline mini video player used on the same page when user plays from a card */}
        {playVideo && !selectedAward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <AwardVideoModal award={playVideo} onClose={() => setPlayVideo(null)} />
          </div>
        )}

        {/* Detail modal */}
        {selectedAward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <AwardDetailModal
              award={selectedAward}
              onClose={() => setSelectedAward(null)}
              onPlay={() => { setSelectedAward(null); setPlayVideo(selectedAward); }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default AwardsAndAchievements;
/* ── Award Detail Modal ──────────────────────────────────────────────────── */

export const AwardDetailModal = ({ award, onClose, onPlay }) => {
  const closeRef = useRef(null);
  const [fullImage, setFullImage] = useState(false);

  // Focus the close button on open for keyboard accessibility
  useEffect(() => {
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="award-modal-title"
      className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#161616] border border-[#EAEAEA] dark:border-[#292929] shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        aria-label="Close award details"
        className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/90 dark:bg-[#262626] text-neutral-700 dark:text-neutral-200 shadow-lg hover:bg-brand-pink hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Hero image */}
      <div className="relative aspect-video overflow-hidden bg-neutral-100 dark:bg-[#0E0E0E]">
        <AwardImage award={award} width={1600} eager className="w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-6 flex items-center gap-2 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-brand-pink text-white text-[10px] font-black uppercase tracking-wider">
            {award.featured ? '★ Featured' : award.category || 'Recognition'}
          </span>
          {award.year && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white text-[11px] font-black">
              <Calendar className="w-3 h-3 text-brand-pink" /> {award.year}
            </span>
          )}
        </div>
        {/* Open full-size image */}
        <button
          type="button"
          onClick={() => setFullImage(true)}
          className="absolute bottom-4 right-4 sm:bottom-5 sm:right-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-sm text-white text-[11px] font-black hover:bg-brand-pink transition-colors cursor-pointer"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Full Size
        </button>
      </div>

      <div className="p-5 sm:p-8 pt-6">
        <h3 id="award-modal-title" className="font-heading font-black text-2xl sm:text-3xl leading-tight mb-3">
          {award.title}
        </h3>

        {/* Meta rows */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {award.organization && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-[#262626] text-xs font-bold text-neutral-600 dark:text-neutral-300">
              <Building2 className="w-3.5 h-3.5 text-brand-pink" />
              {award.organization}
            </span>
          )}
          {award.year && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-xs font-black text-brand-pink border border-brand-pink/20">
              <Calendar className="w-3.5 h-3.5" /> Awarded {award.year}
            </span>
          )}
          {award.externalLink && (
            <a
              href={award.externalLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 text-xs font-black border border-sky-200/70 dark:border-sky-900 hover:bg-sky-100 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Learn More
            </a>
          )}
        </div>

        <p className="text-sm sm:text-[15px] font-medium text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
          {award.description || 'No additional details available for this achievement yet.'}
        </p>

        {/* Video CTA */}
        {award.videoUrl && (
          <button
            type="button"
            onClick={onPlay}
            className="mt-6 inline-flex items-center gap-2.5 px-5 py-3.5 rounded-2xl btn-pink text-white font-black text-sm shadow-xl cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" /> Watch Award Video
          </button>
        )}
      </div>

      {/* Full-size image overlay */}
      {fullImage && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in duration-200"
          onClick={() => setFullImage(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Full size award image"
        >
          <button
            type="button"
            onClick={() => setFullImage(false)}
            aria-label="Close full size image"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/15 text-white hover:bg-brand-pink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={cloudinaryAwardUrl(award.imageUrl || '', 2000)}
            alt={award.imageAlt}
            className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
/* ── Award Video Modal ───────────────────────────────────────────────────── */

export const AwardVideoModal = ({ award, onClose }) => {
  const closeRef = useRef(null);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => closeRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, []);

  // Only a real <video> element is mounted here (on-demand). Nothing is
  // fetched from Cloudinary until the visitor opens the video.
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${award.title}`}
      className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#0A0A0A] border border-brand-pink/30 shadow-2xl animate-in slide-in-from-bottom-4 duration-200"
    >
      <button
        ref={closeRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onClose?.();
        }}
        aria-label="Close video player"
        className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-brand-pink transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="w-full aspect-video bg-black">
        {videoError ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 space-y-2">
            <TriangleAlert className="w-8 h-8 text-amber-400" />
            <p className="text-sm font-bold text-white">This video could not be loaded.</p>
            <p className="text-xs text-neutral-400">Please try again later or check back soon.</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            src={award.videoUrl}
            poster={award.videoThumbnail || cloudinaryAwardUrl(award.imageUrl || '', 1600)}
            controls
            autoPlay
            playsInline
            controlsList="nodownload"
            preload="metadata"
            onError={() => setVideoError(true)}
            className="w-full h-full object-contain"
          >
            <track kind="captions" label="None" />
            Your browser does not support embedded videos. You can{' '}
            <a href={award.videoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-pink underline">
              open the video directly
            </a>
            .
          </video>
        )}
      </div>

      <div className="p-4 sm:p-5 bg-white dark:bg-[#161616] flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="font-heading font-black text-sm sm:text-base text-neutral-900 dark:text-white line-clamp-2">{award.title}</p>
          {award.organization && (
            <p className="text-[11px] font-bold text-neutral-500 dark:text-[#B5B5B5] mt-0.5 flex items-center gap-1">
              <Building2 className="w-3 h-3 text-brand-pink" /> {award.organization}
            </p>
          )}
        </div>
        <a
          href={award.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FFF0F5] dark:bg-[#2A0A17] text-brand-pink text-[11px] font-black border border-brand-pink/25 shrink-0 hover:bg-[#FFE0EB] transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Open
        </a>
      </div>
    </div>
  );
};
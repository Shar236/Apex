import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, Calendar, Loader2, BookOpen } from 'lucide-react';
import { awardApi } from '../lib/api';
import { publicBlogApi } from '../blogs/lib/blogApi.js';
import {
  normalizeAward,
  AwardCard,
  AwardDetailModal,
  AwardVideoModal,
} from './AwardsAndAchievements';
import { SectionHeading } from './ui';

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '');

/**
 * Awards & Achievements Section for Blog Page
 * Consumes the existing Awards API/database and displays active/featured awards in a responsive 3-col grid.
 * Hides completely if no awards exist.
 */
const BlogAwardsSection = () => {
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAward, setSelectedAward] = useState(null);
  const [playVideo, setPlayVideo] = useState(null);

  const loadAwards = useCallback(async () => {
    try {
      setLoading(true);
      const res = await awardApi.list({ limit: 12 });
      if (res.success && Array.isArray(res.data)) {
        setAwards(res.data.map(normalizeAward));
      } else {
        setAwards([]);
      }
    } catch {
      setAwards([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAwards();
  }, [loadAwards]);

  // Modal accessibility: Prevent body scroll and close on Escape
  useEffect(() => {
    const anyOpen = !!selectedAward || !!playVideo;
    if (!anyOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedAward(null);
        setPlayVideo(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedAward, playVideo]);

  // Empty state requirement: If no awards, do not show an empty section — simply hide
  if (!loading && awards.length === 0) {
    return null;
  }

  return (
    <div className="mt-16 sm:mt-24 pt-16 sm:pt-20 border-t border-[var(--color-line)]">
      {/* Section Header */}
      <SectionHeading
        eyebrow="Recognitions & Achievements"
        title="Awards & Achievements"
        subtitle="Recognitions and achievements that make Apex Vouchers proud."
      />

      {/* Responsive Grid Layout: Desktop 3-col, Tablet 2-col, Mobile 1-col */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {awards.map((award, index) => (
          <AwardCard
            key={award.id || index}
            award={award}
            index={index}
            onView={(a) => setSelectedAward(a)}
            onPlay={(a) => setPlayVideo(a)}
          />
        ))}
      </div>

      {/* Award Detail Modal (Reusing existing modal) */}
      {selectedAward && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedAward(null);
          }}
        >
          <AwardDetailModal
            award={selectedAward}
            onClose={() => setSelectedAward(null)}
            onPlay={() => {
              const toPlay = selectedAward;
              setSelectedAward(null);
              setPlayVideo(toPlay);
            }}
          />
        </div>
      )}

      {/* Award Video Modal (Reusing existing modal) */}
      {playVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPlayVideo(null);
          }}
        >
          <AwardVideoModal
            award={playVideo}
            onClose={() => setPlayVideo(null)}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Students Diary & Exam Guides — dynamic homepage section.
 * Loads the latest published blog posts from the CMS and links to each
 * article's dedicated SEO-friendly URL (/blog/:slug). No modals.
 */
export const ExamGuides = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    publicBlogApi.list({ limit: 6 })
      .then((res) => {
        if (cancelled) return;
        if (res.success) setPosts(res.data || []);
        else setError(res.message || 'Failed to load articles');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Failed to load articles');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const featured = posts.find((p) => p.featured);
  const gridPosts = featured ? posts.filter((p) => p._id !== featured._id) : posts;

  return (
    <section className="py-16 sm:py-24 bg-[var(--color-surface)] border-b border-[var(--color-line)] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <SectionHeading
          eyebrow="Students Diary & Guides"
          title="Students Diary & Exam Guides"
          subtitle="Guides on PTE, GRE, TOEFL, IELTS, admissions, and education loans written specifically for Indian students."
        />
        <div className="flex justify-center -mt-4 mb-12">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-full bg-[var(--color-surface)] text-[var(--color-accent)] font-medium text-xs border border-[var(--color-accent)]/45 hover:bg-[var(--color-accent)]/[0.06] transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" /> View All Articles <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12 text-[var(--color-ink-muted)] gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
            <span className="text-xs font-normal">Loading latest guides…</span>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="py-12 text-center">
            <p className="text-sm font-normal text-[var(--color-ink-muted)]">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posts.length === 0 && (
          <div className="py-12 text-center space-y-2">
            <p className="font-heading font-medium text-lg text-[var(--color-ink)]">New guides coming soon!</p>
            <p className="text-sm font-normal text-[var(--color-ink-muted)]">
              Our editorial team is preparing fresh exam guides for you.
            </p>
          </div>
        )}

        {/* Featured + Grid (all cards are links — no modals) */}
        {!loading && !error && posts.length > 0 && (
          <>
            {featured && (
              <Link
                to={`/blog/${featured.slug}`}
                className="group relative grid md:grid-cols-2 rounded-3xl overflow-hidden border border-[var(--color-line)] bg-[#0B0D12] shadow-sm hover:shadow-xl transition-all duration-300 mb-10"
              >
                <div className="relative aspect-video md:aspect-auto md:min-h-72 overflow-hidden">
                  {featured.coverImage ? (
                    <img src={featured.coverImage} alt={featured.coverImageAlt || featured.title} width={800} height={450} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 bg-[#0B0D12]">No image</div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t md:bg-linear-to-r from-[#0B0D12] via-[#0B0D12]/40 to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-[var(--color-accent)] text-white text-[11px] font-medium uppercase tracking-wider shadow-md">
                    {featured.category}
                  </span>
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-10 space-y-3.5 bg-[#0B0D12] text-white">
                  <div className="flex items-center gap-3 text-[11px] font-normal text-neutral-400">
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {fmtDate(featured.publishedAt)}</span>
                    {featured.readingTime ? <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-[var(--color-accent)]" /> {featured.readingTime} min read</span> : null}
                  </div>
                  <h3 className="font-heading font-medium text-2xl sm:text-3xl leading-snug">{featured.title}</h3>
                  <p className="text-neutral-300 text-sm font-normal leading-relaxed line-clamp-3">{featured.excerpt}</p>
                  <span className="inline-flex items-center gap-2 text-[var(--color-accent)] font-medium text-sm pt-1 group-hover:gap-3 transition-all">
                    Read Article <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </div>
              </Link>
            )}

            {/* Article Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {gridPosts.map((post, idx) => (
                <Link
                  key={post._id || post.slug}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col rounded-3xl bg-[var(--color-surface)] border border-[var(--color-line)] hover:border-[var(--color-accent)]/40 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg animate-fade-up"
                  style={{ animationDelay: `${Math.min(idx * 60, 300)}ms` }}
                >
                  <div className="relative aspect-[16/9] bg-[var(--color-surface-sunken)] overflow-hidden">
                    {post.coverImage ? (
                      <img src={post.coverImage} alt={post.coverImageAlt || post.title} width={480} height={270} loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-ink-muted)] text-xs font-normal">No image</div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-[var(--color-accent)] text-white text-[10px] font-medium uppercase tracking-wider shadow-md">{post.category}</span>
                  </div>
                  <div className="flex flex-col flex-1 p-5 space-y-2.5">
                    <h4 className="font-heading font-medium text-base leading-snug text-[var(--color-ink)] line-clamp-2 group-hover:text-[var(--color-accent)] transition-colors">{post.title}</h4>
                    <p className="text-xs font-normal text-[var(--color-ink-muted)] line-clamp-2 flex-1">{post.excerpt}</p>
                    <div className="flex items-center justify-between pt-2.5 border-t border-[var(--color-line)]">
                      <div className="flex items-center gap-3 text-[10px] font-normal text-[var(--color-ink-muted)]">
                        <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" /> {fmtDate(post.publishedAt)}</span>
                        {post.readingTime ? <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readingTime} min</span> : null}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-accent)] group-hover:gap-1.5 transition-all">Read <ArrowRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* NEW — Awards & Achievements Section (Below Blog Listing) */}
        <BlogAwardsSection />

      </div>
    </section>
  );
};

export default ExamGuides;

import { Film } from 'lucide-react';
import { listVideos } from '@/lib/video-api';
import { ReelsCarousel } from '@/components/reels/reels-carousel';
import type { ReelInput } from '@/lib/reel-media';

/**
 * Server component: fetches the REAL /api/reels list (backend order preserved,
 * cached for 5 min) and renders the section shell. Only the carousel itself is
 * client-side, so the homepage stays server-rendered.
 */
export async function ReelsSection() {
  const res = await listVideos();
  if (!res.success || res.settings?.videoSectionEnabled === false) return null;

  const reels = (res.data || []).filter((r) => r && r._id && r.title) as ReelInput[];
  if (reels.length === 0) return null;

  return (
    <section
      id="video-reels"
      className="py-20 sm:py-28 bg-[#0B0D12] text-white relative overflow-hidden border-b border-white/5"
    >
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44rem] h-[44rem] bg-[radial-gradient(ellipse_at_center,_rgba(255,0,92,0.12),transparent_60%)] rounded-full blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="space-y-3 max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium uppercase tracking-widest">
            <Film className="w-4 h-4 text-accent" />
            <span>Watch &amp; Learn</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mt-2">
            Got Questions About <span className="text-accent">Exam Vouchers?</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Watch our quick guides on how exam vouchers work, how to buy and redeem them, and how much you can save.
          </p>
        </div>

        <div className="mt-12">
          <ReelsCarousel reels={reels} />
        </div>
      </div>
    </section>
  );
}

export default ReelsSection;

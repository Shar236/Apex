import { Film, Play } from 'lucide-react';
import { listVideos } from '@/lib/video-api';
import { resolveImageSrc } from '@/lib/cloudinary';
import { VideoReelPlayer } from '@/components/video-reel-player';

const isYouTubeUrl = (url = '') => /youtube\.com|youtu\.be/i.test(url);
const isInstagramUrl = (url = '') => /instagram\.com|instagr\.am/i.test(url);

const isDirectVideo = (url = '') => {
  if (!url) return false;
  if (isYouTubeUrl(url) || isInstagramUrl(url)) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || /cloudinary|s3|blob:|commondatastorage/i.test(url);
};

function ReelCard({ reel, index }: { reel: { _id: string; title: string; description?: string; category?: string; duration?: string; thumbnail?: string; thumbnailUrl?: string; icon?: string; videoUrl?: string; youtubeEmbed?: string; instagramUrl?: string }; index: number }) {
  const poster = reel.thumbnail || reel.thumbnailUrl || '';
  const hasVideo = isDirectVideo(reel.videoUrl) || Boolean(reel.youtubeEmbed) || Boolean(reel.instagramUrl);
  return (
    <VideoReelPlayer
      reel={{
        _id: reel._id,
        title: reel.title,
        description: reel.description,
        videoUrl: reel.videoUrl || '',
        youtubeEmbed: reel.youtubeEmbed || '',
        instagramUrl: reel.instagramUrl || '',
      }}
      trigger={
        <article className="group relative rounded-3xl overflow-hidden bg-[#12151B] border border-white/10 aspect-[3/4] cursor-pointer transition-all duration-300 hover:border-accent/50 hover:shadow-xl">
          {poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveImageSrc(poster)}
              alt={reel.title}
              loading={index < 3 ? 'eager' : 'lazy'}
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-[#12151B] flex items-center justify-center text-3xl">{reel.icon || '🎬'}</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" aria-hidden="true" />
          {hasVideo && (
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-14 h-14 rounded-full bg-accent shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </span>
            </span>
          )}
          <div className="absolute top-3 left-3">
            <span className="px-2 py-0.5 rounded bg-black/70 text-[9px] font-medium text-accent border border-accent/30 uppercase tracking-wider">
              {reel.category || 'Step-By-Step Guide'}
            </span>
          </div>
          <div className="absolute bottom-0 inset-x-0 p-4">
            <h4 className="font-heading font-medium text-sm text-white leading-snug line-clamp-2">{reel.title}</h4>
            {reel.duration && <span className="text-[10px] text-accent font-normal mt-1 block">▶ {reel.duration}</span>}
          </div>
        </article>
      }
    />
  );
}

export async function VideoReelsCarousel() {
  const res = await listVideos();

  if (!res.success || res.settings.videoSectionEnabled === false) return null;
  const reels = res.data;
  if (!reels.length) return null;

  return (
    <section id="video-reels" className="py-20 sm:py-28 bg-[#0B0D12] text-white relative overflow-hidden border-b border-white/5 transition-colors duration-300">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-[radial-gradient(ellipse_at_center,_rgba(255,0,92,0.12),transparent_60%)] rounded-full blur-3xl pointer-events-none" aria-hidden="true" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium uppercase tracking-widest">
            <Film className="w-4 h-4 text-accent" />
            <span>WATCH &amp; LEARN</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mt-2">
            Got Questions About <span className="text-accent">Exam Vouchers?</span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Watch quick videos explaining how exam vouchers work, how to buy them, how to redeem them, and how to save money.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
          {reels.slice(0, 10).map((reel, index) => (
            <ReelCard key={reel._id} reel={reel} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default VideoReelsCarousel;

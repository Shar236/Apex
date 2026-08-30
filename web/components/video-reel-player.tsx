'use client';

import { useEffect, useState } from 'react';
import { X, ExternalLink, Loader2, TriangleAlert } from 'lucide-react';

interface ReelSource {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  youtubeEmbed?: string;
  instagramUrl?: string;
}

const isYouTubeUrl = (url = '') => /youtube\.com|youtu\.be/i.test(url);
const isInstagramUrl = (url = '') => /instagram\.com|instagr\.am/i.test(url);
const isDirectVideo = (url = '') => {
  if (!url) return false;
  if (isYouTubeUrl(url) || isInstagramUrl(url)) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || /cloudinary|s3|blob:|commondatastorage/i.test(url);
};

const youtubeEmbedUrl = (rawUrl: string) => {
  let videoId = '';
  if (rawUrl.includes('youtube.com/embed/')) videoId = rawUrl.split('youtube.com/embed/')[1]?.split('?')[0] || '';
  else if (rawUrl.includes('youtube.com/watch')) {
    try {
      videoId = new URL(rawUrl).searchParams.get('v') || '';
    } catch {
      videoId = '';
    }
  } else if (rawUrl.includes('youtu.be/')) {
    videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0] || '';
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` : '';
};

function ModalPlayer({ reel, onClose }: { reel: ReelSource; onClose: () => void }) {
  const [videoError, setVideoError] = useState(false);
  const direct = isDirectVideo(reel.videoUrl);
  const youtube = youtubeEmbedUrl(reel.youtubeEmbed || reel.videoUrl || '');
  const insta = isInstagramUrl(reel.instagramUrl || reel.videoUrl) ? reel.instagramUrl || reel.videoUrl : '';

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-label={`Video: ${reel.title}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl rounded-3xl overflow-hidden bg-[#0B0D12] border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close video"
          className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-black/60 text-white hover:bg-accent transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-full aspect-video bg-black">
          {youtube ? (
            <iframe
              src={youtube}
              title={reel.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full border-0"
            />
          ) : direct ? (
            videoError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 space-y-2">
                <TriangleAlert className="w-8 h-8 text-amber-400" />
                <p className="text-sm text-white">This video could not be loaded.</p>
                <p className="text-xs text-neutral-400">Please try again later or check back soon.</p>
              </div>
            ) : (
              <video
                src={reel.videoUrl}
                controls
                autoPlay
                playsInline
                controlsList="nodownload"
                preload="metadata"
                onError={() => setVideoError(true)}
                className="w-full h-full object-contain"
              >
                Your browser does not support embedded videos.
              </video>
            )
          ) : insta ? (
            <div className="w-full h-full flex flex-col items-center justify-center text-center px-6 space-y-3">
              <p className="text-sm text-white font-medium">This reel is hosted on Instagram.</p>
              <a
                href={insta}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-accent text-white text-xs font-medium"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open on Instagram
              </a>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-surface text-white flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="font-heading font-medium text-sm sm:text-base line-clamp-2">{reel.title}</p>
            {reel.description && <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-2">{reel.description}</p>}
          </div>
          {direct && (
            <a
              href={reel.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent/10 text-accent text-[11px] font-medium border border-accent/25 shrink-0 hover:bg-accent/20 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Open
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export function VideoReelPlayer({ reel, trigger }: { reel: ReelSource; trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Watch video: ${reel.title}`}
        className="block w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-3xl cursor-pointer"
      >
        {trigger}
      </button>
      {open && <ModalPlayer reel={reel} onClose={() => setOpen(false)} />}
    </>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, ChevronLeft, ChevronRight, Film, Volume2, VolumeX, Sparkles, Instagram, ExternalLink } from 'lucide-react';
import { ApexLogo } from './ApexLogo';
import { videoApi } from '../lib/api';

export const isInstagramUrl = (url = '') => {
  if (!url) return false;
  return /instagram\.com|instagr\.am/i.test(url);
};

export const isYouTubeUrl = (url = '') => {
  if (!url) return false;
  return /youtube\.com|youtu\.be/i.test(url);
};

export const isDirectVideoFile = (url = '') => {
  if (!url) return false;
  if (isInstagramUrl(url) || isYouTubeUrl(url)) return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url) || /commondatastorage\.googleapis\.com|cloudinary|s3|blob:/i.test(url);
};

export const formatYouTubeEmbedUrl = (rawUrl, autoplay = false, mute = true) => {
  if (!rawUrl) return '';
  if (isInstagramUrl(rawUrl)) return '';
  
  let videoId = '';
  if (rawUrl.includes('youtube.com/embed/')) {
    videoId = rawUrl.split('youtube.com/embed/')[1]?.split('?')[0];
  } else if (rawUrl.includes('youtube.com/watch')) {
    try {
      const u = new URL(rawUrl);
      videoId = u.searchParams.get('v');
    } catch {}
  } else if (rawUrl.includes('youtu.be/')) {
    videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
  }

  if (videoId) {
    const params = new URLSearchParams();
    params.set('autoplay', autoplay ? '1' : '0');
    params.set('mute', mute ? '1' : '0');
    params.set('enablejsapi', '1');
    params.set('rel', '0');
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  const base = rawUrl.split('?')[0];
  const params = new URLSearchParams();
  params.set('autoplay', autoplay ? '1' : '0');
  params.set('mute', mute ? '1' : '0');
  return `${base}?${params.toString()}`;
};

export const sanitizeEmbedUrl = formatYouTubeEmbedUrl;

export const REEL_VIDEOS = [
  {
    id: 'v1',
    _id: 'v1',
    title: "How to Buy an Exam Voucher",
    category: "Step-By-Step Guide",
    duration: "15s",
    desc: "Watch how to select your exam, apply discount promo codes, and receive your voucher code in 10 seconds.",
    poster: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v1.jpg",
    thumbnailUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v1.jpg",
    videoStream: "https://res.cloudinary.com/nbcbpuql/video/upload/v1.mp4",
    videoUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/v1.mp4",
    cloudinaryPublicId: "v1",
    youtubeEmbed: "",
    instagramUrl: "",
    badgeColor: "bg-accent text-white",
    icon: "🛒",
    views: "14.2K views",
    viewsCount: 14200,
    order: 1,
    displayOrder: 1,
    featured: true,
  },
  {
    id: 'v2',
    _id: 'v2',
    title: "How Does a PTE Voucher Work?",
    category: "PTE Voucher",
    duration: "18s",
    desc: "Official Pearson PTE Academic & Core vouchers waive off registration fees instantly at checkout.",
    poster: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v2.jpg",
    thumbnailUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v2.jpg",
    videoStream: "https://res.cloudinary.com/nbcbpuql/video/upload/v2.mp4",
    videoUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/v2.mp4",
    cloudinaryPublicId: "v2",
    youtubeEmbed: "",
    instagramUrl: "",
    badgeColor: "bg-accent text-white",
    icon: "🎓",
    views: "22.8K views",
    viewsCount: 22800,
    order: 2,
    displayOrder: 2,
    featured: false,
  },
  {
    id: 'v3',
    _id: 'v3',
    title: "How to Redeem Your Voucher",
    category: "Redemption Guide",
    duration: "14s",
    desc: "Paste your unique voucher code in the Promo Code field on Pearson, ETS, or Duolingo portals.",
    poster: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v3.jpg",
    thumbnailUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v3.jpg",
    videoStream: "https://res.cloudinary.com/nbcbpuql/video/upload/v3.mp4",
    videoUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/v3.mp4",
    cloudinaryPublicId: "v3",
    youtubeEmbed: "",
    instagramUrl: "",
    badgeColor: "bg-accent text-white",
    icon: "🔑",
    views: "18.5K views",
    viewsCount: 18500,
    order: 3,
    displayOrder: 3,
    featured: false,
  },
  {
    id: 'v4',
    _id: 'v4',
    title: "How Much Can You Save?",
    category: "Save Money",
    duration: "16s",
    desc: "Compare regular official exam prices vs Apex bulk discounted prices for PTE, GRE, TOEFL, and Duolingo.",
    poster: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v4.jpg",
    thumbnailUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v4.jpg",
    videoStream: "https://res.cloudinary.com/nbcbpuql/video/upload/v4.mp4",
    videoUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/v4.mp4",
    cloudinaryPublicId: "v4",
    youtubeEmbed: "",
    instagramUrl: "",
    badgeColor: "bg-accent text-white",
    icon: "💰",
    views: "31.9K views",
    viewsCount: 31900,
    order: 4,
    displayOrder: 4,
    featured: false,
  },
  {
    id: 'v5',
    _id: 'v5',
    title: "IELTS Voucher Explained",
    category: "IELTS",
    duration: "20s",
    desc: "Everything about IELTS Academic & General discount codes for IDP registration across India.",
    poster: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v5.jpg",
    thumbnailUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v5.jpg",
    videoStream: "https://res.cloudinary.com/nbcbpuql/video/upload/v5.mp4",
    videoUrl: "https://res.cloudinary.com/nbcbpuql/video/upload/v5.mp4",
    cloudinaryPublicId: "v5",
    youtubeEmbed: "",
    instagramUrl: "",
    badgeColor: "bg-accent text-white",
    icon: "🇬🇧",
    views: "11.7K views",
    viewsCount: 11700,
    order: 5,
    displayOrder: 5,
    featured: false,
  }
];


export const VideoReelsCarousel = () => {
  const [videoList, setVideoList] = useState(REEL_VIDEOS);
  const [videoSectionEnabled, setVideoSectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isMovieMode, setIsMovieMode] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [userInitiatedPlay, setUserInitiatedPlay] = useState(false);

  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const modalVideoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const shouldAutoPlayNextRef = useRef(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const playedVideoIds = useRef(new Set());

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    } else {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    }
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    let isMounted = true;
    videoApi.list().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((v, i) => {
          const publicId = v.cloudinaryPublicId;
          const directVideo = v.videoUrl || (publicId ? `https://res.cloudinary.com/nbcbpuql/video/upload/${publicId}.mp4` : '');
          const cleanThumbnail = (v.thumbnailUrl && !v.thumbnailUrl.includes('unsplash')) ? v.thumbnailUrl : ((v.thumbnail && !v.thumbnail.includes('unsplash')) ? v.thumbnail : '');
          const posterImg = (publicId ? `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/${publicId}.jpg` : '') || cleanThumbnail || `https://res.cloudinary.com/nbcbpuql/video/upload/so_0/v${(i % 5) + 1}.jpg`;
          const viewsNum = Number(v.viewsCount ?? v.views) || 0;
          return {
            _id: v._id,
            id: v._id || publicId || i + 1,
            title: v.title,
            category: v.category || 'Step-By-Step Guide',
            duration: v.duration || '15s',
            desc: v.description || v.desc || '',
            poster: posterImg,
            thumbnailUrl: posterImg,
            videoStream: directVideo,
            videoUrl: directVideo,
            cloudinaryPublicId: publicId || '',
            youtubeEmbed: v.youtubeEmbed || directVideo,
            instagramUrl: v.instagramUrl || (isInstagramUrl(directVideo) ? directVideo : ''),
            badgeColor: v.badgeColor || 'bg-accent text-white',
            icon: v.icon || '🎬',
            viewsCount: viewsNum,
            views: viewsNum >= 1000 ? `${(viewsNum / 1000).toFixed(1)}K views` : `${viewsNum} views`,
            order: v.order ?? v.displayOrder ?? i + 1,
            featured: !!v.featured,
          };
        });
        setVideoList(formatted);
        const featIdx = formatted.findIndex((x) => x.featured);
        if (featIdx !== -1) setActiveIndex(featIdx);
      }
      if (res.settings) {
        if (res.settings.videoSectionEnabled !== undefined) setVideoSectionEnabled(res.settings.videoSectionEnabled);
        if (res.settings.movieReelModeEnabled !== undefined) setIsMovieMode(res.settings.movieReelModeEnabled);
      }
      setLoading(false);
    });

    return () => { isMounted = false; };
  }, []);

  const recordView = (vid) => {
    if (!vid || !vid._id || playedVideoIds.current.has(vid._id)) return;
    playedVideoIds.current.add(vid._id);
    videoApi.incrementView(vid._id).then((res) => {
      if (res.success && res.viewsCount != null) {
        setVideoList((prev) =>
          prev.map((item) =>
            item._id === vid._id
              ? {
                  ...item,
                  viewsCount: res.viewsCount,
                  views: res.viewsCount >= 1000 ? `${(res.viewsCount / 1000).toFixed(1)}K views` : `${res.viewsCount} views`,
                }
              : item
          )
        );
      }
    });
  };

  const getCurrentVideoElement = () => {
    if (typeof window === 'undefined') {
      return desktopVideoRef.current || mobileVideoRef.current;
    }
    return window.innerWidth >= 768 ? desktopVideoRef.current : mobileVideoRef.current;
  };

  const total = videoList.length;
  const currentVideo = videoList[activeIndex] || videoList[0];

  const pauseVisibleVideo = () => {
    const currentVideoEl = getCurrentVideoElement();
    if (currentVideoEl && !currentVideoEl.paused) {
      currentVideoEl.pause();
    }
  };

  const handleVideoEnded = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;

    // Automatic Reel-to-Reel: seamlessly transition to next reel and auto-play
    shouldAutoPlayNextRef.current = true;
    setUserInitiatedPlay(true);
    setUseIframeFallback(false);

    setActiveIndex((prev) => (prev + 1) % total);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 450);
  };

  const goToIndex = (targetIdx, keepPlaying = isPlaying || userInitiatedPlay) => {
    if (targetIdx === activeIndex || isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    pauseVisibleVideo();

    shouldAutoPlayNextRef.current = keepPlaying;
    setUseIframeFallback(false);
    setActiveIndex(targetIdx);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 450);
  };

  const handleNext = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    pauseVisibleVideo();

    shouldAutoPlayNextRef.current = isPlaying || userInitiatedPlay;
    setUseIframeFallback(false);
    setActiveIndex((prev) => (prev + 1) % total);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 450);
  };

  const handlePrev = () => {
    if (isTransitioningRef.current) return;
    isTransitioningRef.current = true;
    pauseVisibleVideo();

    shouldAutoPlayNextRef.current = isPlaying || userInitiatedPlay;
    setUseIframeFallback(false);
    setActiveIndex((prev) => (prev - 1 + total) % total);

    setTimeout(() => {
      isTransitioningRef.current = false;
    }, 450);
  };

  useEffect(() => {
    setUseIframeFallback(false);
    const currentVideoEl = getCurrentVideoElement();

    if (shouldAutoPlayNextRef.current || userInitiatedPlay) {
      if (currentVideo) recordView(currentVideo);

      if (currentVideoEl) {
        currentVideoEl.currentTime = 0;
        const playPromise = currentVideoEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
              setUserInitiatedPlay(true);
              resetControlsTimer();
            })
            .catch((err) => {
              console.warn('[VideoReels]: Autoplay blocked by browser policy:', err);
              setIsPlaying(false);
              setUserInitiatedPlay(false);
              setShowControls(true);
            });
        } else {
          setIsPlaying(true);
          setUserInitiatedPlay(true);
          resetControlsTimer();
        }
      }
    } else {
      setIsPlaying(false);
      setUserInitiatedPlay(false);
      setShowControls(true);
      if (currentVideoEl) {
        currentVideoEl.currentTime = 0;
        currentVideoEl.pause();
      }
    }
  }, [activeIndex]);

  useEffect(() => {
    const currentVideoEl = getCurrentVideoElement();
    if (!currentVideoEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.5 && !currentVideoEl.paused) {
          currentVideoEl.pause();
          setIsPlaying(false);
          setUserInitiatedPlay(false);
          shouldAutoPlayNextRef.current = false;
          setShowControls(true);
        }
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    observer.observe(currentVideoEl);
    return () => observer.disconnect();
  }, [activeIndex, useIframeFallback]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (activeModalVideo) {
        if (e.key === 'Escape') setActiveModalVideo(null);
        return;
      }
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === ' ') {
        e.preventDefault();
        const currentVideoEl = getCurrentVideoElement();
        if (currentVideoEl && document.activeElement === document.body) {
          togglePlay();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModalVideo, isPlaying, userInitiatedPlay]);

  const togglePlay = () => {
    if (currentVideo) recordView(currentVideo);
    
    // If video is Instagram URL, open modal with Instagram button
    if (isInstagramUrl(currentVideo.videoStream) || isInstagramUrl(currentVideo.instagramUrl) || isInstagramUrl(currentVideo.youtubeEmbed)) {
      setActiveModalVideo(currentVideo);
      return;
    }

    if (useIframeFallback) {
      setActiveModalVideo(currentVideo);
      return;
    }

    const currentVideoEl = getCurrentVideoElement();
    if (!currentVideoEl) return;

    if (currentVideoEl.paused) {
      const playPromise = currentVideoEl.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setUserInitiatedPlay(true);
            shouldAutoPlayNextRef.current = true;
            resetControlsTimer();
          })
          .catch((error) => {
            console.warn("Playback error, enabling iframe player:", error);
            setUseIframeFallback(true);
          });
      } else {
        setIsPlaying(true);
        setUserInitiatedPlay(true);
        shouldAutoPlayNextRef.current = true;
        resetControlsTimer();
      }
    } else {
      currentVideoEl.pause();
      setIsPlaying(false);
      setUserInitiatedPlay(false);
      shouldAutoPlayNextRef.current = false;
      setShowControls(true);
    }
  };

  const toggleMute = () => {
    setIsMuted((prevMuted) => {
      const nextMuted = !prevMuted;
      if (desktopVideoRef.current) desktopVideoRef.current.muted = nextMuted;
      if (mobileVideoRef.current) mobileVideoRef.current.muted = nextMuted;
      return nextMuted;
    });
  };


  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const dist = touchStartX.current - touchEndX.current;
    if (dist > 50) handleNext();
    if (dist < -50) handlePrev();
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const getVideoAt = (offset) => {
    const idx = (activeIndex + offset + total) % total;
    return videoList[idx] || videoList[0];
  };

  if (!videoSectionEnabled) return null;
  if (!currentVideo) return null;

  const currentIsInsta = isInstagramUrl(currentVideo.videoStream) || isInstagramUrl(currentVideo.instagramUrl) || isInstagramUrl(currentVideo.youtubeEmbed);
  const currentIsYouTube = isYouTubeUrl(currentVideo.youtubeEmbed) || isYouTubeUrl(currentVideo.videoStream);
  const currentInstaLink = currentVideo.instagramUrl || (isInstagramUrl(currentVideo.videoStream) ? currentVideo.videoStream : '');

  return (
    <section 
      id="video-reels"
      className="py-20 sm:py-28 bg-[#0B0D12] text-white relative overflow-hidden transition-colors duration-300 border-b border-white/5"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Gold Glow Backdrop & Dots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-175 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/12 via-accent/4 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#FF005C_1px,transparent_1px)] [background-size:32px_32px] opacity-4 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-medium uppercase tracking-widest">
            <Film className="w-4 h-4 text-accent" />
            <span>WATCH & LEARN</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-white mt-2">
            Got Questions About <br />
            <span className="text-accent">Exam Vouchers?</span>
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base font-medium max-w-xl mx-auto">
            Watch quick videos explaining how exam vouchers work, how to buy them, how to redeem them, and how to save money.
          </p>

          {/* Movie Autoplay Mode Toggle */}
          <div className="pt-2 flex justify-center items-center gap-3">
            <button
              onClick={() => {
                setIsMovieMode((prev) => !prev);
                pauseVisibleVideo();
                setIsPlaying(false);
                setUserInitiatedPlay(false);
              }}
              className={`px-4 py-2 rounded-full border text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                isMovieMode
                  ? 'bg-accent text-white border-accent shadow-[0_0_20px_rgba(255,0,92,0.35)]'
                  : 'bg-white/10 text-white border-white/20 hover:border-accent'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isMovieMode ? '🎬 Movie Reel Mode (Continuous Left-to-Right)' : '▶ Turn On Movie Reel Mode'}</span>
            </button>
          </div>
        </div>

        {/* Desktop 5-Card Cinematic Film Strip Carousel */}
        <div className="hidden md:flex items-center justify-center gap-4 lg:gap-6 min-h-140 py-4 relative">
          
          {/* Far Left Card (offset -2) */}
          <div 
            onClick={() => goToIndex((activeIndex - 2 + total) % total)}
            className="w-50 h-92.5 rounded-[20px] bg-[#12151B] border border-white/10 opacity-40 scale-75 cursor-pointer hover:opacity-80 hover:scale-[0.82] transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-4"
          >
            {/* Real Video Frame Preview */}
            {getVideoAt(-2).videoStream && isDirectVideoFile(getVideoAt(-2).videoStream) ? (
              <video
                src={getVideoAt(-2).videoStream || getVideoAt(-2).videoUrl}
                poster={getVideoAt(-2).poster || getVideoAt(-2).thumbnailUrl}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform pointer-events-none"
              />
            ) : (
              <img src={getVideoAt(-2).poster || getVideoAt(-2).thumbnailUrl} alt={getVideoAt(-2).title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2 py-0.5 rounded bg-black/70 text-[9px] font-normal text-accent border border-accent/30">
                {getVideoAt(-2).category}
              </span>
              <span className="text-xs">{getVideoAt(-2).icon}</span>
            </div>

            <div className="relative z-10 text-center my-auto">
              <div className="w-10 h-10 rounded-full bg-accent/90 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-medium text-xs text-white leading-tight">{getVideoAt(-2).title}</h4>
              <span className="text-[10px] text-accent font-normal block">▶ {getVideoAt(-2).duration}</span>
            </div>
          </div>

          {/* Immediate Left Card (offset -1) */}
          <div 
            onClick={() => goToIndex((activeIndex - 1 + total) % total)}
            className="w-60 h-110 rounded-[22px] bg-[#12151B] border border-white/10 opacity-65 scale-[0.86] cursor-pointer hover:opacity-90 hover:scale-90 transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-5"
          >
            {/* Real Video Frame Preview */}
            {getVideoAt(-1).videoStream && isDirectVideoFile(getVideoAt(-1).videoStream) ? (
              <video
                src={getVideoAt(-1).videoStream || getVideoAt(-1).videoUrl}
                poster={getVideoAt(-1).poster || getVideoAt(-1).thumbnailUrl}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform pointer-events-none"
              />
            ) : (
              <img src={getVideoAt(-1).poster || getVideoAt(-1).thumbnailUrl} alt={getVideoAt(-1).title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 rounded bg-black/70 text-[10px] font-normal text-accent border border-accent/30">
                {getVideoAt(-1).category}
              </span>
              <span className="text-sm">{getVideoAt(-1).icon}</span>
            </div>

            <div className="relative z-10 my-auto text-center">
              <div className="w-12 h-12 rounded-full bg-accent/90 text-white flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-medium text-sm text-white leading-tight">{getVideoAt(-1).title}</h4>
              <span className="text-xs text-accent font-normal block">▶ {getVideoAt(-1).duration}</span>
            </div>
          </div>

          {/* CENTER FEATURED INLINE VIDEO PLAYER CARD (9:16 Aspect Ratio) */}
          <div 
            onMouseMove={resetControlsTimer}
            onMouseEnter={resetControlsTimer}
            onMouseLeave={() => { if (isPlaying) setShowControls(false); }}
            onTouchStart={resetControlsTimer}
            className="w-75 lg:w-80 h-132.5 lg:h-140 rounded-3xl bg-[#12151B] border-2 border-accent shadow-[0_0_40px_rgba(255,0,92,0.28)] relative overflow-hidden shrink-0 transition-all duration-500 flex flex-col justify-between p-6 z-20 group"
          >
            {/* Direct HTML5 Video Player (Serves as Visual Content and Thumbnail Preview) */}
            {currentIsInsta ? (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center text-white shadow-xl animate-pulse">
                  <Instagram className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-heading font-medium text-sm text-white">{currentVideo.title}</h4>
                  <p className="text-xs text-neutral-300 font-medium mt-1">This video tutorial is hosted on Instagram.</p>
                </div>
                <a
                  href={currentInstaLink || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-xs inline-flex items-center gap-2 shadow-lg hover:scale-105 transition-transform"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Watch on Instagram ↗</span>
                </a>
              </div>
            ) : !useIframeFallback && isDirectVideoFile(currentVideo.videoStream) ? (
              <video
                ref={desktopVideoRef}
                src={currentVideo.videoStream || currentVideo.videoUrl}
                poster={currentVideo.poster || currentVideo.thumbnailUrl}
                muted={isMuted}
                playsInline
                preload="auto"
                loop={false}
                crossOrigin="anonymous"
                onEnded={handleVideoEnded}
                onError={() => setUseIframeFallback(true)}
                onPlay={() => {
                  setIsPlaying(true);
                  resetControlsTimer();
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setShowControls(true);
                }}
                onClick={togglePlay}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              />
            ) : currentIsYouTube ? (
              <iframe
                className="absolute inset-0 w-full h-full object-cover"
                src={formatYouTubeEmbedUrl(currentVideo.youtubeEmbed || currentVideo.videoStream, userInitiatedPlay && isPlaying, isMuted)}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              /* Fallback Poster */
              <img src={currentVideo.poster || currentVideo.thumbnailUrl} alt={currentVideo.title} className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* Gradient Dark Overlay (Fades out when playing so 100% of video is crystal clear) */}
            <div 
              className={`absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/20 to-slate-950/70 transition-opacity duration-500 pointer-events-none ${
                isPlaying ? 'opacity-0' : 'opacity-100'
              }`} 
            />

            {/* Top Branding Bar & Audio Controls */}
            <div 
              className={`relative z-10 flex justify-between items-center transition-all duration-500 ${
                isPlaying && !showControls ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'
              }`}
            >
              <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider shadow-md ${currentVideo.badgeColor}`}>
                {currentVideo.category}
              </span>

              <div className="flex items-center gap-2">
                {!currentIsInsta && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                      resetControlsTimer();
                    }}
                    className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-accent border border-white/20 transition-all cursor-pointer shadow-lg hover:scale-105"
                    title={isMuted ? 'Unmute sound' : 'Mute sound'}
                    aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-accent" />}
                  </button>
                )}
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 shadow-lg">
                  <ApexLogo className="h-4" whiteText={true} />
                </div>
              </div>
            </div>

            {/* Center Play Button Overlay (Shown ONLY when Paused) */}
            {!currentIsInsta && (
              <div 
                className={`relative z-10 text-center my-auto transition-all duration-500 ${
                  isPlaying 
                    ? 'opacity-0 scale-90 pointer-events-none' 
                    : 'opacity-100 scale-100 pointer-events-auto'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-16 h-16 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(255,0,92,0.45)] transition-all transform hover:scale-110 border-2 border-white cursor-pointer"
                  aria-label="Play video"
                >
                  <Play className="w-7 h-7 fill-current ml-1" />
                </button>
                
                <span className="inline-block mt-3 text-[11px] font-medium text-accent uppercase tracking-widest bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-accent/40 shadow-lg">
                  {currentVideo.duration} • Click to Play
                </span>
              </div>
            )}

            {/* Floating Minimal In-Playback Pause Overlay (Appears on hover/tap when playing) */}
            {!currentIsInsta && isPlaying && (
              <div 
                className={`absolute inset-0 z-15 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${
                  showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="pointer-events-auto w-14 h-14 rounded-full bg-black/70 hover:bg-accent text-white backdrop-blur-md flex items-center justify-center shadow-2xl border border-white/20 transition-all transform hover:scale-110 cursor-pointer"
                  aria-label="Pause video"
                >
                  <Pause className="w-6 h-6 fill-current" />
                </button>
              </div>
            )}

            {/* Bottom Information Card (Fades out when playing for clean full vertical view) */}
            <div 
              className={`relative z-10 text-left space-y-2 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl transition-all duration-500 ${
                isPlaying 
                  ? 'opacity-0 translate-y-4 pointer-events-none' 
                  : 'opacity-100 translate-y-0 pointer-events-auto'
              }`}
            >
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-heading font-medium text-lg text-white leading-tight">
                  {currentVideo.title}
                </h3>
                <span className="text-[10px] font-normal text-neutral-400 shrink-0">{currentVideo.views}</span>
              </div>

              <p className="text-xs text-neutral-300 font-medium line-clamp-2">
                {currentVideo.desc}
              </p>

              <div className="flex gap-2 pt-1">
                {currentIsInsta ? (
                  <a
                    href={currentInstaLink || 'https://instagram.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-accent text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                    <span>Watch Reel ↗</span>
                  </a>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="flex-1 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Reel</span>
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveModalVideo(currentVideo);
                  }}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-normal text-xs border border-white/10 cursor-pointer transition-colors"
                  title="Expand Video Details"
                >
                  <Film className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Immediate Right Card (offset +1) */}
          <div 
            onClick={() => goToIndex((activeIndex + 1) % total)}
            className="w-60 h-110 rounded-[22px] bg-[#12151B] border border-white/10 opacity-65 scale-[0.86] cursor-pointer hover:opacity-90 hover:scale-90 transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-5"
          >
            {/* Real Video Frame Preview */}
            {getVideoAt(1).videoStream && isDirectVideoFile(getVideoAt(1).videoStream) ? (
              <video
                src={getVideoAt(1).videoStream || getVideoAt(1).videoUrl}
                poster={getVideoAt(1).poster || getVideoAt(1).thumbnailUrl}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform pointer-events-none"
              />
            ) : (
              <img src={getVideoAt(1).poster || getVideoAt(1).thumbnailUrl} alt={getVideoAt(1).title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 rounded bg-black/70 text-[10px] font-normal text-accent border border-accent/30">
                {getVideoAt(1).category}
              </span>
              <span className="text-sm">{getVideoAt(1).icon}</span>
            </div>

            <div className="relative z-10 my-auto text-center">
              <div className="w-12 h-12 rounded-full bg-accent/90 text-white flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-medium text-sm text-white leading-tight">{getVideoAt(1).title}</h4>
              <span className="text-xs text-accent font-normal block">▶ {getVideoAt(1).duration}</span>
            </div>
          </div>

          {/* Far Right Card (offset +2) */}
          <div 
            onClick={() => goToIndex((activeIndex + 2) % total)}
            className="w-50 h-92.5 rounded-[20px] bg-[#12151B] border border-white/10 opacity-40 scale-75 cursor-pointer hover:opacity-80 hover:scale-[0.82] transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-4"
          >
            {/* Real Video Frame Preview */}
            {getVideoAt(2).videoStream && isDirectVideoFile(getVideoAt(2).videoStream) ? (
              <video
                src={getVideoAt(2).videoStream || getVideoAt(2).videoUrl}
                poster={getVideoAt(2).poster || getVideoAt(2).thumbnailUrl}
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform pointer-events-none"
              />
            ) : (
              <img src={getVideoAt(2).poster || getVideoAt(2).thumbnailUrl} alt={getVideoAt(2).title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2 py-0.5 rounded bg-black/60 text-[9px] font-normal text-accent border border-accent/30">
                {getVideoAt(2).category}
              </span>
              <span className="text-xs">{getVideoAt(2).icon}</span>
            </div>

            <div className="relative z-10 text-center my-auto">
              <div className="w-10 h-10 rounded-full bg-accent/80 text-white flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-medium text-xs text-white leading-tight">{getVideoAt(2).title}</h4>
              <span className="text-[10px] text-accent font-normal block">▶ {getVideoAt(2).duration}</span>
            </div>
          </div>

        </div>

        {/* Mobile Viewport Reel Card */}
        <div className="md:hidden space-y-6">
          <div 
            onTouchStart={resetControlsTimer}
            className="w-full max-w-xs mx-auto aspect-9/16 rounded-[22px] bg-[#12151B] border-2 border-accent shadow-xl relative overflow-hidden flex flex-col justify-between p-5"
          >
            {/* Direct HTML5 Video Player */}
            {currentIsInsta ? (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
                <Instagram className="w-10 h-10 text-accent" />
                <p className="text-xs text-neutral-300 font-medium">This video tutorial is hosted on Instagram.</p>
                <a
                  href={currentInstaLink || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-accent text-white font-medium text-xs inline-flex items-center gap-1.5"
                >
                  <Instagram className="w-4 h-4" />
                  <span>Watch on Instagram ↗</span>
                </a>
              </div>
            ) : !useIframeFallback && isDirectVideoFile(currentVideo.videoStream) ? (
              <video
                ref={mobileVideoRef}
                src={currentVideo.videoStream || currentVideo.videoUrl}
                poster={currentVideo.poster || currentVideo.thumbnailUrl}
                muted={isMuted}
                playsInline
                preload="auto"
                loop={false}
                crossOrigin="anonymous"
                onEnded={handleVideoEnded}
                onError={() => setUseIframeFallback(true)}
                onPlay={() => {
                  setIsPlaying(true);
                  resetControlsTimer();
                }}
                onPause={() => {
                  setIsPlaying(false);
                  setShowControls(true);
                }}
                onClick={togglePlay}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              />
            ) : currentIsYouTube ? (
              <iframe
                className="absolute inset-0 w-full h-full object-cover"
                src={formatYouTubeEmbedUrl(currentVideo.youtubeEmbed || currentVideo.videoStream, userInitiatedPlay && isPlaying, isMuted)}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <img src={currentVideo.poster || currentVideo.thumbnailUrl} alt={currentVideo.title} className="absolute inset-0 w-full h-full object-cover" />
            )}

            {/* Gradient Overlay */}
            <div 
              className={`absolute inset-0 bg-linear-to-t from-slate-950/95 via-slate-950/20 to-slate-950/70 transition-opacity duration-500 pointer-events-none ${
                isPlaying ? 'opacity-0' : 'opacity-100'
              }`} 
            />

            {/* Top Branding & Sound Bar */}
            <div 
              className={`relative z-10 flex justify-between items-center transition-all duration-500 ${
                isPlaying && !showControls ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'
              }`}
            >
              <span className="px-2.5 py-1 rounded-full bg-accent text-white font-medium text-[10px] uppercase">
                {currentVideo.category}
              </span>

              <div className="flex items-center gap-2">
                {!currentIsInsta && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleMute();
                      resetControlsTimer();
                    }}
                    className="p-1 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-accent border border-white/20 cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-accent" />}
                  </button>
                )}
                <ApexLogo className="h-4" whiteText={true} />
              </div>
            </div>

            {/* Center Controls (Paused State) */}
            {!currentIsInsta && (
              <div 
                className={`relative z-10 text-center my-auto transition-all duration-500 ${
                  isPlaying 
                    ? 'opacity-0 scale-90 pointer-events-none' 
                    : 'opacity-100 scale-100 pointer-events-auto'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center mx-auto shadow-xl border-2 border-white cursor-pointer"
                  aria-label="Play video"
                >
                  <Play className="w-6 h-6 fill-current ml-1" />
                </button>
                <span className="inline-block mt-2 text-[10px] font-medium text-accent uppercase tracking-widest bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-accent/40">
                  {currentVideo.duration} • Click to Play
                </span>
              </div>
            )}

            {/* Floating Minimal In-Playback Pause Overlay (Mobile) */}
            {!currentIsInsta && isPlaying && (
              <div 
                className={`absolute inset-0 z-15 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${
                  showControls ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="pointer-events-auto w-12 h-12 rounded-full bg-black/70 hover:bg-accent text-white backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20 cursor-pointer"
                  aria-label="Pause video"
                >
                  <Pause className="w-5 h-5 fill-current" />
                </button>
              </div>
            )}

            {/* Bottom Card (Mobile) */}
            <div 
              className={`relative z-10 text-left space-y-1.5 bg-slate-950/85 backdrop-blur-md p-3.5 rounded-xl border border-white/10 transition-all duration-500 ${
                isPlaying 
                  ? 'opacity-0 translate-y-4 pointer-events-none' 
                  : 'opacity-100 translate-y-0 pointer-events-auto'
              }`}
            >
              <h3 className="font-heading font-medium text-sm text-white leading-tight">{currentVideo.title}</h3>
              {currentIsInsta ? (
                <a
                  href={currentInstaLink || 'https://instagram.com'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2 rounded-lg bg-accent text-white font-medium text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>Watch on Instagram ↗</span>
                </a>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="w-full py-2 rounded-lg bg-accent text-white font-medium text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Play Reel</span>
                </button>
              )}
            </div>
          </div>
        </div>


        {/* Controls Bar (Left to Right Navigation Buttons & Dots) */}
        <div className="flex flex-col items-center gap-4 pt-2">
          
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              aria-label="Previous video"
              className="w-11 h-11 rounded-full bg-white text-slate-950 hover:bg-accent hover:text-white flex items-center justify-center transition-all shadow-lg border border-white/20 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-55 sm:max-w-none px-2 py-1">
              {videoList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToIndex(idx)}
                  aria-label={`Go to video ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    activeIndex === idx
                      ? 'w-7 bg-accent'
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>


            <button
              onClick={handleNext}
              aria-label="Next video"
              className="w-11 h-11 rounded-full bg-white text-slate-950 hover:bg-accent hover:text-white flex items-center justify-center transition-all shadow-lg border border-white/20 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <p className="text-xs text-neutral-400 font-normal">
            Video {activeIndex + 1} of {total} • Left to Right Movie Flow
          </p>

        </div>

      </div>

      {/* Expanded Modal Video Player (Safe Fallback — NEVER Iframe Instagram) */}
      {activeModalVideo && (() => {
        const modalIsInsta = isInstagramUrl(activeModalVideo.videoStream) || isInstagramUrl(activeModalVideo.instagramUrl) || isInstagramUrl(activeModalVideo.youtubeEmbed);
        const modalIsYouTube = isYouTubeUrl(activeModalVideo.youtubeEmbed) || isYouTubeUrl(activeModalVideo.videoStream);
        const modalIsFile = !modalIsInsta && !modalIsYouTube;
        const modalInstaLink = activeModalVideo.instagramUrl || (isInstagramUrl(activeModalVideo.videoStream) ? activeModalVideo.videoStream : '');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
            <div className="relative w-full max-w-2xl bg-[#12151B] rounded-3xl p-6 border border-white/10 shadow-2xl text-white space-y-4">
              
              <button
                onClick={() => setActiveModalVideo(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-accent hover:text-white text-white transition-colors cursor-pointer"
                aria-label="Close modal video player"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-accent text-white text-xs font-medium uppercase">
                  {activeModalVideo.category}
                </span>
                <ApexLogo className="h-5" whiteText={true} />
              </div>

              <h3 className="font-heading font-medium text-2xl text-white">
                {activeModalVideo.title}
              </h3>

              <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-white/10 shadow-xl relative flex items-center justify-center">
                {modalIsInsta ? (
                  <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <img src={activeModalVideo.poster} alt={activeModalVideo.title} className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <div className="absolute inset-0 bg-slate-950/70" />
                    
                    <div className="relative z-10 w-16 h-16 rounded-full bg-accent flex items-center justify-center text-white shadow-2xl animate-pulse">
                      <Instagram className="w-8 h-8" />
                    </div>
                    
                    <div className="relative z-10 space-y-1">
                      <h4 className="font-heading font-medium text-base text-white">{activeModalVideo.title}</h4>
                      <p className="text-xs text-neutral-300 font-medium">This video tutorial is hosted on Instagram.</p>
                    </div>

                    <a
                      href={modalInstaLink || 'https://instagram.com'}
                      target="_blank"
                      rel="noreferrer"
                      className="relative z-10 px-6 py-3 rounded-2xl bg-accent text-white font-medium text-xs inline-flex items-center gap-2 shadow-xl hover:scale-105 transition-transform"
                    >
                      <Instagram className="w-4 h-4" />
                      <span>Watch on Instagram ↗</span>
                    </a>
                  </div>
                ) : modalIsFile ? (
                  <video
                    ref={modalVideoRef}
                    src={activeModalVideo.videoStream}
                    poster={activeModalVideo.poster}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : modalIsYouTube ? (
                  <iframe
                    className="w-full h-full object-cover"
                    src={formatYouTubeEmbedUrl(activeModalVideo.youtubeEmbed || activeModalVideo.videoStream, true, false)}
                    title={activeModalVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center space-y-3">
                    <img src={activeModalVideo.poster} alt={activeModalVideo.title} className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="relative z-10 space-y-2">
                      <p className="text-xs text-neutral-300 font-medium">{activeModalVideo.title}</p>
                      {activeModalVideo.videoStream && (
                        <a
                          href={activeModalVideo.videoStream}
                          target="_blank"
                          rel="noreferrer"
                          className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-xs inline-flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open Video ↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <p className="text-xs text-neutral-300 font-medium leading-relaxed">
                {activeModalVideo.desc}
              </p>

              <div className="pt-2 flex justify-between items-center">
                {modalIsInsta && (
                  <a
                    href={modalInstaLink || 'https://instagram.com'}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-accent hover:text-accent-hover inline-flex items-center gap-1"
                  >
                    <Instagram className="w-4 h-4" /> Open Reel in New Tab ↗
                  </a>
                )}
                <button
                  onClick={() => setActiveModalVideo(null)}
                  className="px-5 py-2.5 rounded-xl bg-accent text-white font-medium text-xs hover:bg-accent-hover transition-colors cursor-pointer ml-auto"
                >
                  Close Video Player
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </section>
  );
};

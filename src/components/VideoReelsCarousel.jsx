import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, ChevronLeft, ChevronRight, Film, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import { ApexLogo } from './ApexLogo';
import { videoApi } from '../lib/api';

export const REEL_VIDEOS = [
  {
    id: 1,
    title: "How to Buy an Exam Voucher",
    category: "Step-By-Step Guide",
    duration: "15s",
    desc: "Watch how to select your exam, apply discount promo codes, and receive your voucher code in 10 seconds.",
    poster: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80",
    videoStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
    badgeColor: "bg-amber-400 text-slate-950",
    icon: "🛒",
    views: "14.2K views"
  },
  {
    id: 2,
    title: "How Does a PTE Voucher Work?",
    category: "PTE Voucher",
    duration: "18s",
    desc: "Official Pearson PTE Academic & Core vouchers waive off registration fees instantly at checkout.",
    poster: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80",
    videoStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
    badgeColor: "bg-amber-400 text-slate-950",
    icon: "🎓",
    views: "22.8K views"
  },
  {
    id: 3,
    title: "How to Redeem Your Voucher",
    category: "Redemption Guide",
    duration: "14s",
    desc: "Paste your unique voucher code in the Promo Code field on Pearson, ETS, or Duolingo portals.",
    poster: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    videoStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
    badgeColor: "bg-amber-400 text-slate-950",
    icon: "🔑",
    views: "18.5K views"
  },
  {
    id: 4,
    title: "How Much Can You Save?",
    category: "Save Money",
    duration: "16s",
    desc: "Compare regular official exam prices vs Apex bulk discounted prices for PTE, GRE, TOEFL, and Duolingo.",
    poster: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80",
    videoStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoypasses.mp4",
    youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
    badgeColor: "bg-amber-400 text-slate-950",
    icon: "💰",
    views: "31.9K views"
  },
  {
    id: 5,
    title: "IELTS Voucher Explained",
    category: "IELTS",
    duration: "20s",
    desc: "Everything about IELTS Academic & General discount codes for IDP registration across India.",
    poster: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80",
    videoStream: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    youtubeEmbed: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0",
    badgeColor: "bg-amber-400 text-slate-950",
    icon: "🇬🇧",
    views: "11.7K views"
  }
];

export const VideoReelsCarousel = () => {
  const [videoList, setVideoList] = useState(REEL_VIDEOS);
  const [videoSectionEnabled, setVideoSectionEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isMovieMode, setIsMovieMode] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState(null);
  const [userInitiatedPlay, setUserInitiatedPlay] = useState(false);

  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const playedVideoIds = useRef(new Set());

  useEffect(() => {
    let isMounted = true;
    videoApi.list().then((res) => {
      if (!isMounted) return;
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const formatted = res.data.map((v, i) => ({
          _id: v._id,
          id: v._id || i + 1,
          title: v.title,
          category: v.category || 'Step-By-Step Guide',
          duration: v.duration || '15s',
          desc: v.description || v.desc || '',
          poster: v.thumbnail || v.poster || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&auto=format&fit=crop&q=80',
          videoStream: v.videoUrl,
          youtubeEmbed: v.youtubeEmbed || v.videoUrl,
          badgeColor: v.badgeColor || 'bg-amber-400 text-slate-950',
          icon: v.icon || '🎬',
          viewsCount: v.viewsCount || 0,
          views: v.viewsCount >= 1000 ? `${(v.viewsCount / 1000).toFixed(1)}K views` : `${v.viewsCount || 0} views`,
          featured: !!v.featured,
        }));
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
    setIsPlaying(false);
    setUserInitiatedPlay(false);
  };

  const handleNext = () => {
    pauseVisibleVideo();
    setIsPlaying(false);
    setUserInitiatedPlay(false);
    setUseIframeFallback(false);
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    pauseVisibleVideo();
    setIsPlaying(false);
    setUserInitiatedPlay(false);
    setUseIframeFallback(false);
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  useEffect(() => {
    setUseIframeFallback(false);
    setIsPlaying(false);
    setUserInitiatedPlay(false);

    const currentVideoEl = getCurrentVideoElement();
    if (currentVideoEl) {
      currentVideoEl.currentTime = 0;
      currentVideoEl.pause();
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
  }, [activeModalVideo, isPlaying]);

  const togglePlay = () => {
    if (currentVideo) recordView(currentVideo);
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
          })
          .catch((error) => {
            console.warn("Playback error, enabling iframe player:", error);
            setUseIframeFallback(true);
          });
      } else {
        setIsPlaying(true);
        setUserInitiatedPlay(true);
      }
    } else {
      currentVideoEl.pause();
      setIsPlaying(false);
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

  return (
    <section 
      id="video-reels"
      className="py-20 sm:py-28 bg-[#151515] text-white relative overflow-hidden transition-colors duration-300 border-b border-amber-500/20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Gold Glow Backdrop & Dots */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/15 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.04] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-10">
        
        {/* Section Header */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-extrabold uppercase tracking-widest">
            <Film className="w-4 h-4 text-amber-400" />
            <span>WATCH & LEARN</span>
          </div>

          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mt-2">
            Got Questions About <br />
            <span className="text-amber-400 underline decoration-amber-400/40 decoration-wavy">Exam Vouchers?</span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base font-medium max-w-xl mx-auto">
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
              className={`px-4 py-2 rounded-full border text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                isMovieMode
                  ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'bg-white/10 text-white border-white/20 hover:border-amber-400'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isMovieMode ? '🎬 Movie Reel Mode (Continuous Left-to-Right)' : '▶ Turn On Movie Reel Mode'}</span>
            </button>
          </div>
        </div>

        {/* Desktop 5-Card Cinematic Film Strip Carousel */}
        <div className="hidden md:flex items-center justify-center gap-4 lg:gap-6 min-h-[560px] py-4 relative">
          
          {/* Far Left Card (offset -2) */}
          <div 
            onClick={() => {
              pauseVisibleVideo();
              setIsPlaying(false);
              setUserInitiatedPlay(false);
              setUseIframeFallback(false);
              setActiveIndex((activeIndex - 2 + total) % total);
            }}
            className="w-[200px] h-[370px] rounded-[20px] bg-slate-900 border border-amber-500/20 opacity-40 scale-[0.75] cursor-pointer hover:opacity-80 hover:scale-[0.82] transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-4"
          >
            <img src={getVideoAt(-2).poster} alt={getVideoAt(-2).title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2 py-0.5 rounded bg-black/70 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                {getVideoAt(-2).category}
              </span>
              <span className="text-xs">{getVideoAt(-2).icon}</span>
            </div>

            <div className="relative z-10 text-center my-auto">
              <div className="w-10 h-10 rounded-full bg-amber-400/90 text-slate-950 flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-black text-xs text-white leading-tight">{getVideoAt(-2).title}</h4>
              <span className="text-[10px] text-amber-400 font-bold block">▶ {getVideoAt(-2).duration}</span>
            </div>
          </div>

          {/* Immediate Left Card (offset -1) */}
          <div 
            onClick={() => {
              pauseVisibleVideo();
              setIsPlaying(false);
              setUserInitiatedPlay(false);
              setUseIframeFallback(false);
              setActiveIndex((activeIndex - 1 + total) % total);
            }}
            className="w-[240px] h-[440px] rounded-[22px] bg-slate-900 border border-amber-500/30 opacity-65 scale-[0.86] cursor-pointer hover:opacity-90 hover:scale-[0.9] transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-5"
          >
            <img src={getVideoAt(-1).poster} alt={getVideoAt(-1).title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 rounded bg-black/70 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                {getVideoAt(-1).category}
              </span>
              <span className="text-sm">{getVideoAt(-1).icon}</span>
            </div>

            <div className="relative z-10 my-auto text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400/90 text-slate-950 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-black text-sm text-white leading-tight">{getVideoAt(-1).title}</h4>
              <span className="text-xs text-amber-400 font-bold block">▶ {getVideoAt(-1).duration}</span>
            </div>
          </div>

          {/* CENTER FEATURED INLINE VIDEO PLAYER CARD (9:16 Aspect Ratio) */}
          <div className="w-[300px] lg:w-[320px] h-[530px] lg:h-[560px] rounded-[24px] bg-[#161616] border-2 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.3)] relative overflow-hidden shrink-0 transition-all duration-500 flex flex-col justify-between p-6 z-20 group">
            
            {/* Inline Video Player / Fallback Embed */}
            {!useIframeFallback ? (
              <video
                ref={desktopVideoRef}
                src={currentVideo.videoStream}
                poster={currentVideo.poster}
                muted={isMuted}
                playsInline
                crossOrigin="anonymous"
                onEnded={handleVideoEnded}
                onError={() => setUseIframeFallback(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <iframe
                className="absolute inset-0 w-full h-full object-cover"
                src={currentVideo.youtubeEmbed}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}

            {/* Gradient Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70 pointer-events-none" />

            {/* Top Branding Bar */}
            <div className="relative z-10 flex justify-between items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${currentVideo.badgeColor}`}>
                {currentVideo.category}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={toggleMute}
                  className="p-1.5 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-amber-400 border border-white/10 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute sound' : 'Mute sound'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
                  <ApexLogo className="h-4" whiteText={true} />
                </div>
              </div>
            </div>

            {/* Center Controls (Play/Pause Button Overlay) */}
            <div className="relative z-10 text-center my-auto">
              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center mx-auto shadow-2xl transition-all transform group-hover:scale-110 border-2 border-white cursor-pointer"
                aria-label={isPlaying ? 'Pause video' : 'Play video'}
              >
                {isPlaying ? (
                  <Pause className="w-7 h-7 fill-slate-950" />
                ) : (
                  <Play className="w-7 h-7 fill-slate-950 ml-1" />
                )}
              </button>
              
              <span className="inline-block mt-3 text-[11px] font-extrabold text-amber-400 uppercase tracking-widest bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/30">
                {isPlaying ? '⚡ Playing Reel Stream' : `${currentVideo.duration} • Click to Play`}
              </span>
            </div>

            {/* Bottom Card Title & Controls */}
            <div className="relative z-10 text-left space-y-2 bg-slate-950/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-lg">
              <div className="flex justify-between items-start gap-2">
                <h3 className="font-heading font-black text-lg text-white leading-tight">
                  {currentVideo.title}
                </h3>
                <span className="text-[10px] font-bold text-slate-400 shrink-0">{currentVideo.views}</span>
              </div>

              <p className="text-xs text-slate-300 font-medium line-clamp-2">
                {currentVideo.desc}
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={togglePlay}
                  className="flex-1 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5 fill-slate-950" /> : <Play className="w-3.5 h-3.5 fill-slate-950" />}
                  <span>{isPlaying ? 'Pause Reel' : 'Play Inline Reel'}</span>
                </button>

                <button
                  onClick={() => setActiveModalVideo(currentVideo)}
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 cursor-pointer"
                  title="Expand to Full Modal"
                >
                  <Film className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

          {/* Immediate Right Card (offset +1) */}
          <div 
            onClick={() => {
              pauseVisibleVideo();
              setIsPlaying(false);
              setUserInitiatedPlay(false);
              setUseIframeFallback(false);
              setActiveIndex((activeIndex + 1) % total);
            }}
            className="w-[240px] h-[440px] rounded-[22px] bg-slate-900 border border-amber-500/30 opacity-65 scale-[0.86] cursor-pointer hover:opacity-90 hover:scale-[0.9] transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-5"
          >
            <img src={getVideoAt(1).poster} alt={getVideoAt(1).title} className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2.5 py-1 rounded bg-black/70 text-[10px] font-bold text-amber-400 border border-amber-500/30">
                {getVideoAt(1).category}
              </span>
              <span className="text-sm">{getVideoAt(1).icon}</span>
            </div>

            <div className="relative z-10 my-auto text-center">
              <div className="w-12 h-12 rounded-full bg-amber-400/90 text-slate-950 flex items-center justify-center mx-auto shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-black text-sm text-white leading-tight">{getVideoAt(1).title}</h4>
              <span className="text-xs text-amber-400 font-bold block">▶ {getVideoAt(1).duration}</span>
            </div>
          </div>

          {/* Far Right Card (offset +2) */}
          <div 
            onClick={() => {
              pauseVisibleVideo();
              setIsPlaying(false);
              setUserInitiatedPlay(false);
              setUseIframeFallback(false);
              setActiveIndex((activeIndex + 2) % total);
            }}
            className="w-[200px] h-[370px] rounded-[20px] bg-slate-900 border border-amber-500/20 opacity-40 scale-[0.75] cursor-pointer hover:opacity-80 hover:scale-[0.82] transition-all duration-500 overflow-hidden relative shadow-xl shrink-0 group flex flex-col justify-between p-4"
          >
            <img src={getVideoAt(2).poster} alt={getVideoAt(2).title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

            <div className="relative z-10 flex justify-between items-start">
              <span className="px-2 py-0.5 rounded bg-black/60 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                {getVideoAt(2).category}
              </span>
              <span className="text-xs">{getVideoAt(2).icon}</span>
            </div>

            <div className="relative z-10 text-center my-auto">
              <div className="w-10 h-10 rounded-full bg-amber-400/80 text-slate-950 flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-slate-950 ml-0.5" />
              </div>
            </div>

            <div className="relative z-10 text-left space-y-1">
              <h4 className="font-heading font-black text-xs text-white leading-tight">{getVideoAt(2).title}</h4>
              <span className="text-[10px] text-amber-400 font-bold block">▶ {getVideoAt(2).duration}</span>
            </div>
          </div>

        </div>

        {/* Mobile Viewport Reel Card */}
        <div className="md:hidden space-y-6">
          <div className="w-full max-w-xs mx-auto aspect-[9/16] rounded-[22px] bg-[#161616] border-2 border-amber-400 shadow-xl relative overflow-hidden flex flex-col justify-between p-5">
            {!useIframeFallback ? (
              <video
                ref={mobileVideoRef}
                src={currentVideo.videoStream}
                poster={currentVideo.poster}
                muted={isMuted}
                playsInline
                onError={() => setUseIframeFallback(true)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <iframe
                className="absolute inset-0 w-full h-full object-cover"
                src={currentVideo.youtubeEmbed}
                title={currentVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/70 pointer-events-none" />

            <div className="relative z-10 flex justify-between items-center">
              <span className="px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase">
                {currentVideo.category}
              </span>
              <ApexLogo className="h-4" whiteText={true} />
            </div>

            <div className="relative z-10 text-center my-auto">
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl border-2 border-white cursor-pointer"
                aria-label="Play video"
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-1" />}
              </button>
            </div>

            <div className="relative z-10 text-left space-y-1.5 bg-slate-950/80 p-3.5 rounded-xl border border-white/10">
              <h3 className="font-heading font-black text-sm text-white leading-tight">{currentVideo.title}</h3>
              <button
                onClick={togglePlay}
                className="w-full py-2 rounded-lg bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-3 h-3 fill-slate-950" /> : <Play className="w-3 h-3 fill-slate-950" />}
                <span>{isPlaying ? 'Pause' : 'Play Stream'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Controls Bar (Left to Right Navigation Buttons & Dots) */}
        <div className="flex flex-col items-center gap-4 pt-2">
          
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              aria-label="Previous video"
              className="w-11 h-11 rounded-full bg-white text-slate-950 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all shadow-lg border border-white/20 cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Pagination Indicators */}
            <div className="flex items-center gap-2 overflow-x-auto max-w-[220px] sm:max-w-none px-2 py-1">
              {REEL_VIDEOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  aria-label={`Go to video ${idx + 1}`}
                  className={`h-2.5 rounded-full transition-all shrink-0 cursor-pointer ${
                    activeIndex === idx
                      ? 'w-7 bg-amber-400'
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              aria-label="Next video"
              className="w-11 h-11 rounded-full bg-white text-slate-950 hover:bg-amber-400 hover:text-slate-950 flex items-center justify-center transition-all shadow-lg border border-white/20 cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <p className="text-xs text-slate-400 font-semibold">
            Video {activeIndex + 1} of {total} • Left to Right Movie Flow
          </p>

        </div>

      </div>

      {/* Expanded Modal Video Player */}
      {activeModalVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-[#161616] rounded-3xl p-6 border border-amber-500/30 shadow-2xl text-white space-y-4">
            
            <button
              onClick={() => setActiveModalVideo(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-amber-400 hover:text-slate-950 text-white transition-colors cursor-pointer"
              aria-label="Close modal video player"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-black uppercase">
                {activeModalVideo.category}
              </span>
              <ApexLogo className="h-5" whiteText={true} />
            </div>

            <h3 className="font-heading font-black text-2xl text-white">
              {activeModalVideo.title}
            </h3>

            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-xl relative">
              <iframe
                className="w-full h-full object-cover"
                src={activeModalVideo.youtubeEmbed}
                title={activeModalVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <p className="text-xs text-slate-300 font-medium leading-relaxed">
              {activeModalVideo.desc}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setActiveModalVideo(null)}
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                Close Video Player
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

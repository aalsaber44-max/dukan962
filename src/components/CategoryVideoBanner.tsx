import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, AlertTriangle, Loader2 } from 'lucide-react';

interface CategoryVideoBannerProps {
  videoUrl: string;
  poster?: string;
  title: string;
}

export const CategoryVideoBanner: React.FC<CategoryVideoBannerProps> = ({
  videoUrl,
  poster,
  title,
}) => {
  const mainVideoRef = useRef<HTMLVideoElement>(null);
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  useEffect(() => {
    const main = mainVideoRef.current;
    const bg = bgVideoRef.current;
    main?.pause();
    bg?.pause();
    setIsPlaying(false);
  }, []);

  const syncMutedState = () => {
    const main = mainVideoRef.current;
    if (main) setIsMuted(main.muted);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const main = mainVideoRef.current;
    if (!main) return;
    const newMuted = !main.muted;
    main.muted = newMuted;
    if (bgVideoRef.current) bgVideoRef.current.muted = true;
    setIsMuted(newMuted);
  };

  const playBoth = async () => {
    const main = mainVideoRef.current;
    const bg = bgVideoRef.current;
    if (!main) return;

    setIsBuffering(true);

    try {
      await main.play();
    } catch {
      main.muted = true;
      setIsMuted(true);
      try {
        await main.play();
      } catch (err) {
        console.warn('Video play delayed, waiting for data:', err);
        setIsBuffering(false);
        return;
      }
    }

    if (bg) {
      bg.muted = true;
      if (Math.abs(bg.currentTime - main.currentTime) > 0.3) {
        try { bg.currentTime = main.currentTime; } catch {}
      }
      try { await bg.play(); } catch {}
    }
  };

  const pauseBoth = () => {
    mainVideoRef.current?.pause();
    bgVideoRef.current?.pause();
    setIsBuffering(false);
  };

  const handlePlayPause = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const main = mainVideoRef.current;
    if (!main) return;

    if (main.paused) {
      await playBoth();
      setIsPlaying(true);
    } else {
      pauseBoth();
      setIsPlaying(false);
    }
  };

  const handleMainPlay = () => {
    setIsPlaying(true);
    const main = mainVideoRef.current;
    const bg = bgVideoRef.current;
    if (!main || !bg) return;

    bg.muted = true;
    if (Math.abs(bg.currentTime - main.currentTime) > 0.3) {
      try { bg.currentTime = main.currentTime; } catch {}
    }
    if (bg.paused) {
      bg.play().catch(() => {});
    }
  };

  const handleMainPause = () => {
    setIsPlaying(false);
    bgVideoRef.current?.pause();
  };

  return (
    <div className="relative mb-6 sm:mb-8 rounded-[22px] sm:rounded-[28px] overflow-hidden ring-1 ring-white/10 shadow-lift bg-[#0B0A09]">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center overflow-hidden">
        <video
          ref={bgVideoRef}
          src={videoUrl}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
        />

        <video
          ref={mainVideoRef}
          src={videoUrl}
          poster={poster}
          loop
          playsInline
          preload="metadata"
          aria-label={`فيديو قسم ${title}`}
          className="relative z-10 w-full h-full object-contain"
          onPlay={handleMainPlay}
          onPause={handleMainPause}
          onVolumeChange={syncMutedState}
          onError={() => setHasError(true)}
          onLoadedData={() => {
            setHasError(false);
            setIsBuffering(false);
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => setIsBuffering(false)}
        />

        {!isPlaying && !hasError && (
          <button
            type="button"
            onClick={handlePlayPause}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors cursor-pointer group/play"
            aria-label="تشغيل الفيديو"
          >
            {/* 💡 تثبيت لون الخلفية الداكنة والأيقونة البيضاء */}
            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full !bg-black/60 backdrop-blur-md ring-2 ring-white/60 flex items-center justify-center group-hover/play:scale-110 transition-transform shadow-2xl">
              {isBuffering ? (
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 !text-white animate-spin" />
              ) : (
                <Play className="w-8 h-8 sm:w-10 sm:h-10 !text-white !fill-white ml-1" />
              )}
            </span>
          </button>
        )}

        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/85 text-center p-4">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-bold !text-white">تعذّر تحميل الفيديو</p>
            <p className="text-xs !text-white/70 max-w-md">
              تحقق من صلاحية رابط الفيديو، أو تأكد أنه بصيغة MP4/WebM.
            </p>
          </div>
        )}

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between gap-3 z-20">
          <span className="text-[10px] sm:text-xs font-bold text-[#E8CC8A] !bg-black/60 backdrop-blur-md ring-1 ring-[#D4B06A]/30 px-3 py-1.5 rounded-full pointer-events-none">
            🎬 فيديو {title}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={hasError}
              aria-label={isPlaying ? 'إيقاف الفيديو' : 'تشغيل الفيديو'}
              className="grid place-items-center w-9 h-9 rounded-full !bg-black/60 hover:!bg-black/80 backdrop-blur-md ring-1 ring-white/20 !text-white transition-all active:scale-90 cursor-pointer disabled:opacity-30"
            >
              {isPlaying ? <Pause className="w-4 h-4 !text-white" /> : <Play className="w-4 h-4 !text-white !fill-white" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              disabled={hasError}
              aria-label={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
              className="grid place-items-center w-9 h-9 rounded-full !bg-black/60 hover:!bg-black/80 backdrop-blur-md ring-1 ring-white/20 !text-white transition-all active:scale-90 cursor-pointer disabled:opacity-30"
            >
              {isMuted ? <VolumeX className="w-4 h-4 !text-white" /> : <Volume2 className="w-4 h-4 !text-white" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

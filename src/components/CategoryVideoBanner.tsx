import React, { useRef, useState } from 'react';
import { Volume2, VolumeX, Play, Pause, AlertTriangle } from 'lucide-react';

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
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!mainVideoRef.current) return;
    const newMuted = !mainVideoRef.current.muted;
    mainVideoRef.current.muted = newMuted;
    if (bgVideoRef.current) bgVideoRef.current.muted = newMuted;
    setIsMuted(newMuted);
  };

  // ✅ مزامنة الفيديو الأساسي مع الخلفية
  const handlePlayPause = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const main = mainVideoRef.current;
    const bg = bgVideoRef.current;
    if (!main) return;

    if (main.paused) {
      // تشغيل الاثنين معاً
      Promise.all([
        main.play().catch(() => {}),
        bg?.play().catch(() => {}),
      ]).then(() => {
        setIsPlaying(true);
      });
    } else {
      // إيقاف الاثنين معاً
      main.pause();
      bg?.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative mb-6 sm:mb-8 rounded-[22px] sm:rounded-[28px] overflow-hidden ring-1 ring-white/10 shadow-lift bg-[#0B0A09]">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center overflow-hidden">
        
        {/* الخلفية الضبابية — بدون autoPlay */}
        <video
          ref={bgVideoRef}
          src={videoUrl}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
        />

        {/* الفيديو الأساسي — بدون autoPlay */}
        <video
          ref={mainVideoRef}
          src={videoUrl}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`فيديو قسم ${title}`}
          className="relative z-10 w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          onLoadedData={() => setHasError(false)}
        />

        {/* زر تشغيل كبير في المنتصف — يظهر فقط قبل التشغيل أو عند التوقف */}
        {!isPlaying && !hasError && (
          <button
            type="button"
            onClick={handlePlayPause}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/35 hover:bg-black/50 transition-colors cursor-pointer group/play"
            aria-label="تشغيل الفيديو"
          >
            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/25 backdrop-blur-md ring-2 ring-white/60 flex items-center justify-center group-hover/play:scale-110 transition-transform shadow-2xl">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1" />
            </span>
          </button>
        )}

        {/* رسالة الخطأ */}
        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/85 text-center p-4">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-bold text-[#F3EEE4]">تعذّر تحميل الفيديو</p>
            <p className="text-xs text-[#A39A8B] max-w-md">
              تحقق من صلاحية رابط الفيديو، أو تأكد أنه بصيغة MP4/WebM.
            </p>
          </div>
        )}

        {/* التدرج السفلي */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* شريط التحكم في الأسفل */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between gap-3 z-20">
          <span className="text-[10px] sm:text-xs font-bold text-[#E8CC8A] bg-black/60 backdrop-blur-md ring-1 ring-[#D4B06A]/30 px-3 py-1.5 rounded-full pointer-events-none">
            🎬 فيديو {title}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePlayPause}
              disabled={hasError}
              aria-label={isPlaying ? 'إيقاف الفيديو' : 'تشغيل الفيديو'}
              className="grid place-items-center w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md ring-1 ring-white/20 text-[#F3EEE4] transition-all active:scale-90 cursor-pointer disabled:opacity-30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              disabled={hasError}
              aria-label={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
              className="grid place-items-center w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md ring-1 ring-white/20 text-[#F3EEE4] transition-all active:scale-90 cursor-pointer disabled:opacity-30"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

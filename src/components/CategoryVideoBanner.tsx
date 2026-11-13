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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [hasError, setHasError] = useState(false);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative mb-6 sm:mb-8 rounded-[22px] sm:rounded-[28px] overflow-hidden ring-1 ring-white/10 shadow-lift bg-[#0B0A09]">
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] flex items-center justify-center overflow-hidden">
        
        {/* 1. الخلفية الضبابية للفيديو (تملأ الفراغات للفيديوهات الرأسية) */}
        <video
          src={videoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
        />

        {/* 2. الفيديو الأساسي (يظهر كاملاً بدون زووم) */}
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          autoPlay
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

        {/* 3. زر تشغيل كبير في المنتصف (يظهر فقط عند التوقف) */}
        {!isPlaying && !hasError && (
          <button
            type="button"
            onClick={togglePlay}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer group/play"
            aria-label="تشغيل الفيديو"
          >
            <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/20 backdrop-blur-md ring-2 ring-white/50 flex items-center justify-center group-hover/play:scale-110 transition-transform">
              <Play className="w-8 h-8 sm:w-10 sm:h-10 text-white fill-white ml-1" />
            </span>
          </button>
        )}

        {/* تدرج سفلي لتحسين قراءة الشريط */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* رسالة خطأ عند فشل تحميل الفيديو */}
        {hasError && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-black/85 text-center p-4">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-bold text-[#F3EEE4]">تعذّر تحميل الفيديو</p>
            <p className="text-xs text-[#A39A8B] max-w-md">
              تحقق من صلاحية رابط الفيديو، أو تأكد أنه بصيغة MP4/WebM من مصدر مباشر.
            </p>
          </div>
        )}

        {/* شريط التحكم السفلي */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between gap-3 z-20">
          <span className="text-[10px] sm:text-xs font-bold text-[#E8CC8A] bg-black/60 backdrop-blur-md ring-1 ring-[#D4B06A]/30 px-3 py-1.5 rounded-full pointer-events-none">
            🎬 فيديو {title}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              disabled={hasError}
              aria-label={isPlaying ? 'إيقاف الفيديو' : 'تشغيل الفيديو'}
              className="grid place-items-center w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md ring-1 ring-white/20 text-[#F3EEE4] transition-all active:scale-90 cursor-pointer disabled:opacity-30"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              disabled={hasError}
              aria-label={isMuted ? 'تفعيل الصوت' : 'كتم الصوت'}
              className="grid place-items-center w-9 h-9 rounded-full bg-black/55 hover:bg-black/75 backdrop-blur-md ring-1 ring-white/20 text-[#F3EEE4] transition-all active:scale-90 cursor-pointer disabled:opacity-30"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

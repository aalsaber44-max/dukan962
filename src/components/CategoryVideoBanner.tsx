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
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/9]">
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
          className="absolute inset-0 w-full h-full object-cover"
          onError={() => setHasError(true)}
          onLoadedData={() => setHasError(false)}
        />

        {/* تدرج سفلي */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

        {/* رسالة خطأ عند فشل تحميل الفيديو */}
        {hasError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/85 text-center p-4">
            <AlertTriangle className="w-10 h-10 text-amber-400" />
            <p className="text-sm font-bold text-[#F3EEE4]">تعذّر تحميل الفيديو</p>
            <p className="text-xs text-[#A39A8B] max-w-md">
              تحقق من صلاحية رابط الفيديو، أو تأكد أنه بصيغة MP4/WebM من مصدر مباشر.
            </p>
          </div>
        )}

        {/* شريط التحكم */}
        <div className="absolute bottom-0 inset-x-0 p-3 sm:p-5 flex items-center justify-between gap-3 z-10">
          <span className="text-[10px] sm:text-xs font-bold text-[#E8CC8A] bg-black/50 backdrop-blur-md ring-1 ring-[#D4B06A]/30 px-3 py-1.5 rounded-full pointer-events-none">
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

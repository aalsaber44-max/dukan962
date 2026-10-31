export type VideoSource =
  | { kind: 'youtube'; src: string }
  | { kind: 'file'; src: string }
  | { kind: 'link'; src: string }
  | null;

/**
 * يحوّل رابط الفيديو المحفوظ في لوحة التحكم إلى مصدر قابل للعرض:
 *  - يوتيوب (watch / youtu.be / shorts / embed) => مشغّل مدمج
 *  - ملف مباشر mp4/webm/ogg => وسم video
 *  - أي رابط آخر (إنستغرام، تيك توك...) => زر يفتح الرابط في تبويب جديد
 * الروابط غير http/https تُرفض (حماية من javascript: وغيره).
 */
export const getVideoSource = (raw?: string): VideoSource => {
  const url = (raw || '').trim();
  if (!/^https?:\/\//i.test(url)) return null;

  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/i);
  if (yt) return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0` };

  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return { kind: 'file', src: url };

  return { kind: 'link', src: url };
};

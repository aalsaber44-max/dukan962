// تحويل الألوان المكتوبة يدوياً إلى متغيّرات نظام التصميم (مرة واحدة)
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'src');

const files = [
  'App.tsx',
  'components/Hero.tsx',
  'components/Navbar.tsx',
  'components/ProductCard.tsx',
  'components/CategoryBoxes.tsx',
  'components/CategoryVideoBanner.tsx',
  'components/FilterBar.tsx',
  'components/Footer.tsx',
  'components/CartDrawer.tsx',
  'components/WishlistDrawer.tsx',
  'components/ProductDetailsPage.tsx',
  'components/MobileBottomNav.tsx',
  'components/EmptyState.tsx',
  'components/RecentlyViewed.tsx',
  'components/FAQ.tsx',
  'components/FAQPage.tsx',
  'components/NotFound.tsx',
  'components/FloatingActions.tsx',
  'components/StockBadge.tsx',
  'components/ProductReviews.tsx',
  'components/Toast.tsx',
  'components/ImageLightbox.tsx',
  'components/CheckoutModal.tsx',
  'components/OrderTrackingModal.tsx',
  'components/DukanLogo.tsx',
  'components/SupportChatbot.tsx',
];

// الأطول أولاً حتى لا تُستبدل البادئات قبل الأنماط المركّبة
const map = [
  ['ring-offset-[#141210]', 'ring-offset-[var(--sf-surface)]'],

  // خلفيات
  ['bg-[#0B0A09]/85', 'bg-[var(--sf-glass)]'],
  ['bg-[#0B0A09]/70', 'bg-[var(--sf-glass)]'],
  ['bg-[#0B0A09]/0', 'bg-transparent'],
  ['bg-[#080706]', 'bg-[var(--sf-bg)]'],
  ['bg-[#0B0A09]', 'bg-[var(--sf-bg)]'],
  ['bg-[#0F0D0B]', 'bg-[var(--sf-bg-alt)]'],
  ['bg-[#141210]', 'bg-[var(--sf-surface)]'],
  ['bg-[#17140F]', 'bg-[var(--sf-panel)]'],
  ['bg-[#1C1815]', 'bg-[var(--sf-panel)]'],
  ['bg-[#1E1A17]', 'bg-[var(--sf-panel)]'],
  ['bg-[#211C17]', 'bg-[var(--sf-panel)]'],
  ['bg-[#26211D]', 'bg-[var(--sf-panel-2)]'],
  ['bg-[#EFE9DE]', 'bg-[var(--sf-plate-a)]'],
  ['bg-[#DCD4C5]', 'bg-[var(--sf-plate-b)]'],

  ['from-[#0B0A09]', 'from-[var(--sf-bg)]'],
  ['to-[#0B0A09]', 'to-[var(--sf-bg)]'],
  ['from-[#141210]', 'from-[var(--sf-surface)]'],
  ['to-[#141210]', 'to-[var(--sf-surface)]'],
  ['from-[#EFE9DE]', 'from-[var(--sf-plate-a)]'],
  ['to-[#DCD4C5]', 'to-[var(--sf-plate-b)]'],
  ['from-[#E8CC8A]', 'from-[var(--sf-accent-strong)]'],
  ['from-[#D4B06A]', 'from-[var(--sf-accent)]'],
  ['from-[#E3C16F]', 'from-[var(--sf-accent-strong)]'],
  ['to-[#D4B06A]', 'to-[var(--sf-accent)]'],
  ['to-[#E8CC8A]', 'to-[var(--sf-accent-strong)]'],
  ['to-[#B8923A]', 'to-[var(--sf-accent-strong)]'],

  // نصوص
  ['text-[#F3EEE4]', 'text-[var(--sf-text)]'],
  ['text-[#CFC7B8]', 'text-[var(--sf-text)]'],
  ['text-[#D6D0C7]', 'text-[var(--sf-text)]'],
  ['text-[#A39A8B]', 'text-[var(--sf-muted)]'],
  ['text-[#8A8173]', 'text-[var(--sf-muted)]'],
  ['text-[#B9B0A0]', 'text-[var(--sf-muted)]'],
  ['text-[#78716C]', 'text-[var(--sf-muted)]'],
  ['placeholder-[#8A8173]', 'placeholder-[var(--sf-muted)]'],
  ['placeholder-[#78716C]', 'placeholder-[var(--sf-muted)]'],
  ['text-[#D4B06A]', 'text-[var(--sf-accent)]'],
  ['text-[#E8CC8A]', 'text-[var(--sf-accent)]'],
  ['text-[#7FD1A0]', 'text-[var(--sf-success)]'],
  ['text-[#F87171]', 'text-[var(--sf-danger)]'],

  // ذهبي كخلفية / حدود
  ['bg-[#D4B06A]/15', 'bg-[var(--sf-accent-soft)]'],
  ['bg-[#D4B06A]/10', 'bg-[var(--sf-accent-soft)]'],
  ['bg-[#D4B06A]', 'bg-[var(--sf-accent)]'],
  ['bg-[#E8CC8A]', 'bg-[var(--sf-accent-strong)]'],
  ['border-[#D4B06A]/30', 'border-[var(--sf-border-strong)]'],
  ['border-[#D4B06A]/40', 'border-[var(--sf-border-strong)]'],
  ['border-[#D4B06A]', 'border-[var(--sf-accent)]'],
  ['ring-[#D4B06A]/40', 'ring-[var(--sf-border-strong)]'],
  ['ring-[#D4B06A]/60', 'ring-[var(--sf-accent)]'],
  ['ring-[#D4B06A]', 'ring-[var(--sf-accent)]'],
  ['accent-[#D4B06A]', 'accent-[var(--sf-accent)]'],
  ['!bg-[#D4B06A]', '!bg-[var(--sf-accent)]'],
  ['!bg-[#E8CC8A]', '!bg-[var(--sf-accent-strong)]'],
  ['!text-[#0B0A09]', '!text-[var(--sf-accent-contrast)]'],
  ['!text-[#E8CC8A]', '!text-[var(--sf-accent)]'],

  // نجاح
  ['bg-[#7FD1A0]/10', 'bg-[var(--sf-success-soft)]'],
  ['bg-[#7FD1A0]', 'bg-[var(--sf-success)]'],
  ['ring-[#7FD1A0]/25', 'ring-[var(--sf-success)]'],
  ['ring-[#7FD1A0]', 'ring-[var(--sf-success)]'],

  // حدود ومساحات محايدة
  ['border-[#2A2520]', 'border-[var(--sf-border)]'],
  ['border-[#332D26]', 'border-[var(--sf-border)]'],
  ['divide-white/10', 'divide-[var(--sf-border)]'],
  ['border-white/10', 'border-[var(--sf-border)]'],
  ['border-white/15', 'border-[var(--sf-border)]'],
  ['border-white/20', 'border-[var(--sf-border)]'],
  ['border-white/5', 'border-[var(--sf-border)]'],
  ['ring-white/10', 'ring-[var(--sf-border)]'],
  ['ring-white/15', 'ring-[var(--sf-border)]'],
  ['ring-white/20', 'ring-[var(--sf-border)]'],
  ['bg-white/[0.02]', 'bg-[var(--sf-soft)]'],
  ['bg-white/[0.03]', 'bg-[var(--sf-soft)]'],
  ['bg-white/[0.04]', 'bg-[var(--sf-soft)]'],
  ['bg-white/[0.05]', 'bg-[var(--sf-soft)]'],
  ['bg-white/[0.06]', 'bg-[var(--sf-soft)]'],
  ['bg-white/[0.07]', 'bg-[var(--sf-soft-strong)]'],
  ['hover:bg-white/10', 'hover:bg-[var(--sf-soft-strong)]'],
  ['hover:bg-white/[0.04]', 'hover:bg-[var(--sf-soft)]'],
  ['hover:bg-[#26211D]', 'hover:bg-[var(--sf-panel-2)]'],
  ['hover:bg-[#1C1815]', 'hover:bg-[var(--sf-panel)]'],
];

let total = 0;
const touched = [];
for (const rel of files) {
  const absolute = path.join(root, rel);
  if (!fs.existsSync(absolute)) {
    console.log('MISSING', rel);
    continue;
  }
  const before = fs.readFileSync(absolute, 'utf8');
  let after = before;
  for (const [from, to] of map) after = after.split(from).join(to);
  if (after !== before) {
    fs.writeFileSync(absolute, after, 'utf8');
    touched.push(rel);
    total += (before.length - after.length) === 0 ? 1 : 1;
  }
}

console.log('FILES_CHANGED', touched.length);
console.log(touched.join('\n'));

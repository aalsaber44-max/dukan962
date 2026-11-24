import {
  Armchair,
  Footprints,
  Sparkles,
  Moon,
  Lamp,
  Watch,
  Smartphone,
  Utensils,
  Flower2,
  Layers,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

/**
 * Emoji + pictograph ranges (Arabic storefront data can contain emoji in
 * Firestore fields such as category names, titles and badges).
 * Kept in one place so the storefront never renders a pictograph.
 */
const EMOJI_SOURCE =
  '[\\p{Extended_Pictographic}\\p{Emoji_Presentation}\\u{FE0F}\\u{20E3}\\u{1F1E6}-\\u{1F1FF}\\u{2600}-\\u{27BF}\\u{2B00}-\\u{2BFF}\\u{1F000}-\\u{1FAFF}]';

const EMOJI_GLOBAL = new RegExp(EMOJI_SOURCE, 'gu');
const EMOJI_TEST = new RegExp(EMOJI_SOURCE, 'u');

/** True when the string carries at least one emoji / pictographic symbol. */
export const hasEmoji = (value?: string | null): boolean =>
  typeof value === 'string' && EMOJI_TEST.test(value);

/**
 * Removes every emoji, variation selector, keycap and zero-width joiner from a
 * string, then tidies the leftover whitespace. Safe for `null` / `undefined`.
 */
export const stripEmoji = (value?: string | null): string => {
  if (typeof value !== 'string') return '';
  return value
    .replace(EMOJI_GLOBAL, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/ +\n/g, '\n')
    .trim();
};

/** `stripEmoji` with a fallback for empty results — ideal for optional fields. */
export const safeText = (value?: string | null, fallback = ''): string =>
  stripEmoji(value) || fallback;

interface IconRule {
  test: RegExp;
  Icon: LucideIcon;
}

/** Ordered — the first matching rule wins. */
const CATEGORY_ICON_RULES: IconRule[] = [
  { test: /رمضان|زين[ةه]|فانوس|ramadan|lantern/i, Icon: Moon },
  { test: /حذاء|أحذية|احذية|صندل|shoe|sneaker|boot/i, Icon: Footprints },
  { test: /عطر|عطور|بخور|perfume|fragrance/i, Icon: Sparkles },
  { test: /إضاء|اضاء|لمب[ةه]|ثريا|نجف|lamp|light|chandelier/i, Icon: Lamp },
  { test: /ساع[ةه]|watch|clock/i, Icon: Watch },
  { test: /موبايل|جوال|إلكترون|الكترون|phone|laptop|tech/i, Icon: Smartphone },
  { test: /مطبخ|أواني|اواني|kitchen|cook|utensil/i, Icon: Utensils },
  { test: /ديكور|زهو|مزهري|decor|vase|flower|vase/i, Icon: Flower2 },
  { test: /سجاد|بساط|موكيت|rug|carpet|textile/i, Icon: Layers },
  { test: /طاول|كرسي|كنب|أثاث|اثاث|خزان|سرير|مكتب|table|chair|sofa|furniture|desk|bed/i, Icon: Armchair },
];

/**
 * Maps a (possibly emoji-prefixed) community category label to a clean
 * Lucide vector icon instead of an emoji glyph.
 */
export const getCategoryIcon = (name?: string | null): LucideIcon => {
  const label = stripEmoji(name);
  if (!label) return LayoutGrid;
  const rule = CATEGORY_ICON_RULES.find(({ test }) => test.test(label));
  return rule ? rule.Icon : LayoutGrid;
};

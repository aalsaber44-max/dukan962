export type CategoryFamily =
  | 'furniture'
  | 'perfume'
  | 'shoes'
  | 'lighting'
  | 'rug'
  | 'watch'
  | 'tech'
  | 'kitchen'
  | 'decor'
  | 'ramadan'
  | 'all';

/** Ordered — the first matching rule wins. */
const FAMILY_RULES: { test: RegExp; family: CategoryFamily }[] = [
  { test: /رمضان|زين[ةه]|فانوس|ramadan|lantern/i, family: 'ramadan' },
  { test: /عطر|عطور|بخور|perfume|fragrance/i, family: 'perfume' },
  { test: /حذاء|أحذية|احذية|صندل|shoe|sneaker|boot/i, family: 'shoes' },
  { test: /إضاء|اضاء|لمب[ةه]|ثريا|نجف|lamp|light|chandelier/i, family: 'lighting' },
  { test: /ساع[ةه]|watch|clock/i, family: 'watch' },
  { test: /موبايل|جوال|إلكترون|الكترون|phone|laptop|tech/i, family: 'tech' },
  { test: /مطبخ|أواني|اواني|kitchen|cook|utensil/i, family: 'kitchen' },
  { test: /ديكور|زهو|مزهري|decor|vase|flower/i, family: 'decor' },
  { test: /سجاد|بساط|موكيت|rug|carpet|textile/i, family: 'rug' },
  { test: /طاول|كرسي|كنب|أثاث|اثاث|خزان|سرير|مكتب|table|chair|sofa|furniture|desk|bed/i, family: 'furniture' },
];

/** Detects the glyph family from a (possibly emoji-prefixed) category label. */
export const getCategoryFamily = (name?: string | null): CategoryFamily => {
  const label = typeof name === 'string' ? name.trim() : '';
  if (!label) return 'all';
  return FAMILY_RULES.find(({ test }) => test.test(label))?.family ?? 'all';
};

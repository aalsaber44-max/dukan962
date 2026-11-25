// One-off codemod: wrap dynamic Firestore strings with stripEmoji(...) at render
// time and make sure the helper is imported. Idempotent (skips wrapped values).
import fs from 'node:fs';

const FILES = [
  'src/components/ProductCard.tsx',
  'src/components/ProductDetailsPage.tsx',
  'src/components/CartDrawer.tsx',
  'src/components/WishlistDrawer.tsx',
  'src/components/RecentlyViewed.tsx',
  'src/components/Navbar.tsx',
  'src/components/CategoryVideoBanner.tsx',
  'src/components/Toast.tsx',
  'src/components/OrderTrackingModal.tsx',
  'src/components/CheckoutModal.tsx',
  'src/components/FilterBar.tsx',
  'src/components/CategoryBoxes.tsx',
];

const PATTERNS = [
  ['{item.product.name}', '{stripEmoji(item.product.name)}'],
  ['${item.product.name}', '${stripEmoji(item.product.name)}'],
  ['{item.product.description}', '{stripEmoji(item.product.description)}'],
  ['{product.name}', '{stripEmoji(product.name)}'],
  ['${product.name}', '${stripEmoji(product.name)}'],
  ['{product.description}', '{stripEmoji(product.description)}'],
  ['{serverProduct.name}', '{stripEmoji(serverProduct.name)}'],
  ['${serverProduct.name}', '${stripEmoji(serverProduct.name)}'],
  ['{product.categoryLabel || \'Dukan 962\'}', '{stripEmoji(product.categoryLabel) || \'Dukan 962\'}'],
  ['{item.name}', '{stripEmoji(item.name)}'],
  ['{toast.message}', '{stripEmoji(toast.message)}'],
  ['{toast.actionLabel}', '{stripEmoji(toast.actionLabel)}'],
  ['{selectedColor.name}', '{stripEmoji(selectedColor.name)}'],
  ['${selectedColor.name}', '${stripEmoji(selectedColor.name)}'],
  ['{color.name}', '{stripEmoji(color.name)}'],
  ['${colorName}', '${stripEmoji(colorName)}'],
  ['{cat.name}', '{stripEmoji(cat.name)}'],
  ['${cat.name}', '${stripEmoji(cat.name)}'],
  ['{currentCategoryData.name}', '{stripEmoji(currentCategoryData.name)}'],
  ['${currentCategoryData.name}', '${stripEmoji(currentCategoryData.name)}'],
  ['{title}', '{stripEmoji(title)}'],
];

const IMPORT_LINE = "import { stripEmoji } from '../utils/emoji';\n";
let report = [];

for (const file of FILES) {
  if (!fs.existsSync(file)) continue;
  let src = fs.readFileSync(file, 'utf8');
  const before = src;
  let count = 0;
  for (const [from, to] of PATTERNS) {
    if (!src.includes(from)) continue;
    const parts = src.split(from);
    // Skip occurrences already wrapped: "...stripEmoji(" right before.
    src = parts.reduce((acc, chunk, i) => {
      if (i === 0) return chunk;
      const tail = acc.slice(-12);
      if (tail.endsWith('stripEmoji(')) return acc + from + chunk;
      count += 1;
      return acc + to + chunk;
    }, '');
  }
  if (count > 0 && !src.includes("from '../utils/emoji'")) {
    src = src.replace(/^(import[^\n]*\n)/, `$1${IMPORT_LINE}`);
  }
  if (src !== before) {
    fs.writeFileSync(file, src, 'utf8');
    report.push(`${file}: ${count} wrapped`);
  }
}
console.log(report.join('\n') || 'no changes');

// إزالة كل الإيموجي من واجهة المتجر (نصوص + تعليقات) دون المساس بالتنسيق
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'src');
const emoji = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/u;
const withSpaces = /\s*[\p{Extended_Pictographic}\u{FE0F}\u{200D}]+\s*/gu;

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (/Admin|node_modules/.test(entry.name)) continue;
      walk(full);
      continue;
    }
    if (!/\.(tsx|ts)$/.test(entry.name) || /Admin|CategoryManager/.test(entry.name)) continue;

    const before = fs.readFileSync(full, 'utf8');
    if (!emoji.test(before)) continue;

    // 1) داخل النصوص: إزالة الإيموجي والمسافة الملاصقة
    let after = before.replace(withSpaces, (match, offset) => {
      const prev = before[offset - 1] ?? ' ';
      const next = before[offset + match.length] ?? ' ';
      // لا نحذف المسافة إذا كانت تفصل كلمتين
      return /[\p{L}\p{N}]/u.test(prev) && /[\p{L}\p{N}]/u.test(next) ? ' ' : '';
    });

    // 2) تعليقات صارت فارغة
    after = after.replace(/\/\/\s*$/gm, '//');
    after = after.replace(/\{\/\*\s*\*\/\}/g, '');
    after = after.replace(/(['"`])\s+(?=[^\s'"`])/g, '$1');

    fs.writeFileSync(full, after, 'utf8');
    console.log('cleaned', path.relative(root, full));
  }
};

walk(root);

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'src');
const attrRe = /(["'])(className|aria-[a-z-]+|data-[a-z-]+|role|type|style|key|src|alt|href|title|dir|id|placeholder|value)=/g;

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
    let after = before.replace(attrRe, '$1 $2=');

    // إزالة شريط العروض العلوي القديم (البنية الجديدة لا تحتاجه)
    if (entry.name === 'App.tsx') {
      after = after.replace(/\n\s*<aside aria-label="شريط العروض"[\s\S]*?<\/aside>\n/, '\n');
    }

    if (after !== before) {
      fs.writeFileSync(full, after, 'utf8');
      console.log('fixed', path.relative(root, full));
    }
  }
};

walk(root);

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', 'src');
const skip = /AdminDashboard|AdminStats|AdminAuthModal|CategoryManager\.tsx$|components\/CategoryManager/;

const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.(tsx|ts|css)$/.test(entry.name) && !skip.test(full)) fix(full);
  }
};

const map = [
  ['text-[#0B0A09]', 'text-[var(--sf-accent-contrast)]'],
  ['hover:text-[#0B0A09]', 'hover:text-[var(--sf-accent-contrast)]'],
  ['ring-[var(--sf-accent)]/30', 'ring-[var(--sf-accent)]'],
  ['ring-[var(--sf-accent)]/40', 'ring-[var(--sf-accent)]'],
  ['border-[var(--sf-accent)]/30', 'border-[var(--sf-border-strong)]'],
  ['border-[var(--sf-accent)]/40', 'border-[var(--sf-border-strong)]'],
  ['border-[var(--sf-accent)]/15', 'border-[var(--sf-border)]'],
  ['border-[#7FD1A0]/30', 'border-[var(--sf-border)]'],
  ['border-[#7FD1A0]/25', 'border-[var(--sf-border)]'],
  ['bg-[var(--sf-panel)]/50', 'bg-[var(--sf-panel)]'],
  ['bg-[var(--sf-bg)]/70', 'bg-black/55'],
  ['bg-[var(--sf-bg)]/85', 'bg-[var(--sf-glass)]'],
  ['bg-[var(--sf-surface)]/60', 'bg-[var(--sf-surface)]'],
  ['bg-[var(--sf-success)]/20', 'bg-[var(--sf-success-soft)]'],
  ['divide-white/5', 'divide-[var(--sf-border)]'],
  ['ring-white/5', 'ring-[var(--sf-border)]'],
  ['rgba(212,176,106,0.15)', 'var(--sf-accent-soft)'],
  ['rgba(212,176,106,0.10)', 'var(--sf-accent-soft)'],
  ['rgba(212,176,106,0.1)', 'var(--sf-accent-soft)'],
  ['shadow-[0_0_80px_-20px_rgba(212,176,106,0.25)]', 'shadow-lift'],
  ['shadow-[0_0_10px_rgba(212,176,106,0.5)]', ''],
  ['shadow-[0_8px_20px_-8px_rgba(212,176,106,0.6)]', 'shadow-gold'],
  ['shadow-[0_12px_25px_-8px_rgba(212,176,106,0.8)]', 'shadow-gold'],
  ['hidden xs:inline sm:inline', 'hidden sm:inline'],
  ['xs:hidden sm:hidden', 'sm:hidden'],
];

let changed = 0;
const touched = [];

const fix = (file) => {
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of map) after = after.split(from).join(to);
  if (after !== before) {
    fs.writeFileSync(file, after, 'utf8');
    changed++;
    touched.push(path.relative(root, file));
  }
};

walk(root);
console.log('CHANGED', changed);
console.log(touched.join('\n'));

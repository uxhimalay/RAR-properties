// Look up typography of text nodes across breakpoints
import { readFileSync } from 'node:fs';
const files = { desktop: 'docs/research/raw/content-tree.json', tablet: 'docs/research/raw/tree-tablet-768.json', mobile: 'docs/research/raw/tree-mobile-390.json' };
const queries = process.argv.slice(2);
for (const [bp, f] of Object.entries(files)) {
  let raw = JSON.parse(readFileSync(f, 'utf8')); if (typeof raw === 'string') raw = JSON.parse(raw); const root = raw.tree || raw;
  const found = {};
  (function walk(n) { const t = n.text; if (t) for (const q of queries) if (!found[q] && t.startsWith(q)) found[q] = n; (n.children || n.c || []).forEach(walk); })(root);
  console.log('== ' + bp);
  for (const q of queries) { const n = found[q]; if (!n) { console.log('  ' + q + ': (not found)'); continue; } const s = n.styles || n; const r = n.rect || n.r; console.log(`  ${q.slice(0, 22).padEnd(22)} fs=${s.fontSize || s.fs} lh=${s.lineHeight || s.lh} fw=${s.fontWeight || s.fw} ls=${s.letterSpacing || s.ls} col=${s.color || s.col} rect=${JSON.stringify(r)}`); }
}

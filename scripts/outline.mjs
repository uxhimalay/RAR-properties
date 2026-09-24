// Prints a condensed outline of a subtree from content-tree.json
// usage: node scripts/outline.mjs <sectionIndex|name-substring> [maxDepth] [file]
import { readFileSync } from 'node:fs';
const [, , sel = '0', maxDepth = '12', file = 'docs/research/raw/content-tree.json'] = process.argv;
const tree = JSON.parse(readFileSync(file, 'utf8'));
function find(node) {
  if (/^\d+$/.test(sel)) return tree.children[+sel];
  const stack = [node];
  while (stack.length) { const n = stack.shift(); if ((n.name||'').toLowerCase().includes(sel.toLowerCase()) || (n.id||'') === sel || (n.cls||'').includes(sel)) return n; if (n.children) stack.push(...n.children); }
}
const root = find(tree);
if (!root) { console.log('not found'); process.exit(1); }
const SKIP = new Set(['display','position','boxSizing','fontFamily','textOverflow','outline','transformOrigin','willChange','pointerEvents','wordBreak']);
function fmt(n, d) {
  if (d > +maxDepth) return;
  const s = n.styles || {};
  const parts = [];
  for (const [k, v] of Object.entries(s)) {
    if (SKIP.has(k)) continue;
    if (k === 'fontWeight' && !n.text) continue;
    if ((k === 'color' || k === 'fontSize' || k === 'lineHeight') && !n.text) continue;
    if (k === 'width' || k === 'height') continue; if (k === 'flex' && v === '0 0 auto') continue; if (k === 'alignContent' && v === s.alignItems) continue;
    parts.push(`${k}:${v}`);
  }
  const ff = n.text ? ` ff=${(s.fontFamily||'').split(',')[0]}` : '';
  const head = `${'  '.repeat(d)}<${n.tag}${n.name ? ` "${n.name}"` : ''}${n.id ? ` #${n.id}` : ''}${n.href ? ` href=${n.href}` : ''}${n.appear ? ' APPEAR' : ''}> [${n.rect.join(',')}] ${s.display}${s.position && s.position !== 'static' ? '/' + s.position : ''}${s.flexDirection ? '/' + s.flexDirection : ''}`;
  console.log(head);
  if (n.text) console.log(`${'  '.repeat(d)}  TEXT: "${n.text}"${ff}`);
  if (n.img) console.log(`${'  '.repeat(d)}  IMG: ${n.img.src?.split('/').pop().split('?')[0]} alt="${n.img.alt}"`);
  if (n.svg) console.log(`${'  '.repeat(d)}  SVG: ${n.svg.slice(0, 160)}`);
  if (n.form) console.log(`${'  '.repeat(d)}  FORM: ${JSON.stringify(n.form)}${n.options ? ' opts=' + JSON.stringify(n.options) : ''}`);
  if (parts.length) console.log(`${'  '.repeat(d)}  ${parts.join(' | ')}`);
  (n.children || []).forEach(c => fmt(c, d + 1));
}
fmt(root, 0);

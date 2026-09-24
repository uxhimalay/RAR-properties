// Outline for compact trees (tree-mobile-390.json / tree-tablet-768.json)
import { readFileSync, writeFileSync } from 'node:fs';
const [, , file, sel = '', maxDepth = '40', skipSpans = '1'] = process.argv;
let raw = JSON.parse(readFileSync(file, 'utf8')); if (typeof raw === 'string') raw = JSON.parse(raw);
if (raw.tree && typeof readFileSync(file, 'utf8') === 'string' && readFileSync(file, 'utf8').startsWith('"')) writeFileSync(file, JSON.stringify(raw));
const root0 = raw.tree || raw;
function find(node) { if (!sel) return node; const stack = [node]; while (stack.length) { const n = stack.shift(); if ((n.n || '').toLowerCase().includes(sel.toLowerCase()) || (n.id || '') === sel || (n.text || '').includes(sel)) return n; if (n.c) stack.push(...n.c); } }
const root = find(root0); if (!root) { console.log('not found'); process.exit(1); }
function fmt(n, d) {
  if (d > +maxDepth || n.hidden) return;
  if (skipSpans === '1' && n.t === 'span' && n.text && n.text.length <= 2) return;
  const s = [];
  for (const k of ['p','fd','wrap','jc','ai','gap','pad','grid','rad','ov','maxw','flex','ar','tr','op','bg']) if (n[k] !== undefined) s.push(k + ':' + n[k]);
  const txt = n.text ? ` TEXT:"${n.text}" ${n.fs}/${n.lh} w${n.fw} ls${n.ls} ${n.col} ${n.ta}` : '';
  console.log(`${'  '.repeat(d)}<${n.t}${n.n ? ` "${n.n}"` : ''}${n.id ? ` #${n.id}` : ''}> [${n.r.join(',')}] ${n.d}${s.length ? ' | ' + s.join(' ') : ''}${n.img ? ' IMG:' + n.img : ''}${txt}`);
  (n.c || []).forEach(c => fmt(c, d + 1));
}
console.log('viewport', raw.vw, 'height', raw.h);
fmt(root, 0);

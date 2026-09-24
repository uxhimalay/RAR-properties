// Downloads all raster assets from the ArcSphere Studio Framer site to public/images
import { writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const BASE = 'https://framerusercontent.com/images/';
const OUT = 'public/images';

const ASSETS = [
  ['JEOoI9AUjiorAUapWVh1gnkvdBI.png', 'hero-left.png'],
  ['vVqkA2phwOpc7kzAHksLgpPasxY.png', 'hero-main.png'],
  ['eJtReq8aEIEdVjdWqNPxJAANXJQ.jpg', 'hero-right.jpg'],
  ['wthfvP6tU9Aorh9kHe1fCtIJ6Lg.png', 'about-left.png'],
  ['GR6RzM6Itwx2wDtjwveRN43I.png', 'about-right.png'],
  ['4DOVdvbWRuODDfm0C2LMekOT9c.png', 'project-corporate-office.png'],
  ['q1jRseViT6p77AKtrsON5HifB0.jpg', 'project-serenity-villa.jpg'],
  ['YJqX4cT1uigCFLzeZ7sd5CjGa0.png', 'project-minimalist-apartment.png'],
  ['xILzBC4T9dkW9g4SA2OKFCeCpWY.png', 'service-architectural.png'],
  ['XvAPBw1t0Xzlyw7rz6xXH45yg.png', 'service-interior-design.png'],
  ['6YL1tAtmkIm3Mvy6fpHipVf7s.png', 'service-renovation.png'],
  ['HZFnCooJ4Nr7M2uNee0yvEoK7k.jpg', 'service-3d-visualization.jpg'],
  ['yJOuZOIs8ZL0On3JA5nIXentk.jpg', 'service-space-planning.jpg'],
  ['MhNlfvpNMNpvRZw6EG0mXPj9Qg.jpg', 'service-construction-consultation.jpg'],
  ['UqMqhHYfcJfkq2yOeOBnNWsjEmQ.jpg', 'expertise-commercial.jpg'],
  ['ecG0oXxVciB6YeEscSE3BDzmk.jpg', 'expertise-residential.jpg'],
  ['IoCUX80inVa3YYNnEWvV34nKZQ.png', 'process-discovery.png'],
  ['11MwiLjJmisM6fK5qmtatuS8OE.png', 'process-concept-development.png'],
  ['BY0VkDaSLT6GSQPRcYDxvN8K448.png', 'process-design-development.png'],
  ['TcTapBxBAcl92Z0CxBxNdDiN5zs.png', 'process-execution.png'],
  ['uCxt73fPvlnB5kTHTnBcmT5QU.jpg', 'review-1.jpg'],
  ['YwMiyx3zw3BnInoLrttBGb07Ok.jpg', 'client-1.jpg'],
  ['6lE03xTKE41EJJCgtuMd8nnBp6c.jpg', 'client-2.jpg'],
  ['POgUrnekSgfq9jHFSm7Gi1re5xw.jpg', 'client-3.jpg'],
  ['WW5YYUveqRONYLlubu7BDlfjoew.jpg', 'client-4.jpg'],
  ['Vot4TfNdPciaGO0nbBK36oh4ec.png', 'cta-quote-bg.png'],
  ['3GG8FlJkc5UJfOGjTcx5PwNKKs.jpg', 'footer-image.jpg'],
];

// Extra assets can be appended via CLI: node scripts/download-assets.mjs id.ext=name.ext ...
for (const arg of process.argv.slice(2)) { const [id, name] = arg.split('='); ASSETS.push([id, name || id]); }

await mkdir(OUT, { recursive: true });
async function dl([id, name]) {
  const dest = `${OUT}/${name}`;
  if (existsSync(dest)) return `skip ${name}`;
  const res = await fetch(BASE + id);
  if (!res.ok) throw new Error(`${res.status} ${id}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  return `ok ${name} (${(res.headers.get('content-length') / 1024 | 0)}KB)`;
}
for (let i = 0; i < ASSETS.length; i += 4) {
  const results = await Promise.allSettled(ASSETS.slice(i, i + 4).map(dl));
  for (const r of results) console.log(r.status === 'fulfilled' ? r.value : 'FAIL ' + r.reason.message);
}

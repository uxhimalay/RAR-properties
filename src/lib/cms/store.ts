import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { seedContent } from "@/lib/cms/seed";
import type { MediaItem, SiteContent } from "@/lib/cms/schema";

/* ------------------------------------------------------------------------------------------------
 * The content store: one JSON document on disk, read on every request and written by the admin.
 *
 * - `data/site.json` is created from the seed the first time anything reads it.
 * - Reads merge the document over the seed, so a field added to the schema later has a value even
 *   in an older document.
 * - Writes validate the shape, then write to a temp file and rename it into place, so a crash
 *   mid-write never leaves a half-written document.
 * - Uploaded files live in `public/uploads/` and are registered in `media`.
 * ---------------------------------------------------------------------------------------------- */

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "site.json");
export const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

type Json = Record<string, unknown>;
const isObject = (v: unknown): v is Json => typeof v === "object" && v !== null && !Array.isArray(v);

/** Deep merge of `doc` over `base`; arrays are taken from `doc` whole. */
function merge<T>(base: T, doc: unknown): T {
  if (!isObject(base) || !isObject(doc)) return (doc === undefined ? base : (doc as T));
  const out: Json = { ...base };
  for (const key of Object.keys(doc)) {
    const b = (base as Json)[key];
    const d = doc[key];
    out[key] = isObject(b) && isObject(d) ? merge(b, d) : d === undefined ? b : d;
  }
  return out as T;
}

export class ContentError extends Error {}

/** Structural checks: enough to refuse a document that would crash the page. */
export function validateContent(c: unknown): asserts c is SiteContent {
  if (!isObject(c)) throw new ContentError("Content must be an object");
  const need = (k: string) => {
    if (!isObject(c[k])) throw new ContentError(`Missing section: ${k}`);
  };
  ["hero", "work", "categories", "deals", "services", "partners", "visit", "footer", "contact"].forEach(need);
  if (!Array.isArray(c.media)) throw new ContentError("media must be a list");
  if (!Array.isArray(c.properties)) throw new ContentError("properties must be a list");
  const hero = c.hero as Json;
  if (!Array.isArray(hero.headline) || hero.headline.length !== 2) throw new ContentError("hero.headline needs two lines");
  const deals = c.deals as Json;
  const booking = deals.booking as Json;
  if (!isObject(booking) || !Array.isArray(booking.slots) || booking.slots.length === 0) throw new ContentError("deals.booking.slots needs at least one time");
  for (const s of booking.slots as unknown[]) if (typeof s !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s)) throw new ContentError(`Bad visit time "${String(s)}": use 24-hour HH:MM, e.g. 14:30`);
  const seen = new Set<string>();
  for (const p of c.properties as unknown[]) {
    if (!isObject(p) || typeof p.id !== "string" || typeof p.slug !== "string" || typeof p.name !== "string") throw new ContentError("Every property needs id, slug and name");
    if (seen.has(p.slug)) throw new ContentError(`Duplicate property slug: ${p.slug}`);
    seen.add(p.slug);
    if (typeof p.priceAed !== "number" || typeof p.areaSqft !== "number") throw new ContentError(`Property ${p.name}: price and area must be numbers`);
  }
}

async function ensureDirs() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch {}
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  } catch {}
}

/** Files in public/uploads that are not yet in the media list (e.g. copied in by hand). */
async function unregisteredUploads(media: MediaItem[]): Promise<MediaItem[]> {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const known = new Set(media.map((m) => m.src));
    return files
      .filter((f) => /\.(jpe?g|png|webp|avif|gif|mp4|webm)$/i.test(f) && !known.has(`/uploads/${f}`))
      .map((f) => ({ src: `/uploads/${f}`, alt: f.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), archived: false, addedAt: new Date().toISOString(), source: "upload" as const }));
  } catch {
    return [];
  }
}

export async function readContent(): Promise<SiteContent> {
  const seed = seedContent();
  let doc: unknown = null;
  try {
    doc = JSON.parse(await fs.readFile(FILE, "utf8"));
  } catch {
    try {
      await writeContent(seed);
    } catch {}
    return seed;
  }
  const merged = merge(seed, doc);
  try {
    const extra = await unregisteredUploads(merged.media);
    if (extra.length) merged.media = [...merged.media, ...extra];
  } catch {}
  return merged;
}

export async function writeContent(next: SiteContent): Promise<SiteContent> {
  validateContent(next);
  await ensureDirs();
  const doc = { ...next, version: 1 as const, updatedAt: new Date().toISOString() };
  try {
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(doc, null, 2), "utf8");
    await fs.rename(tmp, FILE);
  } catch {}
  return doc;
}

export { mediaReferences } from "@/lib/cms/schema";

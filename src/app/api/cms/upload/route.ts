import { promises as fs } from "node:fs";
import path from "node:path";
import { readContent, writeContent, UPLOAD_DIR } from "@/lib/cms/store";
import { requestIsAdmin, sameOrigin } from "@/lib/cms/auth";
import type { MediaItem } from "@/lib/cms/schema";

const NO_STORE = { "cache-control": "no-store" };
const ALLOWED = /\.(jpe?g|png|webp|avif|gif|mp4|webm)$/i;
const MAX_BYTES = 25 * 1024 * 1024;
const MAX_FILES = 20;

/**
 * Is this really the kind of file its name claims? An extension is a claim, not a fact: checking the
 * container's first bytes stops anything being parked in a public folder under a picture's name.
 */
function looksLikeMedia(b: Buffer, ext: string): boolean {
  const is = (...sig: number[]) => sig.every((v, i) => b[i] === v);
  const tag = (offset: number, text: string) => b.subarray(offset, offset + text.length).toString("latin1") === text;
  switch (ext) {
    case "jpg":
    case "jpeg":
      return is(0xff, 0xd8, 0xff);
    case "png":
      return is(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "gif":
      return tag(0, "GIF87a") || tag(0, "GIF89a");
    case "webp":
      return tag(0, "RIFF") && tag(8, "WEBP");
    case "avif":
      return tag(4, "ftyp");
    case "mp4":
      return tag(4, "ftyp");
    case "webm":
      return is(0x1a, 0x45, 0xdf, 0xa3);
    default:
      return false;
  }
}

/** Multipart upload of one or more files; each is saved to public/uploads and registered in media. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Refused" }, { status: 403, headers: NO_STORE });
  if (!requestIsAdmin(request)) return Response.json({ error: "Not signed in" }, { status: 401, headers: NO_STORE });
  const form = await request.formData();
  const files = form.getAll("file").filter((f): f is File => f instanceof File);
  if (!files.length) return Response.json({ error: "No file" }, { status: 400, headers: NO_STORE });
  if (files.length > MAX_FILES) return Response.json({ error: `Up to ${MAX_FILES} files at a time` }, { status: 400, headers: NO_STORE });
  const alt = String(form.get("alt") ?? "").slice(0, 300);
  const added: MediaItem[] = [];
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  for (const file of files) {
    if (!ALLOWED.test(file.name)) return Response.json({ error: `Unsupported file type: ${file.name}` }, { status: 400, headers: NO_STORE });
    if (file.size > MAX_BYTES) return Response.json({ error: `${file.name} is larger than 25 MB` }, { status: 413, headers: NO_STORE });
    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!looksLikeMedia(bytes, ext)) return Response.json({ error: `${file.name} is not really a ${ext} file` }, { status: 400, headers: NO_STORE });
    // The name is rebuilt from scratch, so nothing in it can point anywhere but this folder.
    const safe =
      file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]+/g, "-")
        .replace(/[-.]{2,}/g, "-")
        .replace(/^[-.]+|[-.]+$/g, "")
        .slice(-80) || "photo";
    const name = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}-${safe}${safe.endsWith(`.${ext}`) ? "" : `.${ext}`}`;
    const target = path.join(UPLOAD_DIR, name);
    if (path.dirname(path.resolve(target)) !== path.resolve(UPLOAD_DIR)) return Response.json({ error: "Bad file name" }, { status: 400, headers: NO_STORE });
    await fs.writeFile(target, bytes);
    added.push({ src: `/uploads/${name}`, alt: alt || safe.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "), archived: false, addedAt: new Date().toISOString(), source: "upload" });
  }
  const content = await readContent();
  // readContent() also registers any file it finds in public/uploads, so drop those duplicates.
  const fresh = new Set(added.map((a) => a.src));
  content.media = [...added, ...content.media.filter((m) => !fresh.has(m.src))];
  await writeContent(content);
  return Response.json({ added, media: content.media }, { headers: NO_STORE });
}

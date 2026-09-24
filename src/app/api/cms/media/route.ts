import { promises as fs } from "node:fs";
import path from "node:path";
import { mediaReferences, readContent, writeContent, UPLOAD_DIR } from "@/lib/cms/store";
import { requestIsAdmin, sameOrigin } from "@/lib/cms/auth";

const NO_STORE = { "cache-control": "no-store" };

/** Archive / unarchive or retitle one media item. */
export async function PATCH(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Refused" }, { status: 403, headers: NO_STORE });
  if (!requestIsAdmin(request)) return Response.json({ error: "Not signed in" }, { status: 401, headers: NO_STORE });
  const { src, archived, alt } = (await request.json().catch(() => ({}))) as { src?: string; archived?: boolean; alt?: string };
  if (typeof src !== "string" || !src) return Response.json({ error: "src required" }, { status: 400, headers: NO_STORE });
  const content = await readContent();
  const item = content.media.find((m) => m.src === src);
  if (!item) return Response.json({ error: "Not in the library" }, { status: 404, headers: NO_STORE });
  if (typeof archived === "boolean") item.archived = archived;
  if (typeof alt === "string") item.alt = alt.slice(0, 300);
  await writeContent(content);
  return Response.json({ item, media: content.media }, { headers: NO_STORE });
}

/** Delete an UPLOADED file that nothing references (built-in photos are archived, never deleted). */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Refused" }, { status: 403, headers: NO_STORE });
  if (!requestIsAdmin(request)) return Response.json({ error: "Not signed in" }, { status: 401, headers: NO_STORE });
  const { src } = (await request.json().catch(() => ({}))) as { src?: string };
  if (typeof src !== "string" || !src) return Response.json({ error: "src required" }, { status: 400, headers: NO_STORE });
  const content = await readContent();
  const item = content.media.find((m) => m.src === src);
  if (!item) return Response.json({ error: "Not in the library" }, { status: 404, headers: NO_STORE });
  const refs = mediaReferences(content, src);
  if (refs.length) return Response.json({ error: `Still used by: ${refs.join(", ")}` }, { status: 409, headers: NO_STORE });
  if (item.source !== "upload" || !src.startsWith("/uploads/")) return Response.json({ error: "Built-in photos can be archived but not deleted" }, { status: 400, headers: NO_STORE });
  // Resolve inside the uploads folder and refuse anything that climbs out of it.
  const target = path.resolve(UPLOAD_DIR, path.basename(src));
  if (path.dirname(target) !== path.resolve(UPLOAD_DIR)) return Response.json({ error: "Bad file name" }, { status: 400, headers: NO_STORE });
  content.media = content.media.filter((m) => m.src !== src);
  await writeContent(content);
  try {
    await fs.unlink(target);
  } catch {
    /* already gone */
  }
  return Response.json({ media: content.media }, { headers: NO_STORE });
}

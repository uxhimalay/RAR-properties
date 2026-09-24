import { readContent, writeContent, ContentError } from "@/lib/cms/store";
import { requestIsAdmin, sameOrigin } from "@/lib/cms/auth";

const NO_STORE = { "cache-control": "no-store" };
/** A content document is text; anything larger than this is not one. */
const MAX_BYTES = 8 * 1024 * 1024;

/** The whole content document: read by the admin, written back after edits. */
export async function GET(request: Request) {
  if (!requestIsAdmin(request)) return Response.json({ error: "Not signed in" }, { status: 401, headers: NO_STORE });
  return Response.json(await readContent(), { headers: NO_STORE });
}

export async function PUT(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Refused" }, { status: 403, headers: NO_STORE });
  if (!requestIsAdmin(request)) return Response.json({ error: "Not signed in" }, { status: 401, headers: NO_STORE });
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return Response.json({ error: "That document is too large" }, { status: 413, headers: NO_STORE });
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) return Response.json({ error: "That document is too large" }, { status: 413, headers: NO_STORE });
    const saved = await writeContent(JSON.parse(text));
    return Response.json(saved, { headers: NO_STORE });
  } catch (e) {
    const known = e instanceof ContentError;
    return Response.json({ error: known ? e.message : "Could not save" }, { status: known ? 400 : 500, headers: NO_STORE });
  }
}

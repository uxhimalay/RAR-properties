import { adminIsConfigured, attemptsLeft, clearFailures, clientAddress, issueToken, lockoutMinutes, passcodeMatches, recordFailure, sameOrigin, sessionCookie } from "@/lib/cms/auth";

const NO_STORE = { "cache-control": "no-store" };

/** Exchange the passcode for the admin cookie. Rate limited per address. */
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Refused" }, { status: 403, headers: NO_STORE });
  // Say plainly that the server is missing its secrets, rather than rejecting a correct passcode.
  if (!adminIsConfigured()) {
    return Response.json(
      { error: "The admin is not configured on this server. ADMIN_PASSCODE and ADMIN_SECRET must be set." },
      { status: 503, headers: NO_STORE },
    );
  }
  const address = clientAddress(request);
  if (attemptsLeft(address) <= 0) {
    const minutes = lockoutMinutes(address);
    return Response.json({ error: `Too many attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` }, { status: 429, headers: NO_STORE });
  }
  const { passcode } = (await request.json().catch(() => ({}))) as { passcode?: string };
  if (!passcode || typeof passcode !== "string" || passcode.length > 200 || !passcodeMatches(passcode)) {
    recordFailure(address);
    return Response.json({ error: "That passcode is not right" }, { status: 401, headers: NO_STORE });
  }
  clearFailures(address);
  return Response.json({ ok: true }, { headers: { ...NO_STORE, "set-cookie": sessionCookie(issueToken()) } });
}

/** Sign out. */
export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Refused" }, { status: 403, headers: NO_STORE });
  return Response.json({ ok: true }, { headers: { ...NO_STORE, "set-cookie": sessionCookie(null) } });
}

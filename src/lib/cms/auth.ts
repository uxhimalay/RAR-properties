import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/* ------------------------------------------------------------------------------------------------
 * The admin gate.
 *
 * A passcode (ADMIN_PASSCODE) is exchanged for an httpOnly cookie holding `expiry.signature`,
 * signed with ADMIN_SECRET. The signature covers the expiry AND the passcode, so a session dies
 * when it expires or when the passcode is changed. Every admin page and every /api/cms handler
 * checks it.
 *
 * Both variables are REQUIRED in production. In development they fall back to a known value so the
 * admin can be opened without a setup step; in production that fallback would be a published
 * password, so asking for either one throws instead. Everything that needs them is inside a request
 * handler, so the failure is a refused request rather than a server that will not boot, and a
 * missing variable locks the admin rather than opening it.
 *
 * Also here: a per-address limit on passcode attempts, and a same-origin check used by the write
 * handlers. This is a gate, not an identity system: put a real login in front of it before the
 * admin holds anything sensitive.
 * ---------------------------------------------------------------------------------------------- */

export const ADMIN_COOKIE = "arc_admin";
/** How long a signed-in session lasts. */
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;
/** Passcode attempts allowed per address, and the window they are counted in. */
const MAX_ATTEMPTS = 10;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

/** Thrown when the admin is reachable in production without its secrets configured. */
export class AdminConfigError extends Error {}

const DEV_PASSCODE = "arcsphere";
const DEV_SECRET = "arcsphere-admin-secret";

function required(name: "ADMIN_PASSCODE" | "ADMIN_SECRET", devFallback: string): string {
  const value = process.env[name];
  if (value && value.length > 0) return value;
  if (process.env.NODE_ENV === "production") {
    throw new AdminConfigError(
      `${name} is not set. The admin is closed until it is. Set ADMIN_PASSCODE and ADMIN_SECRET in the environment and restart.`,
    );
  }
  return devFallback;
}

const passcode = () => required("ADMIN_PASSCODE", DEV_PASSCODE);
const secret = () => required("ADMIN_SECRET", DEV_SECRET);

/** True when the admin can actually be used: both secrets present, or not in production. */
export function adminIsConfigured(): boolean {
  try {
    passcode();
    secret();
    return true;
  } catch {
    return false;
  }
}
const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("hex");

const equal = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export function passcodeMatches(code: string): boolean {
  // A missing secret must never read as a match; it locks the admin instead.
  try {
    return equal(sign(code), sign(passcode()));
  } catch {
    return false;
  }
}

/** `expiry.signature`, valid for SESSION_MS. */
export function issueToken(): string {
  const exp = Date.now() + SESSION_MS;
  return `${exp}.${sign(`${exp}:${passcode()}`)}`;
}

export function tokenIsValid(token: string | undefined): boolean {
  if (!token) return false;
  const [expText, signature] = token.split(".");
  const exp = Number(expText);
  if (!Number.isFinite(exp) || !signature || Date.now() > exp) return false;
  try {
    return equal(signature, sign(`${exp}:${passcode()}`));
  } catch {
    return false;
  }
}

/** For server components: is the current request signed in? */
export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return tokenIsValid(jar.get(ADMIN_COOKIE)?.value);
}

/** For route handlers: the cookie from a Request. */
export function requestIsAdmin(request: Request): boolean {
  const raw = request.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE}=([^;]+)`));
  return tokenIsValid(m ? decodeURIComponent(m[1]) : undefined);
}

/** The Set-Cookie for a signed-in session; Secure once the site is served over https. */
export function sessionCookie(token: string | null): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const age = token ? `; Max-Age=${Math.floor(SESSION_MS / 1000)}` : "; Max-Age=0";
  return `${ADMIN_COOKIE}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax${age}${secure}`;
}

/**
 * Cross-site requests cannot change anything. SameSite=Lax already stops the cookie riding along on
 * a cross-site POST; this refuses the request outright when a browser tells us where it came from.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // non-browser clients and same-origin GETs send none
  const host = request.headers.get("host");
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/* ----------------------------------- attempt limiting ---------------------------------------- */

const attempts = new Map<string, { count: number; until: number }>();

export function clientAddress(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return (fwd ? fwd.split(",")[0] : request.headers.get("x-real-ip") ?? "local").trim();
}

/** A local developer is never locked out of their own machine; a deployed site always counts. */
const exempt = (address: string) => process.env.NODE_ENV !== "production" && (address === "local" || address === "::1" || address === "127.0.0.1");

/** How many tries are left for this address, or 0 when it is locked out. */
export function attemptsLeft(address: string): number {
  if (exempt(address)) return MAX_ATTEMPTS;
  const entry = attempts.get(address);
  if (!entry || Date.now() > entry.until) return MAX_ATTEMPTS;
  return Math.max(0, MAX_ATTEMPTS - entry.count);
}

/** Minutes until this address may try again. */
export function lockoutMinutes(address: string): number {
  const entry = attempts.get(address);
  if (!entry) return 0;
  return Math.max(1, Math.ceil((entry.until - Date.now()) / 60000));
}

export function recordFailure(address: string): void {
  if (exempt(address)) return;
  const now = Date.now();
  const entry = attempts.get(address);
  if (!entry || now > entry.until) attempts.set(address, { count: 1, until: now + ATTEMPT_WINDOW_MS });
  else entry.count += 1;
  // keep the map from growing without bound
  if (attempts.size > 5000) for (const [k, v] of attempts) if (now > v.until) attempts.delete(k);
}

export function clearFailures(address: string): void {
  attempts.delete(address);
}

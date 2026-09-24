# Security notes

What is in place, what it is worth, and what to do before this site holds anything sensitive.

## The admin gate (`/admin`)
- A passcode is exchanged for an httpOnly cookie holding `expiry.signature`, signed with HMAC-SHA256 over the expiry **and** the passcode. Changing `ADMIN_PASSCODE` therefore ends every open session. Sessions last 30 days.
- `Secure` is set when `NODE_ENV=production`; `SameSite=Lax`, `Path=/`, httpOnly always.
- Passcode comparison is constant-time.
- Ten wrong passcodes from one address locks that address out for ten minutes, with the remaining time in the message. A local address in development is never locked out.
- Set these in the environment before deploying:
  - `ADMIN_PASSCODE` — anything but the default.
  - `ADMIN_SECRET` — a long random string; without it a fallback is used and cookies are forgeable by anyone who reads the source.
- **This is a gate, not an identity system.** One shared passcode, no accounts, no audit trail. Put a real login (or your platform's access control) in front of `/admin` before it holds client data.

## The content API (`/api/cms/*`, `/api/admin/login`)
- Every handler checks the cookie; unauthenticated requests get 401, including reads.
- Every write also checks the `Origin` header against the host, so a cross-site form or fetch is refused (403) on top of `SameSite=Lax`.
- Every response is `no-store`.
- A content document over 8 MB is refused (413), as is a malformed one (400) with the reason.
- The document is validated before it is written: required sections, two headline lines, at least one visit time in 24-hour `HH:MM`, every property with an id, a unique web address, and numeric price and area.
- Writes are atomic: a temp file is renamed into place, so an interrupted save cannot leave half a document.

## Uploads (`/api/cms/upload`)
- Signed in, same origin, at most 20 files, 25 MB each.
- Extension allowlist: jpg, jpeg, png, webp, avif, gif, mp4, webm. **SVG is refused** (it can carry script).
- The file's first bytes must match the container the extension claims, so a script cannot be parked in a public folder under a picture's name.
- The stored name is rebuilt from scratch (lower case, only letters, digits and single dots or dashes, timestamped and randomised), and the resolved path must sit directly inside `public/uploads`.
- Deleting is restricted to uploaded files that nothing references, and the path is resolved and checked again.

## The front end
- All output goes through React's escaping; nothing uses `dangerouslySetInnerHTML`.
- Next's image optimiser is **not** an open proxy: `remotePatterns` is empty by default, and photos hosted elsewhere are rendered straight from their own host (`unoptimized`). To optimise a particular host, list it in `NEXT_IMAGE_HOSTS` (comma separated).
- Headers on every response: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Permissions-Policy` denying camera, microphone and geolocation, and a CSP covering `frame-ancestors`, `base-uri`, `object-src` and `form-action`. A full script CSP is not set: the animation library writes inline styles, so it needs testing before it can be turned on.
- `/admin` and `/api` send `X-Robots-Tag: noindex, nofollow`, and `robots.txt` disallows both.

## Personal data
- The enquiry drawer and the visit booking collect a name, an email, a phone number and a message. **Nothing is sent anywhere yet**: `sendEnquiry` and `bookVisit` in `src/lib/booking.ts` are stubs. Before wiring them to a backend, decide where that data is stored, for how long, and say so in the privacy line the drawer already shows.
- The AI import calls OpenAI, Gemini or Claude **from the admin's browser** with a key that the admin pastes; the key is kept in that browser's local storage and never reaches our server. The sheet's contents go to whichever provider is chosen, so do not paste client data into a provider the agency has not approved.

## Still to do before production
1. Set `ADMIN_PASSCODE` and `ADMIN_SECRET`.
2. Put a real login or platform access control in front of `/admin`.
3. Serve over https (the session cookie only sets `Secure` there).
4. Back up `data/site.json` and `public/uploads/` together; they are the whole site's content.
5. Decide the storage and retention for enquiries and bookings before wiring the stubs.

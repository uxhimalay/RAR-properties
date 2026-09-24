# ArcSphere

A marketing site for a Dubai real-estate agency, with an admin where everything on it can be
edited. Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, Framer Motion, Lenis.

## Running it

```bash
npm install
cp .env.example .env.local   # fill in ADMIN_PASSCODE and ADMIN_SECRET
npm run dev                  # http://localhost:3000
```

```bash
npm run build && npm start   # production
npx tsc --noEmit             # types
npm run lint                 # lint
```

## Environment

Every variable is read on the server. `.env.example` is the full list; these two matter most.

| Variable | Required | What it does |
| --- | --- | --- |
| `ADMIN_PASSCODE` | **in production** | The passcode typed at `/admin/login`. |
| `ADMIN_SECRET` | **in production** | Signs the admin session cookie. `openssl rand -hex 32`. |
| `NEXT_PUBLIC_SITE_URL` | recommended | The public origin, so social preview images resolve. |
| `NEXT_IMAGE_HOSTS` | optional | Hostnames images may be loaded from. Empty means uploads only. |

In development the two admin variables fall back to a known value so the admin opens without a
setup step. **In production there is no fallback**: if either is missing the admin refuses every
sign-in and says so, rather than accepting a published default.

## How it is laid out

| Path | What is in it |
| --- | --- |
| `src/app/(site)` | The public pages: the home page, `/properties`, `/property/[slug]`. |
| `src/app/admin` | The admin, behind the passcode gate. |
| `src/app/api` | The content, upload, media and sign-in handlers. |
| `src/components/sections` | One file per section of the page. |
| `src/lib/cms` | Schema, seed, store, auth, import. |
| `src/lib/design.ts` | The shared type and layout values. Import these rather than retyping them. |
| `data/site.json` | The content document. Created from the seed on first read. |
| `public/uploads` | Anything uploaded in the admin. |
| `docs/research` | How each section was measured and built. |

## Content

Everything on the page is editable at `/admin`: copy, photographs, the property listings, the
partner ribbon, the booking calendar. Edits are held in memory until **Save**, which writes the
whole document at once, to a temporary file that is then renamed into place, so an interrupted
write cannot leave a half-written document. A save shows on the site on the next load.

Property listings can also be imported from a spreadsheet, with the columns mapped by hand or by a
model whose API key is entered on that screen.

## Before it goes live

- [ ] Set `ADMIN_PASSCODE` and `ADMIN_SECRET`. Nothing else guards the admin.
- [ ] Set `NEXT_PUBLIC_SITE_URL`.
- [ ] Replace the statement section's portrait in the admin. The one seeded with the project is a
      photograph of a real person taken from a reference site and must not be published.
- [ ] Replace the placeholder contact details, social handles and the figures in the ticker and the
      work band with real ones.
- [ ] Connect the enquiry form and the visit booking. Both collect and validate input and then stop:
      `sendEnquiry` and `bookVisit` do not deliver anywhere yet.
- [ ] Point the property photographs at real listings.

## Notes

`data/site.json` and `public/uploads` are written at runtime. On a host with an ephemeral filesystem
they need a persistent volume, or the content resets on every deploy.

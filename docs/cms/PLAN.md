# ArcSphere CMS — plan (2026-09-20)

A minimal admin at `/admin` for a non-technical person to change what the home page shows, without touching code. No payments, no transactions. Everything lives in one JSON document on disk (`data/site.json`) plus uploaded images in `public/uploads/`; the site reads the document on every request, so a save in the admin is live on the next reload.

## What the visitor sees, section by section, and what the admin can change

| # | Section | Visitor sees | On click | Admin fields |
|---|---|---|---|---|
| 0 | Nav | Brand, Enquire, Menu | Enquire → drawer; menu → sections | (fixed) |
| 1 | Hero | Headline, two labels, intro, two links, main + two side photos | "View our work" → work band; "Book a visit" → hot deals | headline (2 lines), labels, paragraph, link labels, the three photos |
| 2 | Work band | Eyebrow, heading, subtitle, link, the 3D image marquee, the stats ribbon | Panels open on hover/tap; link → categories | copy, the marquee images (add / remove / reorder / archive), the four ribbon statements |
| 3 | Categories | Eyebrow, heading, four tabs, a dealt row of **properties** in that category (cover photo; name, price and size on hover), an "Enquire about …" card | Property card → `/property/<slug>` (detail page); enquiry card → drawer with the category | copy; which properties are featured per category comes from the property records (category + featured + order) |
| 4 | Hot deals | Header, the deal property's photo, Book a visit (calendar), the price card with the ruler of unit sizes, the click row of the property's rooms | Book → booking flow; price list → drawer; rooms toggle | copy; **which property is the deal**; optional photo override; price card title/line; unit sizes; the room photos (defaults to the property's gallery); booking: visit times, notice, months ahead, length, place, zone |
| 5 | Services | Header, eight service cards over the video | Card → service pop-up → Enquire | copy per service, its photo, what is included, hours, price line; the video file |
| 6 | Partners (new) | "Developers we work with" ribbon of brand names drifting | (none) | list of partners: name, optional logo, on/off, archive |
| 7 | Book a visit (scatter) | Eight photos scattering, headline, line, button | Button → hot deals | copy, the eight photos |
| 8 | Footer | Collab line, marquee, contact strip, outlined brand, socials, copyright | Marquee → drawer; contact links | copy, address, hours, phone, WhatsApp, email, socials, copyright |
| — | Property page | Cover, name, community, price, price/sq ft, size, beds/baths, status, handover, developer, highlights, description, gallery, Book a visit + Enquire | Book → home booking card with the property as subject; Enquire → drawer | the property record |

## Property record (what a card needs to know)
name, slug, category (Residential / Commercial / Warehouse / Villas), community, type (Apartment, Penthouse, Villa, Townhouse, Office, Retail, Warehouse, Plot), status (Ready / Off-plan), price (AED), area (sq ft), price per sq ft (derived), bedrooms, bathrooms, units available, handover, developer, photos (first = cover), highlights, description, featured, archived. Numbers seeded as plausible 2026 Dubai proxies (Marina ~AED 2,000/sq ft, Downtown ~2,500, Palm villas ~4,000, JVC ~1,300, Business Bay offices ~1,750, Al Quoz / JAFZA warehouses ~600–800, Arabian Ranches ~1,800).

## Media library
Every image on the site is a media item: `src`, alt text, archived flag, source (seed / upload). Upload from the admin (drag or pick), archive to hide it from every picker without deleting, delete only when nothing references it. Pickers show the library, archived items hidden by default.

## Booking, dates and times
Visit times (e.g. 10:00, 11:30, 14:00, 16:30), notice required (minutes), how many months ahead can be booked, visit length, place, time zone label and offset. The calendar reads these live.

## AI import (provision)
`/admin/import`: paste a sheet (CSV/TSV) or pick a file. Two paths: (1) a built-in column matcher that understands common headings (price, sqft, beds, community, …) with no AI; (2) an AI mapper: choose OpenAI, Gemini or Claude, paste an API key (kept in this browser only, never on our server), the model turns the sheet into property records against the schema. Either path ends in a preview table; nothing is saved until "Import". Existing properties with the same slug are updated, new ones added.

## Admin design
White surfaces, ink text, gold for the active item and primary actions, dashed hairlines like the deals cards, generous spacing, one form per section, Save at the top right, a live "View site" link. A passcode gate (`ADMIN_PASSCODE`, default `arcsphere`) keeps it off the public.

## Data flow
`data/site.json` ⇄ route handlers under `/api/cms` (GET content, PUT content, POST upload, PATCH media) ⇄ admin UI. The site's pages read the JSON at request time through `readContent()` and pass it to the sections through a React context (`useSiteContent()`), so the components stay client-side and animated exactly as now.

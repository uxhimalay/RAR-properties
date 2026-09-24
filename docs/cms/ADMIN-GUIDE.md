# ArcSphere admin — how to use it

Open **/admin** and enter the passcode (default `arcsphere`; change it by setting `ADMIN_PASSCODE` in the environment, and `ADMIN_SECRET` for the cookie signature).

## The idea
The left rail lists the home page's sections in page order, then Properties, the Media library and Import. Change anything, press **Save** (or Cmd/Ctrl+S). The public site shows it on its next load. "Unsaved changes" at the top tells you when something is pending; **Discard** puts it back.

## Sections
- **Hero** — the two headline lines, the two labels, the introduction, the two link labels, the main and two side photos.
- **Work band** — header, the 3D marquee photos (order matters; every fourth opens itself), the stats ribbon statements.
- **Categories** — header; the cards on each tab come from Properties (featured first). The screen shows what each tab has.
- **Hot deals** — which property is the deal (its cover, price and photos flow into the cards), an optional photo override, the visit card text, the price card (auto title or your own), the six unit sizes, the room photos, and the booking calendar: visit times, notice, months ahead, length, place and time zone.
- **Services** — the eight cards; each one's category word, title, card text, pop-up photo, what is included, summary, price line, hours and location. Add, reorder or remove.
- **Partners** — the ribbon on/off, its eyebrow, and the partners: name, optional logo, on the ribbon or not, archived.
- **Statement** — the full-screen photograph after the ribbon: the word set across the bottom (any length; it is sized to fill the width), the line above it, the button and where it goes, the background photograph and the small card's photo and caption. The whole section can be switched off. The card is shown on wide screens only, as on the design it follows.
- **Book a visit** — the invitation copy and the eight scattering photos (the last is on top).
- **Footer & contact** — phone, WhatsApp, email, hours, address, social links, and the footer lines. These feed every call, WhatsApp and email link on the site and the enquiry drawer.

## The listings page
Everything on your books lives at **/properties**, and each category at **/properties/residential**, **/commercial**, **/warehouse**, **/villas**. The home page's category row is only a shortlist of four; the link beside the tabs ("See all 12 residential") opens the full list, which visitors can filter by status, bedrooms and budget, and order by price, size or recency. Twelve show at a time with "Show more", and the enquiry panel always ends the grid. Under **Categories** you can edit that link's wording and the page's eyebrow, heading, subtitle and the line shown when nothing matches.

## Properties
The list shows every listing with its cover, category, price, price per sq ft, size, status, and two switches: **Featured** (first in its category) and **Live** (off = archived: hidden from the cards and its page, kept here). Open one to edit everything a card and its page show: name, web address, category, type, community, developer, price, size, units, beds, baths, status, handover, photos (first = cover), description, highlights. **New property** starts a draft; press "Add this property", then Save.

Each property has a page at `/property/<web-address>` with its cover, facts, highlights, gallery, **Book a visit** and **Enquire**. Everything you enter here decides what its card shows on the home row and on the listings page, and how the filters treat it: category, status, bedrooms and price are all filterable, so fill them in even when they are not shown.

## Media library
Drop photos in or choose files (JPG, PNG, WebP, AVIF, up to 25 MB). Every photo slot on the site opens the same library. Give photos a description (used for screen readers). **Archive** hides a photo from the pickers without deleting it; **Delete** is only offered for uploaded photos that nothing uses. The filters show what is not used anywhere.

## Import from a sheet
Copy cells from Excel or Google Sheets (with the heading row) and paste, or pick a CSV. Either **match the columns** (headings like Name, Community, Type, Price, Size, Beds, Baths, Units, Handover, Developer, Images, Highlights, Description are recognised; figures like "AED 2.95M" or "1,450 sq ft" are read) or **let an AI model map it**: choose OpenAI, Gemini or Claude, paste your own API key (it stays in this browser and goes only to that provider), and the model returns the listings. Preview, then **Import & save**. A row with the same web address updates the existing listing. Photo links must start with `http` or `/`.

## Where things live
`data/site.json` is the whole content document; `public/uploads/` holds uploaded files. Back both up together.

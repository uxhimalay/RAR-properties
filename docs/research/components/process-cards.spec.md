# ProcessCards Specification

## Overview
- **Source:** `the project reference` — `section[data-framer-name="Process "]` ("How We Get
  It Done"), the process section, measured 2026-09-18 at 1440.
- **Brief:** "on that 4th section add a header on the right side and project build this design on black bg".
- **Target:** `src/components/sections/ProcessCards.tsx` (the grid) rendered by
  `ProcessPanelContent.tsx` inside the fourth `SteppedPanelSection` (black panel, notch top-left).

## Source layout (1440)
- Section `padding: 100px 0`; container max 1300 with `padding: 0 32px` (inner 1236).
- Title block `padding: 64px 32px`: `h2` "How We Get It Done", Switzer 48px/400, lh 52.8px,
  centred in a 600px column.
- Grid `grid-template-columns: 412px 412px 412px`, no gap, 5 cells: steps 1-3 on row one, step 4
  plus a CTA card spanning two columns (824x375) on row two. Every cell 375px tall.
- Step card: `padding: 32px`, column, `justify-content: space-between`, 1px **dashed** border
  `rgba(217,217,217,.63)` on all sides (shared between neighbours). Top: illustration 348x206
  with `mask: linear-gradient(0deg, transparent 6%, black 56.3%)`. Bottom: "Open" caption block
  `padding-top: 24px; gap: 12px`: `h4` Switzer 20px/400 lh 24 `#0a0a0a`; `p` Manrope 16px/500
  lh 22.4 letter-spacing 0.32px `#545454`.
- Copy: 1. Consultation / 2. Design & Plan / 3. Build & Install / 4. Final Walkthrough (+ one-line
  descriptions). prp uses its own copy in the same shape (`PROCESS_PANEL_STEPS`).

## Illustrations (measured live)
1. **Calendar** (`Variant 1`): header `Date` 348x44, bg `#f2f2f2`, `padding: 12px; gap: 10px`,
   two 11x11 arrow icons (SVG mask, the left one `rotate(180deg)`) and the month in Manrope
   14px/500 `#0a0a0a`. `Dates` grid: 7 columns x 4 rows of 50x30 cells, each with a 1px dashed top
   border `#d9d9d9`; weekday names Inter 10px/500 `#545454`; numbers Manrope 12px/500 `#0a0a0a`.
   The `Active` cell: bg `#e3e3e3`, text `#34e0a1`, dashed border `#fcac0a`. The month label
   cycles April -> May -> June 2026 roughly every 0.9s with the active day 1 / 12 / 11 (the
   source's June grid is scrambled 12,15,13,16,14,17,18 -- prp renders real calendars). Hovering
   a day makes it the active one; the previous reverts.
2. **Rulers** (`Destop`): two rows. Row A (white, `padding: 10px 16px`): `Line` 316x33 = a `ul`
   marquee (`gap: 7px`) of 1px bars, one 33px tall with `border-radius: 0 0 90px 90px` then seven
   17.8px "Half" bars (a 64px unit), `translateX` drifting **-10px/s**; below it figures 0-5
   space-between in Manrope 16px/500 green. Row B (bg `#f2f2f2`, `padding: 10px 16px; gap: 3px`):
   `Line` 316x21, `gap: 5px`, one 21px bar then six 11.3px bars (a 42px unit), drifting **+10px/s**;
   figures 1-8 in Manrope 12px/500 `#0a0a0a`. Bars `#545454`. No hover.
3. **Gauge**: SVG `viewBox 0 0 120 120` rendered 161x164: 16 `<g transform="rotate(k*22.5 60 60)">`
   each holding `<rect x=58.5 y=12 width=3 height=8 rx=1.5>`; ticks 0-7 amber `#fcac0a`, tick 8
   `rgba(58,208,151)` with `scaleY(1.417)`, ticks 9-15 `#474747`. "59%" centred, 38px/700 green.
   Hover grows the ticks (~1.2x).
4. **Checklist** (`Desktop/Done`): vertical `ul` (`gap: 10px`) of 348x44 pills (bg `#f2f2f2`,
   `border-radius: 90px`, `padding: 12px`, 1px dashed top border): 20x20 green icon (masked SVG:
   check-circle, house, bed...), label Manrope 14px/500 `#0a0a0a` ("Kitchen Completed", "Garage
   Completed", "Bedroom Completed", ...), a 20x20 amber marker on the right. The list scrolls up at
   **-10px/s** (measured -24.7 -> -49.8 over 2.5s). Masks: outer `linear-gradient(transparent 6%,
   black 19%)` (top), inner `linear-gradient(0deg, transparent 6%, black 56%)` (bottom).
5. **CTA** (824x375, `padding: 32px`): a 760x311 photo (framerusercontent `Ct3B3fTrAFgLLV4xbXzEIl8.png`)
   with an overlay holding two 380px "Background" halves, each with a 1px white line (bottom of the
   left half, top of the right half -- a step motif). prp uses its own image and copy.

## Black-background mapping (prp)
`#f2f2f2` -> `#161616`; white cells -> transparent on the black card; `#0a0a0a` -> white;
`#545454` -> white 55%; dashed `#d9d9d9`/`rgba(217,217,217,.63)` -> white 22%; ticks `#545454`
-> white 45%; green `#34e0a1` and amber `#fcac0a` kept. Fonts: Switzer -> Inter Display, Manrope
-> Inter.

## Placement
Inside the fourth stepped panel: header (eyebrow + heading, third-section type in white) right-
aligned within the right half (the notch is top-left), then the grid centred at max 1236px. The
panel grows with its content; the section is `min-height: 100svh`. Phone: one column, CTA full
width. Entrance/takeover behaviour unchanged.

## Revision: hot-deals bento (2026-09-18)
User: "change the layout ... different design for each card ... very minimal but in this same
style", then "keep colors to ours", "the content will be showing the hot deals on this property",
"no green use gold colors". Result, `src/components/sections/DealsCards.tsx` (+ `DealsPanelContent.tsx`):
- Same language (three 412px columns sharing 1px dashed lines at white 22%, 32px card padding,
  20px/400 titles, 16px/500 body at white 55%, Inter Display / Inter) recomposed as a bento:
  row 1 wide + narrow, row 2 narrow + wide, row 3 a 120px call-to-action band. Every card carries a
  48px muted step number (white 18%) as its anchor.
- Illustrations reduced to one idea each and tied to a deal: 01 a seven-day strip (the week around
  the highlighted day, months cycling every 0.9s and holding while hovered, hover picks a day);
  02 a single ruler along the card's bottom edge drifting -10px/s under unit-size figures; 03 the
  16-tick gauge showing the reserved share (62% -> 10 filled ticks, the 11th highlighted and
  stretched 1.417x); 04 the included extras as a horizontal pill ticker at -20px/s behind side fades.
- Colours: renovate's green/amber replaced by new site tokens `--color-gold #c9a962` (accent) and
  `--color-gold-light #e6cf8f` (highlighted elements); surfaces use the site's `--color-dark #181818`.
- Copy in `content.ts`: `DEALS_SECTION`, `DEALS`, `DEALS_SIZES`, `DEALS_RESERVED_PERCENT`,
  `DEALS_EXTRAS`, `DEALS_CTA`.

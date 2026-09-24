# Scatter CTA section — spec (source: the project reference "Scroll Anim Section", measured 2026-09-19 at 1440x900 and 390x844 in Chrome)

## Structure
- `section` 1440 x 1900 = sticky stage (100vh) + 1000px "Images Trigger". Background layer: rgb(245,245,245) with two 1px vertical lines rgb(226,227,228) at 16px from each edge (8px on phone).
- Sticky stage: `position: sticky; top: 0`, 100vh, overflow hidden, flex column centred, gap 36.
  - Text block (centred, max-width 600, gap 40; phone: full width, padding 0 16, gap 32):
    - Content (gap 24; phone 12): h1 Roboto 64/64, -1.92px, uppercase, rgb(20,20,21), centred (phone 32/32, -0.96px); p Roboto 20/28, -0.6px, rgb(79,81,84) (phone 16/20, -0.48px).
    - Button 143 x 44, padding 12 16, gap 8, 1px border rgb(195,196,198) (a `::after`), transparent; label Roboto 14/20 500 uppercase -0.42px rgb(20,20,21) over a white copy (label box 20px, overflow hidden); 12 x 12 arrow wrap with two arrows (A at 0,0; B at -12,12).
  - Images: absolute, centred (top 50% / left 50%, translate(-50%,-50%)), 445 x 445 (phone 300), z-index 1. Eight absolute 445-square photos, DOM order Image 8 ... Image 1 (so Image 1 paints on top).

## Scroll behaviour (linear in p = scrolled px into the pinned range / 1000, identical at every breakpoint)
Each image: `translate(x*p, y*p) scale(1 - (1-s)*p)`; x/y in px from the stack centre, s the final scale.

| DOM child (bottom → top) | Image | s | x | y |
|---|---|---|---|---|
| 0 | 8 | 0.30 | -554 | -279 |
| 1 | 7 | 0.50 | -517 | 187 |
| 2 | 6 | 0.30 | -288 | 372 |
| 3 | 5 | 0.35 | 239 | -395 |
| 4 | 4 | 0.40 | 496 | -284 |
| 5 | 3 | 0.40 | 392 | 166 |
| 6 | 2 | 0.30 | 449 | 357 |
| 7 | 1 | 0.40 | -364 | -396 |

Text block: opacity 0 → 1 and scale 0.9 → 1 over p 0.73 → 1.0 (measured 0.29 @0.8, 0.65 @0.9, 1 @1.0). The stage releases exactly at p = 1; the section then scrolls away with the images scattered.

## Hover (CTA)
Background rgba(20,20,21,0) → rgb(20,20,21) in ~400ms ease; label rolls up 20px in ~300ms ease-out (ink copy out, white copy in); arrow A slides to (12,-12) and arrow B from (-12,12) to (0,0) in ~300ms ease-out. Reverses on leave.

## Not present
No Framer appear effects inside this section (no `data-framer-appear-id`).

## Mapping in prp
Background/lines/ink use the site's tokens (cream, ink); photos are the property's; copy is ours; the button links to `#hot-deals`.

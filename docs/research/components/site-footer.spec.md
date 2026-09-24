# Site footer — spec (source: the project reference footer "Desktop", measured 2026-09-19 at 1440x900 and 390x844)

- `footer` 1440 x 563, background rgb(20,20,21), padding-top 72 (phone 32), overflow hidden.
- Top Wrap: flex column centred, gap 64, padding-bottom 80 (phone gap 16, pb 48).
  - "Wanna collab *with me?*": Roboto 16/20 -0.48px white; the italic part Playfair Display italic 400.
  - Marquee link (`./contact`), row 48px tall (phone 20): a `ul` with 12 `li` alternating [text][circle], gap 16, moving left at 69.7px/s; on hover it slows to 55.8px/s (nothing else changes). Text: h1 Roboto 64/64 -1.92px uppercase white "We walk together" (586px wide; phone p 16/24). Circle 48px (phone 20), radius 100, white, holding a 13x12 arrow (path fill #141415) pointing up-right.
- Outline Text: padding 0 16 32 (phone 0 8 24); an SVG fitted to the width (1408 x 174; phone 374 x 46) rendering "the project reference" uppercase, Roboto, line-height 90%, letter-spacing -0.02em, transparent fill, text-stroke ~0.6px rgb(134,136,141).
- Bottom Wrap: padding 24 16 (phone 24 8), row space-between (phone column, gap 16); a 1px line above it (visible in the render).
  - Social links: gap 120; Roboto 14/20 -0.42px white; each label is two stacked copies in a 20px box, rolling up 20px on hover in ~300ms ease-out.
  - "Back to top" (`./#hero`): same roll, plus a 24px arrow-up icon (stroke #fff 1.5) that rolls up 24px.

## Mapping in prp
Black background, white text, the site's gold for the circles, our display face for the marquee and outlined word ("ArcSphere"), Inter for the small type. Social links are placeholders until real handles are supplied.

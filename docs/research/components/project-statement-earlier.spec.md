# Statement section — spec (source: the hero of the project reference measured 2026-09-21 at 1440x900, 834x1112 and 390x844; the nav was excluded at the user's request)

## Box
- `header`, 1440 x 900 (one viewport), `position: relative`, `overflow: clip`, padding **200px 20px 20px**, flex row, `justify-content: center`, `align-items: flex-end`. Page background behind it: a flat colour (blue on the source).
- **z-1** a full-bleed photo, 1440 x 900, `object-fit: cover`.
- **z-2** a "Border" layer, absolute inset, padding 0 20px, holding a 1200px container that draws **five 1px verticals in rgba(255,255,255,0.15)** at x = 120, 420, 720, 1019, 1319: the edges of a four-column 1200px grid. Phone: three lines (16, 195, 373), two columns. Tablet: five.
- **z-2** the content container, 1200 wide at x=120, from y=333 to 880, `align-items: flex-end`; inside, a column with **gap 64** holding the row of blocks and then the word.

## Blocks (desktop)
- **Left**, x=120, width 300 (one column):
  - Paragraph: IBM Plex Sans 500, **16px / 25.6px (1.6)**, letter-spacing -0.32px, **uppercase**, white, width 300, four lines at y=448.
  - Button at y=567, 300 x 46: padding 10px 16px, **gap 12**, background **rgba(255,255,255,0.1)**, **backdrop-filter: blur(50px)**, square corners. An 18px arrow icon, doubled: one in flow at x=136 and one absolute at x=112, so on hover the pair slides right and the second takes its place. Label 16 / 25.6 uppercase white.
- **Right card**, x=1020, 300 x 280: background **rgba(255,255,255,0.2)**, **backdrop-filter: blur(10px)**, padding 12, gap 10, column: a 276 x 220 photo (`object-fit: cover`) then a caption in the paragraph's type.
- **The word**, x=120, width 900 (three columns): **fit text** — the font size is computed so the word exactly spans its box (245.76px for "adrian" at 900px). Weight 700, uppercase, line-height **0.8**, letter-spacing **-0.02em**, white, sitting on the section's bottom padding.

## Entrance
Framer appear animations, all `spring, stiffness 380, damping 58, mass 1`, opacity 0.001 → 1:
| element | offset | delay |
|---|---|---|
| left block | y 12 | 0.15s |
| right card | y 12 | 0.20s |
| the word | y 10 | 0.25s |
No scroll-linked motion: the photo and the word both move 1:1 with the page.

## Breakpoints
- **Tablet (834)**: padding 200/16/16, four columns, the card is **hidden**, the paragraph and button move to the right half (x=417, width 401).
- **Phone (390)**: padding 200/16/16, two columns, the card is **hidden**, the paragraph and button are full width, the word fits the full width.

## Mapping in prp
Structure, proportions, glass values, grid lines and the spring entrance are the source's. Colours are ours: black behind a property photo with a scrim, white type, gold on the button's arrow. Copy, the two photos and the word are content-managed (`statement` in the content document).

# ProjectMarqueeSection Specification

Re-extracted 2026-09-18 after the first project build attempt was rejected. The first attempt was measured
while the section sat **below the fold**, where every card reports `opacity: 0` and an un-expanded
220px layout, so most of its numbers described a pre-entrance state that is never visible. Everything
below was measured with the section scrolled into view.

## Sources

| Part | Source | Section |
| --- | --- | --- |
| Background + box model + scroll behaviour | `the project reference` | `section#project` "Project Section" |
| Card style (3D perspective marquee) | `the project reference` | "material" section, "Rooted in Materiality" |

Per user direction: take the project reference's **background and scroll animation**, drop the project reference's flat hover-row
cards, and use the project reference's **3D rotated-panel** card treatment instead.

## Part 1 — the project reference background (`section#project`)

### Box model (measured at 1440x900, 1440x700, 1440x1100, 1200x900, 810, 390)
- `background-color: rgb(0, 0, 0)`, `border-radius: 0`, full-bleed (no page gutter).
- Desktop: `height: 100vh` exactly. Confirmed by varying viewport height: 700 -> 700px, 900 -> 900px,
  1100 -> 1100px. `padding: 0`.
- Tablet (810-1199): height is content-driven, `padding: 100px 0`.
- Phone (<810): height is content-driven, `padding: 80px 0`.
- Container: `max-width: 1600px`, `padding: 0 40px` at >=810, `0 20px` below 810,
  flex column, `justify-content: center`, `gap: 80px`.

### Scroll behaviour (the "background scroll animation")
Two distinct behaviours, both measured:

1. **Section slides up over a pinned hero, and the hero reacts.** the project reference's hero is
   `position: fixed; top: 0; z-index: 1; height: 100vh` on desktop and tablet (>= 810); on phone it is
   in normal flow. Every later section is `position: relative` and later in DOM order, so the black
   Project Section rises over the stationary hero 1:1 with scroll and covers it. Measured at 1440x900
   while the section rose (scrollY 0 -> 900):
   - `header` opacity: 1 -> 0, linear in scroll: 0.889 @100, 0.778 @200, ... 0.111 @800, 0 @900.
     i.e. `opacity = 1 - scrollY / viewportHeight`.
   - The hero's content layer (`Container`, holding the copy) scales 1 -> 0.9 with a centre origin:
     `scale(0.9333)` @600 = `1 - (600/900) * 0.1`. Its `top` moved 0 -> 30px, confirming the origin.
   - The background image (`BG`) does **not** scale: 1440px wide at both ends.
   - The section itself: `border-radius: 0`, no `box-shadow`, no `transform`. It just slides.
   - The nav is in normal flow and scrolls off with the page; it is not fixed.
   **Replicated on desktop (>= 1200)** without touching prp's own hero animation: the hero's sticky
   box already pins for a 450px runway while the shrink plays; the runway is extended by one
   viewport height (`200dvh + 450px`), the marquee is pulled up over that height (`-mt-[100dvh]`,
   `z-10`), and across it the box fades 1 -> 0 and its content layer scales 1 -> 0.9. prp's content
   layer is the three-card composition (the copy has already faded out by the end of the shrink), so
   the cards scale where the project reference's copy does. Tablet (810-1199) is not covered: prp's tablet hero is
   static by design and has no pinned box to take over.

2. **Content enters at ~50% viewport coverage.** Before the section is roughly half visible its
   contents sit at `opacity: 0`. Measured trigger: the entrance runs when the section top passes
   ~`0.5 * viewportHeight`. Leaving the viewport reverses the layout half of the animation.
   **Replicated** as a `whileInView` fade + rise at `amount: 0.5`, `once: false`.

## Part 2 — the project reference card style (3D perspective marquee)

### Interaction model
**TIME-DRIVEN marquee with hover and drag. Not scroll-driven.** Verified by sampling the track's
`translateX` every 400ms at a fixed scroll offset: it advanced 246.67 -> 288.26 -> 328.34 -> 368.34
-> 410 -> 449.95 -> 489.96 -> 531.6, i.e. a constant **~100 px/s** with the strip moving to the
**right** (+X). Scrolling the page changed nothing beyond the time that elapsed while scrolling.

Measured 2026-09-18 (second pass, after the user asked why hover did nothing):
- **Pointer over the strip slows it to 40 px/s** (sampled 39-41 px/s for 4s), anywhere over the
  strip's box, not only over a panel. Leaving restores 100 px/s within the first 500ms sample.
- **Drag scrubs the track.** Cursor is `grab`. A 300px pointer drag moved the track ~246px during
  the drag (Framer's drag damping) and it kept advancing after release.
- **Hovered panel swings to face the viewer.** Rest: `rotateY(90deg)`. Panel has
  `transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)`. Settled hover matrix (at +420ms):
  `matrix3d(-1,0,0,0, 0,1,0,0, 0,0,-1,0, 0,-48,160,1)` = `translate3d(0, -48px, 160px)
  rotateY(180deg)`. Mid-flight at +111ms it read rotY ~137deg, so it interpolates 90 -> 180 (not
  90 -> 0). `backface-visibility: visible`, so the hovered photo is **mirrored** on the source.
  Under `perspective: 1200px` the 160px lift projects to `1200 / (1200 - 160) = 1.154`, i.e. the
  260x300 face renders at ~300x346 -- matches the measured 300x346 screen box. On leave it
  reverses along the same curve and is back at rest by ~700ms. The inner div and `<img>` only carry
  `opacity 0.3s` (image load fade); nothing else changes on hover.
- The touch-device layout has no hover; in prp the swing uses Tailwind `hover:`, which is gated on
  `@media (hover: hover)`.

### Geometry (measured at 1440x900)
- **Viewport element:** `perspective: 1200px`, `perspective-origin: 50% 50%`, `height: 360px`,
  `overflow: visible`, flex, centred. Panels are allowed to spill past it and are clipped by the page.
- **Track:** zero-size child at the viewport's centre, `transform-style: preserve-3d`,
  `transform: translateX(t)` where `t` is the animated value.
- **Panels:** `position: absolute`, `width: 260px`, `height: 300px`, `top: -150px`
  (= `-height/2`), `left: i * 212px` (pitch **212px**), `transform-origin: 130px 150px` (centre),
  `transform-style: preserve-3d`, and `transform: rotateY(90deg)` — decoded from
  `matrix3d(0,0,-1,0, 0,1,0,0, 1,0,0,0, 0,0,0,1)`.
- **Panel image:** `object-fit: cover`, `border-radius: 4px`, fills the 260x300 panel.
- the project reference ships 50 panels = 10 unique images repeated 5 times.
- **Phone (measured at 390x844):** panels `152x192`, `top: -96px`, pitch **96px**, strip height
  `200px`, same `perspective: 1200px`. Section padding `40px 16px`. Tablet was not measured; prp
  switches geometry at the project's 810px breakpoint.

### Why it looks the way it does
**Every panel carries the identical `rotateY(90deg)`.** A plane rotated 90 degrees about its own
vertical axis is edge-on *only* at the perspective origin; off-axis the same plane is seen obliquely
and projects to a wide parallelogram. So the apparent width is purely a function of horizontal
distance from centre — panels "open up" toward the edges and collapse to a sliver as they cross the
middle. Measured projected widths across the strip: 901, 855, 808, 762, 715, 669, ... down to 18px.
This is the whole effect; there is no per-panel rotation animation.

Panels that land exactly on the centre line vanish (zero projected width). That is authentic — the
same gap is visible in the reference screenshot.

### Panel content
the project reference's panels are **image-only** — no title, no description, no overlay. This suits the "drop the
cards" direction: our section carries the six project images and no text on the panels.

### Section header (the project reference "material" section, measured at 1440 and 390)
Section padding `120px 64px 160px` (desktop) / `40px 16px` (phone). Header is a **centred 686px
column** (x=377 at 1440), stacked:
| Element | Desktop | Phone | Colour (on cream) | Align |
| --- | --- | --- | --- | --- |
| Eyebrow `<p>` "THE ELEMENTS" | Geist 14/500, lh 16.8, ls 0.56px (0.04em), uppercase | 12/500, lh 14.4, ls 0.48px | rgb(115,115,115) | left |
| Heading `<h2>` | Geist 80/400, lh 96 (1.2), ls -3.2px (-0.04em) | 40/400, lh 48, ls -1.6px | rgb(0,0,0) | left |
| Subtitle `<p>` | Geist 18/400, lh 28.8 (1.6) | 16/400, lh 25.6 | rgb(82,82,82) | **right** (`text-align: end`) |
Gaps: eyebrow->heading 7px, heading->subtitle 8px, subtitle->strip **120px** (desktop);
16px / 16px / 32px on phone. prp uses its own families (Inter Display for the heading, Inter for
the rest), inverts the colours for the black band (white, white/50, white/60), keeps the sizes,
weights and tracking, and interpolates a 56px heading for tablet. **Per user direction (2026-09-18)
the header is not the centred column: it is flush with the container's left edge, every line
left-aligned (subtitle included), and the heading is held to one line from tablet up
(`white-space: nowrap`).** Copy is
ArcSphere's own ("Selected Work" / "Shaped by How You Live" / "Homes and workplaces across Dubai,
since 2014."), stored as `PROJECT_MARQUEE_SECTION`. Because the header adds height, the section is
`min-height: 100vh` (content centred) rather than the project reference's fixed `100vh`.

## Implementation notes for prp
- Reuse the six project images already downloaded from the project reference (`public/images/gallery-*.png`).
- Repeat the six images 5 times (30 panels) so the strip always covers the viewport plus 3D spill,
  and animate the track `0 -> 6 * 212 = 1272px` linearly on an infinite loop. Shifting by exactly one
  set width is seamless because the content repeats at that period.
- Loop duration = `1272 / 100 = 12.72s` to hit the measured 100 px/s.
- `next/image` `sizes` must account for the 3D projection: a 260px-wide panel can project to ~900px,
  so request ~900px sources rather than 260px ones or the panels look soft at the strip edges.
- Honour `prefers-reduced-motion`: hold the strip static rather than animating the track.
- Drive the track from a single motion value in `useAnimationFrame` (speed 100, or 40 while a
  `hovered` ref is set by pointer enter/leave on the strip), wrapped modulo the set width, and add
  `onPan` delta to it for drag. Do not combine framer's `animate` loop with `drag`; they fight.
- **Do not put hover on the picture.** A first build used CSS `:hover` on the rotated panel. Near
  the centre a panel projects to a few px, so with the pointer resting over the strip only the odd
  panel touched the pointer pixel, then swung open (its projection grew to 300px and covered the
  pointer), drifted past over ~3s and closed -- the user saw cards "in the centre slowly show front,
  tilt back after 3 sec, every 4th card". And because the outline moves while it swings, hover
  could drop mid-swing and re-acquire: flicker. Fix, implemented 2026-09-18:
  1. Each slot is a wrapper (`pitch` x `stripHeight`, `preserve-3d`, no transform) holding a flat,
     invisible, slot-wide hit div (`data-hit`) and the rotated picture with `pointer-events: none`.
     Hit areas are contiguous, never overlap, and never move relative to the strip.
  2. A slot opens only on a genuine `pointermove` (mouse pointer type, coordinates changed) whose
     target is inside a hit div. The strip drifting under a resting pointer opens nothing.
  3. Each animation frame, if a slot is open, `document.elementFromPoint(lastPointer)` must still
     resolve to that slot or it closes -- so a slot closes when the strip carries it away as well as
     when the pointer moves off. Leaving the strip closes it too.
  4. The swing itself is still the measured CSS transition, driven by inline `transform` from React
     state (`open` slot index); `Panel` is memoised so only the two affected slots re-render.
  5. Speed changes ease with a 150ms time constant instead of stepping, to avoid a jolt.
- **Centre self-reveal (user brief, not a the project reference behaviour).** After the hover rebuild the user asked
  for the cards to keep doing what the first build did by accident: "whenever any card is in center
  it slowly shows front and after 3 sec it tilts back ... after 3 cards the 4th card again". the project reference
  was watched for 30s with the pointer parked off the strip and never opened a panel on its own, so
  this is specified from the brief: as a card's slot centre crosses the strip's centre
  (`REVEAL_AT = 1`; 40% and 5% of the way in were tried and the user settled on the centre) it
  opens with the same swing, holds 3000ms, closes; the next reveal fires 4 slots of travel later, and
  every third gap is 5 slots so that all six images get featured (a strict 4-cadence over 6 images
  only ever shows three of them). Scheduling is in px of travel (drag included) so it survives speed
  changes and the track wrap. A pointer-opened panel always wins: a due reveal is skipped while the
  pointer holds a panel, and moving the pointer onto a slot cancels a running reveal.
- Two of the six source cards were `<video>` on the project reference; their poster stills are used. Video is out of
  scope for an image-only marquee.

## Deliberate deviations
1. The hero takeover runs on desktop only (see Part 1, behaviour 1); the project reference also has it on tablet.
2. Panels are non-linking `<div>`s; prp has no project detail routes.

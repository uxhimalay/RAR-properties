# SteppedPanelSection Specification

## Overview
- **Source:** `the project reference` — `section.accessibility.section.ui-light.ui-background`
  ("REACH YOUR GOALS WITH EXCELLENT TRANSPORT CONNECTIVITY" / "CLOSER THAN YOU THINK.").
- **Scope (user brief):** "project build this white section as our third section but dont add any content
  just the shape and the bg" — so: the background footage and the white stepped panel. No copy, no
  map, no pins, no cards.
- **Target:** `src/components/sections/SteppedPanelSection.tsx`, inserted in `page.tsx` directly
  after the black marquee section (hero = 1, marquee = 2, this = 3).

## How the source works (measured 2026-09-18 at 1440x900)
the project reference is a fully scroll-jacked site: `html, body { overflow: hidden }`, document height 900, and a
custom engine drives every section from keyboard/wheel input. Synthetic wheel events from Playwright
did nothing; keyboard PageDown/ArrowDown did (ArrowDown gets swallowed by the previous section's
slider, so PageDown was used). Each section is a tall runway (this one is `7650px`) containing a
pinned `.sticky__layer--sticky` 900px layer that carries all the visuals.

### Layers inside the pinned 1440x900 layer (paint order)
1. `picture > img` poster `5.accessibility/background@xxl.webp` (1920x1080), `object-fit: cover`.
2. `video.background--cover` `uploads/video/landing/5.accessibility.mp4`, `autoplay loop muted`,
   `object-fit: cover`, desktop only (`is-hidden--sm-down`); a separate portrait video exists for
   phones and is lazy-loaded.
3. `div.background.ui-dark` (rgb(7,11,32)) with three map images and pins — **content, out of scope**.
4. `div.accessibility__background-color.ui-background` — **the white panel**:
   - `1400 x 600` px at `x = 20, y = 280` inside the 1440x900 layer, i.e. `left: 20px; right: 20px;
     bottom: 20px; height: 600px` (`--spacing-layout` is 20px at this breakpoint, 30px at 1920).
   - `background: #fff`, no border-radius, no shadow.
   - While the section is live its inline `clip-path` is
     `polygon(0% 0, 710px 0, 710px 80px, 1400px 80px, 1400px 100%, 0% 100%)`: the left part keeps the
     full height, the right part starts **80px lower**, the step is at **710px** from the panel's
     left edge = 730px in the viewport = `calc(50vw + 10px)` = half the viewport plus half a grid
     gutter (`--spacing-layout + 6 * col + 6 * gutter` on their 12-column grid). In panel
     coordinates that is `calc(50% + 10px)`.
   - Later in the runway (the map phase) the polygon shrinks the panel to a small stepped block:
     `polygon(0% 120px, 216.667px 120px, 216.667px 180px, 453.333px 180px, 453.333px 100%, 0% 100%)`.
     Content phase — out of scope.
5. Text blocks (eyebrow, "Closer than you think.", the large statement) — out of scope.

### The section's own reveal (not replicated)
The `<section>` itself is white with `clip-path: polygon(0 133svh, calc(50vw + 10px) 133svh,
calc(50vw + 10px) 100svh, 100% 100svh, 100% 100%, 0 100%)` at rest and `opacity: 0`. As the section
scrolls in, the engine sets `opacity: 1` and raises the two y-values (right half leads by 33svh), so
the whole layer wipes over the previous section with a stepped leading edge. Sequence observed:
`stickyTop 852 -> 0` (layer arrives like normal content) then the polygon animates
`1197/900 -> 1181/900 -> 900/900`. This is a section-transition effect over the previous pinned
section and would require the third section to overlap the black marquee band; left out as
"shape and bg" — flag for the user.

## Implementation
- `<section class="relative h-svh w-full overflow-hidden bg-black">`
- `<video autoPlay muted loop playsInline poster>` `absolute inset-0 object-cover`, the source's own
  footage saved to `public/videos/stepped-panel-bg.mp4` (4.3MB) and poster
  `public/images/stepped-panel-bg.webp` (1920x1080, 44KB).
- White panel `absolute`, `inset-x 20px`, `bottom 20px`, `height calc(100svh - 300px)` (= 600px at
  900; the source's 280px top gap expressed as a viewport-relative height so the composition holds at
  other heights), `clip-path: polygon(0 0, calc(50% + 10px) 0, calc(50% + 10px) 80px, 100% 80px,
  100% 100%, 0 100%)`.
- Below 810px (source switches to a different mobile layout; interpolated, not measured): insets
  16px, height `calc(100svh - 200px)`, step `calc(50% + 8px)`, notch depth 48px.

## Deliberate deviations
-1. **Takeover added on request** ("let the white top come same as our second section came on
   hero, make the height of white top same as our second section height"): the panel is one
   viewport tall and the section rises over the pinned marquee band, whose content fades and scales
   to 0.9, mirroring the hero takeover. Not a the project reference behaviour.
0. **Background footage removed on request** ("remove the video bg and make it black", same day):
   the section is plain black behind the white panel; the mp4 and poster were deleted from
   `public/`.
1. No pinning / scroll runway: with no content there is nothing to scroll through, so the section is
   a plain 100svh block in normal flow.
2. The stepped wipe-in over the previous section is not replicated (see above).
3. One video for all breakpoints; the source's portrait phone video was not fetched.

## Addendum: bitten-corner tabs (2026-09-18)
User: "from the same link can we add this style of tabs for residential, commercial, warehouse,
villas ... like this but tabs designed" with a screenshot of a white 220x60 block on the project reference's navy
with its bottom-right corner cut out (a 21px square).

Source component: `.btn--bitten-corner` (18 instances on the project reference.space; no real tab group exists
there, the tab set is the user's composition). Measured on `a.btn.btn--bitten-corner.btn--bitten-corner--lb`
("Select office space", offices section) and the `-md` size ("See the master plan"):
- Box: `display: inline-flex; height: 60px; min-width: 220px; padding: 0 40px 0 48px` (8px extra on
  the bitten side); `-md` size: `40px` tall, `padding: 0 18px`.
- Type: `"TT Norms Pro"` 11px / weight 450 / line-height 14px / letter-spacing 0.44px / uppercase /
  centred. Colour rgb(7,11,32) on a white fill, white on a navy fill. `transition: color 0.5s
  cubic-bezier(0.7, 0, 0.3, 1)`.
- Fill: the `::after` (`inset: 0`, background = fill colour) carries
  `clip-path: polygon(...)` — 12 points driven by `--left/--right/--top/--bottom` bite sizes; for
  `--lb` at 60px: `--left: 21px; --bottom: 21px` (bite = 21px square); for `-md--lt` at 40px: 10px.
  `transition: clip-path 0.5s cubic-bezier(0.7, 0, 0.3, 1)`.
- States: rest = bite open; `:hover` = polygon becomes the full rectangle (bite closes);
  `.is-active` = full rectangle; `.is-active:hover` = bite re-opens. `::before` is a hidden second
  fill used by the outline variant.
- Outline variant `--outline`: `::after` gets `border: 1px solid rgba(primary, .3)` and `::before`
  draws the notch's inner edges (1px, `width: var(--left)` etc.); hover strengthens the line.

prp implementation `src/components/ui/BittenTabs.tsx`: same box, type (Inter for TT Norms Pro),
timing, 21px bottom-right bite and state machine; the outline is produced by an outer clipped layer
in the line colour plus an inner layer inset 1px with the same polygon (a uniform 1px line, notch
included). Tabs sit top-left in the stepped white panel with 40px padding, ink-on-white
(`tone="light"`); `tone="dark"` gives the white-on-black version from the screenshot.

Revision (same day, "you have to design the tab component"): the four loose buttons became one
segmented bar. One contiguous control, 1px dividers, the bar (not each button) carries the 21px
bottom-right bite; the active fill is a single element that slides between segments with a
framer-motion layout animation at 0.5s cubic-bezier(0.7, 0, 0.3, 1); hovering the last segment
closes the bite; inactive segments tint 5% on hover; roving tabindex with Left/Right/Home/End.

Also (same day, "remove the scroll bar from there"): the page's native vertical scrollbar is hidden
in globals.css (`html { scrollbar-width: none }` + the WebKit rule), as on the project reference.space; scrolling
is unchanged.

Header above the tabs (same day): eyebrow in the tab type (11px/500 uppercase 0.44px, ink 50%) and a heading in the style of the project reference's panel statement `span.text-color-small` "Closer than you think." measured live: TT Norms Pro 50px / weight 450 / line-height 55px / letter-spacing -1px / uppercase / rgb(87,86,106) inside a 1400x600 `accessibility__hero-content` box padded 20px 20px 30px. prp: Inter Display 50px (32px phone), uppercase, -0.02em, black at 60%; gaps 16px eyebrow->heading, 40px heading->tabs; column limited to the left part of the stepped edge.

Revision (same day): section background removed entirely (transparent) at the user's request so the stepped white shape stands on its own; behind it is the pinned black band during the takeover and the page background afterwards.

## Addendum: dealt card row (2026-09-18)
User brief: below the tabs, the same cards as section two, coming from the right; as each reaches the left end it shows its front; only as many as fit (4-5); "design cinematically". Not a the project reference behaviour -- designed here. See `CategoryShowcase.tsx` header comment for the choreography (perspective 1200, edge-on flight, 1.4s expo settle, 140ms stagger left-first, flip-to-front over the last 55% of the flight, exit left on tab change then re-deal). Card count is measured from the row width.

Revision (same day): during the takeover the panel's 20px side/bottom insets close to 0 in step with the scroll progress (same range as the band's fade), so the white ends up full-bleed with the stepped top edge kept.

Revision (same day, negative space after the 4th card): the row fills its width -- slot count rounded from the width, faces flexed around 260px at a 260:300 ratio with 24px gaps -- and the final slot is a bitten-corner 'See all projects' link card (outline at rest, ink fill on hover with the bite closing), dealt in with the images.

## Addendum: fourth section (2026-09-18)
The component is now parameterised (`notch` right/left, `backdrop` transparent/black, `pinned`, `children`). The page uses it twice: third (notch right, pinned, category content) and fourth (notch left = `polygon(0 80px, calc(50% - 10px) 80px, calc(50% - 10px) 0, 100% 0, 100% 100%, 0 100%)`, empty, black backdrop). The third pins and fades its content as the fourth rises over it, mirroring the band-to-third takeover.

Revision (same day): the fourth is transparent like the third (no black backdrop). A pinned section now fades and scales its whole white panel as the next one rises, uncovering the black band pinned beneath, so every stepped panel rises against black.

Revision (same day): `notchScale` prop; the fourth section's mirrored notch is 40% narrower (0.6 x (50% - 10px) = 426px at 1440), depth unchanged. The third section's notch is still the source's exact polygon.

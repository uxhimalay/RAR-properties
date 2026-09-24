# ArcSphere Studio — Behaviors (extracted from the live site)

## Global
- Smooth scroll: Lenis on `<html>` (class `lenis`). Native scroll otherwise; no scroll-snap.
- Nav is NOT fixed; it scrolls away. No scroll-triggered nav changes.
- Appear animation ("FadeUp"): opacity 0 -> 1, translateY 12px -> 0, spring (~0.6s, tiny overshoot), once, when the element enters the viewport. Applied to: nav links/logo/CTA on load, hero buttons row, "View more projects", service rows (each), expertise cards (each), review image block (tablet/mobile), contact form blocks, footer items.
- Text reveal ("TextReveal default"): section h2/p are split; all glyphs on a line animate together, each subsequent line 0.1s later; opacity 0->1, y 20->0, blur 2px->0, ~0.45s ease-out; triggered once in view.
- Hover text swap (nav links, footer links, all pill buttons): two stacked copies of the label; on hover the stack translates up by (first line height + 10px) inside a clipped box; ~0.4s ease.
- Underline links (project titles, "View more projects", footer "get in touch", contact phone/email): bar slides in from the left on hover (translateX -100% -> 0, ~0.45s).
- Arrow buttons (32px circle, 1px border, rotated 57deg): on hover the stacked arrow glyphs slide up 32px (arrow flies out top-right, next arrives bottom-left).

## Hero (scroll-driven, desktop >= 1200 only)
- `hero_img-box` is `position: sticky; top: 64px` inside a 1260px-tall hero (810px box + 450px runway).
- Progress p = clamp(scrollY / 425, 0, 1) (linear):
  - main image wrapper: scale 1 -> 0.45 (transform-origin center)
  - left image: translateX(-400px) -> 0 (plus constant translateY(-50%) scale(0.5)); right image: translateX(400px) -> 0
  - text box (heading + paragraph + buttons + line): opacity 1 -> 0, translateY 0 -> 500px
- Intro (on load): nav items fade/slide (y12) from ~0.2s; heading words: opacity 0, x5, y20, blur 5 -> 0 over 1.5s, staggered 0.19s/word starting ~0.4s; paragraph words: skewX 5deg, y20, blur 5 -> 0 over 1.5s, staggered 0.025s/word from ~0.4s; buttons row: opacity 0, translate(5,20) -> 0 from ~0.4s over ~1.4s; the two half-lines under the text: opacity 0, translateX(±600px) -> 0 from ~0.4s over ~1s (left half from the right, right half from the left, meeting in the centre).
- Tablet/phone: no sticky, no scroll animation; hero is a full-height image card with the text at the bottom.

## Stats ticker
- Continuous leftward marquee at 40px/s; items: 4 texts separated by outlined dots, gap 48px (desktop).

## Projects
- Card hover: image scales 1.03 (~0.5s); title underline slides in; arrow flies. (Card hover is on the whole card.)

## Services
- Row hover (desktop): row padding-left 0 -> 270px; hidden 269x180 image at left:-280px slides to left:0 (vertically centred); title/description line-height 1.3 -> 1.2, letter-spacing -0.4/-0.3 -> -0.2, color rgb(69,62,58) -> rgba(69,62,58,0.8); arrow flies. ~0.5s ease.
- Row click: opens the service detail modal (fixed, centred 576x792, backdrop rgba(24,24,24,0.4)). Close via X button (top-right of image), Escape, or backdrop click. Body is NOT scroll-locked on the original.

## Expertise cards (desktop)
- Hover: radius 8 -> 0; bottom gradient overlay grows from 147px to full card height; bottom title/subtitle block slides down out of view; stat block ("16+" / "Commercial Projects Done") drops from top:-400px to vertical centre; a glassy "View Projects ↗" pill follows the cursor inside the card. ~0.5s.

## Process cards
- Hover: frosted grid overlay (2 vertical + 2 horizontal 1px lines 150px apart around the centre, 0.5px circle ~313px) slides up from below into place; line/circle color rgb(240,235,230) -> rgba(240,235,230,0.45); tag text (top-right) 16 -> 14px; icon box moves from top-right to the centre (18px above centre); bottom gradient/blur disappears; title recentres below the icon; description slides out. ~0.5s.

## Reviews
- Click-driven slider (4 slides) via the avatar row; no autoplay. Active avatar opacity 1, others 0.7.
- On change: new image enters at scale 1.35 -> 1 over ~0.7s ease-out (crossfade); text fades out ~0.3s then new text fades in ~0.4s after ~0.35s.

## Contact form
- Inputs: 1px bottom border; focus adds layered shadow (see spec). Radio pills: selected = filled #4F4742 with #EFEDE9 text; transitions 0.18s. Submit hover bg rgba(64,54,48,0.85).

## Footer
- Icon buttons expand on hover to reveal their label (width grows, chars fade in).
- "ArcSphere Studio" running text marquee ~100px/s leftwards.

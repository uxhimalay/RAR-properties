# AboutSection + StatsTicker Specification

## Overview
- **Target files:** `src/components/sections/AboutSection.tsx`, `src/components/sections/StatsTicker.tsx`
- **Screenshot:** `docs/design-references/full-desktop-1440.png` (y 1438–2042), `docs/design-references/full-mobile-390.png`
- **Interaction model:** About = static + text reveal. Ticker = time-driven marquee (40px/s leftwards).

## Shared primitives
- `SectionHeading` (`@/components/ui/SectionHeading`) with `subtitleMaxWidth={464}`.
- `Marquee` (`@/components/ui/Marquee`) with `speed={40} gap={48}`.
- `TickerDotIcon` from `@/components/icons`.
- Content: `ABOUT`, `STATS_TICKER` from `@/lib/content`.

## AboutSection — DOM (desktop >= 1200)
```
<section id="about-section" class="section-width flex items-center justify-between overflow-clip">   // 1317 x 493
  <div class="flex w-[28%] flex-col items-center overflow-clip">                                    // img-left column 369 x 493, justify flex-start
    <div class="relative w-full overflow-clip rounded-[8px]" style="height:80%">                     // 369 x 394 (flex 0.8 of 493)
      <img src="/images/about-left.png" fill object-cover/>
    </div>
  </div>
  <SectionHeading heading={ABOUT.heading} subtitle={ABOUT.paragraph} subtitleMaxWidth={464} className="w-[464px] max-w-[35%]"/>   // 464 x 175, centred
  <div class="flex w-[28%] flex-col items-center justify-end overflow-clip">                        // img-right column 369 x 493, justify flex-end
    <div class="relative w-full overflow-clip rounded-[8px]" style="height:80%">                     // 369 x 394, bottom-aligned
      <img src="/images/about-right.png" fill object-cover/>
    </div>
  </div>
</section>
```
- Section height: 493px on desktop (set `min-height:493px` so the 80% image height resolves; or set images to 394px tall explicitly).
- Heading: "Designing Timeless Spaces With Purpose" renders in 2 lines at 464px (40px/56px). Paragraph 16px/25.6px, 2 lines.

## AboutSection — tablet & phone (< 1200)
```
<section id="about-section" class="section-width flex flex-col items-center gap-6 overflow-clip">     // gap 24
  <SectionHeading .../>                                                                            // h2 24px/26.4, p 12px/15.6, gap 8
  <div class="relative w-full overflow-clip rounded-[8px]" style="height:345px">                    // only the RIGHT image is shown, 685x345 (tablet) / 334x345 (phone)
    <img src="/images/about-right.png" fill object-cover/>
  </div>
</section>
```
- Left image hidden below 1200px.

## StatsTicker — DOM
```
<div class="w-full overflow-clip rounded-[10px]">                       // 1416 x 31 desktop, full content width
  <Marquee speed={40} gap={48}>
    {items.map(t => <>
      <p class="whitespace-pre font-display text-[24px] font-normal uppercase leading-[1.3] tracking-[-0.3px] text-ink">{t}</p>
      <TickerDotIcon class="h-6 w-6 shrink-0 text-ink"/>                // 24x24 outlined dot (r 2.25, stroke 1.5)
    </>)}
  </Marquee>
</div>
```
- Items in order: "Award winning designs", "100% Client satisfaction", "150+ Projects Completed", "12+ Years Experience" — each followed by a dot separator, gap 48px between every element.
- Direction: leftwards, 40px per second, linear, infinite.
- Tablet/phone: text 14px / 18.2px / 500 / -0.3px; dot 16px; gap 24px; container height 18px.

## Spacing
- Desktop: About and Ticker are stacked with an 80px gap (the page wrapper places them inside one block). Phone/tablet: 48px gap.

## Text content (verbatim)
- H2: "Designing Timeless Spaces With Purpose" (renders uppercase)
- P: "We offer a complete range of architecture and interior design services tailored to create spaces." (renders uppercase)
- Ticker: see items above (render uppercase)

## Behaviors
- Heading/paragraph: TextReveal default (inside SectionHeading).
- Images: no hover effect. No appear animation on images.

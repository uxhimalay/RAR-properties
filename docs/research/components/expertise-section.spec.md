# ExpertiseSection Specification

## Overview
- **Target file:** `src/components/sections/ExpertiseSection.tsx` (client — cursor-follow pill)
- **Screenshots:** `docs/design-references/full-desktop-1440.png` (y 4567–5345), `docs/design-references/expertise-hover.png` (left card hovered)
- **Interaction model:** hover-driven per card; FadeUp appear per card.

## Shared primitives
- `SectionHeading` ("Project Expertise" / "We design spaces across residential and commercial environments.").
- `FadeUp`, `ArrowUpRightIcon`.
- Content: `EXPERTISE`, `EXPERTISE_SECTION` from `@/lib/content`.

## DOM (desktop >= 1200)
```
<section class="section-width flex flex-col items-center gap-14 overflow-clip">              // 1317 x 778
  <SectionHeading/>
  <div class="flex w-full items-start justify-center gap-4 overflow-clip">                    // section-content 1317 x 603
    <FadeUp class="flex-1"> <ExpertiseCard/> </FadeUp>  x2                                    // each 650 x 603
  </div>
</section>
```
### ExpertiseCard (a Link, whole card is the `group`)
```
<Link href="/projects" class="group relative flex h-[603px] w-full flex-col items-center justify-end gap-4 overflow-clip rounded-[8px] transition-[border-radius] duration-500 hover:rounded-none" onMouseMove={track cursor}>
  <img fill object-cover class="rounded-[8px] group-hover:rounded-none transition-[border-radius] duration-500"/>
  <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-[10px] top-[-400px] group-hover:top-1/2 group-hover:-translate-y-1/2 transition-[top,transform] duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]">   // stat block 366 x 146
    <p class="whitespace-pre font-inter text-[100px] font-medium uppercase leading-[1.1] tracking-[-0.2px] text-white">{statNumber}</p>      // "16+"
    <p class="whitespace-pre text-center font-inter text-[24px] font-normal uppercase leading-[1.1] tracking-[-0.2px] text-white">{statLabel}</p>   // "Commercial Projects Done"
  </div>
  <div class="relative flex w-full flex-col items-start justify-end overflow-clip backdrop-blur-[2px] h-[147px] group-hover:h-full transition-[height] duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]" style="background: linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)">   // card-overlay
    <div class="flex w-full flex-col items-start justify-end gap-[10px] p-8 transition-transform duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:translate-y-[120%]">   // inner text block slides down out of view on hover
      <p class="whitespace-pre font-display text-[32px] font-medium uppercase leading-[1.3] tracking-[-0.2px] text-white">{title}</p>          // "Commercial Design" 331 x 42
      <p class="max-w-[347px] font-display text-[12px] font-normal uppercase leading-[1.3] tracking-[-0.2px] text-white">{subtitle}</p>
    </div>
  </div>
  <CursorPill/>  // see below
</Link>
```
### Cursor-follow pill (desktop only; visible while hovering the card)
- A glassy pill that follows the mouse inside the card: `position:absolute; pointer-events:none; transform: translate(x, y)` (x/y relative to the card, offset so the pill is centred on the cursor). Use framer-motion `useMotionValue` + `useSpring` for smooth follow. Appears (opacity 0 -> 1, scale 0.8 -> 1) on mouseenter, disappears on leave.
- Style (approximate — this element lives in a Framer portal and could not be measured exactly): `flex items-center gap-1.5 rounded-[100px] bg-[rgba(255,255,255,0.22)] px-4 py-2 backdrop-blur-[8px]`, text "View Projects" Inter Display 16px/1.2 400 white + `ArrowUpRightIcon` 16px white.

## Computed styles (desktop)
- Card: 650 x 603; radius 8px (0 on hover); overflow clip; column; justify flex-end; align center; gap 16.
- Stat block: column centred, gap 10; "16+" Inter 100px/110px/500/-0.2px white; label Inter 24px/26.4px/400/-0.2px white centre. Idle top -400px (hidden); hover vertically centred (top 229px of 603).
- Overlay: idle height 147px; gradient rgba(0,0,0,0) -> rgb(0,0,0); backdrop-filter blur(2px); hover height 603px (full).
- Inner text block: padding 32px; gap 10px; title Inter Display 32px/41.6px/500/-0.2px uppercase white; subtitle Inter Display 12px/15.6px/400/-0.2px uppercase white, max-width 347px. On hover it moves to top 604px (out of the card).
- Transitions: all ~0.5s cubic-bezier(0.44,0,0.56,1).

## Tablet & phone (< 1200)
- section gap 24; content column gap 16; each card 685 x 328 (tablet) / 334 x 328 (phone), radius 8, FadeUp appear.
- Overlay inner padding 18px; title 18px / 19.8px / 500 / -0.2px uppercase; subtitle 11px / 12.1px / 400 / -0.2px uppercase. No cursor pill (touch). Hover states can remain for pointer devices.

## Text (verbatim)
1. "Commercial Design" / "Functional and visually compelling spaces for offices, retail stores, hospitality, and businesses." / "16+" / "Commercial Projects Done" / image `/images/expertise-commercial.jpg`
2. "Residential Design" / "Thoughtfully designed homes including villas, apartments, and private residences." / "35+" / "Residencial Projects done" / image `/images/expertise-residential.jpg`
- Both link to /projects. Heading "Project Expertise"; subtitle "We design spaces across residential and commercial environments."

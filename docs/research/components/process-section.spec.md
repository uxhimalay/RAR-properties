# ProcessSection + ProcessCard Specification

## Overview
- **Target files:** `src/components/sections/ProcessSection.tsx`, `src/components/sections/ProcessCard.tsx`
- **Screenshots:** `docs/design-references/process-hover.png` (first card hovered; others idle), `docs/design-references/process-card-hover.png`
- **Interaction model:** hover-driven per card (grid overlay slides up, icon recentres, title recentres, description slides away). No appear animation on cards.

## Shared primitives
- `SectionHeading` ("Clear Design Process" / "A collaborative approach from concept to completion.").
- `PROCESS_ICONS` map from `@/components/icons` (search, cube, bulb, check).
- Content: `PROCESS_STEPS`, `PROCESS_SECTION` from `@/lib/content`.

## DOM (desktop >= 1200)
```
<section id="design-process" class="section-width flex flex-col items-center gap-14 overflow-clip">   // 1317 x 556
  <SectionHeading/>
  <div class="flex w-full items-start justify-center gap-2">                                         // Content 1317 x 331, gap 8
    <div class="flex flex-1 items-center justify-center gap-2 overflow-clip"> <ProcessCard/> <ProcessCard/> </div>   // two halves, each 654 wide
    <div class="flex flex-1 items-center justify-center gap-2 overflow-clip"> <ProcessCard/> <ProcessCard/> </div>
  </div>
</section>
```
### ProcessCard (a div, `group`), 323 x 331 desktop
```
<div class="group relative flex h-[331px] flex-1 flex-col items-center justify-end gap-3 overflow-hidden rounded-[8px]">
  <img fill object-cover class="rounded-[8px]"/>
  // GRID overlay — idle: translated fully below the card; hover: covers the card
  <div class="absolute inset-0 overflow-clip bg-[rgba(255,255,255,0.03)] backdrop-blur-[2px] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]">
    <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[150px] h-[531px]">      // 2 vertical lines
      <div class="h-full w-px bg-[#f0ebe6] group-hover:bg-[rgba(240,235,230,0.45)] transition-colors duration-500"/> <div class="h-full w-px ... same"/>
    </div>
    <div class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 rotate-90 items-center justify-center gap-[150px] h-[531px]">  // 2 horizontal lines (rotated copy)
      <div .../> <div .../>
    </div>
    <div class="absolute left-1/2 top-1/2 h-[306px] w-[306px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[0.5px] border-[#f0ebe6] group-hover:h-[313px] group-hover:w-[313px] group-hover:border-[rgba(240,235,230,0.45)] transition-all duration-500"/>   // circle
    <p class="absolute right-4 top-4 font-display text-[16px] font-medium leading-[1.2] text-[#f0ebe6] group-hover:text-[14px] transition-[font-size] duration-500">{tag}</p>     // "RESEARCH" top-right
    <p class="absolute bottom-4 left-4 font-display text-[16px] font-medium leading-[1.2] text-[#f0ebe6]">{number}</p>                                                             // "01" bottom-left
  </div>
  // ICON container — idle: top strip (72px), icon at the right; hover: whole card, icon centred (18px above centre)
  <div class="absolute inset-x-0 top-0 flex h-[72px] items-center justify-end p-3 overflow-clip group-hover:h-full group-hover:justify-center group-hover:-translate-y-[18px] transition-all duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]">
    <div class="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#f0ebe6] p-2">   // step-icon 48x48
      <Icon class="h-8 w-8 text-[#4c443f]"/>                                                    // 32px, stroke 1.5
    </div>
  </div>
  // BOTTOM content — idle: gradient + blur, title + description left aligned; hover: no gradient, taller, title centred, description gone
  <div class="relative flex w-full flex-col items-start gap-2 p-3 backdrop-blur-[7.5px] group-hover:items-center group-hover:h-[155px] group-hover:backdrop-blur-0 transition-all duration-500 ease-[cubic-bezier(0.44,0,0.56,1)]"
       style="background: linear-gradient(0deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0) 100%)">  // on hover set background to none (use a second absolutely-positioned gradient layer with opacity 1 -> 0, so it can animate)
    <p class="whitespace-pre text-center font-inter text-[24px] font-medium uppercase leading-[1.2] tracking-[-0.96px] text-[#e2dacf]">{title}</p>       // "Discovery" 129 x 29
    <p class="max-w-[282px] font-inter text-[12px] font-normal capitalize leading-[1.2] tracking-[-0.24px] text-[#e2dacf] group-hover:opacity-0 group-hover:-translate-x-[141px] transition-all duration-500">{description}</p>
  </div>
</div>
```

## Computed styles (desktop idle)
- Card 323 x 331, radius 8, overflow hidden, column, justify flex-end, align center, gap 12.
- Grid overlay: bg rgba(255,255,255,0.03), backdrop-filter blur(2px); lines 1px rgb(240,235,230), 150px apart around the centre; circle 306px, 0.5px border rgb(240,235,230); tag "RESEARCH" 16px/19.2/500 rgb(240,235,230) at top 16 right 16; number "01" same type at bottom 16 left 16.
- Icon container: top 0, height 72, padding 12, justify flex-end => icon box at top-right (12px inset). step-icon 48x48 bg rgb(240,235,230) radius 8 padding 8; svg 32px stroke rgb(76,68,63) 1.5.
- Bottom content: 323 x 90, padding 12, gap 8, gradient 0deg rgba(0,0,0,0.72) -> transparent, backdrop blur 7.5px. Title Inter 24px/28.8px/500/-0.96px uppercase rgb(226,218,207). Description Inter 12px/14.4px/400/-0.24px capitalize rgb(226,218,207).

## Hover state (measured)
- Grid overlay inset 0; lines/circle color rgba(240,235,230,0.45); circle 313px; tag 14px/16.8.
- Icon container: inset 0 shifted up 18px, icon centred (icon box at x 136–184, y 123–171 of the card).
- Bottom content: height 155px (top 176), align center, gradient & blur removed; title centred at y 188–217; description slides out (translateX -141, absolute) — hidden.
- All transitions ~0.5s cubic-bezier(0.44,0,0.56,1).

## Tablet & phone (< 1200)
- section gap 24; Content column gap 12: two groups (each `flex flex-col gap-3`) => 4 cards stacked, each full width (685 / 334) x 331px. Same hover behaviour.

## Text (verbatim) — from `PROCESS_STEPS`
1. 01 / RESEARCH / "Discovery" / "We begin by understanding your goals, requirements, and design vision." / search icon / process-discovery.png
2. 02 / IDEATION / "Concept Development" / "Our team develops layouts, ideas, and creative design directions." / cube / process-concept-development.png
3. 03 / MODELLING / "Design Development" / "Detailed drawings, materials, and spatial specifications are finalized." / bulb / process-design-development.png
4. 04 / DELIVERY / "execution" / "We guide implementation to ensure the final result reflects the original design vision." / check / process-execution.png

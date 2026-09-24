# ServicesSection + ServiceRow + ServiceModal Specification

## Overview
- **Target files:** `src/components/sections/ServicesSection.tsx` (client), `src/components/sections/ServiceRow.tsx`, `src/components/sections/ServiceModal.tsx`
- **Screenshots:** `docs/design-references/full-desktop-1440.png` (y 3200–4455), `docs/design-references/services-hover-row1.png` (row 1 hovered: image slid in at left), `docs/design-references/service-overlay-1.png` (modal open)
- **Interaction model:** HOVER (row image slide-in + type tweaks) and CLICK (opens detail modal). Each row has a FadeUp appear.

## Shared primitives
- `SectionHeading` ("Our Services" / "End-to-end design services from concept to completion.").
- `ArrowButton` (`parentGroup`, non-link `<span>` — no href, the row itself is the click target).
- `PillButton` (`variant="dark" size="popup"`) for the modal CTA.
- `FadeUp` per row.
- Icons: `CloseIcon`, `ClockIcon`, `MapPinIcon`, `TickIcon` from `@/components/icons`.
- Content: `SERVICES`, `SERVICES_SECTION`, `SERVICE_DETAIL_CTA` from `@/lib/content`. Use `framer-motion` `AnimatePresence` for the modal.

## ServicesSection — DOM (desktop)
```
<section id="services" class="section-width flex flex-col items-center gap-14 overflow-clip">   // 1317 x 1255
  <SectionHeading/>
  <ul class="flex w-full flex-col items-center overflow-hidden">                                // service_list 1317 x 1080 (6 x 180)
    <ServiceRow service={..} onOpen={..}/> x6
  </ul>
  <ServiceModal service={active} onClose={..}/>   // rendered via AnimatePresence when active != null
</section>
```

## ServiceRow — DOM (desktop) — the whole row is a `group`, `cursor: pointer`, `role="button"`, `tabIndex 0`
```
<li class="w-full">
 <FadeUp>
  <div class="group relative flex h-[180px] w-full items-center justify-end overflow-clip border-b border-[rgba(69,62,58,0.5)] cursor-pointer pl-0 transition-[padding] duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] hover:pl-[270px]">
    <div class="absolute top-1/2 -translate-y-1/2 left-[-280px] h-[180px] w-[269px] overflow-clip transition-[left] duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:left-0">   // service_img
      <img fill object-cover/>
    </div>
    <div class="flex flex-1 items-start justify-between overflow-clip p-10">                    // service_text, padding 40
      <div class="flex w-[661px] max-w-[64%] flex-col items-start gap-[10px] overflow-clip">     // content
        <h3 class="font-display text-[34px] font-normal leading-[1.3] tracking-[-0.4px] text-[#453e3a] transition-all duration-500 group-hover:leading-[1.2] group-hover:tracking-[-0.2px] group-hover:text-[rgba(69,62,58,0.8)]">{title}</h3>
        <p class="font-display text-[18px] font-normal leading-[1.3] tracking-[-0.3px] text-[#453e3a] transition-all duration-500 group-hover:leading-[1.2] group-hover:tracking-[-0.2px] group-hover:text-[rgba(69,62,58,0.8)]">{description}</p>
      </div>
      <div class="flex max-w-[30%] flex-1 items-start justify-end gap-[10px] overflow-clip h-[100px] group-hover:h-8 group-hover:items-center transition-all duration-500">   // num
        <ArrowButton parentGroup/>                                                                  // 32px circle
      </div>
    </div>
  </div>
 </FadeUp>
</li>
```
- Every row has a 1px bottom border rgba(69,62,58,0.5) (including the last).
- Row height 180px exactly; text block vertically at the top (padding 40).

## ServiceRow — tablet & phone (< 1200)
```
<li class="w-full border-b border-[rgba(69,62,58,0.5)]">
  <div class="flex w-full flex-col gap-3 py-[22px] cursor-pointer">                           // 105px tall row, service_text gap 12
    <div class="flex w-full items-center justify-between h-10">                                // 40px
      <h3 class="font-display text-[20px] font-normal leading-[1.2] tracking-[-0.2px] text-ink">{title}</h3>
      <ArrowButton parentGroup/>
    </div>
    <p class="font-display text-[11px] font-normal leading-[1.2] tracking-[-0.2px] text-ink">{description}</p>
  </div>
</li>
```
- No hover image below 1200px. Rows separated by 8px gap (list `gap-2`) plus the border.

## ServiceModal — DOM (all breakpoints; fixed overlay, z-50)
```
<motion.div class="fixed inset-0 z-50 bg-[rgba(24,24,24,0.4)]" initial opacity 0 -> 1 (0.3s) onClick={onClose}/>   // backdrop
<motion.div class="fixed left-1/2 top-1/2 z-50 w-[576px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-[10px] rounded-[8px] bg-[#f0ebe6] p-2 overflow-clip"
            initial {opacity:0, scale:0.96} animate {opacity:1, scale:1} exit reverse, 0.3s ease>            // 576 x 792
  <div class="relative w-full overflow-hidden rounded-[8px]" style="aspect-ratio: 560/415">                   // PopUp-Img-section 560 x 415
    <img fill object-cover src={service.image}/>
    <div class="absolute inset-0 flex flex-col justify-between items-end rounded-[8px] backdrop-blur-[2px]" style="background: linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)">   // card-overlay
      <div class="flex w-full items-center justify-end p-3 h-12"/>   // (spacer row; Close button is positioned absolutely, see below)
      <div class="flex w-full flex-col items-start gap-[10px] p-4">                                          // content 560 x 89
        <p class="font-display text-[24px] font-medium uppercase leading-[1.1] tracking-[-0.2px] text-white">{detail.title}</p>
        <div class="flex items-center gap-3 overflow-clip">                                                  // icons-group
          <div class="flex items-center gap-2 rounded-[15px] p-[2px]"> <ClockIcon class="h-4 w-4 text-[#f0ebe6]"/> <p class="text-[14px] leading-[1.2] font-normal text-[#f0ebe6]">{detail.hours}</p> </div>
          <div class="h-4 w-[2px] bg-[#ccc]"/>
          <div class="flex items-center gap-2 rounded-[15px] p-[2px]"> <MapPinIcon class="h-4 w-4 text-[#f0ebe6]"/> <p class="...">{detail.location}</p> </div>
        </div>
      </div>
    </div>
    <button aria-label="Close" onClick={onClose} class="absolute right-4 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-[100px] bg-[rgba(255,255,255,0.16)] p-1 backdrop-blur-[15px]">
      <CloseIcon class="h-4 w-4 text-[#f0ebe6]"/>   // X, 1.5 stroke
    </button>
  </div>
  <div class="flex w-full flex-col items-start gap-6 overflow-clip p-3">                                       // content 560 x 351, padding 12, gap 24
    <p class="font-display text-[14px] font-medium leading-[1.2] tracking-[-0.2px] text-[#453e3a]">{detail.description}</p>
    <div class="flex w-full flex-col gap-3">                                                                    // Includes-section
      <h3 class="font-display text-[14px] font-medium capitalize leading-[1.2] tracking-[-0.2px] text-[#453e3a]">includes</h3>
      <div class="flex w-full flex-col gap-[10px]">                                                             // points
        {bullets.map(b => <div class="flex items-center gap-2 p-[2px]"> <TickIcon class="h-[9px] w-[11px] text-ink"/> <p class="font-display text-[13px] font-normal leading-[1.2] tracking-[-0.2px] text-[#453e3a]">{b}</p> </div>)}
      </div>
    </div>
    <p class="font-display text-[14px] font-medium leading-[1.2] tracking-[-0.2px] text-[#453e3a]">{detail.summary}</p>
    <div class="flex w-full items-center gap-[10px]">                                                           // Price+Button
      <div class="flex flex-1 flex-col items-start gap-1">
        <h3 class="font-display text-[12px] font-normal capitalize leading-[1.2] tracking-[-0.2px] text-[#453e3a]">starting from</h3>
        <p class="font-display text-[16px] font-medium leading-[1.2] tracking-[-0.2px] text-[#453e3a]">{detail.price}</p>
      </div>
      <PillButton href="/contact" variant="dark" size="popup" style="color:#efede9">Design Your Space</PillButton>   // 157 x 34
    </div>
  </div>
</motion.div>
```
- Close on: X button click, backdrop click, Escape key. Do not lock body scroll.
- Phone: container `max-w-[92vw]`, everything else identical (the original shows the same card on phone).

## Text (verbatim) — from `SERVICES[i].detail` in content.ts (titles, hours "Sun - Fri (9:30 am - 11 pm)", "Dubai, UAE", description, 5 bullets, summary line, price like "250 AED / Hour", CTA "Design Your Space").

## Assets
- Row/modal images: `/images/service-architectural.png`, `service-interior-design.png`, `service-renovation.png`, `service-3d-visualization.jpg`, `service-space-planning.jpg`, `service-construction-consultation.jpg`.

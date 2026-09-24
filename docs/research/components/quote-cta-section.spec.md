# QuoteCtaSection Specification

## Overview
- **Target file:** `src/components/sections/QuoteCtaSection.tsx`
- **Screenshot:** `docs/design-references/full-desktop-1440.png` (y 6906–7479)
- **Interaction model:** static; text reveal on the quote; pill hover text swap.

## Shared primitives
- `TextReveal` (default preset) for the h2 and attribution; `PillButton` (`glass` and `light`, size md; `xs` below 1200).
- Content: `QUOTE_CTA` from `@/lib/content`.

## DOM (desktop >= 1200)
```
<section class="section-width relative flex h-[573px] flex-col items-center justify-between overflow-clip rounded-[16px] p-8">   // 1317 x 573, padding 32
  <img fill object-cover src="/images/cta-quote-bg.png" class="rounded-[16px]"/>                                                  // 3456 x 1248
  <div class="absolute -inset-1" style="background: linear-gradient(291deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.91) 100%)"/>          // overlay (dark from bottom-left)
  <div class="relative z-10 flex w-full flex-col items-start justify-center gap-2 overflow-clip">                                 // Top 1253 x 198
    <TextReveal as="h2" text={QUOTE_CTA.quote} class="max-w-[614px] font-display text-[40px] font-medium uppercase leading-[56px] tracking-[-1.2px] text-[#efede9]"/>   // 3 lines
    <TextReveal as="p" text={QUOTE_CTA.attribution} class="font-inter text-[14px] font-bold leading-[22.4px] tracking-[-0.28px] text-[#efede9]"/>                        // “Frank Gehry”
  </div>
  <div class="relative z-10 flex w-full items-center justify-end gap-4 overflow-clip">                                             // buttons-container 1253 x 48
    <PillButton href="/projects" variant="glass">View Projects</PillButton>                                                        // bg rgba(240,235,230,0.38) text #f0ebe6
    <PillButton href="/contact" variant="light">book consultation</PillButton>                                                     // bg #f0ebe6 text #4f4742
  </div>
</section>
```

## Computed styles
- Card: width 93% (1317) x 573; radius 16; overflow clip; padding 32; column; justify space-between; align center.
- Overlay gradient: `linear-gradient(291deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.91) 100%)` (covers the card, slightly oversized).
- Quote h2: Inter Display 40px / 56px / 500 / -1.2px / uppercase / rgb(239,237,233); max-width 614px (wraps to 3 lines: “ARCHITECTURE SHOULD SPEAK / OF ITS TIME AND PLACE, BUT / YEARN FOR TIMELESSNESS.”).
- Attribution: Inter 14px / 22.4px / 700 / -0.28px / rgb(239,237,233): “Frank Gehry” (with curly quotes, no uppercase).
- Buttons: right-aligned, gap 16.

## Tablet & phone (< 1200)
- Card height 401px, radius 8, padding 24; quote 24px / 28.8px / 500 / -0.72px, max-width 100%; attribution 12px / 19px / 700; buttons row right-aligned, `PillButton size="xs"` (11px/600) gap 8.

## Text (verbatim)
- “Architecture should speak of its time and place, but yearn for timelessness.” (rendered uppercase)
- “Frank Gehry”
- "View Projects" -> /projects; "book consultation" -> /contact

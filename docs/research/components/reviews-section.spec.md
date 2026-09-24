# ReviewsSection Specification

## Overview
- **Target file:** `src/components/sections/ReviewsSection.tsx` (client — slider state)
- **Screenshots:** `docs/design-references/full-desktop-1440.png` (y 6126–6794), `docs/design-references/reviews-slide-last.png` (4th slide active)
- **Interaction model:** CLICK-DRIVEN slider. Clicking an avatar switches the slide. No autoplay. Image crossfades with a 1.35 -> 1 scale; text fades out then in.

## Shared primitives
- `SectionHeading` ("What Our Clients Say" / "Real experiences from clients who trusted us with their spaces.").
- `StarIcon` from `@/components/icons`; `FadeUp` (tablet/phone image block); framer-motion `AnimatePresence`.
- Content: `REVIEWS`, `REVIEWS_SECTION` from `@/lib/content`.

## DOM (desktop >= 1200)
```
<section class="section-width flex flex-col items-center gap-14 overflow-clip">                 // 1317 x 668
  <SectionHeading/>
  <div class="flex w-full items-center justify-center gap-6">                                    // "Desktop 1" 1317 x 493, gap 24
    <div class="relative h-[493px] overflow-hidden rounded-[8px]" style="flex: 1.2 0 0">          // Client 670 x 493
      <AnimatePresence initial={false}>
        <motion.img key={active} src={review.image} class="absolute inset-0 h-full w-full object-cover"
          initial={{ opacity: 0, scale: 1.35 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          transition={{ scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.3 } }}/>
      </AnimatePresence>
    </div>
    <div class="flex h-[493px] flex-1 items-center justify-center overflow-hidden px-8 py-2">       // Text 623 x 493, padding 8px 32px
      <div class="flex h-full w-full flex-col items-start justify-between overflow-hidden">         // Content 559 x 477
        <AnimatePresence mode="wait">
         <motion.div key={active} class="flex flex-col items-start gap-5 overflow-hidden"          // Text group, gap 20
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.4, delay: 0.35 } }} exit={{ opacity: 0, transition: { duration: 0.3 } }}>
          <div class="flex items-center gap-2"> <StarIcon class="h-4 w-4 text-ink"/> x5 </div>       // Stars 112 x 16
          <h3 class="font-display text-[40px] font-medium leading-[40px] text-ink">{review.title}</h3>      // 525 wide, wraps to 1 line
          <p class="font-display text-[24px] font-normal leading-[28.8px] text-[rgba(79,71,66,0.7)]">{review.quote}</p>
         </motion.div>
        </AnimatePresence>
        <div class="flex flex-col items-start gap-4">                                              // bottom group 378 x 124
          <AnimatePresence mode="wait"> <motion.div key={active} class="flex flex-col gap-[2px]" (same fade timing)>   // client-info
            <p class="whitespace-pre font-display text-[16px] font-medium leading-[24px] text-ink">{review.name}</p>
            <p class="whitespace-pre font-display text-[14px] font-normal leading-[20px] text-ink">{review.role}</p>
          </motion.div> </AnimatePresence>
          <div class="flex items-start gap-2 overflow-hidden">                                     // Clients 272 x 62
            {REVIEWS.map((r,i) => <button onClick={()=>setActive(i)} class="relative h-[62px] w-[62px] overflow-clip rounded-[6px] transition-opacity duration-300" style={{ opacity: i===active ? 1 : 0.7 }}> <img src={r.avatar} class="h-full w-full object-cover"/> </button>)}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

## Computed styles (desktop)
- Image block: 670 x 493 (flex-grow 1.2), radius 8, overflow hidden, object-fit cover.
- Text block: 623 wide; padding 8px 32px; inner content 559 x 477 column space-between.
- Stars: 5 x 16px, gap 8px, fill/stroke rgb(79,71,66).
- Title: Inter Display 40px / 40px / 500, rgb(79,71,66).
- Quote: Inter Display 24px / 28.8px / 400, rgba(79,71,66,0.7).
- Name: 16px / 24px / 500; Role: 14px / 20px / 400; both rgb(79,71,66); gap 2px.
- Avatars: 62 x 62, radius 6px, gap 8px, cursor pointer; active opacity 1, inactive 0.7.

## Tablet & phone (< 1200) — "Mobile 1"
```
<section class="section-width flex flex-col items-center gap-6 overflow-clip">
  <SectionHeading/>
  <div class="flex w-full flex-col items-center gap-6">                                        // gap 24
    <FadeUp class="w-full"> <div class="relative h-[324px] w-full overflow-hidden rounded-[8px]"> image crossfade </div> </FadeUp>   // 685/334 x 324
    <div class="flex w-full flex-col items-start gap-6 overflow-hidden">                       // Content gap 24
      <div class="flex flex-col items-start gap-2">  stars 16px; h3 20px / 28px / 500; quote 11px / 17px / 400 rgba(79,71,66,0.7) </div>
      <div class="flex flex-col items-start gap-4"> name 14px / 24px / 500; role 12px / 20px / 400; avatars 48 x 48 gap 8 (radius 6) </div>
    </div>
  </div>
</section>
```

## Text (verbatim) — from `REVIEWS` (4 slides: Michael Turner, Elena Rostova, David Miller, Sarah Jenkins). Images `/images/review-1..4.jpg`, avatars `/images/client-1..4.jpg`.

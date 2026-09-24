# Footer Specification

## Overview
- **Target file:** `src/components/sections/Footer.tsx` (client only if needed for icon-button hover text; CSS-only is fine)
- **Screenshot:** `docs/design-references/full-desktop-1440.png` (y 8440–9807)
- **Interaction model:** hover text-swap on links, underline on "get in touch", icon buttons expand on hover; time-driven running-text marquee (~100px/s).

## Shared primitives
- `SwapLink` (footer links, override color to rgba(79,71,66,0.8)), `UnderlineLink size="lg"` ("get in touch"), `Marquee` (`speed={100} gap={20}`), `FadeUp`.
- Icons: `MailIcon`, `PhoneIcon`, `MapPinIcon` from `@/components/icons`.
- Content: `FOOTER` from `@/lib/content`.

## DOM (desktop >= 1200)
```
<footer id="footer" class="flex w-full flex-col items-center gap-10 overflow-clip rounded-[12px] bg-[#e2dacf] pt-[110px]">   // 1416 x 1367
  <div class="flex w-full items-center justify-center gap-[10px] overflow-clip px-10">              // Container Text, padding 0 40
    <div class="flex flex-1 flex-col items-start gap-[108px]">                                       // Wrapper 1336 x 393
      <div class="flex w-full items-start justify-between overflow-clip">                            // Text 1336 x 239
        <div class="flex max-w-[672px] flex-1 flex-col items-start gap-16">                           // Left Text, gap 64
          <h3 class="font-display text-[40px] font-medium uppercase leading-[48px] tracking-[-1.6px] text-ink">{FOOTER.heading}</h3>   // 3 lines
          <UnderlineLink href="/" size="lg">get in touch</UnderlineLink>                               // 18px, 3px bar
        </div>
        <div class="flex items-start gap-12 overflow-clip">                                           // footer-links 392 x 172, gap 48
          {FOOTER.linkGroups.map(g => <div class="flex flex-col items-start gap-2 overflow-clip"> {g.links.map(l => <SwapLink href={l.href} className="text-[rgba(79,71,66,0.8)]">{l.label}</SwapLink>)} </div>)}   // each link 22px tall, gap 8
        </div>
      </div>
      <div class="flex w-full flex-col items-center gap-4">                                           // Footer bottom 1336 x 46
        <div class="h-px w-full bg-[#f0ebe6]"/>                                                       // Divider
        <div class="flex w-full items-center justify-between overflow-clip">                          // 1336 x 29 (icons overflow to 48)
          <div class="flex items-center gap-2 overflow-clip">                                          // icons-group 180 x 48
            <IconButton icon=mail label="hello@arcspherestudio.ae" href="mailto:..."/>
            <span class="h-6 w-[2px] bg-[#ccc]"/>
            <IconButton icon=phone label="+62 812 3456 7890" href="tel:..."/>
            <span class="h-6 w-[2px] bg-[#ccc]"/>
            <IconButton icon=pin label="Dubai, UAE" href="#"/>
          </div>
          <p class="whitespace-pre font-display text-[16px] font-medium capitalize leading-[20.8px] tracking-[-0.3px] text-[rgba(85,77,72,0.6)]">{FOOTER.copyright}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="w-full pt-20">                                                                          // Running Text, padding-top 80, 1416 x 310
    <Marquee speed={100} gap={20}>
      <div class="p-1"><p class="whitespace-pre font-display text-[240px] font-extrabold leading-[230.4px] tracking-[-9.6px] text-ink">ArcSphere Studio</p></div>
      // repeat the item 3 times inside the Marquee children so the track is wide enough (Marquee duplicates the whole set)
    </Marquee>
  </div>
  <div class="relative w-full overflow-clip" style="aspect-ratio: 2.98755">                            // Video (img) 1416 x 474
    <img fill object-cover src="/images/footer-image.jpg"/>
  </div>
</footer>
```
### IconButton
```
<a href class="group flex h-12 items-center gap-3 overflow-hidden rounded-[15px] p-3">          // 48 x 48 idle; grows to fit the label on hover (e.g. 218px)
  <Icon class="h-6 w-6 shrink-0 text-[#4c443f]"/>                                                 // 24px, 2px stroke
  <span class="max-w-0 whitespace-pre font-display text-[14px] font-normal leading-[16.8px] text-[#4c443f] opacity-0 transition-all duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:max-w-[200px] group-hover:opacity-100">{label}</span>
</a>
```
- The original fades the label in character by character; a width + opacity transition is an acceptable approximation.

## Computed styles (desktop)
- footer: bg rgb(226,218,207); radius 12; padding-top 110; gap 40; overflow clip; width 100% of content (1416).
- Heading: Inter Display 40px / 48px / 500 / -1.6px / uppercase / rgb(79,71,66); max-width 672.
- Links: Inter Display 14px / 15.4px / 500 / -0.4px / uppercase / rgba(79,71,66,0.8); column gap 8; column gap between groups 48.
- Divider 1px rgb(240,235,230). Copyright 16px / 20.8px / 500 / -0.3px / capitalize / rgba(85,77,72,0.6).
- Running text: 240px / 230.4px / 800 / -9.6px rgb(79,71,66); item padding 4; gap 20; leftwards ~100px/s.
- Footer image: 1416 x 474, object-fit cover (natural 1728x624).

## Tablet & phone (< 1200)
```
<footer class="flex w-full flex-col items-center gap-6 overflow-clip rounded-[8px] bg-[#e2dacf] pt-8">        // padding-top 32, gap 24
  <div class="w-full px-3"> <div class="flex flex-col gap-6">                                                    // Wrapper gap 24
    <div class="flex flex-col gap-6 overflow-clip">                                                              // Text: column
      <div class="flex flex-col items-start gap-6"> h3 24px / 28.8px / 500 / -0.24px; UnderlineLink "get in touch" 16px (md size text but keep 3px bar ok) </div>
      <div class="flex w-full items-start justify-between overflow-clip"> 3 link columns (links 12px / 13.2px / 500 / -0.4px) </div>   // footer-links space-between
    </div>
    <div class="flex flex-col items-center gap-4"> divider; <div class="flex w-full flex-col items-start gap-3"> icons row; copyright 12px / 15.6px </div> </div>
  </div> </div>
  <div class="w-full h-20"> Marquee text 64px / 1 / 800 / -2.56px, gap 24 </div>                                  // Running Text 80px tall
  <div class="relative w-full" style="aspect-ratio: 2.769"> footer image </div>                                    // 737 x 266
</footer>
```

## Text (verbatim) — from `FOOTER`: heading "Open to new projects and collaborations that shape meaningful spaces."; "get in touch"; link columns (home, about, services, projects, process, contact | pinterest, linkedin, instagram, behance | Privacy Policy, Cookie Policy, Terms & Conditions); copyright "© 2026 Your Architecture Studio. All rights reserved."; running text "ArcSphere Studio".

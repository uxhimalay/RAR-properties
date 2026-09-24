# HeroSection Specification

## Overview
- **Target file:** `src/components/sections/HeroSection.tsx` (client component — framer-motion `useScroll`/`useTransform`)
- **Screenshots:** `docs/design-references/full-desktop-1440.png` (y 66–876), `docs/design-references/services-hover-item1.png` (shows the hero at scroll 0 with intro finished), `docs/design-references/mobile-390-top.png`
- **Interaction model:** SCROLL-DRIVEN (desktop >= 1200): sticky image box, main image scales down, side images slide in, text fades out. Plus an on-load text reveal. Tablet/phone: static image card (no sticky, no scroll animation).

## Shared primitives
- `TextReveal` (`@/components/motion/TextReveal`) presets `hero-heading` and `hero-paragraph` with `startOnMount`.
- `PillButton` (`variant="light"` and `variant="dark"`, `size="md"` desktop, `size="xs"` on phone/tablet).
- `HERO` from `@/lib/content`.
- Use `next/image` with `fill` + `object-cover` for all images (or plain `<img>` if simpler; either is acceptable).

## DOM Structure (desktop)
```
<header id="hero" class="relative w-full overflow-clip" style="height:1260px">            // 1416 x 1260 at 1440 (810 image box + 450 scroll runway)
  <div class="sticky top-[64px] flex h-[810px] w-full items-center justify-center">        // "hero_img-box"
    <motion.div  // img-left, absolute, z-3, 500x700, radius 12, overflow hidden
        style="top:405px; left:-60px; transform: translateY(-50%) translateX(var(--x)) scale(0.5)">
      <img src="/images/hero-left.png" cover/>
    </motion.div>
    <motion.div  // img-main: relative, flex-1 (full 1416x810), overflow clip, radius 12, transform: scale(var(--s)), origin center
      <img src="/images/hero-main.png" class="absolute inset-0 h-full w-full object-cover rounded-[12px]"/>
      <div class="absolute inset-0 rounded-[12px]" style="background: linear-gradient(180deg, rgba(24,24,24,0) 28%, rgba(24,24,24,0.5) 92%)"/>   // img-bg gradient
      <div class="absolute inset-0 rounded-[12px] bg-[#181818] opacity-[0.35]"/>                                                           // img-bg dim
    </motion.div>
    <motion.div  // img-right, absolute, z-3, 500x700, radius 12, overflow clip
        style="top:405px; right:-60px; transform: translateY(-50%) translateX(var(--x2)) scale(0.5)">
      <img src="/images/hero-right.jpg" cover/>
    </motion.div>
    <motion.div  // hero_text-box: absolute left:40px right:40px top:543px bottom:60px; column; justify:flex-end; align:flex-end; gap:30px; z above images
      <div class="flex w-full items-end justify-between">                                   // text_wrapper (1336 wide)
        <div class="flex max-w-[750px] flex-1 flex-col items-start justify-center gap-[10px]">   // heading
          <h1> TextReveal hero-heading "Where Architecture\nMeets Experience" </h1>
        </div>
        <div class="z-[2] flex flex-1 max-w-[26%] flex-col items-start gap-3">              // "btn" (347 wide box; its child overflows to the left)
          <div class="flex w-full items-center justify-end gap-[15px] pt-2">                 // btn_wrapper
            <div class="flex w-[487px] shrink-0 flex-col items-start justify-center gap-4 overflow-clip pt-2">   // sub-heading (487 wide, right-aligned, overflows the 347 box to the left)
              <p> TextReveal hero-paragraph {HERO.paragraph} </p>
              <FadeUp> <div class="flex items-center gap-4 overflow-clip">                    // buttons-container 386 x 48
                PillButton light md "View Projects" -> /projects                                // 164 x 48
                PillButton dark  md "book consultation" -> /contact                             // 205 x 48
              </div> </FadeUp>
            </div>
          </div>
        </div>
      </div>
      <div class="flex w-full items-center overflow-clip">                                   // line_wrapper 1336 x 1
        <div class="flex flex-1 overflow-hidden"><motion.div class="h-px flex-1 bg-[#f0ebe6]"/></div>   // left half: slides in from translateX(600px)
        <div class="flex flex-1 overflow-hidden"><motion.div class="h-px flex-1 bg-[#f0ebe6]"/></div>   // right half: slides in from translateX(-600px)
      </div>
    </motion.div>
  </div>
</header>
```

## Computed Styles (desktop, exact)
- header: width 100% (1416), height 1260px, overflow clip, position relative. Background none (page bg shows through the runway).
- hero_img-box: position sticky; top 64px; height 810px; width 100%; display flex; align-items center; justify-content center.
- img-main: width 100% (1416) x 810; border-radius 12px; overflow clip. Image object-fit cover (natural 1376x768).
- gradient overlay: `linear-gradient(rgba(24,24,24,0) 28%, rgba(24,24,24,0.5) 92%)`; dim overlay: `#181818` at opacity 0.35.
- img-left / img-right: 500 x 700 px boxes (rendered 250x350 because of scale 0.5), border-radius 12px, overflow hidden, z-index 3, object-fit cover. Positioned: top 405px; left -60px (left one) / right -60px (right one); `transform-origin: center`.
- hero_text-box: absolute; left 40px; right 40px; top 543px; bottom 60px (=> 1336 x 207); display flex column; justify-content flex-end; align-items flex-end; gap 30px.
- h1: Inter Display 80px / 88px / 400; letter-spacing -3.2px; color rgb(240,235,230); text-align left; two lines "Where Architecture" / "Meets Experience" (hard break); max-width 750px.
- paragraph: Inter Display 16px / 20.8px / 400; letter-spacing -0.3px; color rgb(240,235,230); width 487px (wraps to 2 lines).
- buttons: PillButton md — "View Projects" bg rgb(240,235,230) text rgb(79,71,66); "book consultation" bg rgb(79,71,66) text rgb(240,235,230); gap 16px; container padding-top 0.
- lines: 1px tall, bg rgb(240,235,230), each half 668px wide.

## States & Behaviors
### Scroll-driven (desktop only)
- `const { scrollY } = useScroll();` progress `p = scrollY / 425` clamped 0..1 (linear).
  - main scale: `useTransform(scrollY, [0, 425], [1, 0.45], { clamp: true })`
  - left x: `[0, 425] -> [-400, 0]` px; right x: `[0, 425] -> [400, 0]` px (both also keep `translateY(-50%) scale(0.5)` — compose with framer-motion `style={{ x, y: "-50%", scale: 0.5 }}`).
  - text box: opacity `[0,425] -> [1, 0]`, y `[0,425] -> [0, 500]` px.
- Sticky range: the box is sticky from scrollY ≈ 2 to ≈ 452 (it naturally un-sticks at the end of the 1260px header). No JS needed for stickiness.
- Measured checkpoints (scrollY -> main scale / left translateX / text opacity): 0 -> 1 / -400 / 1; 100 -> 0.8706 / -305.9 / 0.765; 250 -> 0.6765 / -164.7 / 0.412; 425+ -> 0.45 / 0 / 0.

### Intro (on mount, desktop and mobile)
- Heading: `TextReveal preset="hero-heading" startOnMount delay={0.4}`.
- Paragraph: `TextReveal preset="hero-paragraph" startOnMount delay={0.4}`.
- Buttons container: opacity 0 -> 1 and translate (5px, 20px) -> 0 starting 0.4s, ~1.4s ease-out (use motion.div, not FadeUp, to get the x offset).
- Lines: left half `x: 600 -> 0`, right half `x: -600 -> 0`, opacity 0 -> 1, delay 0.4s, duration 1s ease-out.

## Tablet & phone (< 1200px) — static card
```
<header id="hero" class="relative flex w-full flex-col overflow-clip rounded-[8px]" style="height: calc(100dvh - 59px)">  // 359 x 785 at 390x844; 737 x 962 at 768x1024
  <div class="relative h-full w-full">                       // hero_img-box (position relative, not sticky)
    <img main cover rounded-[8px]/> + same two overlays (rounded 8px)
    <div class="absolute inset-x-0 bottom-0 flex flex-col items-end gap-4 p-3">           // hero_text-box: padding 12, gap 16
      <div class="flex w-full flex-col items-end gap-3">                                    // text_wrapper gap 12
        <h1 class="w-full text-left"> 40px / 44px / 400 / -0.8px, color #f0ebe6 </h1>       // "Where Architecture" wraps naturally at 335px
        <div class="flex w-full flex-col gap-4">                                            // btn: paragraph + buttons, gap 16
          <p class="w-[311px] max-w-full"> 12px / 15.6px / 400 / -0.3px </p>
          <div class="flex w-full gap-2 pl-[5px]">                                          // buttons-container gap 8
            PillButton light xs "View Projects" className="flex-1"                            // 152 x 34, 11px/600/-0.5
            PillButton dark  xs "book consultation" className="flex-1"
          </div>
        </div>
      </div>
      <div class="h-px w-full bg-[#f0ebe6]"/>                                               // single full-width line
    </div>
  </div>
</header>
```
- No side images on tablet/phone. No scroll animation. Intro text reveal still plays.
- Tablet (768): identical structure to phone, header height = viewport height - 62px.

## Assets
- `/images/hero-main.png` (1376x768), `/images/hero-left.png` (1376x768), `/images/hero-right.jpg` (1200x1361).

## Text content (verbatim)
- H1: "Where Architecture" / "Meets Experience"
- P: "Based in Dubai, we design residential and commercial spaces that elevate how people live, work, and interact with their environment"
- Buttons: "View Projects" (/projects), "book consultation" (/contact)

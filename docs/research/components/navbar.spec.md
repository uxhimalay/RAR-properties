# Navbar Specification

## Overview
- **Target file:** `src/components/sections/Navbar.tsx` (client component — mobile menu state)
- **Screenshots:** `docs/design-references/full-desktop-1440.png` (top 60px), `docs/design-references/mobile-390-top.png`, `docs/design-references/mobile-390-menu-open.png`
- **Interaction model:** static in flow (position: relative, scrolls away). Hover text-swap on links. Click hamburger (<1200px) toggles menu. Intro fade-in on load.

## Shared primitives to use
- `SwapLink` from `@/components/ui/SwapLink` (nav links, already 14px/500/-0.4/uppercase, text-swap hover).
- `PillButton` from `@/components/ui/PillButton` (`variant="dark" size="sm"` for the desktop CTA; `variant="menu" size="md"` for the mobile menu CTA).
- `FadeUp` from `@/components/motion/FadeUp` with `onMount` for the intro.
- Content from `@/lib/content`: `NAV_LINKS`, `NAV_CTA`, `SITE_NAME`.

## DOM Structure (desktop >= 1200px)
```
<nav padding:12px width:100% display:flex align:center gap:20px>            // 1416 x 46 at 1440
  <div row flex:1 align:center gap:20px>                                   // "nav_wrapper" 1392 x 35
    <div row flex:1 align:center gap:32px padding:2px overflow:clip>       // "nav-links-container" 589 x 26
      SwapLink "design process" -> /#design-process
      SwapLink "projects" -> /projects
      SwapLink "services" -> /#services
    </div>
    <div row align:center gap:20px>                                        // "logo_wrapper" 177 x 26
      <Link href="/" class="overflow-hidden"> <p>ArcSphere Studio</p> </Link>
    </div>
    <div row flex:1 justify:flex-end align:center gap:10px>                // "button_group"
      PillButton dark sm "contact us" -> /contact                           // 118 x 35
    </div>
  </div>
</nav>
```

## Computed Styles (desktop)
### nav
- display:flex; padding:12px; justify-content:center; align-items:center; gap:20px; background: transparent; position: relative; width:100%.
### nav links (each SwapLink)
- font: Inter Display 14px / 15.4px (110%) / 500; letter-spacing -0.4px; text-transform: uppercase; color rgb(79,71,66). Link box height 22px (2px padding). Gap between links 32px.
### Logo
- text "ArcSphere Studio": Inter Display 24px / 26.4px / 400; letter-spacing -0.4px; color rgb(79,71,66); white-space: pre. No hover effect.
### CTA (PillButton dark sm)
- background rgb(79,71,66); color rgb(240,235,230); padding 6px 16px; radius 100px; text 14px/500/-0.2px uppercase "contact us"; height 35px.

## States & Behaviors
### Intro (on load)
- Links, logo, CTA: opacity 0 -> 1, translateY 12px -> 0; starts ~0.2s after mount, spring ~0.5s. Use `<FadeUp onMount delay={0.2}>` wrappers (all same delay, no stagger).
### Hover
- Links: text swap (built into SwapLink). CTA: text swap (built into PillButton). Logo: none.
### No scroll behavior. The nav is not fixed.

## Tablet & Phone (< 1200px) — "phone-closed" / open variants
```
<nav class="relative flex flex-col overflow-hidden" style="height: closed 38px | open: 100dvh">   // 359 x 38 at 390
  <div class="w-full bg-[#f0ebe6] flex justify-center items-start gap-[10px]">
    <div class="nav_wrapper w-full flex flex-col items-start gap-8 px-2">                          // gap 32, padding 0 8px
      <div class="logo_wrapper w-full h-[38px] flex items-center justify-between">
        <Link href="/">ArcSphere Studio</Link>                                                     // 24px/26.4/400
        <button aria-label="Menu" class="relative h-11 w-11 overflow-hidden">                       // 44x44, sits at right, vertically centred on the 38px row (top -3px)
          <span class="absolute left-3 top-[15px] h-[2px] w-5 rounded-[10px] bg-[#60544d]"/>          // "Top" bar
          <span class="absolute left-3 top-[27px] h-[2px] w-5 rounded-[10px] bg-[#60544d]"/>          // "Bottom" bar (12px below)
        </button>
      </div>
      // ---- only rendered/visible when open ----
      <div class="nav-links-container flex flex-col items-start gap-8 p-[2px] overflow-clip">      // 134px tall: 3 x 22 + 2 x 32
        SwapLink x3 (same type as desktop) — each animates in: opacity 0 -> 1, y 12 -> 0 (FadeUp)
      </div>
      <div class="button_group w-full flex justify-center items-center">
        PillButton variant="menu" size="md" className="w-full" "contact us" -> /contact               // 343 x 48, bg #60544d, white text 16px/500/-0.2 uppercase
      </div>
    </div>
  </div>
</nav>
```
- Closed: nav height 38px (only the logo row visible; `overflow:hidden`).
- Open: nav grows to the full viewport height (`100dvh`), background rgb(240,235,230), links + CTA fade/slide in (FadeUp). The hamburger bars rotate into an X (top bar rotate 45deg, bottom -45deg, both move to the vertical centre). Animate height with a 0.4s ease. Clicking a link closes the menu.
- Body scroll is not locked on the original; you may leave it unlocked.
- Bottom spacing: hero starts 4px below the nav on tablet/phone (gap 4px), 8px on desktop (gap 8px). The page wrapper handles this gap — Navbar itself has no margin.

## Text content (verbatim)
- "design process", "projects", "services", "ArcSphere Studio", "contact us"

## Responsive summary
- >= 1200px: desktop row (3 links | centred logo | CTA), nav padding 12px, height 46px.
- < 1200px: logo + hamburger row (38px), expandable menu (see above). Nav padding 0.

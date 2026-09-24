# ArcSphere Studio — Page Topology

Source: the project reference. Desktop reference 1440px wide, page height 9814px.
Breakpoints used by the original: phone < 810px, tablet 810–1199px, desktop >= 1200px.

## Global layout
- `<body>` background `rgb(240,235,230)`. Lenis smooth scroll on `<html>` (lerp ~0.1).
- One column wrapper ("content"): `display:flex; flex-direction:column; align-items:center; padding:12px` (desktop) / `8px` (tablet & phone); `gap:112px` (desktop) / `80px` (tablet & phone); `overflow:clip`.
- Full-bleed blocks (nav+hero, footer) span the whole content width (1416px at 1440). Every other section is `width: 93%` of the content width (1317px at 1440), centered.
- No fixed/sticky header. The nav scrolls away. Only sticky element: the hero image box (see hero).
- Framer "Made in Framer" badge (fixed bottom-right) is platform branding and is NOT built.

## Sections (top to bottom, desktop coordinates at 1440px)
| # | Section | Component | Rect (x,y,w,h) | Interaction model |
|---|---------|-----------|----------------|-------------------|
| 0 | Nav | `Navbar.tsx` | 12,12,1416,46 | click (mobile menu), hover text-swap links; intro fade-in |
| 1 | Hero | `HeroSection.tsx` | 12,66,1416,1260 (sticky image box 810 tall + 450 runway) | scroll-driven (image scale, side images slide in, text fades) + intro text reveal |
| 2 | About | `AboutSection.tsx` | 62,1438,1317,493 | static + text reveal |
| 3 | Stats ticker | `StatsTicker.tsx` | 12,2011,1416,31 | time-driven marquee 40px/s |
| 4 | Featured projects | `ProjectsSection.tsx` (+ `ProjectCard.tsx`) | 62,2154,1317,934 | hover (image scale, underline, arrow fly) |
| 5 | Services | `ServicesSection.tsx` (+ `ServiceRow.tsx`, `ServiceModal.tsx`) | 62,3200,1317,1255 | hover (image slide-in) + click (detail modal) |
| 6 | Expertise | `ExpertiseSection.tsx` | 62,4567,1317,778 | hover (overlay expand, stat slide-in, cursor pill) |
| 7 | Process | `ProcessSection.tsx` (+ `ProcessCard.tsx`) | 62,5458,1317,556 | hover (grid overlay, icon recenters) |
| 8 | Reviews | `ReviewsSection.tsx` | 62,6126,1317,668 | click-driven slider (avatars) |
| 9 | Quote CTA | `QuoteCtaSection.tsx` | 62,6906,1317,573 | static + text reveal |
| 10 | Contact | `ContactSection.tsx` | 62,7591,1317,737 | form (focus, radio select, submit hover) |
| 11 | Footer | `Footer.tsx` | 12,8440,1416,1367 | hover (text-swap links, icon buttons expand, underline), marquee ~100px/s |

## Assembly (src/app/page.tsx)
```
<main class="flex flex-col items-center overflow-clip p-2 desktop:p-3 gap-20 desktop:gap-28">   // 80 / 112
  <div class="w-full"> <Navbar/> <HeroSection/> </div>   // nav+hero share one full-width block (gap 8px between nav and hero)
  <div class="w-full flex flex-col items-center gap-12 desktop:gap-20"> <AboutSection/> <StatsTicker/> </div>  // 48 / 80
  <ProjectsSection/> <ServicesSection/> <ExpertiseSection/> <ProcessSection/> <ReviewsSection/>
  <QuoteCtaSection/> <ContactSection/> <Footer/>
</main>
```
Anchors: `#hero`, `#about-section`, `#services`, `#design-process`, `#footer`.

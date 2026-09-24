# ProjectsSection + ProjectCard Specification

## Overview
- **Target files:** `src/components/sections/ProjectsSection.tsx`, `src/components/sections/ProjectCard.tsx`
- **Screenshots:** `docs/design-references/full-desktop-1440.png` (y 2154–3088), `docs/design-references/project-hover.png` (first card hovered)
- **Interaction model:** hover-driven per card (image scale 1.03, title underline slides in, arrow flies). "View more projects" has FadeUp appear.

## Shared primitives
- `SectionHeading` (heading "FEATURED PROJECTS", subtitle max 421).
- `UnderlineLink` (size md) for card titles and "View more projects".
- `ArrowButton` with `parentGroup` (so the card's `group` hover drives it).
- `FadeUp` for the "View more projects" link.
- Content: `PROJECTS`, `PROJECTS_SECTION` from `@/lib/content`.

## DOM (desktop >= 1200)
```
<section class="section-width flex flex-col items-center gap-14 overflow-clip">           // 1317 x 934, gap 56
  <SectionHeading heading="FEATURED PROJECTS" subtitle=".."/>                              // 527 x 119
  <div class="flex w-full items-start justify-center gap-4 overflow-clip">                 // section-content 1317 x 674, gap 16
    <ProjectCard .../> x3   (each flex-1 => 428 wide)
  </div>
  <FadeUp><UnderlineLink href="/projects">View more projects</UnderlineLink></FadeUp>       // 175 x 29, centred
</section>
```

## ProjectCard — DOM
```
<article class="group flex flex-1 flex-col items-center gap-4 overflow-clip">              // 428 x 603 (card 2: 428 x 674), gap 16
  <Link href={project.href ?? "/projects"} class="relative block w-full overflow-clip rounded-[8px]" style="height: tall ? 583px : 512px">   // "wrapper"/project-img
    <img fill class="object-cover transition-transform duration-500 ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:scale-[1.03]"/>
  </Link>
  <div class="flex w-full flex-col items-start gap-2 overflow-clip">                        // info 428 x 75
    <div class="flex w-full items-center justify-between">                                  // 428 x 32
      <UnderlineLink href=...>{project.title}</UnderlineLink>                               // 16px/20.8/500/-0.2 uppercase, e.g. 206 x 29
      <ArrowButton href=... parentGroup/>                                                   // 32 x 32 circle (rendered bbox 44 due to rotation)
    </div>
    <div class="flex flex-col items-start gap-1">                                           // project-info gap 4
      <p class="whitespace-pre font-display text-[12px] font-normal uppercase leading-[1.3] tracking-[-0.2px] text-ink">{project.category}</p>
      <p class="... same">{project.meta}</p>
    </div>
  </div>
</article>
```

## Computed styles
- Image box: width 428 (flex 1 of 1317 with 2 x 16 gaps); height 512px for cards 1 and 3, 583px for card 2 (`tall: true`); border-radius 8px; overflow clip; `object-fit: cover`.
- Title: Inter Display 16px / 20.8px / 500 / -0.2px / uppercase / rgb(79,71,66) (UnderlineLink md). Underline 2px rgb(73,66,61).
- Category & meta: Inter Display 12px / 15.6px / 400 / -0.2px / uppercase / rgb(79,71,66).
- Arrow button: 32px, 1px border rgb(79,71,66), arrow color rgb(79,71,66).

## States & Behaviors
- Card hover (whole card is the `group`): image `scale(1) -> scale(1.03)`, 0.5s ease; title underline slides in (UnderlineLink is its own group — also make it respond to the card hover by adding `group-hover:[&_span[aria-hidden]]:translate-x-0` OR simply wrap: the original triggers the underline only when hovering the title itself; keep UnderlineLink's own hover). Arrow: fly animation via `parentGroup`.
- "View more projects": FadeUp (opacity 0, y 12) on scroll into view. Underline slides in on hover.
- Section heading: TextReveal (built in).

## Tablet & phone (< 1200)
```
<section class="section-width flex flex-col items-center gap-6 overflow-clip">            // gap 24
  <SectionHeading/>
  <div class="flex w-full flex-col items-start gap-8 overflow-clip">                       // gap 32; each card 685 x 413 (tablet) / 334 x 413 (phone)
    <ProjectCard/> x3 — card gap 12; image height 326px for ALL cards (no tall variant); info block identical (title 16px, meta 12px)
  </div>
  <FadeUp><UnderlineLink>View more projects</UnderlineLink></FadeUp>
</section>
```
- Each card also gets a FadeUp appear (opacity 0, y 12) on tablet/phone.

## Assets
- `/images/project-corporate-office.png` (419x515), `/images/project-serenity-villa.jpg` (980x1469), `/images/project-minimalist-apartment.png` (419x515).

## Text (verbatim)
1. "Corporate Office space" — "Commercial Architecture" — "new york, 2026" (href none -> use /projects)
2. "Serenity Villa" — "Residential Architecture" — "Dubai, 2025" (href /projects/serenity-villa)
3. "Minimalist Appartment interior" — "Residential Architecture" — "london, 2025"
- Heading "FEATURED PROJECTS"; subtitle "A selection of our recent architecture and interior design work."; link "View more projects" -> /projects

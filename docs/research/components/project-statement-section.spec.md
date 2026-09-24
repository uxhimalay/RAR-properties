# the project reference — hero section (project reference spec)

Measured 2026-09-21 from the live page. Rebuilt in `src/components/sections/StatementSection.tsx`
(the blank black section between the partners ribbon and the scattering photos).

- Listed at `the project reference`, which is only a wrapper: the
  page is an `<iframe>` of **the project reference All measurements are taken from the
  source, at device pixel ratio 1, after `networkidle` + 4s.
- The section built is `main > section.relative.min-h-[calc(100svh-5rem)].overflow-hidden`, the
  first child of `<main>`. The site's `<header>` is a **sibling** of that section, not part of it.

## Tokens

| Token | Value |
| --- | --- |
| Background | `rgb(5, 5, 5)` |
| Foreground | `rgb(245, 245, 245)` |
| Muted | `rgb(107, 107, 114)` |
| Accent (emerald-500) | `#00BC7B` |
| Sans | Onest — 400 / 500 / 600, stack `Onest, "Onest Fallback", -apple-system, "system-ui", "Segoe UI", sans-serif` (the quotes around `system-ui` are load-bearing) |
| Serif italic | Instrument Serif — 400 italic |
| Mono | Geist Mono — 400 |
| Breakpoints | `md` 768px, `lg` 1024px (Tailwind defaults, NOT this project's 810/1200) |
| Gutters | `px-6 md:px-10 lg:px-14` → 24 / 40 / 56 |

## Layout (1440 × 900)

Section 1440 × 820 (`min-h-[calc(100svh-5rem)]`, `overflow-hidden`), four layers:

1. **Watermark** — `absolute inset-0 flex items-center justify-center`, `aria-hidden`.
   One `<span>` "the project reference": `26vw` / `md:19vw` (273.6px at 1440), weight 600, tracking `-0.05em`,
   `leading-none`, `whitespace-nowrap`, `select-none`, colour white at **0.045** alpha.
   Measured box 808 × 274 at (316, 273) relative to the section. Static — no animation.
2. **Portrait** — `absolute inset-0 flex justify-center items-start pt-4`.
   Inner `relative h-full w-auto` with `aspect-ratio: 1850 / 1720` → 864.77 × 804 at x 288.
   Mask on the inner box, both prefixes:
   `linear-gradient(to bottom, black 0%, black 58%, transparent 92%)`.
   `<img>` fills it, `object-contain object-top`, `sizes="(max-width: 768px) 100vw, 100vh"`.
   Source file `/hero.png`, 1850 × 1720 PNG with alpha — saved to `public/project/statement-portrait.png`.
3. **Content** — `absolute inset-x-0 bottom-0 z-10 px-6 md:px-10 lg:px-14 pb-8 md:pb-10`,
   holding `grid grid-cols-12 gap-x-6 gap-y-7 items-end` (24px / 28px gaps).
   - Left column `col-span-12 md:col-span-7` (764.66px at 1440):
     - Badge: `inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6`,
       border `rgba(0,188,123,0.30)`, fill `rgba(0,188,123,0.07)`, `backdrop-blur-md` (12px).
       Dot: `size-2` emerald, with a second copy behind it at `opacity-75 animate-ping`.
       Label: 11px Geist Mono, uppercase, tracking `0.18em` (1.98px), white at 0.9.
       Measured 393.78 × 30.5. **Note: this is `whitespace-nowrap` and overflows a 390px phone —
       the source clips it with the section's `overflow-hidden`. Reproduced as measured.**
     - `<h1>`: `clamp(2rem, 5.4vw, 5.25rem)` (77.76px at 1440), weight 600, tracking `-0.03em`,
       `leading-[1.04]` (73.87px), `text-balance`, `max-w-3xl` (768px).
       Reads: **Designing products that work** *under real-world* **pressure.**
       The roman words are each wrapped for the reveal (below); the italic run is one plain span,
       Instrument Serif italic 400 at white 0.85.
       Lines at 1440: "Designing products" / "that work under" / "real-world pressure."
   - Right column `col-span-12 md:col-span-4 md:col-start-9 md:pb-2` (426.66px):
     - `<p>`: 14px / `md:15px`, white at 0.7, `leading-relaxed` (1.625), `mb-6`, `max-w-md` (448px),
       `text-pretty`.
     - Links row `flex items-center gap-5`:
       - `#work` — "See selected work", 14px weight 500, with a 1px underline at white 0.4
         (`pb-0.5`) that goes solid white on hover; a 16px lucide arrow-down that drops 4px on
         hover (`group-hover:translate-y-1`). Transitions 0.15s `cubic-bezier(0.4, 0, 0.2, 1)`.
       - `#contact` — "Let’s talk →", 14px, muted, white on hover. The arrow is **not** in the
         reference's copy of Onest: it is painted by `Onest Fallback`, the metric-adjusted local
         face next/font generates beside it, at 14.72px against 14px for plain `sans-serif`. The
         copy of Onest fetched here does carry an arrow, 9.81px wide, so the glyph is pinned to
         `Onest Fallback` by name. Link width then measures 78.27px against the reference's 78.25.
4. **Ticker** — `absolute inset-x-0 bottom-0 translate-y-full z-10`, i.e. it sits in the ~28px strip
   **below** the section. `px-6 md:px-10 lg:px-14 pt-3 grid grid-cols-3 gap-4`, Geist Mono 10px,
   uppercase, tracking `0.2em`, muted at 0.6. Cells: `№ 01` / `Edition 2026 · v1.0`
   (`hidden md:block`) / right-aligned `🇪🇬 Cairo ·` then a `size-1.5` emerald dot on
   `animate-pulse`, the live Cairo time as `HH:MM`, and `EET` in solid muted.
   Server-renders as `--:--` and fills in on hydration.

## Entrance (measured frame by frame)

Runs once on load. No scroll parallax, no mouse parallax — both tested and confirmed absent.
Every curve below was fitted to the recorded frames; each is an **overdamped spring**, quoted as the
two real roots of its characteristic equation and the framer-motion `stiffness`/`damping` that give
them (mass 1, `stiffness = r₁r₂`, `damping = r₁ + r₂`).

| Element | From | Roots | stiffness / damping | Delay |
| --- | --- | --- | --- | --- |
| Portrait wrapper | `opacity 0`, `y 20px` | −6.86, −60 | 410 / 67 | 0 |
| Heading words | `opacity 0`, `y 110%` | −10.05, −60 | 600 / 70 | 0, +0.06 each |
| Left column | `opacity 0`, `y 14px` | −4.72, −16 | 75 / 21 | +0.31 |
| Right column | `opacity 0`, `y 14px` | −4.72, −16 | 75 / 21 | +0.49 |

Fit check for the words (measured vs. model): 0.16/0.159 at 32ms, 0.49/0.475 at 82ms,
0.69/0.681 at 132ms, 0.81/0.807 at 182ms, 0.89/0.883 at 232ms.

The words therefore begin rising **while their own column is still at opacity 0**, and only the last
third of the rise is actually visible. That is what the source does; it is reproduced, not corrected.

Each word sits in a wrapper: `display:inline-block; overflow:hidden; vertical-align:top;
padding-bottom:0.1em; margin-right:0.25em` (`0` on the last word of a run), so the word is clipped
as it rises. The badge, the watermark and the ticker do not animate in.

## Responsive (measured)

| | 390 | 810 | 1440 |
| --- | --- | --- | --- |
| Section | 390 × 764 | 810 × 1000 | 1440 × 820 |
| h1 | 32px / lh 30.4 | 43.74px | 77.76px |
| Watermark | 101.4px (26vw) | 153.9px (19vw) | 273.6px (19vw) |
| Portrait box | 805 × 748, x −207 | 1058 × 984, x −124 | 864.77 × 804, x 288 |
| Columns | both `col-span-12`, stacked, 28px apart | 7 / 4 side by side | 7 / 4 side by side |
| Gutter | 24 | 40 | 56 |
| Ticker middle cell | hidden | shown | shown |

## Deliberate departures

1. **No site header.** The source's `<header>` is a sibling of the section, and this project already
   has its own fixed navigation. building it would stack two navigation bars. The section is
   therefore `min-h-svh` rather than `calc(100svh - 5rem)`, so the composition still fills a screen.
2. **The ticker is gone**, removed on the user's instruction on 2026-09-23. It was the mono strip
   along the bottom edge: `№ 01`, `Edition 2026 · v1.0` and the live Cairo clock. Its measurements
   are in the Content section above, and it had been placed in flow at the end of the section rather
   than `translate-y-full` outside it, so it could not paint over the section that follows. The
   section is now exactly one screen tall. Geist Mono went with it: nothing else used that face.
3. **Triggered by `useInView` (once, 35% visible)** instead of on page load, because the section is
   in the middle of a page rather than at the top of one. Delays and curves are unchanged.
4. `prefers-reduced-motion` skips the entrance and paints the final state.
5. **The heading is an `<h2>`, not the reference's `<h1>`.** This page already has one, and two would
   be a real defect. Every type value is set explicitly, so the rendering is identical.
6. The ticker carries 20px of bottom padding, which the reference does not need because the strip is
   cut off by the fold.
7. **The availability badge is gone**, removed on the user's instruction on 2026-09-23. It was the
   pill above the heading: an emerald hairline, a 7% emerald fill, a `backdrop-blur-md`, a dot with
   a second copy behind it on `animate-ping`, and "Available for Senior Product Design roles" in
   11px Geist Mono at 0.18em tracking. Its measurements stay in the Content section above, so it can
   be put back. Nothing else moved: the block is anchored to the bottom edge.

---

## 2026-09-24 — made the project's own

The section is no longer a copy of anyone. Every word and the photograph come from the content
document (`statement` in `data/site.json`, edited on the admin's Statement screen), so nothing is
hard-coded and no name from the reference remains anywhere in the project.

Added at the same time:

- **Parallax.** Across a full pass of the section the word behind travels 90px one way and the
  portrait 36px the other, giving up to 113px of separation (measured); the portrait also breathes
  1.06 → 1 → 1.06. Both run through a spring (stiffness 70, damping 22, mass 0.6) so the movement
  settles rather than stopping dead with the scroll.
- **Gold.** The word behind is the site's gold at 7%, the italic run of the heading is the light
  gold, a gold hairline draws itself in above the right column, and the underline beneath the first
  link wipes across in gold on hover.
- **Pointer.** A 38rem gold radial light follows the cursor, and the word leans up to 14px towards
  it. Both are written to motion values, so neither re-renders the tree.
- **Hover.** The portrait lifts 8px and scales 1.015 on a spring and the photograph brightens; the
  arrow travels; both links go to the light gold.

`prefers-reduced-motion` keeps the gold and the layout and drops every one of those movements.

# Alignment, spacing and type consistency — 2026-09-24

Measured first (four viewport widths, settled states, real rendered boxes), then changed. The agreed
values now live in `src/lib/design.ts`; a component that needs one of these roles imports it.

## Where each section's writing starts

| | 1440 before | 1440 after | 1728 before | 1728 after |
| --- | --- | --- | --- | --- |
| Hero, work band, listings, property page | 40 | 40 | 104 | 104 |
| Categories, hot deals, services | 40 | 40 | **40** | **104** |
| Footer | **16** | **40** | **16** | **104** |
| built section | 56 | 56 | 56 | 56 |

## What changed

1. **The footer** used an 8/16px side margin where every other section used 20/40, so it sat 24px
   left of the page. Its contact grid, its wordmark block and its bottom bar now share the standard
   container. Three separate margins became one.
2. **The three pinned panels had no width cap.** Everything else stopped at 1600px and centred, so
   above a 1600px viewport the panels drifted up to 64px left of the hero. `SteppedPanelSection`'s
   content wrapper now carries the same cap, as do the services rail's header and chrome rows.
3. **The services rail's first card** kept a flat 40px inset, which would have left it out of step
   with its own capped header on a wide screen. `railInset()` widens the inset in step with the cap.
4. **The small uppercase label** existed twice: 11px with 0.44px tracking almost everywhere, and
   12px/14px with 0.04em tracking in the work band. The work band now uses the same one, and the six
   files that each retyped the string import it instead.
5. **Section headings** were 50, 50 and 44. The services heading joins the other two at 32/50.
6. **Page headings** were 40/64/80 on the listings page and 44/72/96 on a property page. Both are
   40/64/80 now.
7. **Top padding** on the pinned block was 80/100/120 in the work band and 80/96/96 in the panels.
   All are 80/96/96.

## Left alone, deliberately

- **The built section** (`StatementSection`) keeps its own 24/40/56 gutters and its own 768/1024
  breakpoints. It is a ditto project build of another site's hero; matching it to this page's grid would
  undo the thing that was built.
- **The hero and the closing CTA** keep their own 14px label with negative tracking, from their own
  references, and the CTA keeps its 64px heading. They are the two full-screen built moments.
- **The hot-deals header** stays right-aligned against a 50% column. That is a deliberate mirror of
  the panel's notch, not a misalignment.

## Note

The work band's heading measures a few pixels right of the others in an audit. That is the
`hero-heading` reveal preset starting each word 5px across; it lands at 0 once the reveal plays.

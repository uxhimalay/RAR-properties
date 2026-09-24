/* ------------------------------------------------------------------------------------------------
 * The page's shared measurements.
 *
 * Written on 2026-09-24 after an audit found the same role spelled three different ways: the small
 * uppercase label existed at 11px and at 12/14px, section headings at 44, 50 and 64, and the footer
 * sat 24px further left than every other section. These are the agreed values; a component that
 * needs one of these roles imports it rather than retyping it.
 *
 * Deliberately NOT covered, because each follows a project reference with its own system and
 * changing it would change the thing it was built to:
 * - HeroSection's label (14px, -0.03em tracking) and the scattering CTA that closes the page, both
 *   from their own references.
 * - StatementSection, built to a project reference down to its own 768/1024 breakpoints.
 * ---------------------------------------------------------------------------------------------- */

/** Small uppercase label: eyebrows, link labels, card meta. The most repeated type on the site. */
export const LABEL = "font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px]";

/** A section's heading inside a panel: categories, hot deals, services. */
export const HEADING_SECTION =
  "font-display text-[32px] font-normal uppercase leading-[1.1] tracking-[-0.02em] tablet:text-[50px] tablet:leading-[55px]";

/** A page's own title: the listings page, a property page. */
export const HEADING_PAGE =
  "font-display text-[40px] font-normal uppercase leading-[1.05] tracking-[-0.03em] tablet:text-[64px] desktop:text-[80px]";

/** Side gutters. 20px on a phone, 40px from 810px up; every section on the page uses these. */
export const GUTTER = "px-5 tablet:px-10";

/**
 * The content column. The hero, the navigation, the work band, the listings and the property page
 * already capped at 1600 and centred; the three pinned panels and the footer did not, so above a
 * 1600px viewport their headings drifted up to 64px left of everything else.
 */
export const CONTENT_MAX = "mx-auto w-full max-w-[1600px]";

/** Gutters and the cap together, which is what most containers want. */
export const CONTENT = `${CONTENT_MAX} ${GUTTER}`;

/** Space above a section's first line. Matches across the pinned block. */
export const PAD_TOP = "pt-20 tablet:pt-24";

/** The width the content column is capped at, for anything that has to do the arithmetic itself. */
export const CONTENT_MAX_PX = 1600;

/** Left inset that lines a full-bleed rail's first item up with the capped content column. */
export const railInset = (viewportWidth: number, gutter = 40) =>
  Math.max(gutter, (viewportWidth - CONTENT_MAX_PX) / 2 + gutter);

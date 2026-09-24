/**
 * Shared scroll-choreography helpers.
 */

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Easing for a section taking over the one before it (hero -> band). Applied to the linear scroll
 * progress so the rise has a beat of anticipation, sweeps up through the middle and settles into
 * place. easeInOutCubic; symmetric, so a scrub back reads the same in reverse.
 */
export const takeoverEase = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/** Side inset (px) a section arrives with before it lands full-bleed; matches the stepped panels. */
export const ARRIVAL_INSET = 20;

/**
 * Document-space top of an element's layout box, safe for sticky elements.
 *
 * `offsetTop` of a stuck `position: sticky` element (or of a stuck ancestor) reports the STUCK
 * position, which moves with the scroll, so a chain of offsetTops read while pinned is wrong by
 * however far the page has scrolled past the pin. Any re-measure that fires mid-scroll (a resize,
 * the body changing height as content loads or animates) then poisons every scroll range derived
 * from it. This neutralises stickiness for the duration of the read: each sticky node in the chain
 * is temporarily made `relative` with `top: auto`, the offsets are summed, and the inline overrides
 * are removed again in the same synchronous frame, so nothing is ever painted in the override state.
 */
export function layoutTop(el: HTMLElement): number {
  const overridden: { node: HTMLElement; position: string; top: string }[] = [];
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) {
    if (getComputedStyle(n).position === "sticky") {
      overridden.push({ node: n, position: n.style.position, top: n.style.top });
      n.style.position = "relative";
      n.style.top = "auto";
    }
  }
  let top = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) top += n.offsetTop;
  for (const o of overridden) {
    o.node.style.position = o.position;
    o.node.style.top = o.top;
  }
  return top;
}

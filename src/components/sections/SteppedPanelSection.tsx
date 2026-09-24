"use client";

import { useEffect, useRef, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { layoutTop } from "@/lib/motion";
import { CONTENT, PAD_TOP } from "@/lib/design";

/* ------------------------------------------------------------------------------------------------
 * SteppedPanelSection
 *
 * Shape taken from the project reference's accessibility section (measured 2026-09-18 at
 * 1440x900; see docs/research/components/stepped-panel-section.spec.md). Used three times on the
 * page: the third section (notch top-right, with the category header, tabs and dealt cards inside),
 * the fourth (notch top-left, black, the hot-deals bento) and the fifth (no notch: a plain white
 * panel that arrives, pins and is taken over exactly like the other two).
 *
 * - Section one viewport tall. `backdrop="transparent"` lets whatever is behind show through the
 *   notch and margins; `backdrop="black"` gives the project reference's own dark frame.
 * - A white panel whose top edge is stepped: one part starts at the panel's top, the other 80px
 *   lower, the step half a grid gutter (10px) off centre. `notch="right"` cuts the top-right,
 *   `notch="left"` mirrors it, `notch="none"` leaves the edge straight.
 * - As the section rises over whatever precedes it, its margins close: 20px from the left, right
 *   and bottom (the source's inset) while still below the fold, shrinking in step with the scroll
 *   to 0 once the section is in position, so the white ends up filling the viewport edge to edge
 *   with the step shape kept.
 * - `tone`: the panel is white (the project reference's) or black (the fourth section, on request).
 * - The section is at least one viewport tall and grows with its content; the panel's margins are
 *   the animated insets, so a panel with more content than a viewport simply makes the section
 *   taller (the fourth section's process grid needs this).
 * - The section clips with `overflow: clip`, not `hidden`: `hidden` would make the section the scroll
 *   container for anything `position: sticky` inside it (the fifth section's pinned stage), so it
 *   would never stick to the viewport. `clip` clips the same but creates no scroll container.
 * - `contentClassName` replaces the content wrapper's default padding, for content that must fill
 *   the panel edge to edge (the fifth section's video). The default padding is 20/40px on the sides
 *   and bottom but 80/96px on top: the navbar is fixed (56px once scrolled), and a panel pinned at
 *   the top of the viewport would otherwise hide its first line beneath it.
 * - `dwell`: viewports of scroll the section holds, finished and untouched, before the next one
 *   starts rising over it. Without it a section exactly one viewport tall is taken over the instant
 *   it lands, which reads as the next section arriving too fast. It is rendered as an empty block
 *   after the section: the section is sticky, so it simply stays on screen while that block passes,
 *   and the takeover range is pushed back by the same amount so nothing fades early. `dwellPhone`
 *   overrides it below 810px, where vertical scroll is dearer.
 * - `pinned`: the section stays pinned while the next section rises over it, and across that
 *   viewport of scroll something fades 1 -> 0 and scales 1 -> 0.9: with `fade="content"` (default)
 *   just what is inside the panel, so the panel itself stays as the backdrop the next one rises
 *   against; with `fade="panel"` the whole panel, which uncovers the black band pinned beneath. Pair
 *   it with a wrapper block in page.tsx so the pin releases when the block ends.
 *
 * Below 810px the insets and notch scale down (the source swaps to a different mobile layout there;
 * those values are an interpolation, not a measurement).
 * ---------------------------------------------------------------------------------------------- */

/**
 * The stepped top edge. On the source the step sits half a grid gutter off centre (50% +/- 10px on
 * desktop, +/- 8px on phone) and the lower part is 80px (48px) down. `scale` shortens the notch:
 * the step moves toward the notched corner by that factor (0.6 = the notch is 40% narrower), which
 * the user asked for on the fourth section.
 */
function notch(side: "right" | "left", scale: number) {
  const d = (w: string, depth: string) =>
    side === "right"
      ? `polygon(0 0, calc(100% - (${w}) * ${scale}) 0, calc(100% - (${w}) * ${scale}) ${depth}, 100% ${depth}, 100% 100%, 0 100%)`
      : `polygon(0 ${depth}, calc((${w}) * ${scale}) ${depth}, calc((${w}) * ${scale}) 0, 100% 0, 100% 100%, 0 100%)`;
  // `w` is the notch's own width at scale 1: the part of the edge beyond the step.
  return { desktop: d("50% - 10px", "80px"), phone: d("50% - 8px", "48px") };
}

/** The panel's inset from the left, right and bottom before the takeover (source: 20px; 16px on phone). */
const INSET_DESKTOP = 20;
const INSET_PHONE = 16;
const PHONE_QUERY = "(max-width: 809px)";
const TAKEOVER_SCALE = 0.9;

function subscribeToPhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export interface SteppedPanelSectionProps {
  notch?: "right" | "left" | "none";
  /** Notch width as a fraction of the source's (1 = as measured, 0.6 = 40% narrower). */
  notchScale?: number;
  tone?: "white" | "black";
  backdrop?: "transparent" | "black";
  pinned?: boolean;
  /** Viewports of scroll the section holds in place before the next one begins to rise over it. */
  dwell?: number;
  /** Same, below 810px; defaults to `dwell`. */
  dwellPhone?: number;
  fade?: "content" | "panel";
  className?: string;
  contentClassName?: string;
  /** DOM id, so in-page links can target the section. */
  id?: string;
  "aria-label"?: string;
  children?: ReactNode;
}

/** The right notch exactly as measured on the source (kept verbatim for the third section). */
const NOTCH_RIGHT_SOURCE = {
  desktop: "polygon(0 0, calc(50% + 10px) 0, calc(50% + 10px) 80px, 100% 80px, 100% 100%, 0 100%)",
  phone: "polygon(0 0, calc(50% + 8px) 0, calc(50% + 8px) 48px, 100% 48px, 100% 100%, 0 100%)",
} as const;

export function SteppedPanelSection({
  notch: notchSide = "right",
  notchScale = 1,
  tone = "white",
  backdrop = "transparent",
  pinned = false,
  dwell = 0,
  dwellPhone,
  fade = "content",
  className,
  contentClassName,
  id,
  "aria-label": ariaLabel,
  children,
}: SteppedPanelSectionProps) {
  const isPhone = useSyncExternalStore(subscribeToPhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const baseInset = isPhone ? INSET_PHONE : INSET_DESKTOP;
  const hold = pinned ? Math.max(0, isPhone ? (dwellPhone ?? dwell) : dwell) : 0;
  const notchShape =
    notchSide === "none" ? { desktop: "none", phone: "none" } : notchSide === "right" && notchScale === 1 ? NOTCH_RIGHT_SOURCE : notch(notchSide, notchScale);

  // Layout position and viewport height, measured; both scroll ranges derive from them.
  const sectionRef = useRef<HTMLElement>(null);
  const layout = useRef({ top: 0, vh: 1, h: 1 });
  const measured = useMotionValue(0);
  /** Sticky `top`: 0, or negative when the section is taller than the viewport (bottom-aligned pin). */
  const pinTop = useMotionValue("0px");
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const measure = () => {
      // Sticky-safe: a pinned section's offsetTop follows the scroll, and this can run mid-scroll.
      layout.current = { top: layoutTop(el), vh: window.innerHeight, h: el.offsetHeight };
      pinTop.set(`${Math.min(0, window.innerHeight - el.offsetHeight)}px`);
      measured.set(measured.get() + 1); // nudge dependants to re-evaluate with the new layout
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measured, pinTop]);
  const { scrollY } = useScroll();
  const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
  // 0 while the section's top is at or below the viewport bottom, 1 once it has reached the top.
  const entrance = useTransform([scrollY, measured], ([y]: number[]) => clamp01((y - (layout.current.top - layout.current.vh)) / layout.current.vh));
  // 0 while this section sits in position (pinned, bottom-aligned if taller than the viewport), 1 once
  // the next section has fully risen over it.
  const takenOver = useTransform([scrollY, measured], ([y]: number[]) => {
    const { top, vh, h } = layout.current;
    // The section is in position once its bottom is reached; the takeover starts a hold later.
    return pinned ? clamp01((y - (top + Math.max(0, h - vh) + hold * vh)) / vh) : 0;
  });
  const inset = useTransform(entrance, (p) => baseInset * (1 - p));
  const minHeight = useTransform(inset, (v) => `calc(100svh - ${v}px)`);
  const fadeOpacity = useTransform(takenOver, [0, 1], [1, 0]);
  const fadeScale = useTransform(takenOver, [0, 1], [1, TAKEOVER_SCALE]);
  const fadeStyle = { opacity: fadeOpacity, scale: fadeScale };

  return (
    <>
    <motion.section
      ref={sectionRef}
      id={id}
      aria-label={ariaLabel}
      className={cn("relative min-h-svh w-full overflow-clip", pinned && "sticky", backdrop === "black" && "bg-black", className)}
      style={{ top: pinned ? pinTop : undefined, ["--notch-desktop" as string]: notchShape.desktop, ["--notch-phone" as string]: notchShape.phone } as CSSProperties}
    >
      {/* The panel with the stepped top edge; the notch reveals what is behind. Its side and bottom
          margins close as the section's own entrance completes; when pinned, either its content or the
          whole panel fades and scales away as the next section rises over it. */}
      <motion.div
        className={cn("relative flex flex-col [clip-path:var(--notch-phone)] tablet:[clip-path:var(--notch-desktop)]", tone === "black" ? "bg-black" : "bg-white")}
        style={{ marginLeft: inset, marginRight: inset, marginBottom: inset, minHeight, ...(fade === "panel" ? fadeStyle : {}) }}
      >
        {children ? (
          <motion.div className={cn("w-full flex-1", contentClassName ?? `${CONTENT} ${PAD_TOP} pb-5 tablet:pb-10`)} style={fade === "content" ? fadeStyle : undefined}>
            {children}
          </motion.div>
        ) : null}
      </motion.div>
    </motion.section>
    {/* The hold: nothing to see, it only lengthens the scroll the pinned section stays on screen for. */}
    {hold > 0 ? <div aria-hidden="true" className="w-full shrink-0" style={{ height: `${hold * 100}svh` }} /> : null}
    </>
  );
}

export default SteppedPanelSection;

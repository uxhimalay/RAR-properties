"use client";

import { useRef, useSyncExternalStore } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useSiteContent } from "@/lib/cms/context";
import { RollLabel } from "@/components/ui/RollLabel";

/* ------------------------------------------------------------------------------------------------
 * ScatterCtaSection
 *
 * Built to the project reference's scroll-animation section (measured
 * 2026-09-19; docs/research/components/scatter-cta-section.spec.md).
 *
 * - The section is one viewport plus TRAVEL px tall; a stage one viewport tall pins for that TRAVEL.
 * - Eight square photos start stacked dead centre (445px, 300 on phone). As the stage is scrolled
 *   through they scatter: each moves to its own offset and shrinks to its own scale, linearly with
 *   the scroll (the exact offsets and scales measured on the source, which uses the same pixel
 *   values at every breakpoint). The last photo in the DOM paints on top of the stack.
 * - Over the final 27% of the travel the headline, line and button fade in and grow from 0.9 to 1.
 * - The stage releases exactly when the scatter completes; the section then scrolls away.
 * - The button: 1px border, transparent; on hover it fills with ink in 400ms while its label rolls
 *   up to a white copy and its arrow slides out diagonally as a white one slides in (300ms).
 * - Two hairlines run the full height 16px in from each edge (8px on phone), as on the source.
 *
 * Colours are the site's own (cream, ink), photos and copy ours; nothing else deviates.
 * ---------------------------------------------------------------------------------------------- */

/** Pinned scroll length; the scatter runs linearly across it (shorter on phone: less to scroll). */
const TRAVEL = 1000;
const TRAVEL_PHONE = 700;
/** The text appears over the last part of the travel. */
const TEXT_FROM = 0.73;
/** Stack size (source: 445 desktop, 300 phone). */
const BOX_DESKTOP = 445;
const BOX_PHONE = 300;
const LINE_INSET_DESKTOP = 16;
const LINE_INSET_PHONE = 8;
const PHONE_QUERY = "(max-width: 809px)";

/** Final scale and offset (px from the stack centre) for each DOM position, bottom of the stack first. */
const SCATTER = [
  { s: 0.3, x: -554, y: -279 },
  { s: 0.5, x: -517, y: 187 },
  { s: 0.3, x: -288, y: 372 },
  { s: 0.35, x: 239, y: -395 },
  { s: 0.4, x: 496, y: -284 },
  { s: 0.4, x: 392, y: 166 },
  { s: 0.3, x: 449, y: 357 },
  { s: 0.4, x: -364, y: -396 },
];

/** On a phone canvas the same offsets would fly every photo off screen; keep them on the edges instead. */
const SCATTER_PHONE = SCATTER.map((t) => ({ s: Math.min(1, t.s * 1.25), x: Math.round(t.x * 0.4), y: Math.round(t.y * 0.62) }));

const INK = "var(--color-ink)";
const INK_SOFT = "var(--color-ink-2)";
const LINE = "rgba(79, 71, 66, 0.18)";
const BORDER = "rgba(79, 71, 66, 0.35)";

function subscribeToPhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/** The source's 12x12 up-right arrow (its `#svg10082115308` symbol). */
function ArrowNE({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 12" width="12" height="12" className={className} aria-hidden="true">
      <path d="M 10.154 1.5 L 10.154 8.238 L 9.465 8.238 L 9.465 2.768 L 2.328 10.5 L 1.846 9.953 L 8.96 2.246 L 3.911 2.246 L 3.911 1.5 Z" fill="currentColor" />
    </svg>
  );
}

/** The source's button: bordered, hover fills with ink, label and arrow roll. */
export function RollButton({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="group relative inline-flex h-11 items-center gap-2 border px-4 py-3 outline-none transition-colors duration-[400ms] ease-out hover:bg-[var(--color-ink)] focus-visible:bg-[var(--color-ink)]"
      style={{ borderColor: BORDER }}
    >
      <RollLabel className="font-inter text-[14px] font-medium uppercase tracking-[-0.42px]" restClassName="text-ink" hoverClassName="text-white">
        {children}
      </RollLabel>
      <span className="relative block h-3 w-3 overflow-hidden" aria-hidden="true">
        <ArrowNE className="absolute inset-0 text-ink transition-transform duration-300 ease-out group-hover:translate-x-3 group-hover:-translate-y-3 group-focus-visible:translate-x-3 group-focus-visible:-translate-y-3" />
        <ArrowNE className="absolute inset-0 -translate-x-3 translate-y-3 text-white transition-transform duration-300 ease-out group-hover:translate-x-0 group-hover:translate-y-0 group-focus-visible:translate-x-0 group-focus-visible:translate-y-0" />
      </span>
    </a>
  );
}

function ScatterImage({ index, photo, progress, box, phone }: { index: number; photo: { src: string; alt: string }; progress: MotionValue<number>; box: number; phone: boolean }) {
  const target = (phone ? SCATTER_PHONE : SCATTER)[index % SCATTER.length];
  const x = useTransform(progress, [0, 1], [0, target.x]);
  const y = useTransform(progress, [0, 1], [0, target.y]);
  const scale = useTransform(progress, [0, 1], [1, target.s]);
  return (
    <motion.div className="absolute inset-0" style={{ x, y, scale }}>
      <Image src={photo.src} alt={photo.alt} fill sizes={`${box}px`} className="object-cover" draggable={false} />
    </motion.div>
  );
}

export function ScatterCtaSection() {
  const { visit } = useSiteContent();
  const isPhone = useSyncExternalStore(subscribeToPhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const box = isPhone ? BOX_PHONE : BOX_DESKTOP;
  const inset = isPhone ? LINE_INSET_PHONE : LINE_INSET_DESKTOP;
  const travel = isPhone ? TRAVEL_PHONE : TRAVEL;
  const ref = useRef<HTMLElement>(null);
  // 0 when the section's top reaches the viewport top (the stage pins), 1 when its bottom reaches
  // the viewport bottom (the stage releases): exactly the TRAVEL px of pinned scroll.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const textOpacity = useTransform(scrollYProgress, [TEXT_FROM, 1], [0, 1]);
  const textScale = useTransform(scrollYProgress, [TEXT_FROM, 1], [0.9, 1]);
  const textEvents = useTransform(scrollYProgress, (p) => (p > TEXT_FROM + 0.1 ? "auto" : "none"));

  return (
    <section ref={ref} id="visit" aria-label="Book a visit" className="relative w-full" style={{ height: `calc(100svh + ${travel}px)` }}>
      <div className="sticky top-0 flex h-svh w-full flex-col items-center justify-center overflow-hidden bg-cream" style={{ gap: 36 }}>
        {/* the source's two hairlines, full height, just in from each edge */}
        <span aria-hidden="true" className="absolute inset-y-0 w-px" style={{ left: inset, backgroundColor: LINE }} />
        <span aria-hidden="true" className="absolute inset-y-0 w-px" style={{ right: inset, backgroundColor: LINE }} />

        {/* headline, line, button: hidden under the stack until the scatter is nearly done */}
        <motion.div className="relative flex w-full max-w-[600px] flex-col items-center gap-8 px-4 text-center tablet:gap-10 tablet:px-0" style={{ opacity: textOpacity, scale: textScale, pointerEvents: textEvents }}>
          <div className="flex flex-col items-center gap-3 tablet:gap-6">
            <h2 className="font-display text-[32px] font-normal uppercase leading-[32px] tracking-[-0.96px] tablet:text-[64px] tablet:leading-[64px] tablet:tracking-[-1.92px]" style={{ color: INK }}>
              {visit.heading}
            </h2>
            <p className="font-inter text-[16px] font-normal leading-[20px] tracking-[-0.48px] tablet:text-[20px] tablet:leading-[28px] tablet:tracking-[-0.6px]" style={{ color: INK_SOFT }}>
              {visit.paragraph}
            </p>
          </div>
          <RollButton href={visit.cta.href}>{visit.cta.label}</RollButton>
        </motion.div>

        {/* the stack: eight photos on one square, scattering with the scroll; the last paints on top */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-[1]" style={{ width: box, height: box, marginLeft: -box / 2, marginTop: -box / 2 }} aria-hidden="true">
          {visit.images.slice(0, SCATTER.length).map((photo, i) => (
            <ScatterImage key={`${photo.src}-${i}`} index={i} photo={photo} progress={scrollYProgress} box={box} phone={isPhone} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScatterCtaSection;

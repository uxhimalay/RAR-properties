"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { BittenTabs } from "@/components/ui/BittenTabs";
import { PROJECT_TABS } from "@/lib/content";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { useSiteContent } from "@/lib/cms/context";
import { categorySlug, propertiesFor, type Property } from "@/lib/cms/schema";
import { INFO_HEIGHT, INFO_HEIGHT_COMPACT, IMAGE_RATIO, PropertyCard } from "@/components/sections/PropertyCard";
import { EnquiryPanel } from "@/components/ui/EnquiryPanel";

/* ------------------------------------------------------------------------------------------------
 * CategoryShowcase
 *
 * The category tab bar plus a dealt row of the same 3D cards as the marquee in section two.
 *
 * Layout: the row always fills its width exactly, and every property card is the SAME size on every
 * tab. From the row width alone it picks how many slots fit (260px faces with 24px gaps as the
 * reference), then flexes the card width a few pixels so the slots span edge to edge. The property
 * cards take one slot each; the enquiry card takes whatever is left, so a category with fewer
 * listings ends on a wider action panel instead of stretching its cards (which is what made the
 * warehouse tab's cards larger than the residential tab's). Card height is the picture (260:300)
 * plus the fixed details block, so the row is even whatever the photos are.
 *
 * Choreography (the brief: "cards come from the right, and as they reach the left end each card
 * shows front; only as many as fit; design cinematically"):
 * - Cards start beyond the panel's right edge, edge-on (rotateY 90deg) under the same 1200px
 *   perspective as section two, so while travelling they show the same oblique sliver as the
 *   marquee panels. Each travels left to its slot with a fast launch and a long expo settle
 *   (1.4s, cubic-bezier(0.16, 1, 0.3, 1)); it stays edge-on for the first 45% of the flight and
 *   swings round to face front over the final stretch, landing as it opens.
 * - Launches are staggered 140ms apart in slot order, so the leftmost slot fills first and the
 *   row builds left to right, like a hand being dealt.
 * - Switching tabs sends the current cards off to the left, folding edge-on as they go (0.55s,
 *   the source's cubic-bezier(0.7, 0, 0.3, 1), 50ms stagger), then deals the next set from the
 *   right. Motion is always right to left, so the sequence reads as one continuous take.
 * - Each category shows a different rotation of the image set (there is no per-category
 *   content yet); the row plays once it has scrolled into view.
 * ---------------------------------------------------------------------------------------------- */

interface Geometry {
  /** Reference face width; the rendered width flexes around it to fill the row. */
  width: number;
  height: number;
  gap: number;
}

const DESKTOP_GEOMETRY: Geometry = { width: 260, height: 300, gap: 24 };
const PHONE_GEOMETRY: Geometry = { width: 152, height: 192, gap: 16 };
/** Below 1200px: a swipe row instead of a fitted hand; card width by device, height from the same rule. */
const COMPACT_QUERY = "(max-width: 1199px)";
const SWIPE_CARD = {
  phone: { width: 236, height: Math.round(236 * IMAGE_RATIO) + INFO_HEIGHT_COMPACT, gap: 12 },
  tablet: { width: 280, height: Math.round(280 * IMAGE_RATIO) + INFO_HEIGHT_COMPACT, gap: 16 },
};
const PHONE_HAND = 4;
const PHONE_QUERY = "(max-width: 809px)";
const PERSPECTIVE = 1200;
const RADIUS = 4;

const ENTER = { duration: 1.4, ease: [0.16, 1, 0.3, 1] as const, stagger: 0.14, holdEdgeOnUntil: 0.45 };
const EXIT = { duration: 0.55, ease: [0.7, 0, 0.3, 1] as const, stagger: 0.05, travel: 480 };

const IMAGE_SIZES = "(min-width: 1200px) 340px, 60vw";


function subscribeToPhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsPhone() {
  return useSyncExternalStore(subscribeToPhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
}
function subscribeToCompact(onChange: () => void) {
  const mq = window.matchMedia(COMPACT_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
function useIsCompact() {
  return useSyncExternalStore(subscribeToCompact, () => window.matchMedia(COMPACT_QUERY).matches, () => false);
}

function useGeometry(): Geometry {
  return useIsPhone() ? PHONE_GEOMETRY : DESKTOP_GEOMETRY;
}

/**
 * Slots that fill `rowWidth` edge to edge. The count and the card width come from the row's width
 * ONLY, never from how many properties a category happens to have, so a card is the same size on
 * every tab. Height = picture + the details block.
 */
function fit(rowWidth: number, g: Geometry) {
  const slots = Math.max(2, Math.round((rowWidth + g.gap) / (g.width + g.gap)));
  const width = (rowWidth - (slots - 1) * g.gap) / slots;
  return { slots, width, height: Math.round((width * g.height) / g.width) + INFO_HEIGHT };
}

type HandItem = ({ kind: "property"; key: string; property: Property } | { kind: "link"; key: string; property: null }) & { x: number; width: number };

/* ------------------------------------------------------------------------------------------------
 * Link card: the tabs' bitten-corner outline, filling with ink on hover (bite closes, as on the
 * source's buttons). Same two-layer construction as BittenTabs.
 * ---------------------------------------------------------------------------------------------- */

export function CategoryShowcase() {
  const reduceMotion = useReducedMotion();
  const geometry = useGeometry();
  const isPhone = useIsPhone();
  const isCompact = useIsCompact();
  const card = isPhone ? SWIPE_CARD.phone : SWIPE_CARD.tablet;
  const [tab, setTab] = useState(0);
  const enquiry = useEnquiry();
  const content = useSiteContent();
  const properties = propertiesFor(content, PROJECT_TABS[tab]);

  // Slot count and face size from the row's width.
  const rowRef = useRef<HTMLDivElement>(null);
  const [rowWidth, setRowWidth] = useState(0);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const measure = () => setRowWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const { slots, width, height } = rowWidth > 0 ? fit(rowWidth, geometry) : { slots: 0, width: geometry.width, height: geometry.height };

  // Deal once the row has scrolled into view.
  const inView = useInView(rowRef, { once: true, amount: 0.4 });

  const step = width + geometry.gap;
  const fromX = rowWidth + width;
  // Property cards keep the slot width; the enquiry card absorbs the slots a thin category leaves over.
  const shown = properties.slice(0, isCompact ? PHONE_HAND : Math.max(0, slots - 1));
  const hand: HandItem[] = [
    ...shown.map((p, i) => ({ kind: "property" as const, key: p.id, property: p, x: i * step, width })),
    { kind: "link" as const, key: "see-all", property: null, x: shown.length * step, width: Math.max(width, rowWidth - shown.length * step) },
  ];
  const category = PROJECT_TABS[tab];
  const fill = (t: string) => t.replace(/\{category\}/g, category.toLowerCase());
  const seeAll = (
    <EnquiryPanel
      title={fill(content.categories.enquiry.title)}
      text={fill(content.categories.enquiry.text)}
      label={fill(content.categories.enquiry.cta)}
      onClick={() => enquiry.open(category)}
    />
  );
  // Every listing, not just the four that fit: the row is a shortlist, this is the way to the rest.
  const viewAll = (
    <Link
      href={`/properties/${categorySlug(category)}`}
      className="hit-slop group flex w-fit items-center gap-2 py-1 font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px] text-black/60 outline-none transition-colors hover:text-[var(--color-gold-ink)] focus-visible:text-[var(--color-gold)]"
    >
      {content.categories.viewAll.replace(/\{count\}/g, String(properties.length)).replace(/\{category\}/g, category.toLowerCase())}
      <span aria-hidden className="text-[16px] leading-none transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:translate-x-1">
        →
      </span>
    </Link>
  );

  if (isCompact) {
    // Below 1200px a native swipe row: the whole hand plus the enquiry card, dealt in from the right
    // on arrival and re-dealt on every tab change; swiping reveals the rest.
    return (
      <div className="flex w-full flex-col items-start gap-8 tablet:gap-10">
        <div className="flex w-full flex-col items-start gap-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-8">
          <BittenTabs items={PROJECT_TABS} tone="light" aria-label="Project categories" onChange={setTab} />
          {viewAll}
        </div>
        <div ref={rowRef} className="no-scrollbar relative -mx-5 w-[calc(100%+40px)] snap-x snap-mandatory overflow-x-auto px-5 scroll-pl-5 tablet:-mx-10 tablet:w-[calc(100%+80px)] tablet:px-10 tablet:scroll-pl-10" style={{ height: card.height, perspective: PERSPECTIVE, perspectiveOrigin: "20% 50%" }}>
          <AnimatePresence mode="wait" initial>
            {inView ? (
              <motion.div key={tab} className="flex w-max" style={{ gap: card.gap, transformStyle: "preserve-3d" }}>
                {hand.map((item, i) => (
                  <motion.div
                    key={item.key}
                    className="relative shrink-0 snap-start"
                    style={{ width: card.width, height: card.height, transformStyle: "preserve-3d", transformOrigin: "center", willChange: "transform" }}
                    initial={reduceMotion ? { opacity: 0 } : { x: 320, rotateY: 90, opacity: 0 }}
                    animate={{ x: 0, rotateY: reduceMotion ? 0 : [90, 90, 0], opacity: 1, transition: { duration: reduceMotion ? 0.4 : ENTER.duration, ease: ENTER.ease, delay: i * ENTER.stagger, rotateY: { duration: ENTER.duration, ease: ENTER.ease, delay: i * ENTER.stagger, times: [0, ENTER.holdEdgeOnUntil, 1] }, opacity: { duration: 0.35, delay: i * ENTER.stagger } } }}
                    exit={{ x: -240, rotateY: reduceMotion ? 0 : 90, opacity: 0, transition: { duration: EXIT.duration, ease: EXIT.ease, delay: i * EXIT.stagger } }}
                  >
                    {item.kind === "property" ? <PropertyCard property={item.property} sizes={`${card.width}px`} radius={RADIUS} infoHeight={INFO_HEIGHT_COMPACT} /> : seeAll}
                  </motion.div>
                ))}
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-start gap-8 tablet:gap-10">
      <div className="flex w-full flex-col items-start gap-4 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-8">
        <BittenTabs items={PROJECT_TABS} tone="light" aria-label="Project categories" onChange={setTab} />
        {viewAll}
      </div>

      {/* Card row: owns the perspective; slots are placed absolutely from the left and fill the width */}
      <div
        ref={rowRef}
        className="relative w-full"
        style={{ height, perspective: PERSPECTIVE, perspectiveOrigin: "50% 50%" }}
      >
        <AnimatePresence mode="wait" initial>
          {inView && slots > 0 ? (
            <motion.div key={tab} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
              {hand.map((item, i) => (
                <motion.div
                  key={item.key}
                  className="absolute left-0 top-0"
                  style={{ width: item.width, height, transformStyle: "preserve-3d", transformOrigin: "center", willChange: "transform" }}
                  initial={reduceMotion ? { x: item.x, rotateY: 0, opacity: 0 } : { x: fromX, rotateY: 90, opacity: 0 }}
                  animate={{
                    x: item.x,
                    rotateY: reduceMotion ? 0 : [90, 90, 0],
                    opacity: 1,
                    transition: {
                      duration: reduceMotion ? 0.4 : ENTER.duration,
                      ease: ENTER.ease,
                      delay: i * ENTER.stagger,
                      rotateY: { duration: ENTER.duration, ease: ENTER.ease, delay: i * ENTER.stagger, times: [0, ENTER.holdEdgeOnUntil, 1] },
                      opacity: { duration: 0.35, delay: i * ENTER.stagger },
                    },
                  }}
                  exit={{
                    x: item.x - EXIT.travel,
                    rotateY: reduceMotion ? 0 : 90,
                    opacity: 0,
                    transition: { duration: EXIT.duration, ease: EXIT.ease, delay: i * EXIT.stagger },
                  }}
                >
                  {item.kind === "property" ? <PropertyCard property={item.property} sizes={IMAGE_SIZES} radius={RADIUS} /> : seeAll}
                </motion.div>
              ))}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default CategoryShowcase;

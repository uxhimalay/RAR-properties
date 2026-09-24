"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { BookVisit } from "@/components/sections/BookVisit";
import { DealsGalleryRow } from "@/components/sections/DealsGalleryRow";
import { ACCENT, Caption, Card, StepNumber, TICK } from "@/components/sections/DealsPrimitives";
import { DEALS_PRICE_CTA } from "@/lib/content";
import { useSiteContent } from "@/lib/cms/context";
import { findProperty, isRemoteImage, pricePerSqft } from "@/lib/cms/schema";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";

/* ------------------------------------------------------------------------------------------------
 * DealsCards
 *
 * Hot deals on the property, in the card language of the project reference's process cards
 * (measured 2026-09-18, see docs/research/components/process-cards.spec.md) recomposed as a
 * minimal bento at the user's request: different widths, different positions, a different
 * composition per card, and each illustration cut down to its essence.
 *
 * Layout (desktop, 1236px = three 412px columns, all cells sharing 1px dashed lines):
 *   row 1  [ photograph ....................... wide ] [ 01 Book a visit ]
 *   row 2  [ 02 Pricing ] [ hover row of featured units ..... wide ]
 * The wide/narrow alternation gives the rhythm; a large muted number anchors every card. The
 * reserved-share gauge, the extras ticker and the offer band were removed on request while the
 * user re-plans the content; the wide top-left cell carries a photograph and the wide bottom-right
 * cell the project reference's hover row (DealsGalleryRow).
 *
 * Illustrations, each a single idea tied to its deal:
 *   01 the seven days from today; click one and the card becomes a month calendar with visit times
 *      and a Book button (BookVisit.tsx)
 *   02 one ruler along the bottom edge with unit sizes beneath, drifting at the source's 10px/s
 * Colours and the shared primitives (number, caption, card, tokens) live in DealsPrimitives.tsx.
 * ---------------------------------------------------------------------------------------------- */

/* ----------------------------------- 02 ruler ------------------------------------------------ */

function Ruler({ tall, short, shortCount, gap, speed, height }: { tall: number; short: number; shortCount: number; gap: number; speed: number; height: number }) {
  const reduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(348);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const x = useMotionValue(0);
  const unit = (shortCount + 1) * (1 + gap);
  useAnimationFrame((_, delta) => {
    if (reduceMotion) return;
    const next = x.get() + (speed * delta) / 1000;
    x.set(((next % unit) + unit) % unit - unit);
  });
  const units = Math.ceil(width / unit) + 2;
  return (
    <div ref={ref} className="w-full overflow-hidden" style={{ height }}>
      <motion.div className="flex items-end" style={{ x, gap, height }}>
        {Array.from({ length: units }).map((_, u) =>
          Array.from({ length: shortCount + 1 }).map((__, i) => (
            <span key={`${u}-${i}`} className="w-px shrink-0" style={{ height: i === 0 ? tall : short, backgroundColor: TICK, borderRadius: i === 0 ? "0 0 90px 90px" : 0 }} />
          )),
        )}
      </motion.div>
    </div>
  );
}

/* ----------------------------------- cards --------------------------------------------------- */

const PHONE_QUERY = "(max-width: 809px)";
function subscribeToPhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Phone: the four cells become a swipe carousel (one card at a time, snapping), so the section is
 * one screen tall instead of four; gold dots track the position. Tablet: two columns. Desktop: the
 * three-column bento.
 */
export function DealsCards({ className }: { className?: string }) {
  const enquiry = useEnquiry();
  const content = useSiteContent();
  const { deals } = content;
  const property = findProperty(content, deals.propertyId);
  const altFor = (src: string) => content.media.find((m) => m.src === src)?.alt ?? property?.name ?? "";
  const photo = deals.photoOverride ?? property?.images[0] ?? "/images/deals-feature.jpg";
  const priceTitle = deals.pricing.title ?? (property ? `From AED ${pricePerSqft(property).toLocaleString("en-US")} per sq ft` : "Launch pricing");
  const gallery = deals.gallery ?? (property ? property.images.map((src) => ({ src, alt: altFor(src), title: property.name })) : []);
  const isPhone = useSyncExternalStore(subscribeToPhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const onScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const step = el.firstElementChild ? (el.firstElementChild as HTMLElement).offsetWidth + 12 : el.clientWidth;
    setPage(Math.round(el.scrollLeft / step));
  };
  const cells = [
    <Card key="photo" className={cn(isPhone ? "min-h-[440px] w-[84vw] shrink-0 snap-center p-5" : "tablet:col-span-2")}>
      <div className="relative min-h-[256px] flex-1 overflow-hidden">
        <Image src={photo} alt={altFor(photo)} fill sizes="(min-width: 810px) 760px, 90vw" unoptimized={isRemoteImage(photo)} className="object-cover" />
      </div>
    </Card>,
    <Card key="visit" className={cn(isPhone && "min-h-[440px] w-[84vw] shrink-0 snap-center p-5")}>
      <BookVisit settings={deals.booking} visit={deals.visit} />
    </Card>,
    <Card key="price" className={cn("justify-between gap-10", isPhone && "min-h-[440px] w-[84vw] shrink-0 snap-center p-5")}>
        <div className="flex flex-col gap-10">
          <StepNumber n={2} />
          <div className="flex flex-col gap-5">
            <Caption title={priceTitle} description={deals.pricing.description} />
            <button type="button" onClick={() => enquiry.open("Price list")} className="hit-slop group flex w-fit cursor-pointer items-center gap-2 py-1 font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px] outline-none transition-colors hover:text-[var(--color-gold-light)] focus-visible:text-[var(--color-gold-light)]" style={{ color: ACCENT }}>
              {DEALS_PRICE_CTA}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1"><path d="M2 7h9.5M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Ruler tall={28} short={14} shortCount={7} gap={7} speed={-10} height={28} />
          <div className="flex justify-between font-inter text-[12px] font-medium leading-[16.8px]" style={{ color: ACCENT }}>
            {deals.pricing.sizes.map((n) => <span key={n}>{n}</span>)}
          </div>
        </div>
      </Card>,
    <Card key="gallery" className={cn(isPhone ? "min-h-[440px] w-[84vw] shrink-0 snap-center p-5" : "tablet:col-span-2")}>
      <DealsGalleryRow items={gallery} />
    </Card>,
  ];

  if (isPhone) {
    return (
      <div className={cn("w-full", className)}>
        <div ref={trackRef} onScroll={onScroll} className="no-scrollbar -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
          {cells}
        </div>
        <div className="mt-5 flex items-center justify-center gap-2" aria-hidden="true">
          {cells.map((_, i) => (
            <span key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === page ? 20 : 6, backgroundColor: i === page ? ACCENT : "rgba(255,255,255,0.3)" }} />
          ))}
        </div>
      </div>
    );
  }

  return <div className={cn("mx-auto grid w-full max-w-[1236px] grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3", className)}>{cells}</div>;
}

export default DealsCards;

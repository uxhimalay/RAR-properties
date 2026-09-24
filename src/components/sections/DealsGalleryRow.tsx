"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DEALS_GALLERY } from "@/lib/content";
import { isRemoteImage } from "@/lib/cms/schema";

export interface GalleryItem { src: string; alt: string; title: string }
const DEFAULT_ITEMS: GalleryItem[] = DEALS_GALLERY.map((g) => ({ src: g.image, alt: g.title, title: g.title }));

/* ------------------------------------------------------------------------------------------------
 * DealsGalleryRow
 *
 * The hover row from the project reference's dark band (measured 2026-09-17/18),
 * fitted into the wide bottom-right cell of the deals grid.
 *
 * Measured on the source:
 * - A flex row, 8px gap, items centred. Every card is square (aspect 1/1), flex-grow 1, and the
 *   featured one flex-grow 2, so it is exactly twice the width and height of the others; the row's
 *   height is the featured card's.
 * - Card opacity 0.6 at rest, 1 when featured.
 * - The source also draws corner brackets on the featured card and hangs a title and description
 *   beneath it, and features on hover. All three were dropped at the user's request: no brackets,
 *   no captions, and a card is featured only on CLICK (or keyboard activation), not hover.
 * - The second card is featured before any interaction.
 * - Cards fade in left to right as the section arrives.
 *
 * The count follows the cell's width, as asked: four cards when the row is at least 600px wide,
 * otherwise three.
 * ---------------------------------------------------------------------------------------------- */

const GAP = 8;
/** Zero-based: the second card opens by default. */
const DEFAULT_ACTIVE = 1;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const SWITCH = `0.5s ${EASE}`;

export function DealsGalleryRow({ items = DEFAULT_ITEMS }: { items?: GalleryItem[] }) {
  const source = items.length ? items : DEFAULT_ITEMS;
  const rowRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(760);
  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // Never more cards than there are photos: asking for four when the property has three made the
  // open card wider than its slot, so it overflowed the cell above and below.
  const count = Math.max(1, Math.min(source.length, width >= 600 ? 4 : 3));
  const cards = source.slice(0, count);
  const [active, setActive] = useState(Math.min(DEFAULT_ACTIVE, count - 1));

  // One unit is an inactive card's side; the featured card is two units and sets the row's height.
  // With a single photo there is nothing to open, so it simply fills the row.
  const unit = count > 1 ? (width - (count - 1) * GAP) / (count + 1) : width / 2;
  const featured = unit * 2;

  return (
    <div ref={rowRef} className="flex w-full items-center" style={{ gap: GAP, height: featured }}>
      {cards.map((card, i) => {
        const isActive = i === active;
        return (
          <motion.button
            key={card.src}
            type="button"
            aria-pressed={isActive}
            aria-label={card.title}
            className="relative aspect-square min-w-0 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            style={{ flexGrow: isActive ? 2 : 1, flexBasis: 0, transition: `flex-grow ${SWITCH}` }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setActive(i)}
          >
            {/* Picture: dims to 60% while another card is open */}
            <span className="absolute inset-0 block overflow-hidden" style={{ opacity: isActive ? 1 : 0.6, transition: `opacity ${SWITCH}` }}>
              <Image src={card.src} alt="" fill sizes="(min-width: 810px) 320px, 50vw" unoptimized={isRemoteImage(card.src)} className="object-cover" draggable={false} />
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}

export default DealsGalleryRow;

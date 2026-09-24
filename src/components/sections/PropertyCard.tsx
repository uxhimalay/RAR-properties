"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { isRemoteImage, priceLabel, sqftLabel, type Property } from "@/lib/cms/schema";

/* ------------------------------------------------------------------------------------------------
 * PropertyCard: one card in the categories row.
 *
 * Every card has the same structure, whatever the category or how many are in the row: a picture of
 * a fixed height (so a portrait photo and a landscape one read as the same card), a status chip over
 * it, then the details, always visible rather than on hover:
 *
 *   [ picture · status chip ]
 *   name
 *   community · type
 *   ──────────────
 *   price            size (and beds, when it is a home)
 *
 * The whole card links to the property's page; hovering lifts the gold hairline and eases the
 * picture in a little.
 * ---------------------------------------------------------------------------------------------- */

/** Picture height as a share of the card's width (the marquee face's 260:300 proportion). */
export const IMAGE_RATIO = 300 / 260;
/** The details block under the picture: fixed, so every card is the same height. */
export const INFO_HEIGHT = 112;
export const INFO_HEIGHT_COMPACT = 104;

const LABEL = "font-inter text-[10px] font-medium uppercase leading-[14px] tracking-[0.4px]";
const LINE = "rgba(0, 0, 0, 0.12)";

export function PropertyCard({ property, sizes, radius = 4, infoHeight = INFO_HEIGHT, layout = "slot" }: { property: Property; sizes: string; radius?: number; infoHeight?: number; layout?: "slot" | "grid" }) {
  const cover = property.images[0] ?? "/images/deals-feature.jpg";
  const beds = property.bedrooms === null ? null : property.bedrooms === 0 ? "Studio" : `${property.bedrooms} bed`;
  return (
    <Link
      href={`/property/${property.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden border bg-white outline-none transition-colors duration-500 hover:border-[var(--color-gold-ink)] focus-visible:border-[var(--color-gold-ink)]",
        layout === "grid" ? "relative w-full" : "absolute inset-0",
      )}
      style={{ borderColor: LINE, borderRadius: radius }}
      aria-label={`${property.name}, ${property.community}: ${priceLabel(property.priceAed)}, ${sqftLabel(property.areaSqft)}`}
    >
      {/* picture: fixed box, so every card matches whatever the photo's shape */}
      <span className={cn("relative block w-full overflow-hidden", layout === "grid" ? "aspect-[26/30]" : "flex-1")}>
        <Image src={cover} alt="" fill sizes={sizes} unoptimized={isRemoteImage(cover)} className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]" draggable={false} />
        <span className={cn(LABEL, "absolute left-3 top-3 bg-white/90 px-2 py-1 text-ink backdrop-blur-sm")}>{property.status}</span>
      </span>

      {/* details: always on, fixed height, so the row stays even */}
      <span className="flex shrink-0 flex-col justify-center gap-1.5 px-4" style={{ height: infoHeight }}>
        <span className="truncate font-display text-[17px] font-normal leading-[1.15] tracking-[-0.01em] text-ink">{property.name}</span>
        <span className={cn(LABEL, "truncate text-ink/55")}>{property.community} · {property.type}</span>
        <span className="my-1 block h-px w-full shrink-0" style={{ backgroundColor: LINE }} />
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate font-inter text-[15px] font-medium leading-none tracking-[-0.2px]" style={{ color: "var(--color-gold-ink)" }}>{priceLabel(property.priceAed)}</span>
          <span className={cn(LABEL, "shrink-0 text-ink/55")}>{beds ? `${beds} · ` : ""}{sqftLabel(property.areaSqft)}</span>
        </span>
      </span>
    </Link>
  );
}

export default PropertyCard;

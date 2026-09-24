"use client";

import Link from "next/link";
import { DealsCards } from "@/components/sections/DealsCards";
import { TextReveal } from "@/components/motion/TextReveal";
import { useSiteContent } from "@/lib/cms/context";
import { findProperty } from "@/lib/cms/schema";

/**
 * Content of the fourth section's black panel: a header on the right (the panel's notch is
 * top-left, so the right part keeps the full height) and, below it, the hot-deals bento in the card
 * language taken from the project reference. The header uses the third section's type, in white.
 */
export function DealsPanelContent() {
  const content = useSiteContent();
  const { deals } = content;
  const property = findProperty(content, deals.propertyId);
  return (
    <div className="flex w-full flex-col items-stretch gap-10 tablet:gap-14">
      <div className="flex w-full flex-col items-end gap-4 text-right tablet:ml-auto tablet:max-w-[calc(50%-10px)]">
        <p className="font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px] text-white/50">
          {deals.eyebrow}
        </p>
        <TextReveal
          as="h2"
          text={deals.heading}
          className="font-display text-[32px] font-normal uppercase leading-[1.1] tracking-[-0.02em] text-white/70 tablet:text-[50px] tablet:leading-[55px]"
        />
        {property && (
          <Link href={`/property/${property.slug}`} className="hit-slop group flex items-center gap-2 py-1 font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px] outline-none transition-colors hover:text-[var(--color-gold-light)] focus-visible:text-[var(--color-gold-light)]" style={{ color: "var(--color-gold)" }}>
            {property.name}, {property.community}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1"><path d="M2 7h9.5M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        )}
      </div>
      <DealsCards />
    </div>
  );
}

export default DealsPanelContent;

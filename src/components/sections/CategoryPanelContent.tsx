"use client";

import { CategoryShowcase } from "@/components/sections/CategoryShowcase";
import { TextReveal } from "@/components/motion/TextReveal";
import { useSiteContent } from "@/lib/cms/context";

/**
 * Content of the third section's white panel: an eyebrow and a heading in the project reference's
 * panel statement ("Closer than you think.": 50px, uppercase, -1px tracking, muted), then the
 * category tab bar and the row of 3D cards it deals in from the right (CategoryShowcase).
 *
 * The heading sits level with the top-right notch, so it is kept within the left part of the
 * stepped edge; the tab bar and cards below the notch run at their natural width.
 */
export function CategoryPanelContent() {
  const { categories } = useSiteContent();
  return (
    <div className="flex w-full flex-col items-start gap-8 tablet:gap-10">
      <div className="flex max-w-[calc(50%-10px)] flex-col items-start gap-4">
        <p className="font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px]" style={{ color: "var(--color-gold-ink)" }}>
          {categories.eyebrow}
        </p>
        <TextReveal
          as="h2"
          text={categories.heading}
          className="font-display text-[32px] font-normal uppercase leading-[1.1] tracking-[-0.02em] text-black/60 tablet:text-[50px] tablet:leading-[55px]"
        />
      </div>
      <CategoryShowcase />
    </div>
  );
}

export default CategoryPanelContent;

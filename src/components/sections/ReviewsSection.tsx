"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, type Transition } from "framer-motion";
import { FadeUp } from "@/components/motion/FadeUp";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StarIcon } from "@/components/icons";
import { REVIEWS, REVIEWS_SECTION } from "@/lib/content";

/**
 * Reviews section ("What Our Clients Say") — a CLICK-DRIVEN 4-slide testimonial slider.
 * Clicking an avatar switches the slide; there is no autoplay.
 *
 * Desktop (>= 1200): section gap 56 -> row (gap 24) of
 *   - image block, flex 1.2 0 0px, 493px tall, radius 8; slides crossfade with a 1.35 -> 1 scale
 *   - text block, flex 1 0 0px, 493px tall, padding 8px 32px; inner column space-between:
 *       stars / 40px title / 24px quote (fade out 0.3s, then fade in 0.4s after 0.35s)
 *       name + role (same fade timing) and the 62px avatar buttons (active 1, inactive 0.7)
 *
 * Tablet / phone (< 1200): section gap 24 -> stacked column (gap 24):
 *   FadeUp(image 324px tall) then text column (gap 24) with 20px title, 11px quote, 48px avatars.
 *
 * No margins here: the page wrapper owns the spacing above/below.
 */

const STAR_COUNT = 5;

/** Image crossfade: new slide fades in (0.3s) while scaling 1.35 -> 1 (0.7s); old slide fades out (0.3s). */
const IMAGE_TRANSITION: Transition = {
  scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  opacity: { duration: 0.3 },
};

/** Text fade: out 0.3s, then (AnimatePresence mode="wait") in 0.4s after a 0.35s delay. */
const TEXT_ENTER: Transition = { duration: 0.4, delay: 0.35 };
const TEXT_EXIT: Transition = { duration: 0.3 };

export function ReviewsSection() {
  const [active, setActive] = useState(0);
  const review = REVIEWS[active];

  return (
    <section
      id="reviews-section"
      className="section-width flex flex-col items-center gap-6 overflow-clip desktop:gap-14"
    >
      <SectionHeading heading={REVIEWS_SECTION.heading} subtitle={REVIEWS_SECTION.subtitle} />

      {/* Slider row: column below 1200, row (gap 24) on desktop */}
      <div className="flex w-full flex-col items-center gap-6 desktop:flex-row desktop:justify-center">
        {/* ---------------------------------------------------------------- image block */}
        <FadeUp className="w-full min-w-0 desktop:w-auto desktop:flex-[1.2_0_0px]">
          <div className="relative isolate h-[324px] w-full overflow-hidden rounded-[8px] [transform:translateZ(0)] desktop:h-[493px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={active}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.35 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={IMAGE_TRANSITION}
              >
                <Image
                  src={review.image}
                  alt={`Interior project photographed for the review by ${review.name}`}
                  fill
                  sizes="(min-width: 1200px) 47vw, 93vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </FadeUp>

        {/* ---------------------------------------------------------------- text block */}
        <div className="w-full desktop:flex desktop:h-[493px] desktop:w-auto desktop:min-w-0 desktop:flex-[1_0_0px] desktop:items-center desktop:justify-center desktop:overflow-hidden desktop:px-8 desktop:py-2">
          {/* Content: gap 24 column below 1200; full-height space-between column on desktop */}
          <div className="flex w-full flex-col items-start gap-6 overflow-hidden desktop:h-full desktop:justify-between desktop:gap-0">
            {/* Stable wrapper so the space-between column always has two children while slides swap */}
            <div className="flex w-full flex-col items-start">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  className="flex flex-col items-start gap-2 overflow-hidden desktop:gap-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: TEXT_ENTER }}
                  exit={{ opacity: 0, transition: TEXT_EXIT }}
                >
                  {/* Stars: 5 x 16px, gap 8 */}
                  <div className="flex items-center gap-2" role="img" aria-label="Rated 5 out of 5 stars">
                    {Array.from({ length: STAR_COUNT }, (_, i) => (
                      <StarIcon key={i} aria-hidden="true" className="h-4 w-4 shrink-0 text-ink" />
                    ))}
                  </div>
                  <h3 className="font-display text-[20px] font-medium leading-[28px] text-ink desktop:text-[40px] desktop:leading-[40px]">
                    {review.title}
                  </h3>
                  <p className="font-display text-[11px] font-normal leading-[17px] text-[rgba(79,71,66,0.7)] desktop:text-[24px] desktop:leading-[28.8px]">
                    {review.quote}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom group: client info + avatar buttons */}
            <div className="flex flex-col items-start gap-4">
              {/* min-h matches the name+role block (24 + 2 + 20) so the avatars never jump mid-swap */}
              <div className="flex min-h-[46px] flex-col items-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={active}
                    className="flex flex-col gap-[2px]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: TEXT_ENTER }}
                    exit={{ opacity: 0, transition: TEXT_EXIT }}
                  >
                    <p className="whitespace-pre font-display text-[14px] font-medium leading-[24px] text-ink desktop:text-[16px]">
                      {review.name}
                    </p>
                    <p className="whitespace-pre font-display text-[12px] font-normal leading-[20px] text-ink desktop:text-[14px]">
                      {review.role}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Avatars: 48px (62px on desktop), radius 6, gap 8; active 1 / inactive 0.7 */}
              <div className="flex items-start gap-2 overflow-hidden" role="tablist" aria-label="Client reviews">
                {REVIEWS.map((r, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={r.name}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-label={`Show review from ${r.name}`}
                      onClick={() => setActive(i)}
                      className="relative h-12 w-12 shrink-0 cursor-pointer overflow-clip rounded-[6px] transition-opacity duration-300 desktop:h-[62px] desktop:w-[62px]"
                      style={{ opacity: isActive ? 1 : 0.7 }}
                    >
                      <Image src={r.avatar} alt="" fill sizes="62px" className="object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;

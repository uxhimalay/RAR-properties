"use client";

import { useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useSpring } from "framer-motion";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FadeUp } from "@/components/motion/FadeUp";
import { ArrowUpRightIcon } from "@/components/icons";
import { EXPERTISE, EXPERTISE_SECTION } from "@/lib/content";
import type { ExpertiseCard as ExpertiseCardContent } from "@/types/content";

/**
 * "Project Expertise" section: SectionHeading + two hover-driven image cards
 * ("Commercial Design" / "Residential Design"), each linking to /projects.
 *
 * Desktop (>= 1200): section gap 56, cards side by side (flex-1 each, gap 16), 603px tall.
 * Tablet / phone (< 1200): section gap 24, cards stacked (gap 16), 328px tall, no cursor pill.
 *
 * Card hover (pointer devices, ~0.5s cubic-bezier(0.44,0,0.56,1)):
 *  - corners square off (8px -> 0)
 *  - the bottom gradient overlay (147px, blur 2px) grows to cover the whole card
 *  - the title/subtitle block slides down out of the card
 *  - the stat block ("16+" / "Commercial Projects Done") drops in from above and centres
 *  - a glassy "View Projects" pill follows the cursor (framer-motion spring), desktop only
 *
 * No margins here: the page wrapper owns the spacing above/below.
 */

const EASE = "ease-[cubic-bezier(0.44,0,0.56,1)]";
const PILL_SPRING = { stiffness: 300, damping: 30 };
const OVERLAY_GRADIENT = "linear-gradient(180deg, rgba(0,0,0,0) 0%, #000 100%)";

const IMAGE_ALT: Record<string, string> = {
  "/images/expertise-commercial.jpg":
    "Commercial lounge with ribbed oak wall panelling, a tan leather sofa and a small tree",
  "/images/expertise-residential.jpg":
    "Residential living room with burgundy armchairs, a tan channel-tufted sofa and abstract art",
};

export function ExpertiseSection() {
  return (
    <section className="section-width flex flex-col items-center gap-6 overflow-clip desktop:gap-14">
      <SectionHeading heading={EXPERTISE_SECTION.heading} subtitle={EXPERTISE_SECTION.subtitle} />

      <div className="flex w-full flex-col items-start justify-center gap-4 overflow-clip desktop:flex-row">
        {EXPERTISE.map((card) => (
          <FadeUp key={card.title} className="w-full desktop:min-w-0 desktop:flex-1">
            <ExpertiseCard card={card} />
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

function ExpertiseCard({ card }: { card: ExpertiseCardContent }) {
  const [hovered, setHovered] = useState(false);
  // Spring-smoothed cursor position relative to the card. `.set()` animates towards the
  // target, `.jump()` snaps (used on enter so the pill appears under the cursor, not
  // wherever it was last seen).
  const pillX = useSpring(0, PILL_SPRING);
  const pillY = useSpring(0, PILL_SPRING);

  const cursorInCard = (e: MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleMouseEnter = (e: MouseEvent<HTMLAnchorElement>) => {
    const { x, y } = cursorInCard(e);
    pillX.jump(x);
    pillY.jump(y);
    setHovered(true);
  };

  const handleMouseMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const { x, y } = cursorInCard(e);
    pillX.set(x);
    pillY.set(y);
  };

  const handleMouseLeave = () => setHovered(false);

  return (
    <Link
      href={card.href}
      className="group relative flex h-[328px] w-full flex-col items-center justify-end gap-4 overflow-clip rounded-[8px] transition-[border-radius] duration-500 hover:rounded-none desktop:h-[603px]"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <Image
        src={card.image}
        alt={IMAGE_ALT[card.image] ?? card.title}
        fill
        sizes="(min-width: 1200px) 46vw, 93vw"
        className="rounded-[8px] object-cover transition-[border-radius] duration-500 group-hover:rounded-none"
      />

      {/* Stat block: parked 400px above the card while idle, drops to the vertical centre on hover.
          z-[1] keeps it above the overlay so the text stays crisp white (not darkened/blurred). */}
      <div
        className={`absolute top-[-400px] left-1/2 z-[1] flex -translate-x-1/2 flex-col items-center justify-center gap-[10px] transition-[top,translate] duration-500 ${EASE} group-hover:top-1/2 group-hover:-translate-y-1/2`}
      >
        <p className="font-inter text-[100px] leading-[1.1] font-medium tracking-[-0.2px] whitespace-pre text-white uppercase">
          {card.statNumber}
        </p>
        <p className="font-inter text-center text-[24px] leading-[1.1] font-normal tracking-[-0.2px] whitespace-pre text-white uppercase">
          {card.statLabel}
        </p>
      </div>

      {/* Bottom gradient overlay: hugs its content below 1200 (147px on desktop), fills the card on hover.
          interpolate-size lets the auto -> 100% height animate where supported (Chromium). */}
      <div
        className={`relative flex h-auto w-full flex-col items-start justify-end overflow-clip backdrop-blur-[2px] transition-[height] duration-500 ${EASE} [interpolate-size:allow-keywords] group-hover:h-full desktop:h-[147px]`}
        style={{ background: OVERLAY_GRADIENT }}
      >
        {/* Title / subtitle: slides down out of the card on hover */}
        <div
          className={`flex w-full flex-col items-start justify-end gap-[10px] p-[18px] transition-transform duration-500 ${EASE} group-hover:translate-y-[120%] desktop:p-8`}
        >
          <p className="font-display text-[18px] leading-[1.1] font-medium tracking-[-0.2px] whitespace-pre text-white uppercase desktop:text-[32px] desktop:leading-[1.3]">
            {card.title}
          </p>
          <p className="font-display max-w-[347px] text-[11px] leading-[1.1] font-normal tracking-[-0.2px] text-white uppercase desktop:text-[12px] desktop:leading-[1.3]">
            {card.subtitle}
          </p>
        </div>
      </div>

      {/* Cursor-follow "View Projects" pill (desktop only). The outer wrapper is translated to the
          cursor position; the inner pill is offset by -50%/-50% so it is centred on the cursor. */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 z-[2] hidden desktop:block"
        style={{ x: pillX, y: pillY }}
      >
        <motion.div
          className="flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-[100px] bg-[rgba(255,255,255,0.22)] px-4 py-2 backdrop-blur-[8px]"
          initial={false}
          animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <span className="font-display text-[16px] leading-[1.2] font-normal whitespace-nowrap text-white">
            View Projects
          </span>
          <ArrowUpRightIcon className="size-4 shrink-0 text-white" />
        </motion.div>
      </motion.div>
    </Link>
  );
}

export default ExpertiseSection;

"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";
import { useSiteContent } from "@/lib/cms/context";
import { clamp01, takeoverEase } from "@/lib/motion";
import { ArrowDownIcon, ArrowUpRightIcon } from "@/components/icons";
import { FadeUp } from "@/components/motion/FadeUp";
import { TextReveal } from "@/components/motion/TextReveal";

/* ------------------------------------------------------------------------------------------------
 * Shared constants
 * ---------------------------------------------------------------------------------------------- */

const DESKTOP_QUERY = "(min-width: 1200px)";

/** Scroll distance (px) over which the desktop hero animation plays out. */
const SCROLL_RANGE: [number, number] = [0, 425];

/**
 * Post-scroll card. At rest the main image fills the viewport edge to edge; as the page scrolls it is
 * clipped to this centred box (the original 1416 x 810, 12px-radius hero card) while scaling down to
 * END_SCALE, so the end state is the same 637 x 364 card as before, flanked by the two side images.
 */
const CARD = { width: 1416, height: 810, radius: 12 };
const END_SCALE = 0.45;

/**
 * Takeover, after the project reference's hero (measured 2026-09-18) and then choreographed
 * further at the user's request. Once the shrink has finished the box stays pinned while the next
 * section rises over it. Across that one viewport height of scroll, on the shared takeover easing
 * (see lib/motion.ts) so it moves in lockstep with the band's rise: the hero sinks into black (a
 * black layer under the content comes up 0 -> 1), its content fades 1 -> 0, scales 1 -> 0.9 (centre
 * origin) and drifts up by TAKEOVER_DRIFT for depth.
 * Three things hold the box pinned for that extra viewport height and must stay in step: RUNWAY here,
 * the header's desktop height (200dvh + 450px) below, and the next section's -100dvh top margin in
 * page.tsx.
 */
const RUNWAY = 450;
const TAKEOVER_SCALE = 0.9;
const TAKEOVER_DRIFT = -40;

/** Intro delay shared by every hero element. */
const INTRO_DELAY = 0.4;

const MAIN_IMAGE_ALT = "Penthouse terrace at dusk with lounge seating overlooking Dubai Marina, the beach and Ain Dubai";
const LEFT_IMAGE_ALT = "Bedroom with a terracotta throw and floor-to-ceiling windows onto a terrace pool and the sea";
const RIGHT_IMAGE_ALT = "Living room with a curved sofa, travertine media wall and a view of Ain Dubai";

/** 14px / 500 / 140% / -3% uppercase: the labels and the text link. */
const LABEL_TYPE = "font-inter text-[14px] font-medium uppercase leading-[1.4] tracking-[-0.03em]";

/* ------------------------------------------------------------------------------------------------
 * matchMedia hook (local — no shared hook exists in the project yet)
 * Returns null until mounted so the server render and the first client render agree.
 * ---------------------------------------------------------------------------------------------- */

function useIsDesktop(): boolean | null {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

/* ------------------------------------------------------------------------------------------------
 * "View projects" text link: 14px uppercase + 18px down arrow, 1px underline.
 * The underline slides in from the left on hover from 1200px; below that it is always visible.
 * ---------------------------------------------------------------------------------------------- */

function HeroLink({ href, label, tone = "white" }: { href: string; label: string; tone?: "white" | "gold" }) {
  const colour = tone === "gold" ? "text-[var(--color-gold-light)]" : "text-white";
  const line = tone === "gold" ? "bg-[var(--color-gold-light)]" : "bg-white";
  return (
    <a href={href} className="hit-slop group flex flex-col items-start gap-1 outline-none">
      <span className="flex items-center gap-[10px]">
        <span className={`${LABEL_TYPE} ${colour}`}>{label}</span>
        {tone === "gold" ? (
          <ArrowUpRightIcon aria-hidden className={`h-[18px] w-[18px] shrink-0 ${colour}`} />
        ) : (
          <ArrowDownIcon aria-hidden className={`h-[18px] w-[18px] shrink-0 ${colour}`} />
        )}
      </span>
      <span
        aria-hidden
        className={`block h-px w-full origin-left ${line} transition-transform duration-[450ms] ease-[cubic-bezier(0.44,0,0.56,1)] desktop:scale-x-0 desktop:group-hover:scale-x-100 desktop:group-focus-visible:scale-x-100`}
      />
    </a>
  );
}

/** The two links in the hero's bottom-right corner: our work (down the page) and the gold booking call. */
function HeroLinks() {
  const { hero: HERO } = useSiteContent();
  return (
    <div className="flex items-center gap-8">
      <HeroLink href={HERO.link.href} label={HERO.link.label} />
      {HERO.cta && <HeroLink href={HERO.cta.href} label={HERO.cta.label} tone="gold" />}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * The photograph carries the copy, and a bright frame leaves that copy unreadable: measured against
 * the seeded image, white body text fell to 2.4:1 and both links to about 3.2:1, well under the 4.5
 * AA asks for. Colour alone cannot fix that, because the photograph is chosen in the admin and the
 * next one may be brighter still, so the copy sits on a scrim instead: clear across the top third,
 * closing to 45% black where the paragraph starts and 62% at the bottom edge. The same measurement
 * afterwards reads 6.2:1 for the paragraph and 8.9:1 for the gold link.
 * ---------------------------------------------------------------------------------------------- */
function HeroScrim() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[3]"
      style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0) 28%, rgba(0,0,0,0.45) 62%, rgba(0,0,0,0.62) 100%)" }}
    />
  );
}

/* ------------------------------------------------------------------------------------------------
 * Copy overlay, shared by both variants.
 * Column with space-between: nav placeholder / headline + labels / intro + link.
 * Desktop padding 40px 40px 64px (max-width 1600); mobile padding 20px, stacked.
 * ---------------------------------------------------------------------------------------------- */

function HeroOverlay({ variant }: { variant: "desktop" | "mobile" }) {
  const { hero: HERO } = useSiteContent();
  const desktop = variant === "desktop";
  return (
    <div
      className={
        desktop
          ? "absolute inset-0 z-[4] mx-auto flex h-full w-full max-w-[1600px] flex-col justify-between px-10 pb-16 pt-10"
          : "absolute inset-0 z-[4] flex h-full w-full flex-col justify-between p-5"
      }
    >
      {/* Placeholder: keeps the nav row clear at the top of the column */}
      <div aria-hidden className={desktop ? "h-8" : "h-[60px]"} />

      {/* Main: brand headline | labels */}
      <div className={desktop ? "flex w-full items-center justify-between" : "flex w-full flex-col items-start gap-10"}>
        <h1 className="flex flex-col items-start gap-[10px] font-inter font-semibold uppercase leading-[0.9] tracking-[-0.05em] text-white">
          <TextReveal
            as="span"
            preset="hero-heading"
            startOnMount
            delay={INTRO_DELAY}
            text={HERO.headline[0]}
            className={desktop ? "block text-[length:clamp(64px,7.8vw,112px)]" : "block text-[length:clamp(40px,14vw,112px)]"}
          />
          <TextReveal
            as="span"
            preset="hero-heading"
            startOnMount
            delay={INTRO_DELAY + 0.19}
            text={HERO.headline[1]}
            className={desktop ? "block text-[length:clamp(41px,5vw,72px)]" : "block text-[length:clamp(26px,7.5vw,72px)]"}
          />
        </h1>

        <FadeUp
          onMount
          delay={INTRO_DELAY}
          className={desktop ? "flex w-[500px] max-w-full shrink items-center justify-end gap-5" : "flex w-full items-center justify-between"}
        >
          <span className={`${LABEL_TYPE} text-white`}>{HERO.labels[0]}</span>
          <span aria-hidden className={`${LABEL_TYPE} text-[var(--color-gold)]`}>
            {"//"}
          </span>
          <span className={`${LABEL_TYPE} text-white`}>{HERO.labels[1]}</span>
        </FadeUp>
      </div>

      {/* Secondary: intro paragraph | text link */}
      <div className={desktop ? "flex w-full items-end justify-between" : "flex w-full flex-col items-start gap-6 pb-10"}>
        <TextReveal
          as="p"
          preset="hero-paragraph"
          startOnMount
          delay={INTRO_DELAY}
          text={HERO.paragraph}
          className={`w-full max-w-[500px] font-inter font-medium leading-[1.4] tracking-[-0.04em] text-[#e6e6e6] ${desktop ? "text-[18px]" : "text-[16px]"}`}
        />
        <FadeUp onMount delay={INTRO_DELAY + 0.2}>
          <HeroLinks />
        </FadeUp>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Desktop (>= 1200px): full-screen at rest, sticky and scroll-driven
 * ---------------------------------------------------------------------------------------------- */

function HeroDesktop({ className }: { className?: string }) {
  const { hero: HERO } = useSiteContent();
  // Lenis drives native window scroll, so the default (window) useScroll stays in sync.
  const { scrollY } = useScroll();
  const boxRef = useRef<HTMLDivElement>(null);

  // Half the gap between the viewport-sized box and the post-scroll card, measured so the clip is exact
  // at any viewport size (0 when the viewport is smaller than the card).
  const insetX = useMotionValue(0);
  const insetY = useMotionValue(0);
  // Viewport height, measured from the box itself (it is h-dvh), for the takeover's scroll range.
  const boxHeight = useMotionValue(0);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      insetX.set(Math.max(0, (el.clientWidth - CARD.width) / 2));
      insetY.set(Math.max(0, (el.clientHeight - CARD.height) / 2));
      boxHeight.set(el.clientHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [insetX, insetY, boxHeight]);

  const progress = useTransform(scrollY, SCROLL_RANGE, [0, 1]);
  const mainScale = useTransform(progress, [0, 1], [1, END_SCALE]);
  // Edge to edge at rest -> the centred 1416 x 810 card with 12px corners at the end of the range.
  const mainClip = useTransform(
    [progress, insetX, insetY],
    ([p, x, y]: number[]) => `inset(${y * p}px ${x * p}px round ${CARD.radius * p}px)`,
  );
  const leftX = useTransform(progress, [0, 1], [-400, 0]);
  const rightX = useTransform(progress, [0, 1], [400, 0]);
  const textOpacity = useTransform(progress, [0, 1], [1, 0]);
  const textY = useTransform(progress, [0, 1], [0, 500]);

  // Takeover: stays 0 while the shrink plays, then runs 0 -> 1 across the next viewport height of
  // scroll, i.e. exactly as much as the next section has covered the pinned box -- on the shared
  // easing, the same curve the band rises on.
  const takeover = useTransform([scrollY, boxHeight], ([y, h]: number[]) =>
    h > 0 ? takeoverEase(clamp01((y - RUNWAY) / h)) : 0,
  );
  const heroOpacity = useTransform(takeover, [0, 1], [1, 0]);
  const heroScale = useTransform(takeover, [0, 1], [1, TAKEOVER_SCALE]);
  const heroDrift = useTransform(takeover, [0, 1], [0, TAKEOVER_DRIFT]);

  return (
    // hero_img-box: viewport-height box that sticks to the top for the shrink AND the takeover (pure
    // CSS). During the takeover the box sinks into black while its content fades, shrinks and drifts.
    <div ref={boxRef} className={`sticky top-0 h-dvh w-full ${className ?? ""}`}>
      {/* Darkness the hero sinks into as the band rises over it */}
      <motion.div aria-hidden className="absolute inset-0 bg-black" style={{ opacity: takeover }} />
      {/* Content layer: everything the visitor sees fades, scales to 0.9 and drifts up during the takeover */}
      <motion.div className="relative h-full w-full" style={{ opacity: heroOpacity, scale: heroScale, y: heroDrift }}>
        {/* img-left: 500x700 box rendered at 250x350 via scale(0.5); slides in from -400px */}
        <motion.div
          className="absolute left-[-48px] top-1/2 z-[3] h-[700px] w-[500px] overflow-hidden rounded-[12px]"
          style={{ x: leftX, y: "-50%", scale: 0.5 }}
        >
          <Image src={HERO.leftImage} alt={LEFT_IMAGE_ALT} fill sizes="640px" className="object-cover" />
        </motion.div>

        {/* img-main: full-bleed image at 85% over black (the reference's dim); clips and scales down on scroll */}
        <motion.div className="relative h-full w-full overflow-clip bg-black" style={{ scale: mainScale, clipPath: mainClip }}>
          <Image src={HERO.mainImage} alt={MAIN_IMAGE_ALT} fill preload sizes="100vw" className="object-cover opacity-85" />
        </motion.div>

        {/* img-right: mirror of img-left; slides in from +400px */}
        <motion.div
          className="absolute right-[-48px] top-1/2 z-[3] h-[700px] w-[500px] overflow-clip rounded-[12px]"
          style={{ x: rightX, y: "-50%", scale: 0.5 }}
        >
          <Image src={HERO.rightImage} alt={RIGHT_IMAGE_ALT} fill sizes="320px" className="object-cover" />
        </motion.div>

        <HeroScrim />

        {/* Copy overlay: fades out and drifts down while scrolling */}
        <motion.div className="absolute inset-0 z-[4]" style={{ opacity: textOpacity, y: textY }}>
          <HeroOverlay variant="desktop" />
        </motion.div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * Tablet & phone (< 1200px): static full-screen image, no side images, no scroll animation
 * ---------------------------------------------------------------------------------------------- */

function HeroMobile({ className }: { className?: string }) {
  const { hero: HERO } = useSiteContent();
  return (
    <div className={`relative h-dvh w-full overflow-clip bg-black ${className ?? ""}`}>
      <Image src={HERO.mainImage} alt={MAIN_IMAGE_ALT} fill preload sizes="100vw" className="object-cover opacity-85" />
      <HeroScrim />
      <HeroOverlay variant="mobile" />
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------
 * HeroSection
 *
 * At rest the layout follows the project reference's hero (measured 2026-09-17); the
 * scroll-driven shrink into the three-card row is the original ArcSphere behaviour.
 * Full-bleed (the page padding starts below it; the navbar is laid over its top edge).
 * Desktop: viewport-height sticky box plus a 450px scroll runway for the shrink, then one more
 * viewport height during which the box stays pinned and the next section rises over it (the
 * takeover; see RUNWAY). Below 1200px: a static viewport-height image. Both variants are server-rendered and gated with `hidden desktop:block` /
 * `desktop:hidden` so the first paint is correct at every breakpoint; after mount the matchMedia hook
 * prunes the inactive branch so the scroll transforms only live in HeroDesktop.
 * ---------------------------------------------------------------------------------------------- */

export function HeroSection() {
  const isDesktop = useIsDesktop();
  const showDesktop = isDesktop !== false;
  const showMobile = isDesktop !== true;

  return (
    <header id="hero" className="relative w-full overflow-clip desktop:h-[calc(200dvh+450px)]">
      {showDesktop ? <HeroDesktop className="hidden desktop:block" /> : null}
      {showMobile ? <HeroMobile className="desktop:hidden" /> : null}
    </header>
  );
}

export default HeroSection;

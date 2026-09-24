"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import { SECTION_FIVE_VIDEO } from "@/lib/content";
import { useSiteContent } from "@/lib/cms/context";
import type { ServiceItem as AgencyService } from "@/lib/cms/schema";
import { SectionVideo } from "@/components/sections/SectionVideo";
import { ServiceModal } from "@/components/sections/ServiceModal";
import { TextReveal } from "@/components/motion/TextReveal";

/* ------------------------------------------------------------------------------------------------
 * ServicesRail: the fifth section's content.
 *
 * A stage one viewport tall pins while the section scrolls through TRACK_VH viewports. On it: the
 * slow ambient video, a header, eight service cards on a horizontal rail, a progress line and a
 * counter. See docs/research/components/services-rail.md for what was (and was not) taken from the
 * reference the user pointed at.
 *
 * Choreography
 * - Landing: nothing but the video until the section is FULLY on screen (the stage 98% visible,
 *   which is the moment the takeover of the fourth section completes). The video eases from 1.08x
 *   to 1x and is shown on its own for VIDEO_SOLO.
 * - Then the header reveals (eyebrow, heading word by word) and the cards are dealt the way the
 *   site deals cards everywhere else (the category row, the marquee): each starts a full stage-width
 *   to the right, edge-on (rotateY 90deg) under the same 1200px perspective, flies to its slot with
 *   a fast launch and a long expo settle (1.4s, cubic-bezier(0.16, 1, 0.3, 1)), stays edge-on for
 *   the first 45% of the flight and swings round to face front as it lands. Launches are 140ms
 *   apart in slot order, so the row builds left to right. Positions (320x440, every second card
 *   32px lower) are unchanged. The progress line and counter fade in as the row completes.
 * - Travel: the rail follows the scroll only once the first cards have landed (RAIL_RELEASE after
 *   the deal begins) and after the first HOLD of the track; its position eases toward the
 *   scroll-derived target every frame, so the release never jumps. The counter reads the card
 *   nearest the left edge; the gold line is the travel.
 * - Hover lifts a card 8px and slides its arrow.
 *
 * Below 810px there is no pin and no solo: the video sits behind a vertical stack of full-width
 * cards, each dealt from the right as it scrolls into view.
 * ---------------------------------------------------------------------------------------------- */

/** Scroll length of the pinned stage, in viewport heights. */
const TRACK_VH = 320;
/** First part of the track during which the rail holds still regardless. */
const HOLD = 0.18;
/** The video alone, before the header and the deal (ms). */
const VIDEO_SOLO = 3000;
/** The rail may start travelling this long after the deal begins (ms): the first cards have landed. */
const RAIL_RELEASE = 1200;
/** The site's card deal (CategoryShowcase). */
const ENTER = { duration: 1.4, ease: [0.16, 1, 0.3, 1] as const, stagger: 0.14, holdEdgeOnUntil: 0.45, headerLead: 0.3 };
const PERSPECTIVE = 1200;
const CARD_W = 320;
const CARD_H = 440;
const GAP = 16;
/** Every second card sits this much lower. */
const STAGGER_Y = 32;
const PAD_X = 40; // the rail's own gutter; railInset() widens it above 1600px so card 01 meets the header
const EASE = [0.16, 1, 0.3, 1] as const;
const PHONE_QUERY = "(max-width: 809px)";

type Material = "black" | "glass" | "white";
const MATERIALS: Material[] = ["black", "glass", "white"];
import { CONTENT, HEADING_SECTION, LABEL, railInset } from "@/lib/design";
const GOLD = "var(--color-gold)";
/** The same accent for a white card, where --color-gold reads at 2.25:1. */
const GOLD_INK = "var(--color-gold-ink)";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const pad2 = (n: number) => String(n).padStart(2, "0");

function subscribeToPhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/* ----------------------------------- card ---------------------------------------------------- */

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M2 7h9.5M8 3.5L11.5 7 8 10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface CardProps {
  index: number;
  material: Material;
  /** Desktop: deal now. Phone: ignored, each card deals itself when scrolled into view. */
  dealt: boolean;
  /** Where the flight starts, px to the right of the slot. */
  fromX: number;
  phone: boolean;
  /** Opens the service's detail pop-up. */
  onOpen: (service: AgencyService) => void;
}

function ServiceCard({ index, material, dealt, fromX, phone, onOpen }: CardProps) {
  const { services } = useSiteContent();
  const service = services.items[index];
  const reduceMotion = useReducedMotion();
  const dark = material !== "white";
  const delay = phone ? 0.05 : ENTER.headerLead + index * ENTER.stagger;
  const from = reduceMotion ? { opacity: 0, x: 0, rotateY: 0 } : { opacity: 0, x: fromX, rotateY: 90 };
  const to = {
    opacity: 1,
    x: 0,
    rotateY: reduceMotion ? 0 : [90, 90, 0],
    transition: {
      duration: reduceMotion ? 0.4 : ENTER.duration,
      ease: ENTER.ease,
      delay,
      rotateY: { duration: ENTER.duration, ease: ENTER.ease, delay, times: [0, ENTER.holdEdgeOnUntil, 1] },
      opacity: { duration: 0.35, delay },
    },
  };
  const surface =
    material === "black"
      ? "bg-black text-white border-white/10 hover:border-[var(--color-gold)]"
      : material === "glass"
        ? // 35% black let the video through: over a bright frame the gold index fell to 2.97:1.
          // 60% keeps the glass reading while holding 5.2:1 against the brightest frame measured.
          "bg-black/60 text-white border-white/15 backdrop-blur-xl hover:border-[var(--color-gold)]"
        : "bg-white text-ink border-transparent hover:border-[var(--color-gold-ink)]";

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(service)}
      aria-label={`${service.title}: ${services.cta}`}
      className={cn("group relative flex shrink-0 cursor-pointer flex-col justify-between overflow-hidden border p-6 text-left outline-none transition-colors duration-300 focus-visible:border-[var(--color-gold)] tablet:p-7", surface)}
      style={{ width: phone ? "100%" : CARD_W, height: phone ? 460 : CARD_H, marginTop: phone ? 0 : index % 2 ? STAGGER_Y : 0, transformStyle: "preserve-3d", transformOrigin: "center", willChange: "transform" }}
      initial={from}
      animate={phone ? undefined : dealt ? to : from}
      whileInView={phone ? to : undefined}
      viewport={phone ? { once: true, amount: 0.3 } : undefined}
      whileHover={{ y: -8, transition: { duration: 0.35, ease: EASE } }}
    >
      {/* top row: index and category */}
      <div className="flex items-start justify-between gap-4">
        <span className={LABEL} style={{ color: dark ? GOLD : GOLD_INK }}>{pad2(index + 1)}</span>
        <span className={cn(LABEL, dark ? "text-white/55" : "text-ink/55")}>{service.category}</span>
      </div>

      <h3 className="line-clamp-2 font-display text-[28px] font-normal leading-[1.05] tracking-[-0.02em] tablet:text-[30px]">{service.title}</h3>

      <div className="flex flex-col gap-5">
        <p className={cn("line-clamp-3 font-inter text-[14px] font-medium leading-[20px] tracking-[0.28px]", dark ? "text-white/60" : "text-ink/65")}>{service.description}</p>
        <span className={cn("block h-px w-full border-t border-dashed", dark ? "border-white/20" : "border-ink/15")} />
        <span className={cn(LABEL, "flex items-center gap-2")} style={{ color: dark ? GOLD : GOLD_INK }}>
          {services.cta}
          <span className="transition-transform duration-300 group-hover:translate-x-1"><Arrow /></span>
        </span>
      </div>
    </motion.button>
  );
}

/* ----------------------------------- header + chrome ----------------------------------------- */

function Header({ show, className }: { show: boolean; className?: string }) {
  const { services } = useSiteContent();
  return (
    <div className={cn("flex max-w-[620px] flex-col gap-4", className)}>
      <motion.p className={LABEL} style={{ color: GOLD }} initial={{ opacity: 0 }} animate={show ? { opacity: 1 } : undefined} transition={{ duration: 0.8, ease: EASE }}>
        {services.eyebrow}
      </motion.p>
      {/* The invisible copy holds the heading's exact space, so the reveal mounting never moves the rail. */}
      <div className={`relative text-white ${HEADING_SECTION}`}>
        <h2 className="invisible" aria-hidden="true">{services.heading}</h2>
        {show && <TextReveal as="h2" className="absolute inset-0" text={services.heading} preset="hero-heading" startOnMount />}
      </div>
    </div>
  );
}

/* ----------------------------------- rail ---------------------------------------------------- */

export function ServicesRail() {
  const isPhone = useSyncExternalStore(subscribeToPhone, () => window.matchMedia(PHONE_QUERY).matches, () => false);
  const reduceMotion = useReducedMotion();
  const { services } = useSiteContent();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);

  // "Fully on screen": the stage at 98% visible (its top has reached the viewport top). On phone,
  // where there is no pin, things start when a sixth of the stack is in view.
  const ready = useInView(stageRef, { once: true, amount: isPhone ? 0.15 : 0.98 });

  // The video plays alone for VIDEO_SOLO, then the deal begins; the rail is released a little later.
  const [dealt, setDealt] = useState(false);
  const [released, setReleased] = useState(false);
  const [active, setActive] = useState<AgencyService | null>(null);
  const closeModal = () => setActive(null);
  useEffect(() => {
    if (!ready) return;
    const solo = isPhone ? 0 : VIDEO_SOLO;
    const a = window.setTimeout(() => setDealt(true), solo);
    const b = window.setTimeout(() => setReleased(true), solo + RAIL_RELEASE);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [ready, isPhone]);

  // Stage width (where the flight starts) and how far the rail can travel, re-measured on resize.
  const [stageWidth, setStageWidth] = useState(1440);
  const shift = useRef(0);
  const measured = useMotionValue(0);
  useEffect(() => {
    const rail = railRef.current, stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      setStageWidth(stage.clientWidth);
      shift.current = rail ? Math.max(0, rail.scrollWidth - stage.clientWidth) : 0;
      measured.set(measured.get() + 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    if (rail) observer.observe(rail);
    return () => observer.disconnect();
  }, [measured, isPhone]);

  // Scroll-derived target for the rail, and the eased position that actually drives it.
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const xTarget = useTransform([scrollYProgress, measured], ([p]: number[]) => -clamp01((p - HOLD) / (1 - HOLD)) * shift.current);
  const x = useMotionValue(0);
  const releasedRef = useRef(false);
  useEffect(() => {
    releasedRef.current = released;
  }, [released]);
  useAnimationFrame((_, delta) => {
    const target = releasedRef.current ? xTarget.get() : 0;
    const current = x.get();
    if (current === target) return;
    const k = 1 - Math.exp(-(delta / 1000) * 14); // ~70ms time constant: tight to the scroll, no jump on release
    const next = current + (target - current) * k;
    x.set(Math.abs(next - target) < 0.05 ? target : next);
  });
  const travel = useTransform(x, (v) => (shift.current ? clamp01(-v / shift.current) : 0));
  const count = services.items.length;
  const counter = useTransform(travel, (t) => `${pad2(1 + Math.round(t * (count - 1)))} / ${pad2(count)}`);

  // Phone: the same counter and line, driven by the native swipe position.
  const phoneRailRef = useRef<HTMLDivElement>(null);
  const phoneTravel = useMotionValue(0);
  const onPhoneScroll = () => {
    const el = phoneRailRef.current;
    if (!el) return;
    phoneTravel.set(clamp01(el.scrollLeft / Math.max(1, el.scrollWidth - el.clientWidth)));
  };
  const phoneCounter = useTransform(phoneTravel, (t) => `${pad2(1 + Math.round(t * (count - 1)))} / ${pad2(count)}`);

  if (isPhone) {
    return (
      <div ref={stageRef} className="relative flex flex-col overflow-hidden pb-12 pt-24">
        <div className="absolute inset-0">
          <SectionVideo src={SECTION_FIVE_VIDEO.src} rate={SECTION_FIVE_VIDEO.playbackRate} />
          <div className="absolute inset-0 bg-black/45" />
        </div>
        <Header show={ready} className={`relative mb-8 ${CONTENT}`} />
        {/* the rail is a native swipe: each card deals itself in from the right as it enters the screen */}
        <div ref={phoneRailRef} onScroll={onPhoneScroll} className="no-scrollbar relative flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1 scroll-pl-5" style={{ perspective: PERSPECTIVE }}>
          {services.items.map((_, i) => (
            <div key={i} className="shrink-0 snap-start" style={{ width: "76vw" }}>
              <ServiceCard index={i} material={MATERIALS[i % MATERIALS.length]} dealt fromX={Math.min(160, stageWidth * 0.4)} phone onOpen={setActive} />
            </div>
          ))}
        </div>
        <div className={`relative mt-6 flex items-center gap-4 ${CONTENT}`}>
          <div className="h-px flex-1 bg-white/20">
            <motion.div className="h-full origin-left" style={{ scaleX: phoneTravel, backgroundColor: GOLD }} />
          </div>
          <motion.p className={cn(LABEL, "shrink-0 text-white/70")}><motion.span>{phoneCounter}</motion.span></motion.p>
        </div>
        <AnimatePresence>{active && <ServiceModal key={active.title} service={active} onClose={closeModal} />}</AnimatePresence>
      </div>
    );
  }

  const chromeIn = dealt ? { opacity: 1 } : undefined;
  const chromeDelay = ENTER.headerLead + (count - 1) * ENTER.stagger + 0.4;

  return (
    <div ref={trackRef} className="relative" style={{ height: `${TRACK_VH}svh` }}>
      <div ref={stageRef} className="sticky top-0 flex h-svh flex-col overflow-hidden">
        {/* the video, easing from a slight zoom as the section lands; alone for the first seconds */}
        <motion.div className="absolute inset-0" initial={{ scale: reduceMotion ? 1 : 1.08 }} animate={{ scale: reduceMotion || ready ? 1 : 1.08 }} transition={{ duration: 2.4, ease: EASE }}>
          <SectionVideo src={SECTION_FIVE_VIDEO.src} rate={SECTION_FIVE_VIDEO.playbackRate} />
        </motion.div>
        {/* scrims for the header and the chrome, arriving with them */}
        <motion.div className="pointer-events-none absolute inset-x-0 top-0 h-[40%] bg-gradient-to-b from-black/70 to-transparent" initial={{ opacity: 0 }} animate={chromeIn} transition={{ duration: 1.2, ease: EASE }} />
        <motion.div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-t from-black/60 to-transparent" initial={{ opacity: 0 }} animate={chromeIn} transition={{ duration: 1.2, ease: EASE }} />

        {/* header: top padding clears the fixed navbar while the stage is pinned */}
        <div className={`relative z-10 flex items-end justify-between gap-10 pt-24 ${CONTENT}`}>
          <Header show={dealt} />
          <motion.p className={cn(LABEL, "shrink-0 text-white/70")} aria-live="off" initial={{ opacity: 0 }} animate={chromeIn} transition={{ duration: 0.8, delay: chromeDelay, ease: EASE }}>
            <motion.span>{counter}</motion.span>
          </motion.p>
        </div>

        {/* the rail: cards dealt from the right under perspective, then travelling with the scroll */}
        <div className="relative z-10 flex flex-1 items-center overflow-visible" style={{ perspective: PERSPECTIVE, perspectiveOrigin: "50% 50%" }}>
          <motion.div ref={railRef} className="flex items-start" style={{ x, gap: GAP, paddingLeft: railInset(stageWidth, PAD_X), paddingRight: railInset(stageWidth, PAD_X), transformStyle: "preserve-3d" }}>
            {services.items.map((_, i) => (
              <ServiceCard key={i} index={i} material={MATERIALS[i % MATERIALS.length]} dealt={dealt} fromX={stageWidth} phone={false} onOpen={setActive} />
            ))}
          </motion.div>
        </div>

        <motion.div className={`relative z-10 pb-10 ${CONTENT}`} initial={{ opacity: 0 }} animate={chromeIn} transition={{ duration: 0.8, delay: chromeDelay, ease: EASE }}>
          <div className="h-px w-full bg-white/20">
            <motion.div className="h-full origin-left" style={{ scaleX: travel, backgroundColor: GOLD }} />
          </div>
        </motion.div>
      </div>
      <AnimatePresence>{active && <ServiceModal key={active.title} service={active} onClose={closeModal} />}</AnimatePresence>
    </div>
  );
}

export default ServicesRail;

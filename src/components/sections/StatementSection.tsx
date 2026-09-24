"use client";

import { useRef } from "react";
import Image from "next/image";
import { Instrument_Serif, Onest } from "next/font/google";
import {
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
} from "framer-motion";
import { useSiteContent } from "@/lib/cms/context";

/* ------------------------------------------------------------------------------------------------
 * StatementSection
 *
 * One screen: a word set enormous behind a portrait, a heading laid over it, and a short paragraph
 * with two links. Layout, type and the entrance curves are measured and recorded in
 * docs/research/components/project-statement-section.spec.md; every word and the photograph come
 * from the content document, so the section is the admin's to change.
 *
 * What moves:
 * - Scroll. The word behind drifts one way and the portrait the other, so they separate as the
 *   section is passed; the portrait also breathes from 1.06 to 1 and back. Both are run through a
 *   spring, so the movement keeps going for a beat after the scroll stops.
 * - Pointer. A soft gold light follows the cursor behind the portrait, and the word leans a few
 *   pixels towards it. Both are written to motion values, so neither re-renders the tree.
 * - Arrival. The words of the heading rise out of their own clipped boxes, the portrait fades up,
 *   and the two columns follow, on the overdamped springs the reference was measured at.
 * - Hover. The portrait lifts and warms, the underline wipes across in gold and the arrow travels.
 *
 * `prefers-reduced-motion` keeps the gold and the layout and drops the movement.
 * ---------------------------------------------------------------------------------------------- */

const sans = Onest({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-project-sans", display: "swap" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: "italic", variable: "--font-project-serif", display: "swap" });

/* Palette. The golds are the site's own tokens, which is what ties this section to the rest. */
const BG = "#050505";
const FG = "#F5F5F5";
const MUTED = "#6B6B72";

const STACK_SANS = `var(--font-project-sans), -apple-system, "system-ui", "Segoe UI", sans-serif`;
const STACK_SERIF = `var(--font-project-serif), Georgia, serif`;
/** The arrow is not in Onest; pinning it to the generated fallback keeps the line its measured width. */
const STACK_ARROW = `"Onest Fallback", sans-serif`;

/* Overdamped springs, each quoted by the two real roots it was fitted to:
 * stiffness = r1 * r2, damping = r1 + r2, mass 1. */
const SPRING_IMAGE: Transition = { type: "spring", stiffness: 410, damping: 67, mass: 1 }; // -6.86, -60
const SPRING_WORD: Transition = { type: "spring", stiffness: 600, damping: 70, mass: 1 }; //  -10.05, -60
const SPRING_COLUMN: Transition = { type: "spring", stiffness: 75, damping: 21, mass: 1 }; //  -4.72, -16
const WORD_STAGGER = 0.06;
const DELAY_COLUMN_LEFT = 0.31;
const DELAY_COLUMN_RIGHT = 0.49;

/** Smooths the scroll-driven movement so it settles rather than stops dead. */
const DRIFT_SPRING = { stiffness: 70, damping: 22, mass: 0.6 } as const;
/** How far the word and the portrait travel across a full pass of the section. */
const WORD_TRAVEL = 90;
const PORTRAIT_TRAVEL = 36;
/** How far the word leans towards the pointer. */
const MAGNET = 14;

const GUTTER = "px-6 min-[768px]:px-10 min-[1024px]:px-14";
const EASE_UI = "transition-colors duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]";

/** The roman words of the heading: each is clipped by its wrapper and rises out of it. */
function Run({ words, show, from }: { words: string[]; show: boolean; from: number }) {
  return (
    <span style={{ display: "inline" }}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", paddingBottom: "0.1em", marginRight: i === words.length - 1 ? 0 : "0.25em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ opacity: 0, y: "110%" }}
            animate={show ? { opacity: 1, y: "0%" } : undefined}
            transition={{ ...SPRING_WORD, delay: (from + i) * WORD_STAGGER }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

function ArrowDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-1" aria-hidden="true">
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}

export function StatementSection() {
  const { statement } = useSiteContent();
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inView = useInView(bodyRef, { once: true, amount: 0.35 });
  const show = reduced || inView;

  /* Scroll: 0 as the section's top meets the bottom of the screen, 1 as its bottom leaves the top. */
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const wordDrift = useSpring(useTransform(scrollYProgress, [0, 1], [WORD_TRAVEL, -WORD_TRAVEL]), DRIFT_SPRING);
  const portraitDrift = useSpring(useTransform(scrollYProgress, [0, 1], [-PORTRAIT_TRAVEL, PORTRAIT_TRAVEL]), DRIFT_SPRING);
  const portraitScale = useSpring(useTransform(scrollYProgress, [0, 0.5, 1], [1.06, 1, 1.06]), DRIFT_SPRING);

  /* Pointer: a gold light that follows the cursor, and the word leaning towards it. */
  const glowX = useSpring(useMotionValue(50), { stiffness: 60, damping: 20 });
  const glowY = useSpring(useMotionValue(45), { stiffness: 60, damping: 20 });
  const magnetX = useSpring(useMotionValue(0), { stiffness: 50, damping: 18 });
  const glow = useMotionTemplate`radial-gradient(38rem 38rem at ${glowX}% ${glowY}%, rgba(201,169,98,0.16), rgba(201,169,98,0.05) 42%, transparent 68%)`;

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 100;
    glowX.set(px);
    glowY.set(((e.clientY - r.top) / r.height) * 100);
    magnetX.set(((px - 50) / 50) * MAGNET);
  };
  const onPointerLeave = () => {
    glowX.set(50);
    glowY.set(45);
    magnetX.set(0);
  };

  if (!statement.enabled) return null;

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 14 } as const,
    animate: show ? ({ opacity: 1, y: 0 } as const) : undefined,
    transition: { ...SPRING_COLUMN, delay },
  });
  const lead = statement.heading.lead.split(/\s+/).filter(Boolean);
  const tail = statement.heading.tail.split(/\s+/).filter(Boolean);

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label={statement.word}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`${sans.variable} ${serif.variable} group/section flex min-h-svh w-full flex-col`}
      style={{ backgroundColor: BG, color: FG, fontFamily: STACK_SANS }}
    >
      {/* the band the page's fixed navigation sits in */}
      <div aria-hidden="true" className="h-20 w-full shrink-0" />

      <div ref={bodyRef} className="relative min-h-[calc(100svh-5rem)] flex-1 overflow-hidden">
        {/* the gold light that follows the cursor */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ background: reduced ? undefined : glow }} />

        {/* the word, drifting against the scroll and leaning towards the pointer, brought up behind head and shoulders */}
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 flex items-start justify-center pt-8 min-[768px]:pt-12 min-[1200px]:pt-16" style={reduced ? undefined : { y: wordDrift, x: magnetX }}>
          <span
            className="select-none whitespace-nowrap text-[28vw] font-semibold leading-none tracking-[-0.04em] min-[768px]:text-[22vw]"
            style={{ color: "rgba(201,169,98,0.08)" }}
          >
            {statement.word}
          </span>
        </motion.div>

        {/* the portrait: entrance on the outside, drift in the middle, steady without hover effects */}
        <motion.div
          className="absolute inset-0 z-[1] flex items-start justify-center pt-4"
          initial={{ opacity: 0, y: 20 }}
          animate={show ? { opacity: 1, y: 0 } : undefined}
          transition={SPRING_IMAGE}
        >
          <motion.div className="relative flex h-full w-auto items-start" style={reduced ? undefined : { y: portraitDrift, scale: portraitScale }}>
            <div
              className="relative h-full w-auto"
              style={{
                aspectRatio: "747 / 1024",
                WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 95%)",
                maskImage: "linear-gradient(to bottom, black 0%, black 65%, transparent 95%)",
              }}
            >
              {statement.image ? (
                <Image src={statement.image} alt="Riyaz" fill priority sizes="(max-width: 768px) 100vw, 100vh" className="object-contain object-top" />
              ) : null}
            </div>
          </motion.div>
        </motion.div>

        {/* the writing, sat on the bottom edge */}
        <div className={`absolute inset-x-0 bottom-0 z-10 pb-8 min-[768px]:pb-10 ${GUTTER}`}>
          <div className="grid grid-cols-12 items-end gap-x-6 gap-y-7">
            <motion.div className="col-span-12 min-[768px]:col-span-7" {...rise(DELAY_COLUMN_LEFT)}>
              <h2 className="max-w-3xl text-balance text-[clamp(2rem,5.4vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
                <Run words={lead} show={show} from={0} />{" "}
                <span style={{ fontFamily: STACK_SERIF, fontStyle: "italic", fontWeight: 400, color: "var(--color-gold-light)" }}>{statement.heading.italic}</span>{" "}
                <Run words={tail} show={show} from={0} />
              </h2>
            </motion.div>

            <motion.div className="col-span-12 min-[768px]:col-span-4 min-[768px]:col-start-9 min-[768px]:pb-2" {...rise(DELAY_COLUMN_RIGHT)}>
              {/* a gold hairline, the same accent the rest of the page uses to open a column */}
              <motion.span
                aria-hidden="true"
                className="mb-5 block h-px w-full origin-left"
                style={{ backgroundColor: "var(--color-gold)" }}
                initial={{ scaleX: 0 }}
                animate={show ? { scaleX: 1 } : undefined}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: DELAY_COLUMN_RIGHT + 0.15 }}
              />
              <p className="mb-6 max-w-md text-pretty text-[14px] leading-relaxed min-[768px]:text-[15px]" style={{ color: "rgba(245,245,245,0.7)" }}>
                {statement.paragraph}
              </p>
              <div className="flex items-center gap-5">
                <a href={statement.cta.href} className={`group inline-flex items-center gap-2 text-sm font-medium outline-none hover:text-[var(--color-gold-light)] focus-visible:text-[var(--color-gold-light)] ${EASE_UI}`}>
                  <span className="relative block pb-0.5">
                    {statement.cta.label}
                    {/* the rule beneath wipes across in gold */}
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 block h-px" style={{ backgroundColor: "rgba(245,245,245,0.4)" }} />
                    <span aria-hidden="true" className="absolute inset-x-0 bottom-0 block h-px origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100" style={{ backgroundColor: "var(--color-gold)" }} />
                  </span>
                  <ArrowDown />
                </a>
                <a href={statement.secondary.href} className={`text-sm outline-none hover:text-[var(--color-gold-light)] focus-visible:text-[var(--color-gold-light)] ${EASE_UI}`} style={{ color: MUTED }}>
                  {statement.secondary.label} <span style={{ fontFamily: STACK_ARROW }}>→</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default StatementSection;

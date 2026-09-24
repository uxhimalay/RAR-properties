"use client";

import { memo, useMemo, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useSiteContent } from "@/lib/cms/context";
import { ARRIVAL_INSET, clamp01, layoutTop, takeoverEase } from "@/lib/motion";
import { TextReveal } from "@/components/motion/TextReveal";
import { CountUp } from "@/components/motion/CountUp";
import { LABEL } from "@/lib/design";
import { StatsTicker } from "@/components/sections/StatsTicker";

/* ------------------------------------------------------------------------------------------------
 * Geometry, measured from the project reference's material section (2026-09-18).
 * See docs/research/components/project-marquee-section.spec.md for the full extraction.
 * ---------------------------------------------------------------------------------------------- */

interface Geometry {
  /** Panel face, in its own (un-projected) plane. */
  panelWidth: number;
  panelHeight: number;
  /** Horizontal distance between panel centres along the strip. */
  pitch: number;
  /** Height of the strip's viewport box. */
  stripHeight: number;
}

/** >= 810px, measured at 1440. */
const DESKTOP_GEOMETRY: Geometry = { panelWidth: 260, panelHeight: 300, pitch: 212, stripHeight: 360 };

/** < 810px, measured at 390. */
/** Strip height leaves room for the open (front-facing) panel, which grows past 192px. */
const PHONE_GEOMETRY: Geometry = { panelWidth: 152, panelHeight: 192, pitch: 96, stripHeight: 264 };

const PHONE_QUERY = "(max-width: 809px)";
/** The cinematic arrival over the hero only exists where the hero pins (the desktop hero). */
const DESKTOP_QUERY = "(min-width: 1200px)";

const PANEL_RADIUS = 4;

/** Perspective on the strip's viewport element. Everything about the effect follows from this. */
const PERSPECTIVE = 1200;

/** Track speed in px/second: measured 100 with the pointer elsewhere, 40 while it is over the strip. */
const SPEED = 100;
const SPEED_HOVERED = 40;

/** Time constant (ms) for easing between the two speeds, so the change of pace is not a jolt. */
const SPEED_EASE = 150;

/**
 * Arrival over the hero (desktop). The band's position in the document is scroll-locked, so the
 * rise is shaped with a transform: it lags its linear position at first (a beat of anticipation),
 * sweeps up through the middle and settles into place, on the shared takeover easing that also
 * drives the hero's fade beneath it. It arrives as an inset card, ARRIVAL_INSET (20px) in from each
 * side like the stepped panels later on, and the margins close as it lands.
 *
 * Takeover by the next section, the same treatment the hero gets from this one: the band pins while
 * the next section rises over it, and across that one viewport height of scroll its content fades
 * 1 -> 0 and scales 1 -> 0.9 (centre origin). The band itself stays black; only the content reacts.
 * When the band is taller than the viewport it pins with its bottom edge at the viewport bottom, so
 * the ribbon is never cut off.
 */
const TAKEOVER_SCALE = 0.9;

/**
 * Self-reveal, per the user's brief: as a card's slot crosses the strip's centre it opens on its own,
 * holds, then tilts back and carries on. The next reveal comes REVEAL_EVERY cards later. Every
 * REVEAL_STRETCH_EVERY-th gap is one card longer: with six images a strict every-4th rhythm would
 * only ever feature three of them, and the extra card walks the pattern through all six.
 */
const REVEAL_EVERY = 4;
const REVEAL_HOLD = 3000;
const REVEAL_STRETCH_EVERY = 3;

/**
 * Where on its way in a card reveals itself: a fraction of the distance from the strip's left edge
 * to its centre. 1 = the card opens exactly as it reaches the centre (user brief, after trying 0.4
 * and 0.05); 0.4 would be 40% of the way in.
 */
const REVEAL_AT = 1;

/**
 * Copies of the image list laid end to end. The strip has to stay wider than the viewport plus the
 * 3D spill at both edges, because a panel near the edge projects to ~900px -- far wider than its
 * 260px face.
 */
const SETS = 5;

/** The panels: SETS copies of the band's images laid end to end (built inside the component from the content document). */
function buildPanels(images: { src: string; alt: string }[]) {
  const list = images.length ? images : [{ src: "/images/gallery-vale-house.png", alt: "" }];
  return Array.from({ length: SETS * list.length }, (_, i) => ({ ...list[i % list.length], key: i }));
}

/**
 * A 260px panel can project to roughly 900px near the strip edges, so the browser needs a source
 * wider than the panel's layout box or the edge panels look soft.
 */
const IMAGE_SIZES = "(min-width: 1200px) 900px, (min-width: 810px) 70vw, 90vw";

/**
 * Hover, measured on the live panels: rest is rotateY(90deg); over 0.4s with
 * cubic-bezier(0.25, 0.8, 0.25, 1) the panel swings round to face the viewer, lifts 48px and comes
 * 160px forward. It settles at rotateY(180deg) -- the back face, so the photo reads mirrored while
 * open, exactly as on the source -- and reverses along the same curve when it closes.
 */
const TRANSFORM_REST = "rotateY(90deg)";
const TRANSFORM_OPEN = "translate3d(0, -48px, 160px) rotateY(180deg)";
const SWING_TRANSITION = "transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)";

/* ------------------------------------------------------------------------------------------------
 * Phone / desktop geometry switch. useSyncExternalStore keeps the first client render identical to
 * the server render (desktop geometry), then swaps once the media query is known.
 * ---------------------------------------------------------------------------------------------- */

function subscribeToPhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useGeometry(): Geometry {
  const isPhone = useSyncExternalStore(
    subscribeToPhone,
    () => window.matchMedia(PHONE_QUERY).matches,
    () => false,
  );
  return isPhone ? PHONE_GEOMETRY : DESKTOP_GEOMETRY;
}

function subscribeToDesktop(onChange: () => void) {
  const mq = window.matchMedia(DESKTOP_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribeToDesktop, () => window.matchMedia(DESKTOP_QUERY).matches, () => true);
}

/* ------------------------------------------------------------------------------------------------
 * Panel
 *
 * Every panel carries the identical rotateY(90deg) at rest. A plane rotated 90 degrees about its
 * own vertical axis is edge-on only at the perspective origin; off-axis it is seen obliquely and
 * projects to a wide parallelogram. So apparent width is purely a function of distance from the
 * centre line, and panels crossing the middle collapse to a sliver. That is the whole effect --
 * there is no per-panel rotation animation apart from the swing.
 *
 * Hit-testing is deliberately NOT done on the picture. A rotated panel's projected outline is a thin
 * sliver near the centre and it moves as the panel swings, so browser :hover on it is sporadic and
 * flickers. Instead each slot has a flat, invisible, slot-wide hit area (`data-hit`) that never
 * moves relative to the strip; the picture itself ignores the pointer.
 * ---------------------------------------------------------------------------------------------- */

const Panel = memo(function Panel({
  image,
  alt,
  index,
  count,
  geometry,
  stripWidth,
  open,
}: {
  image: string;
  alt: string;
  index: number;
  /** Distinct images; panels past the first set are decorative copies. */
  count: number;
  geometry: Geometry;
  stripWidth: number;
  open: boolean;
}) {
  const decorative = index >= count;
  return (
    <div
      className="absolute"
      style={{
        width: geometry.pitch,
        height: geometry.stripHeight,
        left: index * geometry.pitch - stripWidth / 2 - geometry.pitch / 2,
        top: -geometry.stripHeight / 2,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Slot-wide hit area: flat, invisible, contiguous with its neighbours */}
      <div data-hit={index} className="absolute inset-0" />

      {/* Picture: the 3D panel, centred in the slot, no pointer events.
          The transformed layer itself is NOT clipped or rounded: a rounded overflow clip on a
          perspective-projected layer that moves every frame produces a flickering hairline in
          Chrome (the mask edge and the content edge disagree by a pixel from frame to frame).
          The radius lives on the image, and will-change keeps the layer on the compositor so it is
          never re-rasterised mid-motion. */}
      <div
        aria-hidden={decorative}
        className="pointer-events-none absolute"
        style={{
          width: geometry.panelWidth,
          height: geometry.panelHeight,
          left: (geometry.pitch - geometry.panelWidth) / 2,
          top: (geometry.stripHeight - geometry.panelHeight) / 2,
          transform: open ? TRANSFORM_OPEN : TRANSFORM_REST,
          transformOrigin: "center",
          transition: SWING_TRANSITION,
          willChange: "transform",
        }}
      >
        <Image
          src={image}
          alt={decorative ? "" : alt}
          fill
          sizes={IMAGE_SIZES}
          className="object-cover"
          style={{ borderRadius: PANEL_RADIUS }}
          draggable={false}
        />
      </div>
    </div>
  );
});

/* ------------------------------------------------------------------------------------------------
 * ProjectMarqueeSection
 *
 * Full-bleed black band carrying a section header and a 3D perspective marquee.
 *
 * Background and box model come from the project reference's dark band: black,
 * edge to edge, at least 100vh on desktop with the content centred, a 1600px container and 40px
 * gutters. Below 1200px the height becomes content-driven with 100px (tablet) / 80px (phone) block
 * padding, matching the source.
 *
 * The header follows the project reference's material header -- small uppercase eyebrow, large
 * sentence-case heading, subtitle -- flush left, with the heading kept to one line from tablet up.
 * Colours are inverted for the black band; type uses the project's own families.
 *
 * The strip is a time-driven marquee -- not scroll-driven -- advanced every frame at 100px/s, easing
 * to 40px/s while the pointer is over it, and scrubbed 1:1 by dragging (grab cursor). The track
 * offset wraps every set width, which is seamless because the content repeats at that period.
 *
 * A panel opens when the pointer actually MOVES onto its slot, and closes as soon as its slot is
 * no longer under the pointer, whether the pointer moved or the strip did. The strip drifting under
 * a resting pointer opens nothing by itself.
 *
 * Independently, a card reveals itself on its way in, once it is REVEAL_AT of the distance from the
 * strip's left edge to the centre: it opens, holds for REVEAL_HOLD, tilts back and carries on, and
 * the next reveal comes REVEAL_EVERY cards later. The pointer always takes precedence over a
 * self-reveal.
 *
 * The entrance is the project reference's measured scroll behaviour: the contents sit at opacity 0 until
 * the section is roughly half visible, and the animation reverses when it leaves.
 *
 * Below the strip sits the site's stats ribbon (StatsTicker, dark tone), per the user's request.
 *
 * The section is `position: sticky` so that the next section can rise over it (see TAKEOVER_SCALE);
 * page.tsx wraps the two in one block so the pin releases once the takeover is complete.
 * ---------------------------------------------------------------------------------------------- */

function slotUnderPointer(clientX: number, clientY: number): number | null {
  const hit = document.elementFromPoint(clientX, clientY)?.closest<HTMLElement>("[data-hit]");
  return hit ? Number(hit.dataset.hit) : null;
}

export function ProjectMarqueeSection({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();
  const geometry = useGeometry();
  const { work } = useSiteContent();
  const images = work.images;
  const panels = useMemo(() => buildPanels(images), [images]);

  // ---- Pin + takeover by the next section ------------------------------------------------------
  const sectionRef = useRef<HTMLElement>(null);
  /** `top` for the sticky pin: 0, or negative when the band is taller than the viewport. */
  const pinTop = useMotionValue("0px");
  /** Document scrollY at which the takeover starts (band fully pinned), and its length (1 viewport). */
  const takeoverRange = useRef({ start: 0, length: 1 });
  /** Document scrollY at which the band's own arrival over the hero starts (top at the fold), and 1 viewport. */
  const arrivalRange = useRef({ start: 0, length: 1 });
  const isDesktop = useIsDesktop();
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const measure = () => {
      const vh = window.innerHeight;
      const h = el.offsetHeight;
      // Layout position, read sticky-safe: a stuck element's offsetTop follows the scroll, and this
      // can run mid-scroll (body resize, viewport resize).
      const top = layoutTop(el);
      takeoverRange.current = { start: top + Math.max(0, h - vh), length: vh };
      arrivalRange.current = { start: top - vh, length: vh };
      pinTop.set(`${Math.min(0, vh - h)}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(document.body);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [pinTop]);
  const { scrollY } = useScroll();
  const takeover = useTransform(scrollY, (y) => {
    const { start, length } = takeoverRange.current;
    return Math.min(1, Math.max(0, (y - start) / length));
  });
  const contentOpacity = useTransform(takeover, [0, 1], [1, 0]);
  const contentScale = useTransform(takeover, [0, 1], [1, TAKEOVER_SCALE]);

  // ---- Arrival over the hero (desktop only) ----------------------------------------------------
  // Linear progress p of the band's top from the fold to the viewport top, and its eased twin e.
  // The transform is the difference between where the eased rise wants the band and where scroll
  // has put it: -(e - p) viewport heights, which is 0 at both ends so nothing ever jumps.
  const arrival = useTransform(scrollY, (y) => {
    if (!isDesktop) return 0;
    const { start, length } = arrivalRange.current;
    return clamp01((y - start) / length);
  });
  const riseY = useTransform(arrival, (p) => -(takeoverEase(p) - p) * arrivalRange.current.length);
  const sideClip = useTransform(arrival, (p) => {
    const inset = isDesktop ? ARRIVAL_INSET * (1 - takeoverEase(p)) : 0;
    return `inset(0px ${inset}px 0px ${inset}px)`;
  });
  // ----------------------------------------------------------------------------------------------
  const setWidth = Math.max(1, images.length) * geometry.pitch;
  const stripWidth = panels.length * geometry.pitch;

  const x = useMotionValue(0);
  const hovered = useRef(false);
  const speed = useRef(SPEED);
  const pointer = useRef<{ x: number; y: number } | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const openRef = useRef<number | null>(null);
  /** Who opened the current slot: the pointer, or the self-reveal schedule. */
  const openBy = useRef<"pointer" | "auto" | null>(null);

  // Self-reveal schedule, all in px of strip travel so it is immune to speed changes, drag and the
  // track wrapping. Slot 15's centre sits exactly on the strip's centre at x = 0 (the strip is an
  // even number of slots), so thresholds spaced in whole slots from 0 mark centre crossings; each
  // reveal fires `lead` px before its crossing, i.e. when the card is REVEAL_AT of the way in.
  const travel = useRef(0);
  const nextReveal = useRef(0);
  const reveals = useRef(0);
  const revealUntil = useRef<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const lead = useRef(0);
  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const measure = () => {
      lead.current = (1 - REVEAL_AT) * (el.clientWidth / 2);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const setOpenSlot = (slot: number | null, by: "pointer" | "auto" | null = slot === null ? null : "pointer") => {
    if (openRef.current === slot && openBy.current === by) return;
    openRef.current = slot;
    openBy.current = slot === null ? null : by;
    setOpen(slot);
  };

  const wrap = (value: number) => ((value % setWidth) + setWidth) % setWidth;
  const advance = (dx: number) => {
    x.set(wrap(x.get() + dx));
    travel.current += dx;
  };

  useAnimationFrame((time, delta) => {
    // A pointer-opened panel closes once its slot has drifted out from under the pointer.
    if (openBy.current === "pointer") {
      const p = pointer.current;
      if (!p || slotUnderPointer(p.x, p.y) !== openRef.current) setOpenSlot(null);
    }
    if (reduceMotion) return;

    // A self-revealed panel tilts back after its hold.
    if (revealUntil.current !== null && time >= revealUntil.current) {
      revealUntil.current = null;
      if (openBy.current === "auto") setOpenSlot(null);
    }
    // Fire the next self-reveal `lead` px before the scheduled slot crosses the centre, i.e. once
    // that card is REVEAL_AT of the way in. The pointer always wins: if it already holds a panel
    // open the turn is skipped, not queued.
    if (travel.current >= nextReveal.current - lead.current) {
      reveals.current += 1;
      const stretch = reveals.current % REVEAL_STRETCH_EVERY === 0 ? 1 : 0;
      nextReveal.current += (REVEAL_EVERY + stretch) * geometry.pitch;
      while (nextReveal.current - lead.current <= travel.current) nextReveal.current += REVEAL_EVERY * geometry.pitch;
      if (openRef.current === null) {
        // The slot whose centre is `lead` px left of the strip's centre right now.
        const nearest = Math.round((stripWidth / 2 - lead.current - x.get()) / geometry.pitch);
        setOpenSlot(Math.min(panels.length - 1, Math.max(0, nearest)), "auto");
        revealUntil.current = time + REVEAL_HOLD;
      }
    }

    const target = hovered.current ? SPEED_HOVERED : SPEED;
    speed.current += (target - speed.current) * Math.min(1, delta / SPEED_EASE);
    advance((speed.current * delta) / 1000);
  });

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const prev = pointer.current;
    pointer.current = { x: e.clientX, y: e.clientY };
    // Only genuine pointer motion opens a panel; the browser also synthesises moves when content
    // shifts under a still pointer, and those arrive with unchanged coordinates.
    if (prev && prev.x === e.clientX && prev.y === e.clientY) return;
    const slot = (e.target as HTMLElement).closest<HTMLElement>("[data-hit]");
    if (slot) {
      revealUntil.current = null;
      setOpenSlot(Number(slot.dataset.hit), "pointer");
    } else if (openBy.current === "pointer") {
      setOpenSlot(null);
    }
  };

  const onPointerLeave = () => {
    hovered.current = false;
    pointer.current = null;
    if (openBy.current === "pointer") setOpenSlot(null);
  };

  return (
    <motion.section
      ref={sectionRef}
      id="work"
      aria-label="Selected project imagery"
      className={`sticky flex w-full items-center justify-center overflow-hidden bg-black py-20 tablet:py-24 desktop:min-h-dvh ${className ?? ""}`}
      style={{ top: pinTop, y: riseY, clipPath: sideClip }}
    >
      {/* Content layer: fades and scales down while the next section rises over the band */}
      <motion.div
        className="flex w-full max-w-[1600px] flex-col items-center justify-center px-5 tablet:px-10"
        style={{ opacity: contentOpacity, scale: contentScale }}
      >
        {/* Header: flush with the container's left edge, every line left-aligned, heading on one line.
            From 1200px it is a row, with the figure at the far end starting on the header's own top
            line; below that there is no room beside the heading, so the figure stacks under the link. */}
        <div className="mb-12 flex w-full flex-col items-start gap-4 text-left desktop:mb-[120px] desktop:gap-2">
          <p className={LABEL} style={{ color: "var(--color-gold)" }}>
            {work.eyebrow}
          </p>
          {/* Heading, subtitle and link on the left; the figure at the far end. `items-baseline`
              puts the figure's number on the heading's own baseline, with no offsets to keep in
              step if either changes size. */}
          <div className="flex w-full flex-col items-start gap-10 desktop:flex-row desktop:items-baseline desktop:justify-between desktop:gap-16">
          <div className="flex w-full flex-col items-start gap-4 text-left desktop:w-auto desktop:gap-2">
          <TextReveal
            as="h2"
            text={work.heading}
            className="font-display text-[40px] font-normal leading-[1.2] tracking-[-0.04em] text-white tablet:whitespace-nowrap tablet:text-[56px] desktop:text-[80px]"
          />
          <TextReveal
            as="p"
            text={work.subtitle}
            className="font-inter text-[16px] font-normal leading-[1.6] text-white/60 tablet:text-[18px]"
          />
          {/* where to go next: the categories the work is sorted into, one section down */}
          <a href={work.link.href} className="hit-slop group mt-1 flex w-fit items-center gap-2 py-1 font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px] outline-none transition-colors hover:text-[var(--color-gold-light)] focus-visible:text-[var(--color-gold-light)]" style={{ color: "var(--color-gold)" }}>
            {work.link.label}
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true" className="transition-transform duration-300 group-hover:translate-y-1"><path d="M7 2v9.5M3.5 8L7 11.5 10.5 8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

          {/* The figure at the other end of the line: it runs up from zero the first time it is
              reached, with the caption under it. Switched off, and edited, in the admin. */}
          {work.figure?.enabled ? (
            <div className="flex shrink-0 flex-col items-start gap-2 desktop:items-end desktop:text-right">
              <p className="font-display text-[48px] font-normal leading-[0.95] tracking-[-0.04em] text-white tablet:text-[64px] desktop:text-[80px]">
                <CountUp to={work.figure.value} />
                <span aria-hidden="true" style={{ color: "var(--color-gold)" }}>{work.figure.suffix}</span>
              </p>
              <p aria-hidden="true" className="max-w-[260px] font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px]" style={{ color: "var(--color-gold)" }}>
                {work.figure.label}
              </p>
              {/* the whole figure once, in readable text: the digits above churn while they count */}
              <span className="sr-only">{`${work.figure.value.toLocaleString("en-US")}${work.figure.suffix} ${work.figure.label}`}</span>
            </div>
          ) : null}
          </div>
        </div>

        {/* Strip viewport: owns the perspective, the hover speed, the open slot and the drag */}
        <motion.div
          ref={stripRef}
          className="relative w-full cursor-grab touch-pan-y select-none active:cursor-grabbing"
          style={{ height: geometry.stripHeight, perspective: PERSPECTIVE, perspectiveOrigin: "50% 50%" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ amount: 0.5, once: false }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          onPointerEnter={() => {
            hovered.current = true;
          }}
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPan={(_, info) => advance(info.delta.x)}
        >
          {/* Track: zero-size, pinned to the strip's centre, carrying the whole 3D scene */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-0 w-0"
            style={{ x, transformStyle: "preserve-3d", willChange: "transform" }}
          >
            {panels.map((panel) => (
              <Panel
                key={panel.key}
                image={panel.src}
                alt={panel.alt}
                index={panel.key}
                count={Math.max(1, images.length)}
                geometry={geometry}
                stripWidth={stripWidth}
                open={open === panel.key}
              />
            ))}
          </motion.div>
        </motion.div>

        {/* Stats ribbon, the same ticker as under About, in white on the black band */}
        <StatsTicker tone="dark" items={work.stats} className="mt-16 desktop:mt-[120px]" />
      </motion.div>
    </motion.section>
  );
}

export default ProjectMarqueeSection;

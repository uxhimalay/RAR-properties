"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { SITE_FOOTER } from "@/lib/content";
import { useSiteContent } from "@/lib/cms/context";
import { RollLabel } from "@/components/ui/RollLabel";
import { useEnquiry } from "@/components/enquiry/EnquiryContext";
import { CONTENT, LABEL } from "@/lib/design";

/* ------------------------------------------------------------------------------------------------
 * SiteFooter
 *
 * Built to the project reference's footer (measured 2026-09-19;
 * docs/research/components/site-footer.spec.md).
 *
 * - Dark block, 72px top padding (32 on phone). Centred "Want to talk *property?*" line, the italic
 *   part in the display face.
 * - A marquee link: [big uppercase phrase][circle with an up-right arrow] repeated, 16px apart,
 *   drifting left at 69.7px/s and easing down to 55.8px/s while hovered (the source's only hover
 *   change). The phrase is 64/64 on desktop (16/24 on phone), the circle 48px (20).
 * - The brand name outlined, fitted to the full width (an SVG text with a hairline stroke and no fill).
 * - A bottom row above a 1px line: social links left (120px apart; stacked on phone) and "Back to
 *   top" right, every label rolling up to a second copy on hover, the arrow icon rolling with it.
 *
 * Colours mapped to ours: black, white, the gold accent for the circles; type in the site's faces.
 * ---------------------------------------------------------------------------------------------- */

/** Marquee speeds, px/s (source: 69.7 at rest, 55.8 hovered). */
const SPEED = 69.7;
const SPEED_HOVER = 55.8;
/** How quickly the speed eases between the two (per second). */
const SPEED_EASE = 6;
const GAP = 16;
const GOLD = "var(--color-gold)";

/** The source's 13x12 arrow inside the circles (`#svg-1130742374_178`). */
function ArrowNE({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 13 12" className={className} aria-hidden="true">
      <path d="M11 1.5v6.738h-.746v-5.47L2.522 10.5 2 9.953l7.707-7.707h-5.47V1.5H11Z" fill="currentColor" />
    </svg>
  );
}

/** The source's 24x24 arrow-up icon (`#svg146682300_245`). */
function ArrowUp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" className={className} aria-hidden="true">
      <path d="M12 5v15M7 9l4.293-4.293c.333-.333.5-.5.707-.5.207 0 .374.167.707.5L17 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ----------------------------------- marquee ------------------------------------------------- */

function Marquee({ text, onClick }: { text: string; onClick: () => void }) {
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const [period, setPeriod] = useState(0);
  const [copies, setCopies] = useState(4);
  const hovered = useRef(false);
  const speed = useRef(SPEED);
  const x = useMotionValue(0);

  // One period = phrase + gap + circle + gap; enough copies to cover the width twice over.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      const [phrase, circle] = [track.children[0] as HTMLElement | undefined, track.children[1] as HTMLElement | undefined];
      if (!phrase || !circle) return;
      const p = phrase.offsetWidth + GAP + circle.offsetWidth + GAP;
      setPeriod(p);
      setCopies(Math.max(2, Math.ceil((track.parentElement?.clientWidth ?? 1440) / p) + 2));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track.parentElement ?? track);
    return () => observer.disconnect();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !period) return;
    const dt = delta / 1000;
    const target = hovered.current ? SPEED_HOVER : SPEED;
    speed.current += (target - speed.current) * Math.min(1, dt * SPEED_EASE);
    let next = x.get() - speed.current * dt;
    if (next <= -period) next += period;
    x.set(next);
  });

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={text}
      className="group relative block h-11 w-full cursor-pointer overflow-hidden outline-none tablet:h-12"
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <motion.ul ref={trackRef} className="absolute left-0 top-1/2 flex -translate-y-1/2 items-center whitespace-nowrap" style={{ x, gap: GAP }} aria-hidden="true">
        {Array.from({ length: copies }).flatMap((_, c) => [
          <li key={`t${c}`} className="font-display text-[16px] font-normal uppercase leading-[24px] text-white tablet:text-[64px] tablet:leading-[64px] tablet:tracking-[-1.92px]">
            {text}
          </li>,
          <li key={`c${c}`} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-black tablet:h-12 tablet:w-12" style={{ backgroundColor: GOLD }}>
            <ArrowNE className="h-2 w-2 tablet:h-3 tablet:w-[13px]" />
          </li>,
        ])}
      </motion.ul>
    </button>
  );
}

/* ----------------------------------- outlined brand ------------------------------------------ */

/**
 * The brand name as an outline, fitted to the full width like the source's fit-text SVG: a text
 * stretched to the viewBox width, stroke only, the stroke kept at hairline width whatever the scale.
 */
function OutlineBrand({ text }: { text: string }) {
  const W = 1000;
  const H = 124;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" aria-hidden="true">
      <text
        x={W / 2}
        y={H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        textLength={W}
        lengthAdjust="spacingAndGlyphs"
        fontSize={168}
        fill="none"
        stroke="rgba(255, 255, 255, 0.45)"
        strokeWidth={0.7}
        vectorEffect="non-scaling-stroke"
        className="font-display uppercase"
        style={{ letterSpacing: "-0.02em" }}
      >
        {text}
      </text>
    </svg>
  );
}

/* ----------------------------------- footer -------------------------------------------------- */

const LINK = "font-inter text-[14px] font-normal tracking-[-0.42px] text-white";

const GOLD_LABEL = `${LABEL} text-[var(--color-gold)]`;
/** Tall enough to tap without an invisible slop, which would overlap the link stacked under it. */
const CONTACT_LINK = "group inline-flex w-fit items-center gap-2 py-2.5 font-inter text-[16px] font-medium leading-[22px] tracking-[-0.32px] text-white outline-none transition-colors hover:text-[var(--color-gold-light)] focus-visible:text-[var(--color-gold-light)]";

export function SiteFooter() {
  const enquiry = useEnquiry();
  const { footer, contact: CONTACT } = useSiteContent();
  const whatsappHref = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, "")}`;
  const telHref = `tel:${CONTACT.phone.replace(/[^\d+]/g, "")}`;
  return (
    <footer id="contact" data-anchor-offset="64" className="w-full overflow-hidden bg-black pt-8 text-white tablet:pt-[72px]" aria-label="Footer">
      <div className="flex w-full flex-col items-center gap-4 pb-12 tablet:gap-16 tablet:pb-20">
        <p className="font-inter text-[16px] font-normal leading-5 tracking-[-0.48px]">
          {footer.collab.text} <span className="font-display italic">{footer.collab.italic}</span>
        </p>
        <Marquee text={footer.marquee} onClick={() => enquiry.open()} />
      </div>

      {/* how to reach us: the details behind every call to action on the page */}
      <div className={`relative ${CONTENT} mb-8 grid grid-cols-1 gap-8 border-t border-dashed py-8 tablet:grid-cols-3 tablet:gap-6`} style={{ borderColor: "rgba(255, 255, 255, 0.22)" }}>
        <div className="flex flex-col gap-2">
          <p className={GOLD_LABEL}>{SITE_FOOTER.contact.visit}</p>
          <p className="font-inter text-[16px] font-medium leading-[22px] tracking-[-0.32px] text-white">{CONTACT.address}</p>
          <p className="font-inter text-[13px] font-medium leading-[18px] text-white/55">{CONTACT.hours}</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className={GOLD_LABEL}>{SITE_FOOTER.contact.call}</p>
          <a href={telHref} className={CONTACT_LINK}>{CONTACT.phone}</a>
          <a href={whatsappHref} target="_blank" rel="noreferrer" className={CONTACT_LINK}>{CONTACT.whatsapp} <span className="text-[11px] uppercase tracking-[0.44px] text-white/55">WhatsApp</span></a>
        </div>
        <div className="flex flex-col gap-2">
          <p className={GOLD_LABEL}>{SITE_FOOTER.contact.email}</p>
          <a href={`mailto:${CONTACT.email}`} className={CONTACT_LINK}>{CONTACT.email}</a>
          <button type="button" onClick={() => enquiry.open()} className={cn(CONTACT_LINK, "cursor-pointer text-[var(--color-gold)]")}>{footer.marquee} <ArrowNE className="h-3 w-[13px]" /></button>
        </div>
      </div>

      <div className={`${CONTENT} pb-6 tablet:pb-8`}>
        <OutlineBrand text={footer.outline} />
        <span className="sr-only">{footer.outline}</span>
      </div>

      {/* Phone stacks these rows, so they are spaced far enough apart that the links' tap areas never overlap. */}
      <div className={`relative flex flex-col gap-8 py-6 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-4 ${CONTENT}`}>
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-white/10" />
        <p className="order-last font-inter text-[12px] font-medium leading-[16px] text-white/45 tablet:absolute tablet:left-1/2 tablet:top-1/2 tablet:order-none tablet:-translate-x-1/2 tablet:-translate-y-1/2">{footer.copyright}</p>
        <ul className="flex items-start justify-between tablet:justify-start tablet:gap-[120px]">
          {CONTACT.socials.map((s) => (
            <li key={s.label}>
              <a href={s.href} target="_blank" rel="noreferrer" className={cn("hit-slop group block py-1 outline-none", LINK)}>
                <RollLabel>{s.label}</RollLabel>
              </a>
            </li>
          ))}
        </ul>
        <a href="#top" className={cn("hit-slop group flex items-center gap-1 self-start outline-none tablet:self-auto", LINK)}>
          <RollLabel>{SITE_FOOTER.backToTop}</RollLabel>
          <span className="block h-6 w-6 overflow-hidden" aria-hidden="true">
            <span className="block transition-transform duration-300 ease-out group-hover:-translate-y-6 group-focus-visible:-translate-y-6">
              <ArrowUp />
              <ArrowUp />
            </span>
          </span>
        </a>
      </div>
    </footer>
  );
}

export default SiteFooter;

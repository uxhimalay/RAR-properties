"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimationFrame, useMotionValue, useReducedMotion } from "framer-motion";
import { useSiteContent } from "@/lib/cms/context";

/* ------------------------------------------------------------------------------------------------
 * PartnersRibbon
 *
 * "Developers we work with": a quiet dark band between the services and the statement, carrying the
 * statement's black so the two read as one stretch rather than a bright strip between them. The
 * partner names drift left as wordmarks (a logo replaces the name when one is set in the admin),
 * with a gold dot between each. Slows while hovered, like the footer marquee. Managed in the admin:
 * names, logos, on/off, archive; the whole ribbon can be switched off.
 * ---------------------------------------------------------------------------------------------- */

const SPEED = 40;
const SPEED_HOVER = 18;
const GAP = 56;
import { CONTENT, LABEL } from "@/lib/design";

export function PartnersRibbon() {
  const { partners } = useSiteContent();
  const reduceMotion = useReducedMotion();
  const items = partners.items.filter((p) => p.enabled && !p.archived);
  const trackRef = useRef<HTMLUListElement>(null);
  const [period, setPeriod] = useState(0);
  const [copies, setCopies] = useState(2);
  const hovered = useRef(false);
  const speed = useRef(SPEED);
  const x = useMotionValue(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !items.length) return;
    const measure = () => {
      const set = [...track.children].slice(0, items.length);
      const p = set.reduce((w, el) => w + (el as HTMLElement).offsetWidth + GAP, 0);
      setPeriod(p);
      setCopies(Math.max(2, Math.ceil((track.parentElement?.clientWidth ?? 1440) / Math.max(1, p)) + 1));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track.parentElement ?? track);
    return () => observer.disconnect();
  }, [items.length]);

  useAnimationFrame((_, delta) => {
    if (reduceMotion || !period) return;
    const dt = delta / 1000;
    const target = hovered.current ? SPEED_HOVER : SPEED;
    speed.current += (target - speed.current) * Math.min(1, dt * 6);
    let next = x.get() - speed.current * dt;
    if (next <= -period) next += period;
    x.set(next);
  });

  if (!partners.enabled || !items.length) return null;

  return (
    <section aria-label="Partners" className="w-full overflow-hidden border-t border-dashed bg-black py-10 tablet:py-14" style={{ borderColor: "rgba(255, 255, 255, 0.18)" }} onMouseEnter={() => (hovered.current = true)} onMouseLeave={() => (hovered.current = false)}>
      <p className={`${LABEL} ${CONTENT} mb-6`} style={{ color: "var(--color-gold)" }}>{partners.eyebrow}</p>
      <div className="relative h-10 w-full">
        <motion.ul ref={trackRef} className="absolute left-0 top-0 flex items-center whitespace-nowrap" style={{ x, gap: GAP }}>
          {Array.from({ length: copies }).flatMap((_, c) =>
            items.map((p, i) => (
              <li key={`${c}-${p.id}`} className="flex items-center" style={{ gap: GAP }} aria-hidden={c > 0 ? "true" : undefined}>
                {p.logo ? (
                  <span className="relative block h-8 w-[140px]">
                    <Image src={p.logo} alt={p.name} fill sizes="140px" className="object-contain" />
                  </span>
                ) : (
                  <span className="font-display text-[26px] font-normal uppercase leading-none tracking-[-0.02em] text-white/70 tablet:text-[30px]">{p.name}</span>
                )}
                {i < items.length - 1 || true ? <span aria-hidden="true" className="block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "var(--color-gold)" }} /> : null}
              </li>
            )),
          )}
        </motion.ul>
      </div>
    </section>
  );
}

export default PartnersRibbon;

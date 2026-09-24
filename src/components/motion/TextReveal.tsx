"use client";

import { Fragment, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ElementType } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

export type TextRevealPreset = "default" | "hero-heading" | "hero-paragraph";

interface TextRevealProps {
  /** Text to reveal. Use "\n" for hard line breaks. */
  text: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /**
   * default: per-LINE stagger (0.1s), y 20 -> 0, blur 2 -> 0, 0.45s (section headings/paragraphs, on scroll into view)
   * hero-heading: per-WORD stagger (0.19s), x 5 / y 20 / blur 5 -> 0, 1.5s (plays on mount)
   * hero-paragraph: per-WORD stagger (0.025s), skewX 5deg / y 20 / blur 5 -> 0, 1.5s (plays on mount)
   */
  preset?: TextRevealPreset;
  /** Extra delay (s) before the first unit starts */
  delay?: number;
  /** Play immediately on mount instead of when scrolled into view */
  startOnMount?: boolean;
}

const subscribeNoop = () => () => {};

const PRESETS = {
  default: { stagger: 0.1, by: "line" as const, duration: 0.45, from: { opacity: 0, y: 20, x: 0, skewX: 0, filter: "blur(2px)" } },
  "hero-heading": { stagger: 0.19, by: "word" as const, duration: 1.5, from: { opacity: 0, y: 20, x: 5, skewX: 0, filter: "blur(5px)" } },
  "hero-paragraph": { stagger: 0.025, by: "word" as const, duration: 1.5, from: { opacity: 0, y: 20, x: 0, skewX: 5, filter: "blur(5px)" } },
};

/**
 * Framer-style text reveal. Splits text into words (inline-block spans) and animates them in.
 * For the "default" preset the stagger is per rendered line (measured after layout), matching the
 * original site where every character on a line appears together and each line follows 0.1s later.
 */
export function TextReveal({ text, as: Tag = "span", className, style, preset = "default", delay = 0, startOnMount = false }: TextRevealProps) {
  const cfg = PRESETS[preset];
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const [lineIndex, setLineIndex] = useState<number[] | null>(null);

  const lines = useMemo(() => text.split("\n").map((l) => l.split(/\s+/).filter(Boolean)), [text]);

  useLayoutEffect(() => {
    if (cfg.by !== "line" || !ref.current) return;
    const spans = Array.from(ref.current.querySelectorAll<HTMLElement>("[data-word]"));
    const tops: number[] = [];
    const idx = spans.map((s) => {
      const t = Math.round(s.offsetTop);
      let i = tops.findIndex((v) => Math.abs(v - t) < 4);
      if (i === -1) { tops.push(t); i = tops.length - 1; }
      return i;
    });
    setLineIndex(idx);
  }, [cfg.by, text]);

  // Client-only flag without a state update in an effect: false on the server, true once hydrated.
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  const play = startOnMount ? mounted : inView;

  // Running word index per line, computed up front rather than by mutating a counter mid-render.
  const offsets = useMemo(() => lines.reduce<number[]>((acc, _, i) => { acc.push(i === 0 ? 0 : acc[i - 1] + lines[i - 1].length); return acc; }, []), [lines]);
  return (
    <Tag ref={ref} className={className} style={style}>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {line.map((w, wi) => {
            const wordIndex = offsets[li] + wi;
            const unit = cfg.by === "word" ? wordIndex : (lineIndex ? lineIndex[wordIndex] : li);
            const key = `${li}-${wi}`;
            return (
              <Fragment key={key}>
                <motion.span
                  data-word=""
                  className="inline-block will-change-transform"
                  initial={cfg.from}
                  animate={play ? { opacity: 1, y: 0, x: 0, skewX: 0, filter: "blur(0px)" } : cfg.from}
                  transition={{ duration: cfg.duration, delay: delay + unit * cfg.stagger, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
                {wi < line.length - 1 ? " " : null}
              </Fragment>
            );
          })}
          {li < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </Tag>
  );
}

export { cn as _cn };

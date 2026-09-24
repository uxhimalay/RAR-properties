"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------------------------------
 * BittenTabs
 *
 * A segmented tab bar in the visual language of the project reference's bitten-corner button
 * (measured 2026-09-18): 60px tall, 220px minimum per segment, 11px / 500 / uppercase / 0.44px
 * tracking, a 1px line at 30% ink, and a 21px square bitten out of the bar's bottom-right corner.
 *
 * Design:
 * - One contiguous bar, segments divided by 1px lines, so it reads as a single control.
 * - The active segment is solid ink with inverted text. The fill is one element that slides between
 *   segments (framer-motion layout animation, 0.5s cubic-bezier(0.7, 0, 0.3, 1) -- the source's
 *   button easing), so switching feels like a physical selector rather than a repaint.
 * - The bite belongs to the bar, so whichever segment is last is cut by it, fill included. As on the
 *   source, hovering the segment that owns the corner closes the bite over 0.5s and leaving re-opens
 *   it.
 * - Inactive segments tint on hover (ink at 5%).
 *
 * The outline follows the bitten shape without a border property: an outer layer in the line
 * colour and an inner layer inset by 1px, both clipped by the same polygon, give a uniform 1px line
 * everywhere including along the notch. Everything inside is clipped by the same polygon, so the
 * sliding fill needs no special casing at the corner.
 *
 * Accessible: role=tablist/tab, aria-selected, roving tabindex, Left/Right/Home/End keys. `onChange`
 * reports the selected index so panels can be wired up when there is content to show.
 * ---------------------------------------------------------------------------------------------- */

const BITE = 21;
const EASE_CSS = "cubic-bezier(0.7, 0, 0.3, 1)";
const EASE = [0.7, 0, 0.3, 1] as const;

/** Six points, so the open and closed shapes interpolate; `b` is the bite size. */
const bitten = (b: string) => `polygon(0 0, 100% 0, 100% calc(100% - ${b}), calc(100% - ${b}) calc(100% - ${b}), calc(100% - ${b}) 100%, 0 100%)`;
const CLIP_OPEN = bitten(`${BITE}px`);
const CLIP_CLOSED = bitten("0px");

const TONES = {
  light: { ink: "#000000", surface: "#ffffff", line: "rgba(0, 0, 0, 0.3)", tint: "rgba(0, 0, 0, 0.05)" },
  dark: { ink: "#ffffff", surface: "#000000", line: "rgba(255, 255, 255, 0.3)", tint: "rgba(255, 255, 255, 0.08)" },
} as const;

export interface BittenTabsProps {
  items: readonly string[];
  /** Index of the initially active tab. */
  defaultIndex?: number;
  tone?: keyof typeof TONES;
  onChange?: (index: number) => void;
  className?: string;
  "aria-label"?: string;
}

export function BittenTabs({ items, defaultIndex = 0, tone = "light", onChange, className, "aria-label": ariaLabel }: BittenTabsProps) {
  const [active, setActive] = useState(defaultIndex);
  const [hovered, setHovered] = useState<number | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const id = useId();
  const colours = TONES[tone];
  const last = items.length - 1;

  // The corner bite closes while the pointer is over the segment that owns it.
  const clip = hovered === last ? CLIP_CLOSED : CLIP_OPEN;
  const clipStyle: CSSProperties = { clipPath: clip, transition: `clip-path 0.5s ${EASE_CSS}` };

  const select = (index: number) => {
    setActive(index);
    onChange?.(index);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next =
      e.key === "ArrowRight" ? (index + 1) % items.length
      : e.key === "ArrowLeft" ? (index - 1 + items.length) % items.length
      : e.key === "Home" ? 0
      : e.key === "End" ? last
      : null;
    if (next === null) return;
    e.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("relative inline-flex w-full max-w-full tablet:w-auto", className)}
      style={{ ...clipStyle, backgroundColor: colours.line }}
    >
      {/* Inner surface, inset 1px: leaves the outer layer showing as a 1px line along the bitten shape */}
      <div className="relative m-px flex w-full min-w-0 max-w-full overflow-x-auto no-scrollbar tablet:w-auto" style={{ ...clipStyle, backgroundColor: colours.surface }}>
        {items.map((label, index) => {
          const isActive = index === active;
          return (
            <button
              key={label}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              id={`${id}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(index)}
              onKeyDown={(e) => onKeyDown(e, index)}
              onPointerEnter={() => setHovered(index)}
              onPointerLeave={() => setHovered((h) => (h === index ? null : h))}
              className="relative flex h-[52px] min-w-0 flex-1 cursor-pointer items-center justify-center px-2 font-inter text-[10px] font-medium uppercase leading-[14px] tracking-[0.3px] outline-none focus-visible:z-20 focus-visible:ring-2 focus-visible:ring-inset tablet:h-[60px] tablet:min-w-[180px] tablet:flex-none tablet:px-6 tablet:text-[11px] tablet:tracking-[0.44px] desktop:min-w-[220px] desktop:px-10"
              style={{
                color: isActive ? colours.surface : colours.ink,
                backgroundColor: !isActive && hovered === index ? colours.tint : "transparent",
                borderLeft: index === 0 ? "none" : `1px solid ${colours.line}`,
                transition: `color 0.5s ${EASE_CSS}, background-color 0.3s ${EASE_CSS}`,
              }}
            >
              {isActive ? (
                <motion.span
                  layoutId={`${id}-fill`}
                  aria-hidden
                  className="absolute inset-0"
                  style={{ backgroundColor: colours.ink }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              ) : null}
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default BittenTabs;

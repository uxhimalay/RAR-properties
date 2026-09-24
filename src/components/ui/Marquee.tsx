"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  children: ReactNode;
  /** scroll speed in px per second (leftwards) */
  speed?: number;
  /** gap between items AND between the two repeated copies, in px */
  gap?: number;
  className?: string;
  trackClassName?: string;
}

/**
 * Infinite leftward ticker. Renders the children twice and translates the track by -50%
 * so the loop is seamless; duration is derived from the measured width so speed is exact.
 */
export function Marquee({ children, speed = 40, gap = 48, className, trackClassName }: MarqueeProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(20);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) setDuration(half / speed);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [speed, children]);

  const copy = (
    <div className="flex shrink-0 items-center" style={{ gap, paddingRight: gap }}>
      {children}
    </div>
  );

  return (
    <div className={cn("w-full overflow-clip", className)}>
      <div
        ref={trackRef}
        className={cn("flex w-max items-center will-change-transform", trackClassName)}
        style={{ animation: `marquee-left ${duration}s linear infinite` }}
      >
        {copy}
        {copy}
      </div>
    </div>
  );
}

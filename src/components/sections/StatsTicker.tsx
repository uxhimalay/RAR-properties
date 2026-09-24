import { Fragment } from "react";
import { Marquee } from "@/components/ui/Marquee";
import { TickerDotIcon } from "@/components/icons";
import { STATS_TICKER } from "@/lib/content";

/**
 * Stats ticker under the About section: "Award winning designs · 100% Client satisfaction · ..."
 * scrolling leftwards at 40px/s (linear, infinite — handled by Marquee).
 *
 * Desktop (>= 1200): text 24px / 1.3 / 400 / -0.3px, 24px outlined dot, 48px gap (31px tall).
 * Tablet / phone (< 1200): text 14px / 1.3 / 500 / -0.3px, 16px dot, 24px gap (18px tall).
 *
 * Marquee takes `gap` as a number, so two instances are rendered and toggled with
 * `hidden desktop:block` / `desktop:hidden` to switch the gap at the breakpoint without a client hook.
 * No margins here: the page wrapper owns the spacing above/below.
 *
 * `tone="dark"` swaps the ink colour for white so the same ribbon can sit on the black project band.
 */

const TEXT_DESKTOP = "whitespace-pre font-display text-[24px] font-normal uppercase leading-[1.3] tracking-[-0.3px]";
const TEXT_MOBILE = "whitespace-pre font-display text-[14px] font-medium uppercase leading-[1.3] tracking-[-0.3px]";

const TONE = {
  light: "text-ink",
  dark: "text-white",
} as const;

function TickerItems({ items, textClassName, dotClassName }: { items: string[]; textClassName: string; dotClassName: string }) {
  return (
    <>
      {items.map((item) => (
        <Fragment key={item}>
          <p className={textClassName}>{item}</p>
          <TickerDotIcon aria-hidden="true" className={dotClassName} />
        </Fragment>
      ))}
    </>
  );
}

export function StatsTicker({ tone = "light", className, items = STATS_TICKER }: { tone?: keyof typeof TONE; className?: string; items?: string[] }) {
  const color = TONE[tone];
  // On the black band the dots pick up the gold accent; on cream they stay ink.
  const dot = tone === "dark" ? "text-[var(--color-gold)]" : color;
  return (
    <div className={`w-full overflow-clip rounded-[10px] ${className ?? ""}`}>
      {/* Desktop: gap 48 */}
      <Marquee speed={40} gap={48} className="hidden desktop:block">
        <TickerItems items={items} textClassName={`${TEXT_DESKTOP} ${dot}`} dotClassName={`h-6 w-6 shrink-0 ${dot}`} />
      </Marquee>
      {/* Tablet / phone: gap 24 */}
      <Marquee speed={40} gap={24} className="desktop:hidden">
        <TickerItems items={items} textClassName={`${TEXT_MOBILE} ${dot}`} dotClassName={`h-4 w-4 shrink-0 ${dot}`} />
      </Marquee>
    </div>
  );
}

export default StatsTicker;

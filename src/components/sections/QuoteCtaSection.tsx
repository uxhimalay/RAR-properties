import Image from "next/image";
import { TextReveal } from "@/components/motion/TextReveal";
import { PillButton } from "@/components/ui/PillButton";
import { QUOTE_CTA } from "@/lib/content";

/**
 * Quote CTA section — a full-bleed (93% width) image card with a dark gradient overlay,
 * the Frank Gehry quote top-left and two pill buttons bottom-right.
 *
 * Desktop (>= 1200): 1317 x 573, radius 16, padding 32; quote 40/56 (max-width 614px, 3 lines),
 * attribution 14/22.4; buttons md, gap 16.
 *
 * Tablet / phone (< 1200): height 401, radius 8, padding 24; quote 24/28.8 (max-width 100%),
 * attribution 12/19; buttons xs, gap 8.
 *
 * PillButton's `size` prop is not responsive, so the buttons row is rendered twice
 * (xs row below 1200, md row from 1200 up) and toggled with `hidden` / `desktop:flex`.
 * The section is `justify-between`, and `display:none` children do not participate in flex
 * layout, so only two children are ever laid out.
 */
export function QuoteCtaSection() {
  return (
    <section className="section-width relative flex h-[401px] flex-col items-center justify-between overflow-clip rounded-[8px] p-6 desktop:h-[573px] desktop:rounded-[16px] desktop:p-8">
      {/* Background image (3456 x 1248) */}
      <Image
        src={QUOTE_CTA.image}
        alt="Modern hillside house terrace with an olive tree and a city skyline at dusk"
        fill
        sizes="93vw"
        className="rounded-[8px] object-cover desktop:rounded-[16px]"
      />

      {/* Overlay: dark from the bottom-left, slightly oversized so no edge shows through */}
      <div
        aria-hidden
        className="absolute -inset-1"
        style={{ background: "linear-gradient(291deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.91) 100%)" }}
      />

      {/* Top: quote + attribution */}
      <div className="relative z-10 flex w-full flex-col items-start justify-center gap-2 overflow-clip">
        <TextReveal
          as="h2"
          text={QUOTE_CTA.quote}
          className="max-w-full font-display text-[24px] font-medium uppercase leading-[28.8px] tracking-[-0.72px] text-[#efede9] desktop:max-w-[614px] desktop:text-[40px] desktop:leading-[56px] desktop:tracking-[-1.2px]"
        />
        <TextReveal
          as="p"
          text={QUOTE_CTA.attribution}
          className="font-inter text-[12px] font-bold leading-[19px] tracking-[-0.24px] text-[#efede9] desktop:text-[14px] desktop:leading-[22.4px] desktop:tracking-[-0.28px]"
        />
      </div>

      {/* Bottom: buttons (xs row below 1200) */}
      <div className="relative z-10 flex w-full items-center justify-end gap-2 overflow-clip desktop:hidden">
        <PillButton href={QUOTE_CTA.primaryCta.href} variant="glass" size="xs">
          {QUOTE_CTA.primaryCta.label}
        </PillButton>
        <PillButton href={QUOTE_CTA.secondaryCta.href} variant="light" size="xs">
          {QUOTE_CTA.secondaryCta.label}
        </PillButton>
      </div>

      {/* Bottom: buttons (md row from 1200 up) */}
      <div className="relative z-10 hidden w-full items-center justify-end gap-4 overflow-clip desktop:flex">
        <PillButton href={QUOTE_CTA.primaryCta.href} variant="glass">
          {QUOTE_CTA.primaryCta.label}
        </PillButton>
        <PillButton href={QUOTE_CTA.secondaryCta.href} variant="light">
          {QUOTE_CTA.secondaryCta.label}
        </PillButton>
      </div>
    </section>
  );
}

export default QuoteCtaSection;

import type React from "react";
import { cn } from "@/lib/utils";
import { TextReveal } from "@/components/motion/TextReveal";

interface SectionHeadingProps {
  heading: string;
  subtitle?: string;
  /** max width of the subtitle paragraph on desktop (px). Site uses 421 for most sections, 464 for About. */
  subtitleMaxWidth?: number;
  className?: string;
  align?: "center" | "left";
}

/**
 * Standard centered section heading used by every section:
 * desktop  h2 40px/56px 500 -1.2px uppercase #4F4742 + p 16px/25.6px 500 -0.32px uppercase #57504B, gap 12px
 * <1200px  h2 24px/26.4px 500 -0.48px + p 12px/15.6px 500 -0.24px, gap 8px
 * Both lines use the per-line reveal (fade up + un-blur) when scrolled into view.
 */
export function SectionHeading({ heading, subtitle, subtitleMaxWidth = 421, className, align = "center" }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col gap-2 overflow-clip desktop:gap-3", align === "center" ? "items-center text-center" : "items-start text-left", className)}>
      <TextReveal
        as="h2"
        text={heading}
        className="font-display text-[24px] font-medium uppercase leading-[1.1] tracking-[-0.48px] text-ink desktop:text-[40px] desktop:leading-[56px] desktop:tracking-[-1.2px]"
      />
      {subtitle ? (
        <TextReveal
          as="p"
          text={subtitle}
          className="font-display text-[12px] font-medium uppercase leading-[1.3] tracking-[-0.24px] text-ink-2 desktop:max-w-[var(--sub-max)] desktop:text-[16px] desktop:leading-[1.6] desktop:tracking-[-0.32px]"
          style={{ ["--sub-max" as string]: `${subtitleMaxWidth}px` } as React.CSSProperties}
        />
      ) : null}
    </div>
  );
}

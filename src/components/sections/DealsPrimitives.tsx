import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------------------------------
 * Shared pieces of the deals bento (fourth section): the colour tokens and the three primitives
 * every cell is built from. Split out of DealsCards.tsx so the booking card (BookVisit.tsx) can use
 * the same language without a circular import.
 *
 * Colours are the site's own tokens: gold (--color-gold) as the accent, light gold
 * (--color-gold-light) for highlighted elements, #262626 for an active surface, dashed lines at
 * white 22%.
 * ---------------------------------------------------------------------------------------------- */

export const ACCENT = "var(--color-gold)"; // site token, #c9a962
export const MARK = "var(--color-gold-light)"; // site token, #e6cf8f
export const SURFACE_ACTIVE = "#262626";
export const LINE = "rgba(255, 255, 255, 0.22)";
export const TICK = "rgba(255, 255, 255, 0.45)";
export const MUTED = "rgba(255, 255, 255, 0.55)";
export const NUMBER = "rgba(255, 255, 255, 0.18)";

export const DASHED = { borderStyle: "dashed", borderColor: LINE } as const;

export function StepNumber({ n }: { n: number }) {
  return (
    <span className="font-display text-[48px] font-normal leading-none tracking-[-0.02em]" style={{ color: NUMBER }}>
      {String(n).padStart(2, "0")}
    </span>
  );
}

export function Caption({ title, description, className }: { title: string; description: string; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h4 className="font-display text-[20px] font-normal leading-6 text-white">{title}</h4>
      <p className="font-inter text-[16px] font-medium leading-[22.4px] tracking-[0.32px]" style={{ color: MUTED }}>{description}</p>
    </div>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("relative flex min-h-[320px] flex-col border p-8", className)} style={DASHED}>
      {children}
    </div>
  );
}

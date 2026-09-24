"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------------------------------
 * EnquiryPanel: the bitten-corner card in the tabs' language (outlined, filling with ink on hover,
 * the bite closing as it fills). It ends the category row and the listings grid, so the visitor is
 * always one click from telling us what they could not find.
 * ---------------------------------------------------------------------------------------------- */

const BITE = 21;
const EASE_CSS = "cubic-bezier(0.7, 0, 0.3, 1)";
const bitten = (b: string) => `polygon(0 0, 100% 0, 100% calc(100% - ${b}), calc(100% - ${b}) calc(100% - ${b}), calc(100% - ${b}) 100%, 0 100%)`;
export const CLIP_OPEN = bitten(`${BITE}px`);
export const CLIP_CLOSED = bitten("0px");

export function EnquiryPanel({ title, text, label, onClick, className }: { title: string; text: string; label: string; onClick: () => void; className?: string }) {
  const [hover, setHover] = useState(false);
  const layer = { clipPath: hover ? CLIP_CLOSED : CLIP_OPEN, transition: `clip-path 0.5s ${EASE_CSS}, background-color 0.5s ${EASE_CSS}, opacity 0.5s ${EASE_CSS}` };
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("group relative flex h-full w-full cursor-pointer flex-col justify-between gap-6 overflow-hidden p-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset", className)}
      style={{ color: hover ? "#ffffff" : "#000000", transition: `color 0.5s ${EASE_CSS}` }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      <span aria-hidden className="absolute inset-0" style={{ ...layer, backgroundColor: hover ? "#000000" : "rgba(0, 0, 0, 0.3)" }} />
      <span aria-hidden className="absolute inset-px" style={{ ...layer, backgroundColor: "#ffffff", opacity: hover ? 0 : 1 }} />
      <span className="relative flex flex-col gap-3">
        <span className="line-clamp-2 font-display text-[20px] font-normal leading-[1.15] tracking-[-0.01em]">{title}</span>
        <span className="max-w-[420px] font-inter text-[13px] font-medium leading-[19px] tracking-[-0.1px]" style={{ color: hover ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.55)", transition: `color 0.5s ${EASE_CSS}` }}>
          <span className="line-clamp-3 block">{text}</span>
        </span>
      </span>
      <span className="relative flex items-center justify-between gap-4 font-inter text-[11px] font-medium uppercase leading-[14px] tracking-[0.44px]" style={{ color: hover ? "var(--color-gold-light)" : "#000000", transition: `color 0.5s ${EASE_CSS}` }}>
        <span className="line-clamp-2 max-w-[70%]">{label}</span>
        <span aria-hidden className="text-[18px] leading-none transition-transform duration-500 ease-[cubic-bezier(0.7,0,0.3,1)] group-hover:translate-x-1">
          →
        </span>
      </span>
    </button>
  );
}

export default EnquiryPanel;

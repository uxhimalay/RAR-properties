import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "light" | "dark" | "glass" | "menu";
type Size = "md" | "sm" | "xs" | "popup";

interface PillButtonProps {
  /** Without an href the pill renders as a <button type="button"> (e.g. to open the enquiry drawer). */
  href?: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

const VARIANTS: Record<Variant, { bg: string; color: string }> = {
  light: { bg: "#f0ebe6", color: "#4f4742" },
  dark: { bg: "#4f4742", color: "#f0ebe6" },
  glass: { bg: "rgba(240, 235, 230, 0.38)", color: "#f0ebe6" },
  menu: { bg: "#60544d", color: "#ffffff" },
};

const SIZES: Record<Size, { padding: string; fontSize: number; fontWeight: number; letterSpacing: string; innerPadding: string; innerHeight: string }> = {
  // innerHeight = visible text window (measured): md 28px, sm 23px, xs 22px, popup 18px
  md: { padding: "10px 21px", fontSize: 16, fontWeight: 500, letterSpacing: "-0.2px", innerPadding: "5px 0", innerHeight: "calc(1.1em + 10.4px)" },
  sm: { padding: "6px 16px", fontSize: 14, fontWeight: 500, letterSpacing: "-0.2px", innerPadding: "3.5px 0 3px", innerHeight: "calc(1.2em + 6.5px)" },
  xs: { padding: "6px 16px", fontSize: 11, fontWeight: 600, letterSpacing: "-0.5px", innerPadding: "5px 0", innerHeight: "calc(1.1em + 10px)" },
  popup: { padding: "8px 21px", fontSize: 12, fontWeight: 500, letterSpacing: "-0.2px", innerPadding: "2px 0", innerHeight: "calc(1.2em + 4px)" },
};

/**
 * Rounded pill button with the site's "text swap" hover: two stacked copies of the label
 * (line-height 1.2 and 1.1, gap 10px) inside a clipped box; on hover the stack slides up by
 * (1.2em + 10px) so the second copy replaces the first. 100px radius, backdrop blur 5px.
 */
export function PillButton({ href, children, variant = "light", size = "md", className, style, onClick }: PillButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const cls = cn("group relative inline-flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[100px] backdrop-blur-[5px] uppercase whitespace-pre outline-none", className);
  const inline = { backgroundColor: v.bg, color: v.color, padding: s.padding, fontSize: s.fontSize, fontWeight: s.fontWeight, letterSpacing: s.letterSpacing, ...style };
  const inner = (
    <span className="flex flex-col items-center overflow-hidden" style={{ padding: s.innerPadding, height: s.innerHeight }}>
      <span className="flex flex-col items-center gap-[10px] transition-transform duration-[400ms] ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:-translate-y-[calc(1.2em+10px)] group-focus-visible:-translate-y-[calc(1.2em+10px)]">
        <span className="block leading-[1.2]">{children}</span>
        <span className="block leading-[1.1]" aria-hidden>
          {children}
        </span>
      </span>
    </span>
  );
  if (!href) {
    return (
      <button type="button" onClick={onClick} className={cls} style={inline}>
        {inner}
      </button>
    );
  }
  return (
    <Link href={href} onClick={onClick} className={cls} style={inline}>
      {inner}
    </Link>
  );
}

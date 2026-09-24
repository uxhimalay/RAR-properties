import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SwapLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

/**
 * Nav / footer text link with the "text swap" hover: two stacked copies (line-height 1.1, gap 10px)
 * in a clipped 2px-padded box; on hover the stack slides up by (1.1em + 10px).
 * Default type: 14px / 500 / -0.4px / uppercase. Override size/color via className or style.
 */
export function SwapLink({ href, children, className, style, onClick }: SwapLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn("group relative flex items-start gap-[10px] overflow-clip p-[2px] text-[14px] font-medium uppercase leading-[1.1] tracking-[-0.4px] text-ink whitespace-pre", className)}
      style={{ height: "calc(1.1em + 6.6px)", ...style }}
    >
      <span className="flex flex-col items-center gap-[10px] py-[2px] transition-transform duration-[400ms] ease-[cubic-bezier(0.44,0,0.56,1)] group-hover:-translate-y-[calc(1.1em+10px)]">
        <span className="block">{children}</span>
        <span className="block" aria-hidden>
          {children}
        </span>
      </span>
    </Link>
  );
}

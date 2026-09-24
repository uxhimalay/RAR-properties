import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface UnderlineLinkProps {
  href: string;
  children: ReactNode;
  /** md: 16px text + 2px bar (project titles, "View more projects"); lg: 18px text + 3px bar (footer "get in touch") */
  size?: "md" | "lg";
  className?: string;
}

/**
 * Text link whose underline bar slides in from the left on hover (bar starts at translateX(-100%)).
 * Type: Inter Display 500, uppercase, letter-spacing -0.2px, line-height 1.3, color #4F4742; bar color #49423D.
 */
export function UnderlineLink({ href, children, size = "md", className }: UnderlineLinkProps) {
  return (
    <Link href={href} className={cn("group inline-flex items-center justify-center gap-[6px] overflow-clip", className)}>
      <span className="relative flex flex-col items-center px-[2px] pt-[2px] pb-[6px]">
        <span className={cn("block whitespace-pre font-medium uppercase leading-[1.3] tracking-[-0.2px] text-ink", size === "lg" ? "text-[18px]" : "text-[16px]")}>{children}</span>
        <span
          aria-hidden
          className={cn("absolute inset-x-0 bottom-0 bg-line transition-transform duration-[450ms] ease-[cubic-bezier(0.44,0,0.56,1)] -translate-x-[102%] group-hover:translate-x-0", size === "lg" ? "h-[3px]" : "h-[2px]")}
        />
      </span>
    </Link>
  );
}

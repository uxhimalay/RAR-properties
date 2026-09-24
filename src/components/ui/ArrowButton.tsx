import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUpIcon } from "@/components/icons";

interface ArrowButtonProps {
  href?: string;
  className?: string;
  /** stroke/arrow color (default #4F4742) */
  color?: string;
  /** When true the fly animation is driven by an ancestor `.group` hover instead of the button's own hover. */
  parentGroup?: boolean;
}

/**
 * 32px circular outline button (1px border) rotated 57deg so the up-arrow glyph points up-right.
 * Two stacked arrow glyphs (22px, gap 10px) sit inside the clipped circle; on hover the column
 * slides up 32px so the second arrow "flies" in from the bottom-left as the first leaves top-right.
 */
export function ArrowButton({ href, className, color = "#4f4742", parentGroup = false }: ArrowButtonProps) {
  const inner = (
    <>
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-full border" style={{ borderColor: color }} />
      <span
        className={cn(
          "flex w-4 flex-col items-center gap-[10px] -mt-[3px] transition-transform duration-[450ms] ease-[cubic-bezier(0.44,0,0.56,1)]",
          parentGroup ? "group-hover:-translate-y-8" : "group-hover/arrow:-translate-y-8",
        )}
      >
        <ArrowUpIcon className="h-[22px] w-[22px] shrink-0" style={{ color }} />
        <ArrowUpIcon className="h-[22px] w-[22px] shrink-0" style={{ color }} />
      </span>
    </>
  );
  const cls = cn("group/arrow relative block h-8 w-8 shrink-0 overflow-clip rounded-full p-2 rotate-[57deg]", className);
  return href ? (
    <Link href={href} className={cls} aria-label="Open">
      {inner}
    </Link>
  ) : (
    <span className={cls}>{inner}</span>
  );
}

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Two stacked copies of a label in a clipped box; when an ancestor with class `group` is hovered
 * (or focused) the column rolls up one box height, so the second copy replaces the first. The
 * hover-roll used across the project reference (buttons, footer links): 20px boxes, ~300ms
 * ease-out. `hoverClassName` styles the second copy (e.g. white on a dark hover fill).
 */
export function RollLabel({ children, height = 20, className, restClassName, hoverClassName }: { children: ReactNode; height?: 20 | 24; className?: string; restClassName?: string; hoverClassName?: string }) {
  const roll = height === 24 ? "group-hover:-translate-y-6 group-focus-visible:-translate-y-6" : "group-hover:-translate-y-5 group-focus-visible:-translate-y-5";
  return (
    <span className={cn("block overflow-hidden", className)} style={{ height }}>
      <span className={cn("block transition-transform duration-300 ease-out", roll)}>
        <span className={cn("block", restClassName)} style={{ height, lineHeight: `${height}px` }}>{children}</span>
        <span className={cn("block", hoverClassName)} style={{ height, lineHeight: `${height}px` }} aria-hidden="true">{children}</span>
      </span>
    </span>
  );
}

export default RollLabel;

"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

interface FadeUpProps extends HTMLMotionProps<"div"> {
  /** delay in seconds */
  delay?: number;
  /** initial vertical offset in px (site default 12) */
  y?: number;
  /** play on mount instead of on scroll into view */
  onMount?: boolean;
}

/**
 * Framer "appear" effect used across the site: opacity 0 -> 1, y 12 -> 0 with a soft spring
 * (slight overshoot), triggered once when the element enters the viewport.
 */
export function FadeUp({ children, delay = 0, y = 12, onMount = false, ...rest }: FadeUpProps) {
  const visible = { opacity: 1, y: 0 };
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...(onMount ? { animate: visible } : { whileInView: visible, viewport: { once: true, amount: 0.15 } })}
      transition={{ type: "spring", stiffness: 120, damping: 18, mass: 1, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

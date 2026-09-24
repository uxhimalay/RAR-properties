"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------------------------------------
 * CountUp: a number that runs up from zero the first time it is scrolled to, once.
 *
 * The figure is written straight into the DOM node rather than held in state, so the count does not
 * re-render the tree sixty times a second. The markup ships with the final value in it, which is
 * what the server renders and what anyone without JavaScript sees; on mount it drops to zero and
 * waits for the section to arrive. Reduced motion leaves the final value alone.
 *
 * The digits are hidden from screen readers while they churn; the caller is expected to put the
 * whole figure in readable text beside it.
 * ---------------------------------------------------------------------------------------------- */

const DURATION = 1.8;
/** Settles quickly and then creeps to the target, so the last few digits are readable. */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function CountUp({ to, duration = DURATION, className }: { to: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion() ?? false;
  const target = Number.isFinite(to) ? to : 0;

  // Start from zero as soon as the script runs, so the run-up has somewhere to come from.
  useEffect(() => {
    if (reduced || !ref.current) return;
    ref.current.textContent = "0";
  }, [reduced]);

  useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !inView) return;
    const controls = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [inView, target, duration, reduced]);

  return (
    <span ref={ref} aria-hidden="true" className={className}>
      {target.toLocaleString("en-US")}
    </span>
  );
}

export default CountUp;

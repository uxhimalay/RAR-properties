"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { layoutTop } from "@/lib/motion";

/* ------------------------------------------------------------------------------------------------
 * Global smooth scrolling.
 *
 * Lenis on <html>; framer-motion's useScroll reads the window scroll Lenis drives, so every
 * scroll-linked animation stays in sync.
 *
 * The feel is taken from the project reference (measured 2026-09-19 from its live
 * Locomotive Scroll instance, `document.querySelector(".js-page-content").scroller`):
 *
 * - lerp 0.06 (Locomotive's and Lenis's default is 0.1). Each frame closes 6% of the remaining
 *   distance, so a flick keeps gliding for about 1.5s instead of 1s: 50% of the way at ~0.2s, 90%
 *   at ~0.65s, 99% at ~1.3s.
 * - Wheel steps are scaled by 0.4 of the browser's LEGACY wheel delta (virtual-scroll's
 *   `mouseMultiplier: 0.4` on `wheelDeltaY`), not of the pixel delta. The legacy delta is 120 per
 *   mouse notch and 3 per pixel on trackpads, so a notch moves 48px (less than native) while a
 *   trackpad swipe moves 1.2x its native distance: "scroll a little and it carries on". Lenis only
 *   exposes the pixel delta, so the rule is applied in `virtualScroll`, which runs before Lenis
 *   consumes an event. Browsers without the legacy delta (Firefox) get the pixel delta x 1.2 x 0.4.
 * - Touch stays native (Lenis's default). The source smooths touch too (`smartphone: {smooth:
 *   true}`, touchMultiplier 2); flip `syncTouch` on here to match if wanted.
 * - `respectReducedMotion` (Lenis default) drops the smoothing for users who asked for less motion.
 *
 * In-page anchors (`<a href="#id">`) are handled here rather than with Lenis's own `anchors`
 * option: several sections are pinned with `position: sticky`, and a stuck section's bounding box
 * is not where it lives in the document, so the target is resolved with `layoutTop()` (sticky-safe)
 * and scrolled to over ANCHOR_DURATION. `pauseScroll()` lets overlays (the enquiry drawer) hold the
 * page still while they are open.
 * ---------------------------------------------------------------------------------------------- */

/** Per-frame interpolation toward the target (source: 0.06). */
const LERP = 0.06;
/** Scale applied to the legacy wheel delta (source: virtual-scroll `mouseMultiplier: 0.4`). */
const WHEEL_MULTIPLIER = 0.4;
/** Legacy delta per pixel when the browser gives none: 120 per 100px notch. */
const LEGACY_PER_PIXEL = 1.2;
/** Anchor travel time (s), with an expo-out settle. */
const ANCHOR_DURATION = 1.4;
const anchorEase = (t: number) => 1 - Math.pow(1 - t, 4);

type LegacyWheelEvent = WheelEvent & { wheelDeltaX?: number; wheelDeltaY?: number };

let instance: Lenis | null = null;

/** Stop the page scrolling (e.g. behind a drawer); returns the function that resumes it. */
export function pauseScroll(): () => void {
  instance?.stop();
  return () => instance?.start();
}

/**
 * Smooth-scroll to an in-page target, sticky-safe. A target may carry `data-anchor-offset="64"` to
 * land that far below the viewport top, so its first line is not left under the fixed navbar; the
 * pinned panels need none because they already hold that space open themselves.
 */
export function scrollToAnchor(target: string | HTMLElement) {
  const el = typeof target === "string" ? document.getElementById(target.replace(/^#/, "")) : target;
  if (!el) return false;
  const offset = Number(el.dataset.anchorOffset ?? 0) || 0;
  const top = el.id === "top" ? 0 : Math.max(0, layoutTop(el) - offset);
  if (instance) instance.scrollTo(top, { duration: ANCHOR_DURATION, easing: anchorEase });
  else window.scrollTo({ top, behavior: "smooth" });
  return true;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
      lerp: LERP,
      smoothWheel: true,
      virtualScroll: (data) => {
        if (data.event.type !== "wheel") return true;
        const e = data.event as LegacyWheelEvent;
        // Locomotive/virtual-scroll: delta = (wheelDelta || -pixelDelta) * mouseMultiplier, sign flipped.
        data.deltaY = (e.wheelDeltaY ? -e.wheelDeltaY : data.deltaY * LEGACY_PER_PIXEL) * WHEEL_MULTIPLIER;
        data.deltaX = (e.wheelDeltaX ? -e.wheelDeltaX : data.deltaX * LEGACY_PER_PIXEL) * WHEEL_MULTIPLIER;
        return true;
      },
    });
    instance = lenis;

    // Same-page anchors: resolve the target's true document position and glide there.
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const a = (event.target as HTMLElement | null)?.closest?.("a[href*='#']") as HTMLAnchorElement | null;
      if (!a) return;
      // Only same-page targets ("#work" or "/#work" while on "/"); other pages navigate normally.
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || url.hash.length < 2) return;
      if (scrollToAnchor(url.hash)) {
        event.preventDefault();
        history.replaceState(null, "", url.hash);
      }
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      lenis.destroy();
      instance = null;
    };
  }, []);
  return <>{children}</>;
}

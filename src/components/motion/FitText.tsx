"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------------------------------
 * FitText: one line set at whatever size makes it span its box exactly.
 *
 * Framer's "fit text" measures the word and scales the font size to the container; it does not
 * stretch the glyphs, so the letterforms stay true. This does the same: the word is measured once
 * at a reference size in a hidden copy, and the ratio gives the size for the current width, re-run
 * whenever the box changes or the web font finishes loading (a fallback face measures differently).
 * ---------------------------------------------------------------------------------------------- */

/** Measured at this size; the result scales linearly from it. */
const REFERENCE = 200;

export function FitText({ text, className, style, as: Tag = "span", lineHeight = 0.8, letterSpacing = "-0.02em", maxSize = 400 }: { text: string; className?: string; style?: React.CSSProperties; as?: "span" | "h2" | "h3" | "p"; lineHeight?: number; letterSpacing?: string; maxSize?: number }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);
  const [size, setSize] = useState(0);

  const measure = () => {
    const box = boxRef.current;
    const probe = probeRef.current;
    if (!box || !probe) return;
    const width = box.clientWidth;
    const natural = probe.getBoundingClientRect().width;
    if (!width || !natural) return;
    setSize(Math.min(maxSize, (width / natural) * REFERENCE));
  };

  useLayoutEffect(() => {
    measure();
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(measure);
    observer.observe(box);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure reads refs only
  }, [text, letterSpacing]);

  // Re-measure once the real face has loaded: a fallback font gives a different natural width.
  useEffect(() => {
    let live = true;
    document.fonts?.ready.then(() => live && measure());
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- measure reads refs only
  }, [text]);

  return (
    <div ref={boxRef} className={cn("w-full", className)} style={style}>
      {/* the hidden copy that is measured: same face, same tracking, one line, no wrapping */}
      <span ref={probeRef} aria-hidden="true" className="pointer-events-none invisible fixed left-0 top-0 block whitespace-pre" style={{ fontSize: REFERENCE, letterSpacing, lineHeight: 1 }}>
        {text}
      </span>
      <Tag className="block whitespace-pre" style={{ fontSize: size || undefined, lineHeight, letterSpacing, opacity: size ? 1 : 0 }}>
        {text}
      </Tag>
    </div>
  );
}

export default FitText;

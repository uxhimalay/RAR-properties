"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------------------------------
 * SectionVideo
 *
 * An ambient video filling its section edge to edge (absolute, object-cover), looping, muted, and
 * played slowly. It only runs while the section is on screen:
 *
 * - The file is preloaded in full as the page loads, so the first frame is already decoded and
 *   buffered by the time the section arrives: no stall on start.
 * - Playback starts once the visible part of the video covers at least PLAY_AT of the viewport (or
 *   of the video, if it is smaller than the viewport) and pauses when it leaves the viewport entirely,
 *   so nothing decodes off screen. Measuring against the viewport matters when the video is taller
 *   than the screen (the phone layout, where it sits behind a long stack of cards): a ratio of its
 *   own height would never reach the threshold there.
 * - `rate` is applied on load and re-applied on every play, since some engines reset the rate when
 *   the source (re)loads. 0.5 on a 30fps source shows each frame twice, the slowest rate that still
 *   reads as smooth; going lower makes the steps visible.
 * - With `prefers-reduced-motion` the video stays on its first frame.
 * ---------------------------------------------------------------------------------------------- */

const PLAY_AT = 0.3;
/** Fine-grained thresholds so the observer reports as the visible share changes. */
const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);

export function SectionVideo({ src, rate = 0.5, className }: { src: string; rate?: number; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const slow = () => {
      video.defaultPlaybackRate = rate;
      video.playbackRate = rate;
    };
    slow();
    video.addEventListener("loadedmetadata", slow);
    video.addEventListener("play", slow);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (reduceMotion) return;
        const viewport = entry.rootBounds?.height ?? window.innerHeight;
        const visible = entry.intersectionRect.height / Math.min(viewport, entry.boundingClientRect.height || viewport);
        if (visible >= PLAY_AT) {
          video.muted = true; // autoplay policy: must be muted before play()
          slow();
          video.play().catch(() => {});
        } else if (!entry.isIntersecting) {
          video.pause();
        }
      },
      { threshold: THRESHOLDS },
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", slow);
      video.removeEventListener("play", slow);
      video.pause();
    };
  }, [rate, reduceMotion]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      className={cn("pointer-events-none absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}

export default SectionVideo;

"use client";

import { animate } from "animejs";
import { useCallback, useRef } from "react";
import { DUALITY_COVER_UNCOVER_MS } from "./consts/dualityButtonConsts";

type AnimLike = {
  pause?: () => void;
  cancel?: () => void;
  revert?: () => void;
};

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function stopAnim(anim: AnimLike | null) {
  if (!anim) return;
  try {
    anim.pause?.();
    anim.cancel?.();
    anim.revert?.();
  } catch {
    // ignore teardown races
  }
}

/**
 * Slides the cover overlay straight down (no fade / bounce) to reveal the face.
 */
export function useCoverStateUncover(durationMs = DUALITY_COVER_UNCOVER_MS) {
  const animRef = useRef<AnimLike | null>(null);
  const busyRef = useRef(false);

  const cancel = useCallback(() => {
    stopAnim(animRef.current);
    animRef.current = null;
    busyRef.current = false;
  }, []);

  const run = useCallback(
    (overlay: HTMLElement | null, onComplete: () => void) => {
      if (busyRef.current) return;
      busyRef.current = true;
      stopAnim(animRef.current);

      if (!overlay || prefersReducedMotion()) {
        busyRef.current = false;
        onComplete();
        return;
      }

      animRef.current = animate(overlay, {
        translateY: ["0%", "100%"],
        duration: durationMs,
        ease: "inOutQuad",
        onComplete: () => {
          animRef.current = null;
          busyRef.current = false;
          onComplete();
        },
      });
    },
    [durationMs],
  );

  return { run, cancel, busyRef };
}

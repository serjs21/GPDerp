"use client";

import { createTimeline } from "animejs";
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

export type CoverUncoverTargets = {
  overlay: HTMLElement | null;
  title: HTMLElement | null;
};

/**
 * Slides the icon overlay down (clipped to the face) and fades the external title.
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
    (targets: CoverUncoverTargets, onComplete: () => void) => {
      if (busyRef.current) return;
      busyRef.current = true;
      stopAnim(animRef.current);

      const { overlay, title } = targets;

      if ((!overlay && !title) || prefersReducedMotion()) {
        busyRef.current = false;
        onComplete();
        return;
      }

      const timeline = createTimeline({
        defaults: {
          duration: durationMs,
          ease: "inOutQuad",
        },
        onComplete: () => {
          animRef.current = null;
          busyRef.current = false;
          onComplete();
        },
      });
      animRef.current = timeline;

      if (overlay) {
        timeline.add(
          overlay,
          {
            translateY: ["0%", "100%"],
            ease: "inOutQuad",
          },
          0,
        );
      }

      if (title) {
        timeline.add(
          title,
          {
            opacity: [1, 0],
            duration: durationMs * 0.55,
            ease: "inQuad",
          },
          0,
        );
      }
    },
    [durationMs],
  );

  return { run, cancel, busyRef };
}

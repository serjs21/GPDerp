"use client";

import { createDrawable, createTimeline } from "animejs";
import { useCallback, useRef } from "react";
import { DUALITY_COVER_UNCOVER_MS } from "./consts/dualityButtonConsts";

type TimelineLike = {
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

function stopTimeline(timeline: TimelineLike | null) {
  if (!timeline) return;
  try {
    timeline.pause?.();
    timeline.cancel?.();
    timeline.revert?.();
  } catch {
    // ignore teardown races
  }
}

export type CoverUncoverTargets = {
  iconDisk: HTMLElement | null;
  titleText: SVGTextElement | null;
  arrowPaths: SVGPathElement[];
};

/**
 * Runs title→arrow (fade + stroke draw) and icon-disk drop in parallel.
 */
export function useCoverStateUncover(durationMs = DUALITY_COVER_UNCOVER_MS) {
  const timelineRef = useRef<TimelineLike | null>(null);
  const busyRef = useRef(false);

  const cancel = useCallback(() => {
    stopTimeline(timelineRef.current);
    timelineRef.current = null;
    busyRef.current = false;
  }, []);

  const run = useCallback(
    (targets: CoverUncoverTargets, onComplete: () => void) => {
      if (busyRef.current) return;
      busyRef.current = true;
      stopTimeline(timelineRef.current);

      if (prefersReducedMotion()) {
        busyRef.current = false;
        onComplete();
        return;
      }

      const { iconDisk, titleText, arrowPaths } = targets;
      const drawable =
        arrowPaths.length > 0 ? createDrawable(arrowPaths) : null;
      if (drawable) {
        for (const item of drawable) {
          item.draw = "0 0";
        }
      }

      const timeline = createTimeline({
        defaults: {
          duration: durationMs,
          ease: "inOutCubic",
        },
        onComplete: () => {
          timelineRef.current = null;
          busyRef.current = false;
          onComplete();
        },
      });
      timelineRef.current = timeline;

      if (titleText) {
        timeline.add(
          titleText,
          {
            opacity: [1, 0],
            duration: durationMs * 0.65,
            ease: "inQuad",
          },
          0,
        );
      }

      if (drawable) {
        for (const path of arrowPaths) {
          path.style.opacity = "1";
        }
        timeline.add(
          drawable,
          {
            draw: ["0 0", "0 1"],
            ease: "inOutSine",
          },
          durationMs * 0.12,
        );
      }

      if (iconDisk) {
        timeline.add(
          iconDisk,
          {
            translateY: ["0%", "115%"],
            opacity: [1, 0],
            ease: "inCubic",
          },
          0,
        );
      }
    },
    [durationMs],
  );

  return { run, cancel, busyRef };
}

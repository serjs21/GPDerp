"use client";

import { useEffect, useRef } from "react";

/** After a registered step, ignore further wheel ticks for this long. */
export const PATH_WHEEL_DEBOUNCE_MS = 200;

type Step = () => boolean;

/**
 * Wheel → 1 stop, then a fixed ignore window.
 *
 * 1. First wheel tick registers immediately and steps one stop.
 * 2. Ticks during the ignore window are not applied; they only remember that
 *    scrolling is still happening (and the latest direction).
 * 3. When the window ends, if scrolling is still happening, register one more
 *    stop and start a new ignore window.
 */
export function usePathWheelScroll(
  stageRef: React.RefObject<HTMLElement | null>,
  stepForward: Step,
  stepBack: Step,
  debounceMs = PATH_WHEEL_DEBOUNCE_MS,
) {
  const ignoringRef = useRef(false);
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (ignoringRef.current || (event.deltaY === 0 && event.deltaX === 0)) return;
      ignoringRef.current = true;

      console.log("wheel", event.deltaX, event.deltaY);
      console.log("ignoring", ignoringRef.current, debounceMs);

      const shouldStepForward = event.deltaX > 0 || event.deltaY < 0;
      void (shouldStepForward ? stepForward() : stepBack());

      setTimeout(() => ignoringRef.current = false , debounceMs)

    };

    stage.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      stage.removeEventListener("wheel", onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

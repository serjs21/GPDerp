"use client";

import { useEffect, useRef } from "react";
import { filterInertia } from "@/utils/wheelEvents";

export const PATH_WHEEL_DEBOUNCE_MS = 400;

type Step = () => boolean;

const isNextStepDirection = (event: WheelEvent) => {
  if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return event.deltaX > 0;
  return event.deltaY < 0;
}

export function usePathWheelScroll(
  stageRef: React.RefObject<HTMLElement | null>,
  stepForward: Step,
  stepBack: Step,
  debounceMs = PATH_WHEEL_DEBOUNCE_MS,
) {
  const ignoringRef = useRef(false);
  const stepForwardRef = useRef(stepForward);
  const stepBackRef = useRef(stepBack);
  const debounceMsRef = useRef(debounceMs);
  stepForwardRef.current = stepForward;
  stepBackRef.current = stepBack;
  debounceMsRef.current = debounceMs;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const closuredHandler = (event: WheelEvent) => {
      ignoringRef.current = true;
      setTimeout(() => {
        ignoringRef.current = false;
      }, debounceMsRef.current);
      const shouldStepForward = isNextStepDirection(event);
      void (shouldStepForward ? stepForwardRef.current() : stepBackRef.current());
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      // #region agent log
      fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "a4f3b7" },
        body: JSON.stringify({
          sessionId: "a4f3b7",
          runId: "post-fix",
          hypothesisId: "C-D",
          location: "usePathWheelScroll.ts:onWheel",
          message: "human wheel after lethargy",
          data: {
            ignoring: ignoringRef.current,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      if (!ignoringRef.current) void closuredHandler(event);
    };

    const handler = filterInertia(onWheel);
    stage.addEventListener("wheel", handler, { passive: false });
    return () => {
      stage.removeEventListener("wheel", handler);
    };
  }, [stageRef]);
}

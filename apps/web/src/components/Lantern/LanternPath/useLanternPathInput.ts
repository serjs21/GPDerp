"use client";

import { useEffect, useRef } from "react";
import { LANTERN_PATH_WHEEL_GESTURE_IDLE_MS } from "./lanternPath.config";

export function useLanternPathInput(
  stageRef: React.RefObject<HTMLDivElement | null>,
  stepForward: () => boolean,
  stepBack: () => boolean,
) {
  const wheelGestureLockedRef = useRef(false);
  const wheelIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const scheduleWheelGestureUnlock = () => {
      if (wheelIdleTimerRef.current) {
        clearTimeout(wheelIdleTimerRef.current);
      }
      wheelIdleTimerRef.current = setTimeout(() => {
        wheelGestureLockedRef.current = false;
        wheelIdleTimerRef.current = null;
      }, LANTERN_PATH_WHEEL_GESTURE_IDLE_MS);
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      scheduleWheelGestureUnlock();

      const direction = Math.sign(event.deltaY);
      if (direction === 0 || wheelGestureLockedRef.current) return;

      const stepped = direction > 0 ? stepForward() : stepBack();
      if (stepped) {
        wheelGestureLockedRef.current = true;
      }
    };

    stage.addEventListener("wheel", onWheel, { passive: false, capture: true });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      if (wheelIdleTimerRef.current) {
        clearTimeout(wheelIdleTimerRef.current);
      }
    };
  }, [stageRef, stepBack, stepForward]);

  // Arrow keys are global while the path is mounted (home page primary carousel).
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepForward();
      if (event.key === "ArrowLeft") stepBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stepBack, stepForward]);
}

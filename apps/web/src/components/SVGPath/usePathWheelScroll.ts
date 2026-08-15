"use client";

import { useEffect, useRef } from "react";

export const PATH_WHEEL_DEBOUNCE_MS = 400;

type Step = () => boolean;

export function usePathWheelScroll(
  stageRef: React.RefObject<HTMLElement | null>,
  stepForward: Step,
  stepBack: Step,
  debounceMs = PATH_WHEEL_DEBOUNCE_MS,
) {
  const ignoringRef = useRef(false);

  const closuredHandler = (event: WheelEvent) => {
    ignoringRef.current = true;
    console.log("trace_scroll", event.deltaX, event.deltaY);
    setTimeout(() => ignoringRef.current = false , debounceMs);
    const shouldStepForward = event.deltaX > 0 || event.deltaY < 0;
    void (shouldStepForward ? stepForward() : stepBack());
  }

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (!ignoringRef.current) setTimeout(() => void closuredHandler(event), 0);
  };

  useEffect(() => {
    if (!stageRef.current) return;
    stageRef.current.addEventListener("wheel", (event) => void onWheel(event), { passive: false });
    return () => {
      stageRef.current?.removeEventListener("wheel", onWheel);
    };
  }, []);
}

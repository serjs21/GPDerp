"use client";

import { useEffect, useRef } from "react";
import { filterInertia } from "@/utils/wheelEvents";

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
    setTimeout(() => ignoringRef.current = false , debounceMs);
    const shouldStepForward = event.deltaX > 0 || event.deltaY < 0;
    void (shouldStepForward ? stepForward() : stepBack());
  }

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    if (!ignoringRef.current) void closuredHandler(event);
  };

  useEffect(() => {
    if (!stageRef.current) return;
    const handler = filterInertia(onWheel);
    stageRef.current.addEventListener("wheel", handler, { passive: false });
    return () => {
      stageRef.current?.removeEventListener("wheel", handler);
    };
  }, []);
}

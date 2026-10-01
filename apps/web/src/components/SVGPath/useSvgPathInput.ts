"use client";

import { useEffect, useRef } from "react";
import { usePathWheelScroll } from "./usePathWheelScroll";

export function useSvgPathInput(
  stageRef: React.RefObject<HTMLDivElement | null>,
  stepForward: () => boolean,
  stepBack: () => boolean,
  enabled = true,
) {
  const enabledRef = useRef(enabled);
  const stepForwardRef = useRef(stepForward);
  const stepBackRef = useRef(stepBack);
  enabledRef.current = enabled;
  stepForwardRef.current = stepForward;
  stepBackRef.current = stepBack;

  const gatedForward = () => (enabledRef.current ? stepForwardRef.current() : false);
  const gatedBack = () => (enabledRef.current ? stepBackRef.current() : false);

  usePathWheelScroll(stageRef, gatedForward, gatedBack);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!enabledRef.current) return;
      if (event.key === "ArrowLeft") stepForwardRef.current();
      if (event.key === "ArrowRight") stepBackRef.current();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

"use client";

import { useEffect } from "react";
import { usePathWheelScroll } from "./usePathWheelScroll";

export function useSvgPathInput(
  stageRef: React.RefObject<HTMLDivElement | null>,
  stepForward: () => boolean,
  stepBack: () => boolean,
  enabled = true,
) {
  const gatedForward = () => (enabled ? stepForward() : false);
  const gatedBack = () => (enabled ? stepBack() : false);

  usePathWheelScroll(stageRef, gatedForward, gatedBack);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepForward();
      if (event.key === "ArrowLeft") stepBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled, stepBack, stepForward]);
}

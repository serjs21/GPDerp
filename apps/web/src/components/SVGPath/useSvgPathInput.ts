"use client";

import { useEffect } from "react";
import { usePathWheelScroll } from "./usePathWheelScroll";

export function useSvgPathInput(
  stageRef: React.RefObject<HTMLDivElement | null>,
  stepForward: () => boolean,
  stepBack: () => boolean,
) {
  usePathWheelScroll(stageRef, stepForward, stepBack);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") stepForward();
      if (event.key === "ArrowLeft") stepBack();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stepBack, stepForward]);
}

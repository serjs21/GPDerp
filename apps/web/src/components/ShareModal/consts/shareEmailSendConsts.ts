import type { TargetAndTransition, Transition } from "motion/react";

export const SEND_ICON_MOTION: Record<"flying" | "rest", { animate: TargetAndTransition; transition: Transition }> = {
  flying: {
    animate: {
      x: [0, 3, -2, 4, 1, 0],
      y: [0, -4, -7, -5, -2, 0],
      rotate: [0, -5, 4, -3, 2, 0],
    },
    transition: { duration: 1.4, repeat: Infinity, ease: "easeInOut" },
  },
  rest: {
    animate: { x: 0, y: 0, rotate: 0 },
    transition: { duration: 0.2 },
  },
};

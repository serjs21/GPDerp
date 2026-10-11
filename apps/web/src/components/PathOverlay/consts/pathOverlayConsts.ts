import type { Transition } from "motion/react";

export const PATH_OVERLAY_DEFAULTS = {
  fillOrigin: "center",
  seam: "sCurve",
} as const;

export const PATH_OVERLAY_CONTENT_TRANSITION: Record<"reduced" | "full", Transition> = {
  reduced: { duration: 0 },
  full: { duration: 0.32, ease: [0.38, 0, 0.9, 1] },
};

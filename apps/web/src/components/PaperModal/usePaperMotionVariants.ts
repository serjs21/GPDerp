"use client";

import { useReducedMotion } from "motion/react";
import { resolvePaperMotion, type PaperMotionPreset } from "./paperMotion";

/** Overlay + paper variants for the preset, swapped for the reduced set under reduced motion. */
export function usePaperMotionVariants(motionPreset: PaperMotionPreset) {
  const reduceMotion = useReducedMotion();
  const motionBundle = resolvePaperMotion(motionPreset);
  return reduceMotion
    ? { overlay: motionBundle.reducedOverlay, paper: motionBundle.reducedPaper }
    : { overlay: motionBundle.overlay, paper: motionBundle.paper };
}

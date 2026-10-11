"use client";

import { useState } from "react";
import { selectorCosmicRotationDeg } from "@/theme/celestialSelectorLayout";
import { STYLE_NAVIGATION_WHEEL } from "./styleNavigationWheel.config";
import { unwrapRotationDeg } from "./utils/styleNavigationWheelUtils";

/** Slot rotation of the circle base, unwrapped so each slot change takes the shortest turn. */
export function useContinuousWheelRotationDeg(slot: number) {
  const rawRotationDeg =
    selectorCosmicRotationDeg(slot) + STYLE_NAVIGATION_WHEEL.circleBaseRotationOffsetDeg;
  const [cosmicRotationDeg, setCosmicRotationDeg] = useState(rawRotationDeg);
  const continuousRotationDeg = unwrapRotationDeg(cosmicRotationDeg, rawRotationDeg);
  if (continuousRotationDeg !== cosmicRotationDeg) {
    setCosmicRotationDeg(continuousRotationDeg);
  }
  return continuousRotationDeg;
}

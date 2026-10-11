"use client";

import { useMemo } from "react";
import { canStepBack, canStepForward } from "./utils";

/**
 * PathNavigation context value (null while navigation is disabled). Stable between tween frames so
 * lantern action panels don't re-render on every step frame.
 */
export function usePathNavigationValue(params: {
  enabled: boolean;
  focusIndex: number;
  scrollCount: number;
  stepBack: () => void;
  stepForward: () => void;
}) {
  const { enabled, focusIndex, scrollCount, stepBack, stepForward } = params;
  const showNavBack = canStepBack(focusIndex);
  const showNavForward = canStepForward(focusIndex, scrollCount);

  return useMemo(
    () =>
      enabled
        ? {
            showBack: showNavBack,
            showForward: showNavForward,
            onStepBack: () => void stepBack(),
            onStepForward: () => void stepForward(),
          }
        : null,
    [enabled, showNavBack, showNavForward, stepBack, stepForward],
  );
}

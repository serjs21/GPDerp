"use client";

import { useThemeScaleContext } from "@/app/providers/ThemeScaleProvider";

/** Canonical theme scale progress: 0 = sumie/day, 100 = night-sky. */
export const useThemeScaleProgress = () => {
  const { progress } = useThemeScaleContext();
  return progress;
};

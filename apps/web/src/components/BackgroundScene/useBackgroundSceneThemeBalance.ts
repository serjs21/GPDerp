"use client";

import { useMemo } from "react";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { colorBalanceFromThemeSelection } from "./backgroundSceneThemeColorBalance";

export function useBackgroundSceneThemeBalance() {
  const { scene } = useCelestialTheme();

  return useMemo(
    () =>
      colorBalanceFromThemeSelection({
        theme: scene.theme,
        solarElevationDeg: scene.layout.sun.altitudeDeg,
      }),
    [scene.theme, scene.layout.sun.altitudeDeg],
  );
}

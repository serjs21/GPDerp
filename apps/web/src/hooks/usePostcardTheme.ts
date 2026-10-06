"use client";

import { useMemo } from "react";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import {
  postcardThemeFromCelestial,
  type PostcardTheme,
} from "@/components/Postcard/utils/postcardTheme";

/** Current celestial scene as a postcard theme snapshot. */
export function usePostcardTheme(): PostcardTheme {
  const { scene, backgroundBodies } = useCelestialTheme();
  return useMemo(
    () => postcardThemeFromCelestial({ scene, backgroundBodies }),
    [scene, backgroundBodies],
  );
}

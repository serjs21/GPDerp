"use client";

import { useMemo } from "react";
import {
  useCelestialTheme,
  useOptionalCelestialTheme,
} from "@/app/providers/CelestialThemeProvider";
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

/** Postcard theme, or null when rendered outside CelestialThemeProvider. */
export function useOptionalPostcardTheme(): PostcardTheme | null {
  const celestial = useOptionalCelestialTheme();
  const scene = celestial?.scene;
  const backgroundBodies = celestial?.backgroundBodies;
  return useMemo(
    () => (scene && backgroundBodies ? postcardThemeFromCelestial({ scene, backgroundBodies }) : null),
    [scene, backgroundBodies],
  );
}

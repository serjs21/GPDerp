"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCelestialSlotState } from "@/hooks/useCelestialSlotState";
import {
  getSelectorDialLayoutFromSlot,
  selectorLayoutToBackgroundBodies,
} from "@/theme/celestialSelectorLayout";
import { clampSlot, slotToDate } from "@/theme/celestialTime";
import type { GeoCoordinates } from "@/theme/celestialTheme";
import {
  BANGKOK_COORDINATES,
  useCelestialScene,
} from "@/theme/useCelestialScene";

const DEFAULT_CELESTIAL_SLOT = 16;

type CelestialThemeContextValue = {
  slot: number;
  effectiveSlot: number;
  coordinates: GeoCoordinates;
  layout: ReturnType<typeof getSelectorDialLayoutFromSlot>;
  backgroundBodies: ReturnType<typeof selectorLayoutToBackgroundBodies>;
  scene: ReturnType<typeof useCelestialScene>;
  setPreviewSlot: (slot: number | null) => void;
  commitSlot: (slot: number) => void;
  /** Apply a slot saved in user settings; `null` follows the local clock. */
  applySavedSlot: (slot: number | null) => void;
};

const CelestialThemeContext = createContext<CelestialThemeContextValue | null>(null);

type CelestialThemeProviderProps = {
  children: ReactNode;
  initialSlot?: number;
  /** Follow the user's stored selection, falling back to the local clock. Stories leave this off. */
  followUserPreference?: boolean;
};

export function CelestialThemeProvider({
  children,
  initialSlot = DEFAULT_CELESTIAL_SLOT,
  followUserPreference = false,
}: CelestialThemeProviderProps) {
  const { slot, storeSlot } = useCelestialSlotState(initialSlot, followUserPreference);
  const [previewSlot, setPreviewSlotState] = useState<number | null>(null);
  const coordinates = BANGKOK_COORDINATES;

  const effectiveSlot = previewSlot ?? slot;
  const scene = useCelestialScene({
    date: slotToDate(effectiveSlot),
    coordinates,
  });
  const layout = useMemo(
    () => getSelectorDialLayoutFromSlot(effectiveSlot, coordinates),
    [effectiveSlot, coordinates],
  );
  const backgroundBodies = useMemo(
    () =>
      selectorLayoutToBackgroundBodies(
        effectiveSlot,
        layout,
        scene.layout.moon.limbAngleDeg,
      ),
    [effectiveSlot, layout, scene.layout.moon.limbAngleDeg],
  );

  useEffect(() => {
    const root = document.documentElement;
    const { sceneVars } = scene;
    root.style.setProperty("--sky-top", sceneVars["--sky-top"] ?? "");
    root.style.setProperty("--sky-mid", sceneVars["--sky-mid"] ?? "");
    root.style.setProperty("--sky-horizon", sceneVars["--sky-horizon"] ?? "");
    root.style.setProperty("--ink-on-sky", sceneVars["--ink-on-sky"] ?? "");
    return () => {
      root.style.removeProperty("--sky-top");
      root.style.removeProperty("--sky-mid");
      root.style.removeProperty("--sky-horizon");
      root.style.removeProperty("--ink-on-sky");
    };
  }, [scene]);

  const setPreviewSlot = useCallback((next: number | null) => {
    setPreviewSlotState(next === null ? null : clampSlot(next));
  }, []);

  const commitSlot = useCallback(
    (next: number) => {
      setPreviewSlotState(null);
      storeSlot(clampSlot(next));
    },
    [storeSlot],
  );

  const value = useMemo(
    () => ({
      slot,
      effectiveSlot,
      coordinates,
      layout,
      backgroundBodies,
      scene,
      setPreviewSlot,
      commitSlot,
      applySavedSlot: storeSlot,
    }),
    [
      slot,
      effectiveSlot,
      coordinates,
      layout,
      backgroundBodies,
      scene,
      setPreviewSlot,
      commitSlot,
      storeSlot,
    ],
  );

  return (
    <CelestialThemeContext.Provider value={value}>{children}</CelestialThemeContext.Provider>
  );
}

export function useCelestialTheme() {
  const context = useContext(CelestialThemeContext);
  if (!context) {
    throw new Error("useCelestialTheme must be used within CelestialThemeProvider");
  }
  return context;
}

/** Same as useCelestialTheme, or null outside the provider. */
export function useOptionalCelestialTheme() {
  return useContext(CelestialThemeContext);
}

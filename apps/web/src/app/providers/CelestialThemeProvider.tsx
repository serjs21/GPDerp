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
import {
  COOKIE_MAX_AGE,
  CELESTIAL_SLOT_COOKIE,
  PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY,
} from "@/config/userConfiguration";
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

const writeCelestialSlotCookie = (slot: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${CELESTIAL_SLOT_COOKIE}=${slot}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
};

type CelestialThemeContextValue = {
  slot: number;
  effectiveSlot: number;
  coordinates: GeoCoordinates;
  layout: ReturnType<typeof getSelectorDialLayoutFromSlot>;
  backgroundBodies: ReturnType<typeof selectorLayoutToBackgroundBodies>;
  scene: ReturnType<typeof useCelestialScene>;
  setPreviewSlot: (slot: number | null) => void;
  commitSlot: (slot: number) => void;
};

const CelestialThemeContext = createContext<CelestialThemeContextValue | null>(null);

type CelestialThemeProviderProps = {
  children: ReactNode;
  initialSlot?: number;
};

export function CelestialThemeProvider({
  children,
  initialSlot = DEFAULT_CELESTIAL_SLOT,
}: CelestialThemeProviderProps) {
  const [slot, setSlot] = useState(() => clampSlot(initialSlot));
  const [previewSlot, setPreviewSlotState] = useState<number | null>(null);
  const coordinates = BANGKOK_COORDINATES;

  useEffect(() => {
    writeCelestialSlotCookie(slot);
  }, [slot]);

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

  const setPreviewSlot = useCallback((next: number | null) => {
    setPreviewSlotState(next === null ? null : clampSlot(next));
  }, []);

  const commitSlot = useCallback((next: number) => {
    const clamped = clampSlot(next);
    setPreviewSlotState(null);
    setSlot(clamped);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY, String(clamped));
    }
    writeCelestialSlotCookie(clamped);
  }, []);

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

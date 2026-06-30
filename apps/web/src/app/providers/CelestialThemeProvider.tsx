"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY } from "@/config/userConfiguration";
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

const DEFAULT_CELESTIAL_SLOT = 48;

const readStoredSlot = (): number => {
  if (typeof window === "undefined") return DEFAULT_CELESTIAL_SLOT;
  const stored = window.localStorage.getItem(PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY);
  if (!stored) return DEFAULT_CELESTIAL_SLOT;
  const parsed = Number.parseInt(stored, 10);
  if (Number.isNaN(parsed)) return DEFAULT_CELESTIAL_SLOT;
  return clampSlot(parsed);
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

export function CelestialThemeProvider({ children }: { children: ReactNode }) {
  const [slot, setSlot] = useState(() =>
    typeof window !== "undefined" ? readStoredSlot() : DEFAULT_CELESTIAL_SLOT,
  );
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
    () => selectorLayoutToBackgroundBodies(layout, scene.layout.moon.limbAngleDeg),
    [layout, scene.layout.moon.limbAngleDeg],
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

"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { clampSlot } from "@/theme/celestialTime";
import {
  getPreferredCelestialSlot,
  storeCelestialSlot,
  subscribeCelestialSlot,
} from "@/theme/celestialSlotPreference";

/**
 * Committed celestial slot. With `followUserPreference` the slot is the user's stored selection or the
 * local clock (SSR and hydration use `initialSlot`); otherwise it is local state seeded by `initialSlot`.
 */
export function useCelestialSlotState(initialSlot: number, followUserPreference: boolean) {
  const [fixedSlot, setFixedSlot] = useState(() => clampSlot(initialSlot));
  const preferredSlot = useSyncExternalStore(
    subscribeCelestialSlot,
    getPreferredCelestialSlot,
    () => clampSlot(initialSlot),
  );

  const storeSlot = useCallback(
    (next: number | null) => {
      if (followUserPreference) {
        storeCelestialSlot(next);
        return;
      }
      setFixedSlot(clampSlot(next ?? initialSlot));
    },
    [followUserPreference, initialSlot],
  );

  return { slot: followUserPreference ? preferredSlot : fixedSlot, storeSlot };
}

import {
  CELESTIAL_SLOT_COOKIE,
  COOKIE_MAX_AGE,
  PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY,
  isCelestialSlot,
} from "@/config/userConfiguration";
import { clampSlot, localClockSlot } from "./celestialTime";

/**
 * The user's celestial theme slot. An explicit selection lives in localStorage (+ a cookie so SSR
 * renders it); without one the theme follows the local clock as of page load.
 */

const listeners = new Set<() => void>();
let clockSlotAtLoad: number | null = null;

export function readStoredCelestialSlot(): number | null {
  const raw = window.localStorage.getItem(PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY);
  return raw !== null && isCelestialSlot(raw) ? clampSlot(Number.parseInt(raw, 10)) : null;
}

export function getPreferredCelestialSlot(): number {
  clockSlotAtLoad ??= localClockSlot(new Date());
  return readStoredCelestialSlot() ?? clockSlotAtLoad;
}

function writeSlotCookie(slot: number | null) {
  document.cookie =
    slot === null
      ? `${CELESTIAL_SLOT_COOKIE}=; path=/; max-age=0; SameSite=Lax`
      : `${CELESTIAL_SLOT_COOKIE}=${slot}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

/** Store an explicit slot, or `null` to follow the clock again. */
export function storeCelestialSlot(slot: number | null) {
  const next = slot === null ? null : clampSlot(slot);
  if (next === null) {
    window.localStorage.removeItem(PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY);
  } else {
    window.localStorage.setItem(PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY, String(next));
  }
  writeSlotCookie(next);
  for (const listener of listeners) listener();
}

export function subscribeCelestialSlot(listener: () => void) {
  // Earlier builds wrote the cookie for every slot, including the default; without an explicit
  // selection that cookie would pin SSR to a stale slot.
  if (readStoredCelestialSlot() === null) writeSlotCookie(null);
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

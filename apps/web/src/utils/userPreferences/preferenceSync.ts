import {
  PREFERENCE_LOCALE_STORAGE_KEY,
  isAppLocale,
  type AppLocale,
} from "@/config/userConfiguration";

export type PreferenceSyncPlan<T> = {
  /** Server value to apply locally. */
  apply: T | null;
  /** Local value to save to the server. */
  push: T | null;
};

/**
 * An explicit choice made on this device wins (and is saved if the server differs); otherwise the
 * saved server value is applied. `null` means "no value" on either side.
 */
export function planPreferenceSync<T>(local: T | null, server: T | null): PreferenceSyncPlan<T> {
  if (local === null) return { apply: server, push: null };
  return { apply: null, push: local === server ? null : local };
}

export function readStoredLocale(): AppLocale | null {
  const raw = window.localStorage.getItem(PREFERENCE_LOCALE_STORAGE_KEY);
  return raw !== null && isAppLocale(raw) ? raw : null;
}

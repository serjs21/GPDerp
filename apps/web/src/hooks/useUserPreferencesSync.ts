"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { fetchOwnProfile, updateOwnConfiguration } from "@/api/user";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { PREFERENCE_LOCALE_STORAGE_KEY } from "@/config/userConfiguration";
import { useLocale } from "@/hooks/useLocale";
import { readStoredCelestialSlot } from "@/theme/celestialSlotPreference";
import { planPreferenceSync, readStoredLocale } from "@/utils/userPreferences/preferenceSync";

/** Once per signed-in user and page load, reconcile locale + celestial slot with saved user settings. */
export function useUserPreferencesSync() {
  const router = useRouter();
  const { initialized, isLoggedIn, user } = useAuthenticationState();
  const { locale, setLocale } = useLocale();
  const { applySavedSlot } = useCelestialTheme();
  const syncedUserIdRef = useRef<string | null>(null);
  const userId = initialized && isLoggedIn ? user.id : null;

  useEffect(() => {
    if (userId === null) {
      syncedUserIdRef.current = null;
      return;
    }
    if (syncedUserIdRef.current === userId) return;

    let cancelled = false;
    fetchOwnProfile()
      .then(({ configuration }) => {
        if (cancelled) return;
        syncedUserIdRef.current = userId;

        const language = planPreferenceSync(readStoredLocale(), configuration.language);
        const slot = planPreferenceSync(readStoredCelestialSlot(), configuration.celestialSlot);

        if (slot.apply !== null) applySavedSlot(slot.apply);
        if (language.apply !== null && language.apply !== locale) {
          setLocale(language.apply);
          window.localStorage.setItem(PREFERENCE_LOCALE_STORAGE_KEY, language.apply);
          router.refresh();
        }
        if (language.push === null && slot.push === null) return;
        return updateOwnConfiguration({
          ...(language.push !== null ? { language: language.push } : {}),
          ...(slot.push !== null ? { celestialSlot: slot.push } : {}),
        });
      })
      // Best-effort: on failure the page keeps the local/default preferences.
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [userId, locale, setLocale, applySavedSlot, router]);
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { fetchOwnProfile, type UserProfileResponse } from "@/api/user";
import { useAuthenticationVerification } from "@/app/providers/AuthenticationVerificationProvider";
import { comicToast } from "@/components/ComicToast";
import {
  isAppLocale,
  isThemeName,
  PREFERENCE_LOCALE_STORAGE_KEY,
  PREFERENCE_THEME_STORAGE_KEY,
} from "@/config/userConfiguration";
import { useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/hooks/useTheme";
import { shouldApplyServerPreference } from "../tabState";

/**
 * Loads the signed-in user's profile (prompting login otherwise). Stored client theme/locale win;
 * server preferences apply only when the client has none.
 */
export function useOwnProfile(initialized: boolean, isLoggedIn: boolean) {
  const { openAuthenticationModal } = useAuthenticationVerification();
  const { setTheme } = useTheme();
  const { setLocale } = useLocale();
  const t = useTranslations("Profile");
  const hasStoredTheme = useRef(false);
  const hasStoredLanguage = useRef(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedTheme = window.localStorage.getItem(PREFERENCE_THEME_STORAGE_KEY);
    if (storedTheme && isThemeName(storedTheme)) {
      hasStoredTheme.current = true;
      setTheme(storedTheme);
    }
    const storedLanguage = window.localStorage.getItem(PREFERENCE_LOCALE_STORAGE_KEY);
    if (storedLanguage && isAppLocale(storedLanguage)) {
      hasStoredLanguage.current = true;
      setLocale(storedLanguage);
    }
  }, [setLocale, setTheme]);

  useEffect(() => {
    if (!initialized) return;
    if (!isLoggedIn) openAuthenticationModal("login");
  }, [initialized, isLoggedIn, openAuthenticationModal]);

  useEffect(() => {
    if (!initialized || !isLoggedIn) return;
    setLoading(true);
    void fetchOwnProfile()
      .then((data) => {
        setProfile(data);
        if (
          shouldApplyServerPreference({
            hasClientPreference: hasStoredTheme.current,
            isValidServerValue: isThemeName(data.configuration.theme),
          })
        ) {
          setTheme(data.configuration.theme);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(PREFERENCE_THEME_STORAGE_KEY, data.configuration.theme);
          }
        }
        if (
          shouldApplyServerPreference({
            hasClientPreference: hasStoredLanguage.current,
            isValidServerValue: isAppLocale(data.configuration.language),
          })
        ) {
          setLocale(data.configuration.language);
          if (typeof window !== "undefined") {
            window.localStorage.setItem(PREFERENCE_LOCALE_STORAGE_KEY, data.configuration.language);
          }
        }
      })
      .catch(() => {
        comicToast.error(t("toasts.loadError"));
      })
      .finally(() => setLoading(false));
    // t only formats the error toast; re-running would refetch the profile on locale change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, isLoggedIn, setLocale, setTheme]);

  return { profile, setProfile, loading };
}

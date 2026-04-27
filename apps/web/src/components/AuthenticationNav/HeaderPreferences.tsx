"use client";

import { message } from "@/components/StyledComponents";
import { LocaleSelector } from "@/components/LocaleSelector";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { updateOwnConfiguration } from "@/api/user";
import {
  PREFERENCE_LOCALE_STORAGE_KEY,
  PREFERENCE_THEME_STORAGE_KEY,
  PREFERENCE_THEME_SCALE_STORAGE_KEY,
  type AppLocale,
  type ThemeName,
} from "@/config/userConfiguration";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import { useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "next-intl";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import styles from "./headerPreferences.module.css";

const THEME_SCALE_FROM_THEME: Record<ThemeName, number> = {
  sumie: 0,
  "tokyo-dusk": 50,
  "night-sky": 100,
};

const readStoredThemeScale = (theme: ThemeName): number => {
  if (typeof window === "undefined") return THEME_SCALE_FROM_THEME[theme];
  const storedScale = window.localStorage.getItem(PREFERENCE_THEME_SCALE_STORAGE_KEY);
  if (!storedScale) return THEME_SCALE_FROM_THEME[theme];
  const parsedScale = Number.parseInt(storedScale, 10);
  if (Number.isNaN(parsedScale)) return THEME_SCALE_FROM_THEME[theme];
  return Math.max(0, Math.min(100, parsedScale));
};

export const HeaderPreferences = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticationState();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { languageOptions } = useProfileI18n();
  const t = useTranslations("Profile");
  const [themePreviewProgress, setThemePreviewProgress] = useState<number | null>(() => readStoredThemeScale(theme));

  const persistIfLoggedIn = useCallback(
    async (body: { theme?: ThemeName; language?: AppLocale }) => {
      if (!isLoggedIn) return;
      try {
        await updateOwnConfiguration({
          theme: body.theme ?? theme,
          language: body.language ?? locale,
        });
        router.refresh();
      } catch {
        message.error(t("preferencesSaveError"));
      }
    },
    [isLoggedIn, locale, router, t, theme],
  );

  const onThemeChange = (next: ThemeName, scaleOverride?: number) => {
    const nextScale = scaleOverride ?? THEME_SCALE_FROM_THEME[next];
    setThemePreviewProgress(nextScale);
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCE_THEME_STORAGE_KEY, next);
      window.localStorage.setItem(PREFERENCE_THEME_SCALE_STORAGE_KEY, String(nextScale));
    }
    void persistIfLoggedIn({ theme: next });
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const rootStyle = document.documentElement.style;

    if (themePreviewProgress === null) {
      const keys = Object.keys(getThemeScaleVars(0));
      for (const key of keys) {
        rootStyle.removeProperty(key);
      }
      return;
    }

    const preview = getThemeScaleVars(themePreviewProgress);
    for (const key of Object.keys(preview)) {
      rootStyle.setProperty(key, preview[key]);
    }

    return () => {
      const keys = Object.keys(getThemeScaleVars(0));
      for (const key of keys) {
        rootStyle.removeProperty(key);
      }
    };
  }, [themePreviewProgress]);

  const onThemeScaleCommit = (progress: number) => {
    onThemeChange(getPersistedThemeFromScale(progress), progress);
  };

  const onLocaleChange = (next: AppLocale) => {
    setLocale(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCE_LOCALE_STORAGE_KEY, next);
    }
    if (!isLoggedIn) {
      router.refresh();
      return;
    }
    void persistIfLoggedIn({ language: next });
  };

  return (
    <div className={styles.wrap} role="group" aria-label={t("preferencesGroupLabel")}>
      <ThemeSelector
        value={theme}
        scaleValue={themePreviewProgress ?? THEME_SCALE_FROM_THEME[theme]}
        onChange={onThemeChange}
        onScaleCommit={onThemeScaleCommit}
        onPreviewChange={setThemePreviewProgress}
        className={styles.themeSelector}
        ariaLabel={t("theme")}
      />
      <LocaleSelector
        value={locale}
        options={languageOptions}
        onChange={onLocaleChange}
        className={styles.localeSelector}
        getPopupContainer={(node) => node.parentElement ?? document.body}
      />
    </div>
  );
};

"use client";

import { message } from "@/components/StyledComponents";
import { LocaleSelector } from "@/components/LocaleSelector";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useThemeScaleContext } from "@/app/providers/ThemeScaleProvider";
import { updateOwnConfiguration } from "@/api/user";
import {
  PREFERENCE_LOCALE_STORAGE_KEY,
  type AppLocale,
  type ThemeName,
} from "@/config/userConfiguration";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import { useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "next-intl";
import styles from "./headerPreferences.module.css";

const THEME_SCALE_FROM_THEME: Record<ThemeName, number> = {
  sumie: 0,
  "tokyo-dusk": 50,
  "night-sky": 100,
};

export const HeaderPreferences = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticationState();
  const { theme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { languageOptions } = useProfileI18n();
  const t = useTranslations("Profile");
  const { progress, setPreviewProgress, commitScale } = useThemeScaleContext();

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

  const onThemeChange = (next: ThemeName) => {
    commitScale(THEME_SCALE_FROM_THEME[next]);
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
        scaleValue={progress}
        onChange={onThemeChange}
        onScaleCommit={commitScale}
        onPreviewChange={setPreviewProgress}
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

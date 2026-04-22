"use client";

import { message } from "antd";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { updateOwnConfiguration } from "@/api/user";
import { UISelect } from "@/components/ui";
import {
  PREFERENCE_LOCALE_STORAGE_KEY,
  PREFERENCE_THEME_STORAGE_KEY,
  type AppLocale,
  type ThemeName,
} from "@/config/userConfiguration";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import { useLocale } from "@/hooks/useLocale";
import { useTheme } from "@/hooks/useTheme";
import { useTranslations } from "next-intl";
import styles from "./headerPreferences.module.css";

export const HeaderPreferences = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticationState();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { themeOptions, languageOptions } = useProfileI18n();
  const t = useTranslations("Profile");

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
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCE_THEME_STORAGE_KEY, next);
    }
    void persistIfLoggedIn({ theme: next });
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
      <UISelect
        className={styles.select}
        value={theme}
        onChange={(e) => onThemeChange(e.target.value as ThemeName)}
        options={themeOptions}
        aria-label={t("theme")}
      />
      <UISelect
        className={styles.select}
        value={locale}
        onChange={(e) => onLocaleChange(e.target.value as AppLocale)}
        options={languageOptions}
        aria-label={t("language")}
      />
    </div>
  );
};

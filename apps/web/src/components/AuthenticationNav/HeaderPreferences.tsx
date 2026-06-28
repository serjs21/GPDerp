"use client";

import { message } from "@/components/StyledComponents";
import { LocaleSelector } from "@/components/LocaleSelector";
import { CelestialThemeSelector } from "@/components/CelestialThemeSelector";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { useCelestialTheme } from "@/app/providers/CelestialThemeProvider";
import { updateOwnConfiguration } from "@/api/user";
import {
  PREFERENCE_LOCALE_STORAGE_KEY,
  type AppLocale,
} from "@/config/userConfiguration";
import { useProfileI18n } from "@/hooks/useProfileI18n";
import { useLocale } from "@/hooks/useLocale";
import { useTranslations } from "next-intl";
import styles from "./headerPreferences.module.css";

export const HeaderPreferences = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticationState();
  const { locale, setLocale } = useLocale();
  const { languageOptions } = useProfileI18n();
  const t = useTranslations("Profile");
  const { effectiveSlot, setPreviewSlot, commitSlot } = useCelestialTheme();

  const persistIfLoggedIn = useCallback(
    async (body: { language?: AppLocale }) => {
      if (!isLoggedIn) return;
      try {
        await updateOwnConfiguration({
          language: body.language ?? locale,
        });
        router.refresh();
      } catch {
        message.error(t("preferencesSaveError"));
      }
    },
    [isLoggedIn, locale, router, t],
  );

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
      <CelestialThemeSelector
        slot={effectiveSlot}
        onChange={commitSlot}
        onPreviewChange={setPreviewSlot}
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

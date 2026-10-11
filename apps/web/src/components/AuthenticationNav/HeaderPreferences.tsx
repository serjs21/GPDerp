"use client";

import { comicToast } from "@/components/ComicToast";
import { LocaleBubbleSelector } from "@/components/LocaleBubbleSelector";
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
import { clampSlot } from "@/theme/celestialTime";
import { useTranslations } from "next-intl";
import styles from "./headerPreferences.module.css";

export const HeaderPreferences = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticationState();
  const { locale, setLocale } = useLocale();
  const { languageOptions } = useProfileI18n();
  const t = useTranslations("Profile");
  const { effectiveSlot, setPreviewSlot, commitSlot, scene } = useCelestialTheme();

  const persistIfLoggedIn = useCallback(
    async (body: { language?: AppLocale; celestialSlot?: number }) => {
      if (!isLoggedIn) return;
      try {
        await updateOwnConfiguration(body);
      } catch {
        comicToast.error(t("preferencesSaveError"));
      }
    },
    [isLoggedIn, t],
  );

  const onLocaleChange = (next: AppLocale) => {
    setLocale(next);
    window.localStorage.setItem(PREFERENCE_LOCALE_STORAGE_KEY, next);
    void persistIfLoggedIn({ language: next }).then(() => router.refresh());
  };

  const onThemeChange = (next: number) => {
    commitSlot(next);
    void persistIfLoggedIn({ celestialSlot: clampSlot(next) });
  };

  return (
    <div className={styles.wrap} role="group" aria-label={t("preferencesGroupLabel")}>
        <CelestialThemeSelector
        slot={effectiveSlot}
        onChange={onThemeChange}
        onPreviewChange={setPreviewSlot}
        sceneVars={scene.sceneVars}
        className={styles.themeSelector}
        ariaLabel={t("theme")}
      />
      <LocaleBubbleSelector
        value={locale}
        options={languageOptions}
        onChange={onLocaleChange}
        className={styles.localeSelector}
        dropDirection="down-left"
        tailDirection="top-right"
        ariaLabel={t("language")}
      />
    </div>
  );
};

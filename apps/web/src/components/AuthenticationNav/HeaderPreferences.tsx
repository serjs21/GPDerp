"use client";

import { Dropdown, type MenuProps, message } from "@/components/StyledComponents";
import { UIButton } from "@/components/ui";
import { ThemeSelector } from "@/components/ThemeSelector";
import { Languages, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ComponentType, useMemo } from "react";
import { useAuthenticationState } from "@/app/providers/AuthenticationProvider";
import { updateOwnConfiguration } from "@/api/user";
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
import { DE, ES, FR, IT, JP, PT, TH, US } from "country-flag-icons/react/3x2";
import { getPersistedThemeFromScale, getThemeScaleVars } from "@/theme/themeScale";
import styles from "./headerPreferences.module.css";

type FlagComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

const LOCALE_FLAGS: Partial<Record<AppLocale, FlagComponent>> = {
  en: US,
  ja: JP,
  es: ES,
  fr: FR,
  th: TH,
  de: DE,
  it: IT,
  pt: PT,
};

export const HeaderPreferences = () => {
  const router = useRouter();
  const { isLoggedIn } = useAuthenticationState();
  const { theme, setTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  const { languageOptions } = useProfileI18n();
  const t = useTranslations("Profile");
  const [themePreviewProgress, setThemePreviewProgress] = useState<number | null>(null);

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
    setThemePreviewProgress(null);
    setTheme(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(PREFERENCE_THEME_STORAGE_KEY, next);
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
    onThemeChange(getPersistedThemeFromScale(progress));
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

  const localeLabelByValue = useMemo(
    () =>
      languageOptions.reduce(
        (acc, option) => {
          acc[option.value] = option.label;
          return acc;
        },
        {} as Record<AppLocale, string>,
      ),
    [languageOptions],
  );

  const selectedLocaleLabel = localeLabelByValue[locale] ?? locale;
  const SelectedFlag = LOCALE_FLAGS[locale];

  const localeMenuItems: MenuProps["items"] = languageOptions.map((option) => {
    const OptionFlag = LOCALE_FLAGS[option.value];
    const isSelected = option.value === locale;
    return {
      key: option.value,
      label: (
        <span className={styles.localeOption}>
          {OptionFlag ? (
            <OptionFlag className={styles.localeFlag} aria-hidden />
          ) : (
            <Languages className={styles.localeFallbackIcon} aria-hidden />
          )}
          <span className={styles.localeOptionLabel}>{option.label}</span>
          <span className={styles.localeCode} aria-hidden>
            {option.value.toUpperCase()}
          </span>
          {isSelected ? <span className={styles.localeCurrent}>Current</span> : null}
        </span>
      ),
    };
  });

  return (
    <div className={styles.wrap} role="group" aria-label={t("preferencesGroupLabel")}>
      <ThemeSelector
        value={theme}
        onChange={onThemeChange}
        onScaleCommit={onThemeScaleCommit}
        onPreviewChange={setThemePreviewProgress}
        className={styles.themeSelector}
        ariaLabel={t("theme")}
      />
      <Dropdown
        trigger={["click"]}
        placement="bottomRight"
        menu={{
          items: localeMenuItems,
          selectedKeys: [locale],
          onClick: ({ key }) => onLocaleChange(key as AppLocale),
        }}
      >
        <UIButton
          className={styles.localeTrigger}
          aria-haspopup="menu"
          aria-label={`${t("language")}: ${selectedLocaleLabel}`}
          title={selectedLocaleLabel}
        >
          {SelectedFlag ? (
            <SelectedFlag className={styles.localeFlag} aria-hidden />
          ) : (
            <Languages className={styles.localeFallbackIcon} aria-hidden />
          )}
          <ChevronDown className={styles.localeChevron} aria-hidden />
        </UIButton>
      </Dropdown>
    </div>
  );
};

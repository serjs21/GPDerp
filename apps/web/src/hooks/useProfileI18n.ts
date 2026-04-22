"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SUPPORTED_LOCALES, type AppLocale, type ThemeName } from "@/config/userConfiguration";

export const useProfileI18n = () => {
  const profile = useTranslations("Profile");
  const profileInfo = useTranslations("ProfileInfo");
  const themes = useTranslations("Themes");
  const languages = useTranslations("Languages");

  const themeOptions = useMemo(
    () =>
      [
        { value: "tokyo-dusk", label: themes("tokyoDusk") },
        { value: "sumie", label: themes("sumie") },
        { value: "night-sky", label: themes("nightSky") },
      ] as Array<{ value: ThemeName; label: string }>,
    [themes],
  );

  const languageOptions = useMemo(
    () =>
      SUPPORTED_LOCALES.map((locale) => ({
        value: locale,
        label: `${languages(`codes.${locale}`)} (${locale})`,
      })) as Array<{ value: AppLocale; label: string }>,
    [languages],
  );

  return {
    profile,
    profileInfo,
    themeOptions,
    languageOptions,
  };
};

import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_COOKIE,
  THEME_COOKIE,
  CELESTIAL_SLOT_COOKIE,
  isAppLocale,
  isCelestialSlot,
  isThemeName,
  type AppLocale,
  type ThemeName,
} from "@/config/userConfiguration";
import { clampSlot } from "@/theme/celestialTime";

const DEFAULT_CELESTIAL_SLOT = 48;

export type SsrThemeSettings = {
  initialTheme: ThemeName;
  initialLocale: AppLocale;
  initialCelestialSlot: number;
};

export const getSsrThemeSettings = async (): Promise<SsrThemeSettings> => {
  const store = await cookies();
  const cookieTheme = store.get(THEME_COOKIE)?.value ?? "";
  const cookieLocale = store.get(LOCALE_COOKIE)?.value ?? "";
  const cookieSlot = store.get(CELESTIAL_SLOT_COOKIE)?.value ?? "";

  return {
    initialTheme: isThemeName(cookieTheme) ? cookieTheme : DEFAULT_THEME,
    initialLocale: isAppLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE,
    initialCelestialSlot: isCelestialSlot(cookieSlot)
      ? clampSlot(Number.parseInt(cookieSlot, 10))
      : DEFAULT_CELESTIAL_SLOT,
  };
};

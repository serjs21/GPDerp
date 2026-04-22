import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  DEFAULT_THEME,
  LOCALE_COOKIE,
  THEME_COOKIE,
  isAppLocale,
  isThemeName,
  type AppLocale,
  type ThemeName,
} from "@/config/userConfiguration";

export type SsrThemeSettings = {
  initialTheme: ThemeName;
  initialLocale: AppLocale;
};

export const getSsrThemeSettings = async (): Promise<SsrThemeSettings> => {
  const store = await cookies();
  const cookieTheme = store.get(THEME_COOKIE)?.value ?? "";
  const cookieLocale = store.get(LOCALE_COOKIE)?.value ?? "";

  return {
    initialTheme: isThemeName(cookieTheme) ? cookieTheme : DEFAULT_THEME,
    initialLocale: isAppLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE,
  };
};

"use client";

import { useEffect } from "react";
import Cookies from "js-cookie";
import { useTheme as useNextTheme } from "next-themes";
import {
  COOKIE_MAX_AGE,
  DEFAULT_THEME,
  THEME_COOKIE,
  THEMES,
  isThemeName,
  type ThemeName,
} from "@/config/userConfiguration";

export const useTheme = () => {
  const { resolvedTheme, setTheme: setRawTheme } = useNextTheme();
  const theme: ThemeName = resolvedTheme && isThemeName(resolvedTheme) ? resolvedTheme : DEFAULT_THEME;

  useEffect(() => {
    Cookies.set(THEME_COOKIE, theme, { expires: 365, sameSite: "lax" });
  }, [theme]);

  const setTheme = (nextTheme: ThemeName) => {
    if (!isThemeName(nextTheme)) return;
    setRawTheme(nextTheme);
    Cookies.set(THEME_COOKIE, nextTheme, { expires: 365, sameSite: "lax" });
  };

  return {
    theme,
    setTheme,
    themeCookieMaxAge: COOKIE_MAX_AGE,
    themes: THEMES,
  };
};

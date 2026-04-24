"use client";

import { useEffect } from "react";
import { useTheme as useNextTheme } from "next-themes";
import {
  COOKIE_MAX_AGE,
  DEFAULT_THEME,
  THEME_COOKIE,
  THEMES,
  isThemeName,
  type ThemeName,
} from "@/config/userConfiguration";

const setClientCookie = (name: string, value: string, maxAgeInSeconds: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeInSeconds}; samesite=lax`;
};

export const useTheme = () => {
  const { resolvedTheme, setTheme: setRawTheme } = useNextTheme();
  const theme: ThemeName = resolvedTheme && isThemeName(resolvedTheme) ? resolvedTheme : DEFAULT_THEME;

  useEffect(() => {
    setClientCookie(THEME_COOKIE, theme, COOKIE_MAX_AGE);
  }, [theme]);

  const setTheme = (nextTheme: ThemeName) => {
    if (!isThemeName(nextTheme)) return;
    setRawTheme(nextTheme);
    setClientCookie(THEME_COOKIE, nextTheme, COOKIE_MAX_AGE);
  };

  return {
    theme,
    setTheme,
    themeCookieMaxAge: COOKIE_MAX_AGE,
    themes: THEMES,
  };
};

"use client";

import { useLocale as useNextIntlLocale } from "next-intl";
import {
  COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isAppLocale,
  type AppLocale,
} from "@/config/userConfiguration";

const setClientCookie = (name: string, value: string, maxAgeInSeconds: number) => {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeInSeconds}; samesite=lax`;
};

export const useLocale = () => {
  const locale = useNextIntlLocale();
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;

  const setLocale = (nextLocale: AppLocale) => {
    if (!isAppLocale(nextLocale)) return;
    setClientCookie(LOCALE_COOKIE, nextLocale, COOKIE_MAX_AGE);
  };

  return { locale: currentLocale, setLocale };
};

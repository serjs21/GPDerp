"use client";

import Cookies from "js-cookie";
import { useLocale as useNextIntlLocale } from "next-intl";
import {
  COOKIE_MAX_AGE,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  isAppLocale,
  type AppLocale,
} from "@/config/userConfiguration";

export const useLocale = () => {
  const locale = useNextIntlLocale();
  const currentLocale: AppLocale = isAppLocale(locale) ? locale : DEFAULT_LOCALE;

  const setLocale = (nextLocale: AppLocale) => {
    if (!isAppLocale(nextLocale)) return;
    Cookies.set(LOCALE_COOKIE, nextLocale, { expires: COOKIE_MAX_AGE / (60 * 60 * 24), sameSite: "lax" });
  };

  return { locale: currentLocale, setLocale };
};

import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, isAppLocale } from "@/config/userConfiguration";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale = isAppLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});

export const locales = SUPPORTED_LOCALES;

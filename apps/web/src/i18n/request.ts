import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, SUPPORTED_LOCALES, isAppLocale } from "@/config/userConfiguration";
import { mergeMessages, type Messages } from "./mergeMessages";

const loadMessages = async (locale: string): Promise<Messages> =>
  (await import(`../../messages/${locale}.json`)).default;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get(LOCALE_COOKIE)?.value ?? "";
  const locale = isAppLocale(localeCookie) ? localeCookie : DEFAULT_LOCALE;

  const fallbackMessages = await loadMessages(DEFAULT_LOCALE);
  const messages =
    locale === DEFAULT_LOCALE
      ? fallbackMessages
      : mergeMessages(fallbackMessages, await loadMessages(locale));

  return { locale, messages };
});

export const locales = SUPPORTED_LOCALES;

import { SUPPORTED_LOCALES, type AppLocale } from "@/config/userConfiguration";

/** Locales that Intl.DisplayNames understands well (exclude joke locale). */
const DISPLAY_OF_LOCALES = SUPPORTED_LOCALES.filter((locale) => locale !== "lol");

/** Endonym (name of the language in that language). */
const NATIVE_LABELS: Record<AppLocale, string> = {
  en: "English",
  ja: "日本語",
  es: "Español",
  fr: "Français",
  th: "ไทย",
  de: "Deutsch",
  it: "Italiano",
  pt: "Português",
  lol: "LOL",
};

/** Extra aliases Intl may miss (accents, joke locale, common spellings). */
const EXTRA_SEARCH_ALIASES: Partial<Record<AppLocale, readonly string[]>> = {
  fr: ["francais", "frances", "french"],
  es: ["espanol", "spanish", "castellano"],
  de: ["deutsch", "german", "aleman", "allemand"],
  pt: ["portugues", "portuguese", "portoghese"],
  ja: ["japanese", "nihongo", "japonais", "giapponese"],
  th: ["thai", "thailandese", "tailandes"],
  en: ["english", "ingles", "anglais", "inglese"],
  it: ["italiano", "italian", "italien"],
  lol: [
    "lol",
    "joke",
    "joke language",
    "meme",
    "maximum meme dialect",
    "idioma de broma",
    "langue blague",
  ],
};

export function nativeLanguageLabel(locale: AppLocale): string {
  const fallback = NATIVE_LABELS[locale] ?? locale;
  if (locale === "lol") return fallback;
  try {
    const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
    return name ?? fallback;
  } catch {
    return fallback;
  }
}

/** Fold accents so "francais" matches "Français". */
export function normalizeLanguageQuery(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function collectDisplayNames(locale: AppLocale): string[] {
  const names = new Set<string>([locale, NATIVE_LABELS[locale]]);
  if (locale === "lol") {
    for (const alias of EXTRA_SEARCH_ALIASES.lol ?? []) names.add(alias);
    return [...names];
  }

  for (const ofLocale of DISPLAY_OF_LOCALES) {
    try {
      const name = new Intl.DisplayNames([ofLocale], { type: "language" }).of(locale);
      if (name) names.add(name);
    } catch {
      // Unsupported DisplayNames locale — skip.
    }
  }

  for (const alias of EXTRA_SEARCH_ALIASES[locale] ?? []) {
    names.add(alias);
  }

  return [...names];
}

/** Lowercased, accent-folded haystack of names in every supported UI language. */
export function languageSearchHaystack(locale: AppLocale): string {
  return collectDisplayNames(locale).map(normalizeLanguageQuery).join("\n");
}

export function languageMatchesQuery(locale: AppLocale, query: string): boolean {
  const q = normalizeLanguageQuery(query);
  if (!q) return true;
  return languageSearchHaystack(locale).includes(q);
}

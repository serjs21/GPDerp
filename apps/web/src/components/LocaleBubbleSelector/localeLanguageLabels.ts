import { SUPPORTED_LOCALES, type AppLocale } from "@/config/userConfiguration";

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
};

/** Extra aliases Intl may miss (accents, common spellings). */
const EXTRA_SEARCH_ALIASES: Partial<Record<AppLocale, readonly string[]>> = {
  fr: ["francais", "frances", "french"],
  es: ["espanol", "spanish", "castellano"],
  de: ["deutsch", "german", "aleman", "allemand"],
  pt: ["portugues", "portuguese", "portoghese"],
  ja: ["japanese", "nihongo", "japonais", "giapponese"],
  th: ["thai", "thailandese", "tailandes"],
  en: ["english", "ingles", "anglais", "inglese"],
  it: ["italiano", "italian", "italien"],
};

export function capitalizeLanguageLabel(name: string): string {
  const chars = Array.from(name);
  if (chars.length === 0) return name;
  const first = chars[0];
  const upper = first.toLocaleUpperCase();
  if (upper === first) return name;
  chars[0] = upper;
  return chars.join("");
}

export function nativeLanguageLabel(locale: AppLocale): string {
  const fallback = NATIVE_LABELS[locale] ?? locale;
  try {
    const name = new Intl.DisplayNames([locale], { type: "language" }).of(locale);
    if (!name) return fallback;
    // Intl often lowercases Latin endonyms (français, español); restore capitals.
    return capitalizeLanguageLabel(name);
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

  for (const ofLocale of SUPPORTED_LOCALES) {
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

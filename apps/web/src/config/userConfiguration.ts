export const THEMES = {
  tokyoDusk: "tokyo-dusk",
  sumie: "sumie",
  nightSky: "night-sky",
} as const;

export type ThemeName = (typeof THEMES)[keyof typeof THEMES];

export const SUPPORTED_LOCALES = ["en", "ja", "es", "fr", "th", "de", "it", "pt", "zh", "vi"] as const;
export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_THEME: ThemeName = THEMES.tokyoDusk;
export const DEFAULT_LOCALE: AppLocale = "en";

export const THEME_COOKIE = "gpderp-theme";
export const LOCALE_COOKIE = "gpderp-locale";
export const CELESTIAL_SLOT_COOKIE = "gpderp-celestial-slot";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Sync with profile page / header so server preferences merge correctly */
export const PREFERENCE_THEME_STORAGE_KEY = "gpderp.profile.selectedTheme";
export const PREFERENCE_THEME_SCALE_STORAGE_KEY = "gpderp.profile.selectedThemeScale";
export const PREFERENCE_CELESTIAL_SLOT_STORAGE_KEY = "gpderp.profile.selectedCelestialSlot";
export const PREFERENCE_LOCALE_STORAGE_KEY = "gpderp.profile.selectedLanguage";
export const PENDING_HAIKU_SUBJECT_STORAGE_KEY = "gpderp.pendingHaikuSubject";
export const PENDING_HAIKU_AFTER_PURCHASE_STORAGE_KEY = "gpderp.pendingHaikuAfterPurchase";
export const PREFERENCE_HAIKU_ACTIONS_OPEN_STORAGE_KEY = "gpderp.profile.haikuActionsOpen";
/** Relative path (+ query/hash) to restore after login / registration (sessionStorage; per-tab). */
export const POST_LOGIN_RETURN_STORAGE_KEY = "gpderp.auth.postLoginReturn";
export const RESUME_PENDING_HAIKU_EVENT = "gpderp:resume-pending-haiku";
export const NO_CREDITS_LEFT_EVENT = "gpderp:no-credits-left";
/** Fired when the user dismisses the purchase-confirmed modal. */
export const GENERATION_PURCHASE_ACKNOWLEDGED_EVENT = "gpderp:generation-purchase-acknowledged";
export const HAIKU_ACTIONS_OPEN_EVENT = "gpderp:haiku-actions-open";

export const isThemeName = (value: string): value is ThemeName =>
  (Object.values(THEMES) as string[]).includes(value);

export const isAppLocale = (value: string): value is AppLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(value);

const CELESTIAL_SLOT_MAX = 95;

export const isCelestialSlot = (value: string): boolean => {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return false;
  return parsed >= 0 && parsed <= CELESTIAL_SLOT_MAX;
};

import type { AppLocale } from "@/config/userConfiguration";
import {
  SHARE_LINKS_CREATION_DATE_COVER_JA,
  SHARE_LINKS_SORT_CATEGORIES,
  type ShareLinksSortCategory,
} from "../consts/shareLinksSortConsts";

export function resolveShareLinksSortCategories(
  locale: AppLocale,
): ShareLinksSortCategory[] {
  if (locale !== "ja") return SHARE_LINKS_SORT_CATEGORIES;
  return SHARE_LINKS_SORT_CATEGORIES.map((category) =>
    category.id === "creationDate"
      ? {
          ...category,
          coverSrc: SHARE_LINKS_CREATION_DATE_COVER_JA,
          coverMirrored: true,
        }
      : category,
  );
}

/** Cover art shown on the coins while covered — what the cluster looks like on first render. */
export function shareLinksSortCoverSrcs(locale: AppLocale): string[] {
  return resolveShareLinksSortCategories(locale).map((category) => category.coverSrc);
}

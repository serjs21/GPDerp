import type { AppLocale } from "@/config/userConfiguration";
import {
  LABEL_CREATION_DATE_COVER_JA,
  LABEL_SORT_CATEGORIES,
  type LabelSortCategory,
} from "../consts/labelSortConsts";

const isJaCreationDate = (category: { id: string }, locale: AppLocale) =>
  locale === "ja" && category.id === "creationDate";

export function resolveLabelSortCategories(
  locale: AppLocale,
  t: (key: string) => string,
): LabelSortCategory[] {
  return LABEL_SORT_CATEGORIES.map(({ titleKey, ariaLabelKey, ...category }) => {
    const translated = { ...category, title: t(titleKey), ariaLabel: t(ariaLabelKey) };
    return isJaCreationDate(category, locale)
      ? {
          ...translated,
          coverSrc: LABEL_CREATION_DATE_COVER_JA,
          coverMirrored: true,
        }
      : translated;
  });
}

/** Cover art shown on the coins while covered — what the cluster looks like on first render. */
export function labelSortCoverSrcs(locale: AppLocale): string[] {
  return LABEL_SORT_CATEGORIES.map((category) =>
    isJaCreationDate(category, locale) ? LABEL_CREATION_DATE_COVER_JA : category.coverSrc,
  );
}

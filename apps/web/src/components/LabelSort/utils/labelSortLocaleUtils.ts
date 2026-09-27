import type { AppLocale } from "@/config/userConfiguration";
import {
  LABEL_CREATION_DATE_COVER_JA,
  LABEL_SORT_CATEGORIES,
  type LabelSortCategory,
} from "../consts/labelSortConsts";

export function resolveLabelSortCategories(locale: AppLocale): LabelSortCategory[] {
  if (locale !== "ja") return LABEL_SORT_CATEGORIES;
  return LABEL_SORT_CATEGORIES.map((category) =>
    category.id === "creationDate"
      ? { ...category, coverSrc: LABEL_CREATION_DATE_COVER_JA }
      : category,
  );
}

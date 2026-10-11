import type { LabelSortCategory, LabelSortValue } from "@/components/LabelSort";

export const ORDER_SORT_TITLE = "title";

export const ORDER_SORT_CATEGORIES: LabelSortCategory[] = [
  {
    id: "creationDate",
    title: "categories.creationDate.title",
    coverSrc: "/sort_button/creation_date_cover_labels.svg",
    topIconSrc: "/sort_button/time_new.svg",
    bottomIconSrc: "/sort_button/time_old.svg",
    ariaLabel: "categories.creationDate.ariaLabel",
  },
  {
    id: "alpacabet",
    title: "categories.alpacabet.title",
    coverSrc: "/sort_button/alpacabet_cover_labels.svg",
    topIconSrc: "/sort_button/alpabeth_start.svg",
    bottomIconSrc: "/sort_button/alpabeth_end.svg",
    iconTone: "mask",
    ariaLabel: "categories.alpacabet.ariaLabel",
  },
];

export const ORDER_SORT_DEFAULT_VALUE: LabelSortValue = {
  categoryId: null,
  direction: "asc",
};

import type { LabelSortCategory, LabelSortValue } from "@/components/LabelSort";

export const ORDER_SORT_TITLE = "Order by";

export const ORDER_SORT_CATEGORIES: LabelSortCategory[] = [
  {
    id: "creationDate",
    title: "Creation date",
    coverSrc: "/sort_button/creation_date_cover_labels.svg",
    topIconSrc: "/nav/sort/creation_date_new.svg",
    bottomIconSrc: "/nav/sort/creation_date_old.svg",
    iconTone: "image",
    ariaLabel: "Sort by creation date",
  },
  {
    id: "alpacabet",
    title: "Alpacabet",
    coverSrc: "/sort_button/alpacabet_cover_labels.svg",
    topIconSrc: "/nav/sort/alpacabet_start.svg",
    bottomIconSrc: "/nav/sort/alpacabet_end.svg",
    iconTone: "image",
    ariaLabel: "Sort alphabetically",
  },
];

export const ORDER_SORT_DEFAULT_VALUE: LabelSortValue = {
  categoryId: null,
  direction: "asc",
};

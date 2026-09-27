import type { DualityIconTone } from "@/components/DualityButton";

export type LabelSortDirection = "asc" | "desc";

export type LabelSortValue = {
  categoryId: string | null;
  direction: LabelSortDirection;
};

export type LabelSortCategory = {
  id: string;
  title: string;
  coverSrc: string;
  ariaLabel: string;
  topIconSrc?: string;
  bottomIconSrc?: string;
  centerIconSrc?: string;
  centerIconScale?: number;
  iconTone?: DualityIconTone;
};

/** Japanese locale swaps creation-date covers with the share-links tab. */
export const LABEL_CREATION_DATE_COVER_JA = "/sort_button/time_cover.svg";

export const LABEL_SORT_CATEGORIES: LabelSortCategory[] = [
  {
    id: "creationDate",
    title: "Creation date",
    coverSrc: "/sort_button/creation_date_cover_labels.svg",
    topIconSrc: "/sort_button/time_new.svg",
    bottomIconSrc: "/sort_button/time_old.svg",
    ariaLabel: "Sort by creation date",
  },
  {
    id: "alpacabet",
    title: "Alpacabet",
    coverSrc: "/sort_button/alpacabet_cover_labels.svg",
    topIconSrc: "/sort_button/alpabeth_start.svg",
    bottomIconSrc: "/sort_button/alpabeth_end.svg",
    iconTone: "mask",
    ariaLabel: "Sort alphabetically",
  },
  {
    id: "connection",
    title: "Connections",
    coverSrc: "/sort_button/connections_cover.svg",
    topIconSrc: "/sort_button/connections_high.svg",
    bottomIconSrc: "/sort_button/connections_low.svg",
    iconTone: "strokeInvert",
    ariaLabel: "Sort by connection",
  },
];

export const LABEL_SORT_DEFAULT_VALUE: LabelSortValue = {
  categoryId: null,
  direction: "asc",
};

/** Face size for the sort cluster coins. */
export const LABEL_SORT_SIZE_REM = 3.5;

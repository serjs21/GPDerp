import type { DualityIconTone } from "@/components/DualityButton";

export type ShareLinksSortDirection = "asc" | "desc";

export type ShareLinksSortValue = {
  categoryId: string | null;
  direction: ShareLinksSortDirection;
};

export type ShareLinksSortCategory = {
  id: string;
  title: string;
  coverSrc: string;
  coverMirrored?: boolean;
  ariaLabel: string;
  topIconSrc?: string;
  bottomIconSrc?: string;
  centerIconSrc?: string;
  centerIconScale?: number;
  iconTone?: DualityIconTone;
};

/** Japanese locale swaps creation-date covers with the labels tab. */
export const SHARE_LINKS_CREATION_DATE_COVER_JA =
  "/sort_button/creation_date_cover_labels.svg";

export const SHARE_LINKS_SORT_CATEGORIES: ShareLinksSortCategory[] = [
  {
    id: "creationDate",
    title: "Creation date",
    coverSrc: "/sort_button/time_cover.svg",
    topIconSrc: "/sort_button/time_new.svg",
    bottomIconSrc: "/sort_button/time_old.svg",
    ariaLabel: "Sort by creation date",
  },
  {
    id: "alpacabeth",
    title: "Alpacabeth",
    coverSrc: "/sort_button/alpacabeth_cover.svg",
    topIconSrc: "/sort_button/alpabeth_start.svg",
    bottomIconSrc: "/sort_button/alpabeth_end.svg",
    iconTone: "mask",
    ariaLabel: "Sort alphabetically",
  },
  {
    id: "hitsLeft",
    title: "Hits left",
    coverSrc: "/sort_button/hitpoints_cover.svg",
    topIconSrc: "/sort_button/hitpoints_high.svg",
    bottomIconSrc: "/sort_button/hitpoints_low.svg",
    ariaLabel: "Sort by hits left",
  },
  {
    id: "timeLeft",
    title: "Time left",
    coverSrc: "/sort_button/time_left_cover.svg",
    centerIconSrc: "/sort_button/time_left.svg",
    centerIconScale: 2,
    iconTone: "strokeInvert",
    ariaLabel: "Sort by time left",
  },
];

export const SHARE_LINKS_SORT_DEFAULT_VALUE: ShareLinksSortValue = {
  categoryId: null,
  direction: "asc",
};

/** Face size for the sort cluster coins. */
export const SHARE_LINKS_SORT_SIZE_REM = 3.5;

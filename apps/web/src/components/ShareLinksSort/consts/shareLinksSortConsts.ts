import type { DualityIconTone } from "@/components/DualityButton";

export type ShareLinksSortDirection = "asc" | "desc";

export type ShareLinksSortValue = {
  categoryId: string;
  direction: ShareLinksSortDirection;
};

export type ShareLinksSortCategory = {
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
    iconTone: "strokeInvert",
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
  categoryId: SHARE_LINKS_SORT_CATEGORIES[0]!.id,
  direction: "asc",
};

/** Face size for the sort cluster coins. */
export const SHARE_LINKS_SORT_SIZE_REM = 3.5;

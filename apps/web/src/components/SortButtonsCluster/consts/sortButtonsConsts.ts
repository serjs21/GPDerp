export type SortDirection = "asc" | "desc";

export type SortButtonsValue = {
  categoryId: string;
  direction: SortDirection;
};

export const SORT_DIRECTION_ICON_SRC = "/sort_button/sort_direction.svg";

/** Flip-card duration for the direction indicator (ms). */
export const SORT_DIRECTION_FLIP_MS = 320;

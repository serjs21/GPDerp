import type { CSSProperties } from "react";
import {
  ROTATED_SORT_COIN_MAX_REM,
  ROTATED_SORT_COIN_WIDTH_RATIO,
  ROTATED_SORT_GAP_PER_COIN,
  ROTATED_SORT_ROOT_FONT_PX,
  ROTATED_SORT_TOP_PAD_PER_COIN,
} from "@/consts/sort/rotatedSortConsts";

/**
 * Coin diameter (rem) for a rotated sort column of `contentWidthPx`.
 * Falls back to `minRem` until measured, and never shrinks below it.
 */
export function rotatedSortCoinSizeRem(contentWidthPx: number, minRem: number): number {
  if (contentWidthPx <= 0) return minRem;
  const fitted =
    (contentWidthPx * ROTATED_SORT_COIN_WIDTH_RATIO) / ROTATED_SORT_ROOT_FONT_PX;
  return Math.min(ROTATED_SORT_COIN_MAX_REM, Math.max(minRem, fitted));
}

/** Gap / top padding CSS vars that keep CoverLabel arcs clear at any coin size. */
export function buildRotatedSortClusterStyle(coinSizeRem: number): CSSProperties {
  return {
    "--rotated-sort-gap": `${coinSizeRem * ROTATED_SORT_GAP_PER_COIN}rem`,
    "--rotated-sort-top-pad": `${coinSizeRem * ROTATED_SORT_TOP_PAD_PER_COIN}rem`,
  } as CSSProperties;
}

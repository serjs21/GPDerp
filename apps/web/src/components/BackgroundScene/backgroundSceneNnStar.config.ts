/** Smiley star on the page sky — position/size tuning. */
export const BACKGROUND_SCENE_NN_STAR = {
  src: "/theme-selector/nnstar.svg",
  /** Center of icon, percent of the celestial layer. */
  leftPercent: 56,
  topPercent: 8,
  /** Width in rem. */
  sizeRem: 0.8,
  rotationDeg: 12,
} as const;

/**
 * Opacity for assets that only show on the short day↔night crossfade.
 * Peaks at 1 when sun/moon are equal (0.5), zero in full day or full night.
 */
export function twilightSubPathOpacity(sunOpacity: number): number {
  const t = Math.max(0, Math.min(1, sunOpacity));
  return 1 - t * 2;
}

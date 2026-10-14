/** Matches the web uploader's `processImageForUpload` cap, so backfilled icons equal fresh uploads. */
export const ICON_BACKFILL_MAX_DIMENSION = 256;

export type IconBackfillAction = "resize" | "set-cache-header" | "skip";

export type IconBackfillInput = {
  width?: number;
  height?: number;
  cacheControl?: string;
  targetCacheControl: string;
};

/** Decides what the backfill does to one stored icon: shrink it, only fix its header, or leave it. */
export function planIconBackfill({
  width,
  height,
  cacheControl,
  targetCacheControl,
}: IconBackfillInput): IconBackfillAction {
  if (Math.max(width ?? 0, height ?? 0) > ICON_BACKFILL_MAX_DIMENSION) return "resize";
  if (cacheControl !== targetCacheControl) return "set-cache-header";
  return "skip";
}

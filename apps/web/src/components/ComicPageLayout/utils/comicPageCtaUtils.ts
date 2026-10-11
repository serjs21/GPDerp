const CTA_FILL = "#17131A";
const CTA_DISABLED_FILL = "#9e9e9e";

/** Grey burst while disabled/busy; otherwise the caller's fill or the default ink. */
export function ctaBurstFill(canPress: boolean, fill?: string): string {
  return canPress ? (fill ?? CTA_FILL) : CTA_DISABLED_FILL;
}

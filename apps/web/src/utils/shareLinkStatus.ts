import type { ShareLinkListItem } from "@/api/shareLinks";

/** `labelKey` → `ShareLinkStatus.labels.*`; duration `unitKey` → `ShareLinkStatus.duration.*` (ICU `{count}`). */
export type ShareLinkDurationDetail = {
  unitKey: "lessThanMinute" | "minutes" | "hours" | "days" | "months";
  count: number;
};

export type ShareLinkComputedStatus =
  | { kind: "active_indefinite"; labelKey: "active"; detail: null; active: true }
  | { kind: "active_remaining_views"; labelKey: "remainingViews"; detail: string; active: true }
  | { kind: "active_expires_in"; labelKey: "expiresIn"; detail: ShareLinkDurationDetail; active: true }
  | { kind: "stopped"; labelKey: "stopped"; detail: null; active: false }
  | { kind: "expired"; labelKey: "expired"; detail: null; active: false }
  | { kind: "view_limit_reached"; labelKey: "viewLimitReached"; detail: null; active: false };

export type ShareLinkFilter = "all" | "active" | "inactive" | "expired" | "view_limit_reached";

function humanizeDuration(from: Date, to: Date): ShareLinkDurationDetail {
  const deltaMs = Math.max(0, to.getTime() - from.getTime());
  const totalMinutes = Math.floor(deltaMs / 60_000);
  if (totalMinutes < 1) return { unitKey: "lessThanMinute", count: 0 };
  if (totalMinutes < 60) return { unitKey: "minutes", count: totalMinutes };
  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) return { unitKey: "hours", count: totalHours };
  const totalDays = Math.floor(totalHours / 24);
  if (totalDays < 30) return { unitKey: "days", count: totalDays };
  const totalMonths = Math.floor(totalDays / 30);
  return { unitKey: "months", count: totalMonths };
}

export function isExpired(link: ShareLinkListItem, now = new Date()): boolean {
  if (!link.expirationDate) return false;
  return new Date(link.expirationDate).getTime() <= now.getTime();
}

export function isViewLimitReached(link: ShareLinkListItem): boolean {
  return link.maxViews != null && link.viewCount >= link.maxViews;
}

export function isWithinShareLinkLimits(link: ShareLinkListItem, now = new Date()): boolean {
  return !isExpired(link, now) && !isViewLimitReached(link);
}

export function isActiveShareLink(link: ShareLinkListItem, now = new Date()): boolean {
  return !link.disabled && isWithinShareLinkLimits(link, now);
}

export type ShareLinkRestartReason = "expired" | "limit_reached";

/** Restart CTA for links that cannot be started until limits are reset. */
export function getRestartReason(
  link: ShareLinkListItem | null,
  now = new Date(),
): ShareLinkRestartReason | null {
  if (!link || isActiveShareLink(link, now)) return null;
  if (isExpired(link, now) || link.deactivationReason === "timeout") return "expired";
  if (isViewLimitReached(link) || link.deactivationReason === "limit_reached") return "limit_reached";
  return null;
}

export function canStartShareLink(link: ShareLinkListItem, now = new Date()): boolean {
  return link.disabled && isWithinShareLinkLimits(link, now);
}

export function remainingViews(link: ShareLinkListItem): number | null {
  if (link.maxViews == null) return null;
  return Math.max(0, link.maxViews - link.viewCount);
}

export function getShareLinkStatus(link: ShareLinkListItem, now = new Date()): ShareLinkComputedStatus {
  if (isExpired(link, now)) {
    return { kind: "expired", labelKey: "expired", detail: null, active: false };
  }
  if (isViewLimitReached(link)) {
    return { kind: "view_limit_reached", labelKey: "viewLimitReached", detail: null, active: false };
  }
  if (link.disabled) {
    return { kind: "stopped", labelKey: "stopped", detail: null, active: false };
  }
  if (link.expirationDate) {
    const expiry = new Date(link.expirationDate);
    return {
      kind: "active_expires_in",
      labelKey: "expiresIn",
      detail: humanizeDuration(now, expiry),
      active: true,
    };
  }
  if (link.maxViews != null) {
    return {
      kind: "active_remaining_views",
      labelKey: "remainingViews",
      detail: `${String(remainingViews(link) ?? 0)}/${link.maxViews}`,
      active: true,
    };
  }
  return { kind: "active_indefinite", labelKey: "active", detail: null, active: true };
}

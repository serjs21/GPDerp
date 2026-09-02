import type { ShareLinkListItem } from "@/api/shareLinks";

export type ShareLinkComputedStatus =
  | { kind: "active_indefinite"; label: string; detail: null; active: true }
  | { kind: "active_remaining_views"; label: string; detail: string; active: true }
  | { kind: "active_expires_in"; label: string; detail: string; active: true }
  | { kind: "stopped"; label: string; detail: null; active: false }
  | { kind: "expired"; label: string; detail: null; active: false }
  | { kind: "view_limit_reached"; label: string; detail: null; active: false };

export type ShareLinkFilter = "all" | "active" | "inactive" | "expired" | "view_limit_reached";

function humanizeDuration(from: Date, to: Date): string {
  const deltaMs = Math.max(0, to.getTime() - from.getTime());
  const totalMinutes = Math.floor(deltaMs / 60_000);
  if (totalMinutes < 1) return "less than a minute";
  if (totalMinutes < 60) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) return `${totalHours} hour${totalHours === 1 ? "" : "s"}`;
  const totalDays = Math.floor(totalHours / 24);
  if (totalDays < 30) return `${totalDays} day${totalDays === 1 ? "" : "s"}`;
  const totalMonths = Math.floor(totalDays / 30);
  return `${totalMonths} month${totalMonths === 1 ? "" : "s"}`;
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

export function canStartShareLink(link: ShareLinkListItem, now = new Date()): boolean {
  return link.disabled && isWithinShareLinkLimits(link, now);
}

export function remainingViews(link: ShareLinkListItem): number | null {
  if (link.maxViews == null) return null;
  return Math.max(0, link.maxViews - link.viewCount);
}

export function getShareLinkStatus(link: ShareLinkListItem, now = new Date()): ShareLinkComputedStatus {
  if (isExpired(link, now)) {
    return { kind: "expired", label: "Expired", detail: null, active: false };
  }
  if (isViewLimitReached(link)) {
    return { kind: "view_limit_reached", label: "View limit reached", detail: null, active: false };
  }
  if (link.disabled) {
    return { kind: "stopped", label: "Stopped", detail: null, active: false };
  }
  if (link.expirationDate) {
    const expiry = new Date(link.expirationDate);
    return {
      kind: "active_expires_in",
      label: "Expires in",
      detail: humanizeDuration(now, expiry),
      active: true,
    };
  }
  if (link.maxViews != null) {
    return {
      kind: "active_remaining_views",
      label: "Remaining views",
      detail: `${String(remainingViews(link) ?? 0)}/${link.maxViews}`,
      active: true,
    };
  }
  return { kind: "active_indefinite", label: "Active", detail: null, active: true };
}

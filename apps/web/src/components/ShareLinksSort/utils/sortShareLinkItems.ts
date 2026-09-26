import type { ShareLinkListItem } from "@/api/shareLinks";
import type { ShareLinksSortValue } from "../consts/shareLinksSortConsts";

function hitsRemaining(link: ShareLinkListItem): number {
  if (link.maxViews == null) return Number.POSITIVE_INFINITY;
  return Math.max(0, link.maxViews - link.viewCount);
}

function timeRemainingMs(link: ShareLinkListItem, nowMs: number): number {
  if (link.expirationDate == null) return Number.POSITIVE_INFINITY;
  return new Date(link.expirationDate).getTime() - nowMs;
}

/** Live share link — not disabled, expired, or out of hits. */
function isActiveLink(link: ShareLinkListItem, nowMs: number): boolean {
  const expiredByDate =
    link.expirationDate != null &&
    new Date(link.expirationDate).getTime() <= nowMs;
  const viewLimitReached =
    link.maxViews != null && link.viewCount >= link.maxViews;
  return !link.disabled && !expiredByDate && !viewLimitReached;
}

function compareMetric(
  a: ShareLinkListItem,
  b: ShareLinkListItem,
  categoryId: string,
  nowMs: number,
): number {
  switch (categoryId) {
    case "alpacabeth":
      return a.haikuSubject.localeCompare(b.haikuSubject, undefined, {
        sensitivity: "base",
      });
    case "hitsLeft":
      return hitsRemaining(a) - hitsRemaining(b);
    case "timeLeft":
      return timeRemainingMs(a, nowMs) - timeRemainingMs(b, nowMs);
    case "creationDate":
    default:
      return (
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }
}

function compareLinks(
  a: ShareLinkListItem,
  b: ShareLinkListItem,
  sort: ShareLinksSortValue & { categoryId: string },
  nowMs: number,
): number {
  // Hits / time: keep every active link ahead of inactive, then sort by metric.
  if (sort.categoryId === "hitsLeft" || sort.categoryId === "timeLeft") {
    const aActive = isActiveLink(a, nowMs);
    const bActive = isActiveLink(b, nowMs);
    if (aActive !== bActive) return aActive ? -1 : 1;
  }

  const delta = compareMetric(a, b, sort.categoryId, nowMs);
  return sort.direction === "desc" ? -delta : delta;
}

/** Stable client-side sort for the share-links management list. */
export function sortShareLinkItems(
  items: ShareLinkListItem[],
  sort: ShareLinksSortValue,
  nowMs: number = Date.now(),
): ShareLinkListItem[] {
  if (sort.categoryId == null) return items;
  return [...items].sort((a, b) =>
    compareLinks(a, b, { ...sort, categoryId: sort.categoryId }, nowMs),
  );
}

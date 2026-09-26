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

function compareLinks(
  a: ShareLinkListItem,
  b: ShareLinkListItem,
  sort: ShareLinksSortValue & { categoryId: string },
  nowMs: number,
): number {
  let delta = 0;
  switch (sort.categoryId) {
    case "alpacabeth":
      delta = a.haikuSubject.localeCompare(b.haikuSubject, undefined, {
        sensitivity: "base",
      });
      break;
    case "hitsLeft":
      delta = hitsRemaining(a) - hitsRemaining(b);
      break;
    case "timeLeft":
      delta = timeRemainingMs(a, nowMs) - timeRemainingMs(b, nowMs);
      break;
    case "creationDate":
    default:
      delta =
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      break;
  }
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

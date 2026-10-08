import type { ShareLinkListItem } from "@/api/shareLinks";
import type {
  ShareLinksSortDirection,
  ShareLinksSortValue,
} from "../consts/shareLinksSortConsts";

type Sortable = {
  id: string;
  createdAt: string;
  expirationDate: string | null;
  maxViews: number | null;
  viewCount: number;
  disabled: boolean;
  haikuSubject: string;
};

const isExpired = (row: Sortable, nowMs: number) =>
  row.expirationDate != null && new Date(row.expirationDate).getTime() <= nowMs;

const hitsRemaining = (row: Sortable): number => {
  if (row.maxViews == null) return Number.POSITIVE_INFINITY;
  return Math.max(0, row.maxViews - row.viewCount);
};

const timeRemainingMs = (row: Sortable, nowMs: number): number => {
  if (row.expirationDate == null) return Number.POSITIVE_INFINITY;
  return new Date(row.expirationDate).getTime() - nowMs;
};

const isActive = (row: Sortable, nowMs: number): boolean => {
  if (row.disabled) return false;
  if (isExpired(row, nowMs)) return false;
  if (row.maxViews != null && row.viewCount >= row.maxViews) return false;
  return true;
};

function timeLeftBucket(row: Sortable, nowMs: number): number {
  const active = isActive(row, nowMs);
  const infinite = row.expirationDate == null;
  const expired = isExpired(row, nowMs);
  if (active && infinite) return 0;
  if (active) return 1;
  if (infinite) return 2;
  if (expired) return 3;
  return 2;
}

function hitsLeftBucket(row: Sortable, nowMs: number): number {
  const active = isActive(row, nowMs);
  const infinite = row.maxViews == null;
  const remaining = hitsRemaining(row);
  if (active && infinite) return 0;
  if (active) return 1;
  if (infinite) return 2;
  if (remaining <= 0) return 3;
  return 2;
}

function compareCreatedAtAsc(a: Sortable, b: Sortable): number {
  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
}

function compareAsc(
  a: Sortable,
  b: Sortable,
  categoryId: string,
  nowMs: number,
): number {
  switch (categoryId) {
    case "creationDate":
      return compareCreatedAtAsc(a, b);
    case "alpacabet":
      return a.haikuSubject.localeCompare(b.haikuSubject, undefined, {
        sensitivity: "base",
      });
    case "timeLeft": {
      const bucketDelta = timeLeftBucket(a, nowMs) - timeLeftBucket(b, nowMs);
      if (bucketDelta !== 0) return bucketDelta;
      const aBucket = timeLeftBucket(a, nowMs);
      if (aBucket === 1) {
        return timeRemainingMs(a, nowMs) - timeRemainingMs(b, nowMs);
      }
      if (aBucket === 2) {
        const aInf = a.expirationDate == null;
        const bInf = b.expirationDate == null;
        if (aInf !== bInf) return aInf ? -1 : 1;
        if (!aInf) {
          return timeRemainingMs(a, nowMs) - timeRemainingMs(b, nowMs);
        }
      }
      return compareCreatedAtAsc(b, a);
    }
    case "hitsLeft": {
      const bucketDelta = hitsLeftBucket(a, nowMs) - hitsLeftBucket(b, nowMs);
      if (bucketDelta !== 0) return bucketDelta;
      const aBucket = hitsLeftBucket(a, nowMs);
      if (aBucket === 1) {
        return hitsRemaining(a) - hitsRemaining(b);
      }
      if (aBucket === 2) {
        const aInf = a.maxViews == null;
        const bInf = b.maxViews == null;
        if (aInf !== bInf) return aInf ? -1 : 1;
        if (!aInf) {
          return hitsRemaining(a) - hitsRemaining(b);
        }
      }
      return compareCreatedAtAsc(b, a);
    }
    default:
      return compareCreatedAtAsc(b, a);
  }
}

/**
 * Client-side sort mirroring BE `sortShareLinkRows`.
 * Asc builds the bucket order; `desc` reverses the full list.
 */
export function sortShareLinkItems(
  items: ShareLinkListItem[],
  sort: ShareLinksSortValue,
  nowMs: number = Date.now(),
): ShareLinkListItem[] {
  if (sort.categoryId == null) return items;

  const ascending = [...items].sort((a, b) =>
    compareAsc(a, b, sort.categoryId!, nowMs),
  );
  return sort.direction === "desc" ? ascending.reverse() : ascending;
}

export type { ShareLinksSortDirection };

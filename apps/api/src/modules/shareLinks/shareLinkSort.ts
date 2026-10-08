import type { ShareLinkDeactivationReason } from "../../generated/prisma";

export type ShareLinkSortCategoryId =
  | "creationDate"
  | "alpacabet"
  | "hitsLeft"
  | "timeLeft";

export type ShareLinkSortDirection = "asc" | "desc";

export type ShareLinkSortInput = {
  categoryId: ShareLinkSortCategoryId | null;
  direction: ShareLinkSortDirection;
};

export type ShareLinkSortableRow = {
  id: string;
  createdAt: Date;
  expirationDate: Date | null;
  maxViews: number | null;
  viewCount: number;
  disabled: boolean;
  deactivationReason?: ShareLinkDeactivationReason | null;
  haikuSubject: string;
};

const isExpired = (row: ShareLinkSortableRow, now: Date) =>
  row.expirationDate != null && row.expirationDate.getTime() <= now.getTime();

const hitsRemaining = (row: ShareLinkSortableRow): number => {
  if (row.maxViews == null) return Number.POSITIVE_INFINITY;
  return Math.max(0, row.maxViews - row.viewCount);
};

const timeRemainingMs = (row: ShareLinkSortableRow, now: Date): number => {
  if (row.expirationDate == null) return Number.POSITIVE_INFINITY;
  return row.expirationDate.getTime() - now.getTime();
};

/** Live link: enabled and within expiry / view limits. */
export const isShareLinkActive = (row: ShareLinkSortableRow, now: Date): boolean => {
  if (row.disabled) return false;
  if (isExpired(row, now)) return false;
  if (row.maxViews != null && row.viewCount >= row.maxViews) return false;
  return true;
};

/**
 * Time left buckets (asc):
 * 0 active infinite → 1 active finite → 2 inactive infinite → 3 inactive expired
 */
function timeLeftBucket(row: ShareLinkSortableRow, now: Date): number {
  const active = isShareLinkActive(row, now);
  const infinite = row.expirationDate == null;
  const expired = isExpired(row, now);
  if (active && infinite) return 0;
  if (active) return 1;
  if (infinite) return 2;
  if (expired) return 3;
  return 2;
}

/**
 * Hits left buckets (asc):
 * 0 active infinite → 1 active finite → 2 inactive infinite → 3 inactive at 0
 */
function hitsLeftBucket(row: ShareLinkSortableRow, now: Date): number {
  const active = isShareLinkActive(row, now);
  const infinite = row.maxViews == null;
  const remaining = hitsRemaining(row);
  if (active && infinite) return 0;
  if (active) return 1;
  if (infinite) return 2;
  if (remaining <= 0) return 3;
  return 2;
}

function compareCreatedAtAsc(a: ShareLinkSortableRow, b: ShareLinkSortableRow): number {
  return a.createdAt.getTime() - b.createdAt.getTime();
}

/** Ascending compare for a category (desc is applied by reversing the result). */
function compareAsc(
  a: ShareLinkSortableRow,
  b: ShareLinkSortableRow,
  categoryId: ShareLinkSortCategoryId,
  now: Date,
): number {
  switch (categoryId) {
    case "creationDate":
      return compareCreatedAtAsc(a, b);
    case "alpacabet":
      return a.haikuSubject.localeCompare(b.haikuSubject, undefined, {
        sensitivity: "base",
      });
    case "timeLeft": {
      const bucketDelta = timeLeftBucket(a, now) - timeLeftBucket(b, now);
      if (bucketDelta !== 0) return bucketDelta;
      const aBucket = timeLeftBucket(a, now);
      if (aBucket === 1) {
        return timeRemainingMs(a, now) - timeRemainingMs(b, now);
      }
      if (aBucket === 2) {
        const aInf = a.expirationDate == null;
        const bInf = b.expirationDate == null;
        if (aInf !== bInf) return aInf ? -1 : 1;
        if (!aInf) {
          return timeRemainingMs(a, now) - timeRemainingMs(b, now);
        }
      }
      return compareCreatedAtAsc(b, a); // newer first as tie-break
    }
    case "hitsLeft": {
      const bucketDelta = hitsLeftBucket(a, now) - hitsLeftBucket(b, now);
      if (bucketDelta !== 0) return bucketDelta;
      const aBucket = hitsLeftBucket(a, now);
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
 * Sort share-link rows for listShareLinksForUser.
 * Builds the asc order, then reverses the full list when direction is `desc`.
 * Default (no category): newest createdAt first.
 */
export function sortShareLinkRows<T extends ShareLinkSortableRow>(
  rows: T[],
  sort: ShareLinkSortInput,
  now: Date = new Date(),
): T[] {
  const categoryId = sort.categoryId;

  if (categoryId == null) {
    return [...rows].sort((a, b) => compareCreatedAtAsc(b, a));
  }

  const ascending = [...rows].sort((a, b) => compareAsc(a, b, categoryId, now));
  return sort.direction === "desc" ? ascending.reverse() : ascending;
}

export const SHARE_LINK_SORT_CATEGORY_IDS = [
  "creationDate",
  "alpacabet",
  "hitsLeft",
  "timeLeft",
] as const satisfies readonly ShareLinkSortCategoryId[];

export function parseShareLinkSortCategoryId(
  value: string | undefined | null,
): ShareLinkSortCategoryId | null {
  if (!value) return null;
  return (SHARE_LINK_SORT_CATEGORY_IDS as readonly string[]).includes(value)
    ? (value as ShareLinkSortCategoryId)
    : null;
}

export function parseShareLinkSortDirection(
  value: string | undefined | null,
): ShareLinkSortDirection {
  return value === "desc" ? "desc" : "asc";
}

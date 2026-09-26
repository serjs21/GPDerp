import type { ShareLinkDeactivationReason } from "../../generated/prisma";

export type ShareLinkSortCategoryId =
  | "creationDate"
  | "alpacabeth"
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
 * Time left buckets (fixed order; direction only sorts within active finite):
 * 0 active infinite → 1 active finite → 2 inactive infinite → 3 inactive expired
 */
function timeLeftBucket(row: ShareLinkSortableRow, now: Date): number {
  const active = isShareLinkActive(row, now);
  const infinite = row.expirationDate == null;
  const expired = isExpired(row, now);
  if (active && infinite) return 0;
  if (active) return 1;
  if (infinite) return 2; // inactive, no expiry
  if (expired) return 3;
  // Inactive with a future expiry: keep ahead of expired, after infinite inactive
  return 2;
}

/**
 * Hits left buckets (fixed order; direction only sorts within active finite):
 * 0 active infinite → 1 active finite → 2 inactive infinite → 3 inactive at 0
 */
function hitsLeftBucket(row: ShareLinkSortableRow, now: Date): number {
  const active = isShareLinkActive(row, now);
  const infinite = row.maxViews == null;
  const remaining = hitsRemaining(row);
  if (active && infinite) return 0;
  if (active) return 1;
  if (infinite) return 2; // inactive, unlimited hits
  if (remaining <= 0) return 3;
  // Inactive with finite hits left: keep with infinite-inactive tier, after true infinites
  return 2;
}

function compareByDirection(delta: number, direction: ShareLinkSortDirection): number {
  return direction === "desc" ? -delta : delta;
}

function compareCreatedAt(
  a: ShareLinkSortableRow,
  b: ShareLinkSortableRow,
  direction: ShareLinkSortDirection,
): number {
  return compareByDirection(a.createdAt.getTime() - b.createdAt.getTime(), direction);
}

/**
 * Sort share-link rows for listShareLinksForUser.
 * Default (no category): newest createdAt first.
 */
export function sortShareLinkRows<T extends ShareLinkSortableRow>(
  rows: T[],
  sort: ShareLinkSortInput,
  now: Date = new Date(),
): T[] {
  const categoryId = sort.categoryId;
  const direction = sort.direction;

  if (categoryId == null) {
    return [...rows].sort((a, b) => compareCreatedAt(a, b, "desc"));
  }

  return [...rows].sort((a, b) => {
    switch (categoryId) {
      case "creationDate":
        return compareCreatedAt(a, b, direction);
      case "alpacabeth": {
        const delta = a.haikuSubject.localeCompare(b.haikuSubject, undefined, {
          sensitivity: "base",
        });
        return compareByDirection(delta, direction);
      }
      case "timeLeft": {
        const bucketDelta = timeLeftBucket(a, now) - timeLeftBucket(b, now);
        if (bucketDelta !== 0) return bucketDelta;
        const aBucket = timeLeftBucket(a, now);
        if (aBucket === 1) {
          // Active finite: sort by time remaining
          return compareByDirection(
            timeRemainingMs(a, now) - timeRemainingMs(b, now),
            direction,
          );
        }
        if (aBucket === 2) {
          // Inactive with time: infinites first, then by remaining
          const aInf = a.expirationDate == null;
          const bInf = b.expirationDate == null;
          if (aInf !== bInf) return aInf ? -1 : 1;
          if (!aInf) {
            return compareByDirection(
              timeRemainingMs(a, now) - timeRemainingMs(b, now),
              direction,
            );
          }
        }
        return compareCreatedAt(a, b, "desc");
      }
      case "hitsLeft": {
        const bucketDelta = hitsLeftBucket(a, now) - hitsLeftBucket(b, now);
        if (bucketDelta !== 0) return bucketDelta;
        const aBucket = hitsLeftBucket(a, now);
        if (aBucket === 1) {
          return compareByDirection(
            hitsRemaining(a) - hitsRemaining(b),
            direction,
          );
        }
        if (aBucket === 2) {
          const aInf = a.maxViews == null;
          const bInf = b.maxViews == null;
          if (aInf !== bInf) return aInf ? -1 : 1;
          if (!aInf) {
            return compareByDirection(
              hitsRemaining(a) - hitsRemaining(b),
              direction,
            );
          }
        }
        return compareCreatedAt(a, b, "desc");
      }
      default:
        return compareCreatedAt(a, b, "desc");
    }
  });
}

export const SHARE_LINK_SORT_CATEGORY_IDS = [
  "creationDate",
  "alpacabeth",
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

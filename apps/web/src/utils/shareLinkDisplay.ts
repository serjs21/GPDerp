import type { ShareLinkListItem } from "@/api/shareLinks";

export const SHARE_LINK_CLOCK_THRESHOLD_MS = 100 * 60 * 60 * 1000;

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_MONTH = 30 * MS_PER_DAY;
const MS_PER_YEAR = 365.25 * MS_PER_DAY;

export type HitsMeterDisplay =
  | { kind: "unlimited" }
  | { kind: "remaining"; count: number; total: number }
  | { kind: "empty"; count: 0; total: number };

export type TimeMeterDisplay =
  | { kind: "unlimited" }
  | { kind: "clock"; text: string }
  | { kind: "relative"; text: string };

export function getHitsMeterDisplay(link: Pick<ShareLinkListItem, "maxViews" | "viewCount">): HitsMeterDisplay {
  if (link.maxViews == null) return { kind: "unlimited" };
  const count = Math.max(0, link.maxViews - link.viewCount);
  if (count === 0) return { kind: "empty", count: 0, total: link.maxViews };
  return { kind: "remaining", count, total: link.maxViews };
}

export function formatHms(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatRelativeTimeLeft(remainingMs: number, locale: string): string {
  const safeMs = Math.max(0, remainingMs);
  const unit: "year" | "month" | "day" =
    safeMs >= MS_PER_YEAR ? "year" : safeMs >= MS_PER_MONTH ? "month" : "day";
  const value =
    unit === "year"
      ? Math.round(safeMs / MS_PER_YEAR)
      : unit === "month"
        ? Math.round(safeMs / MS_PER_MONTH)
        : Math.max(1, Math.round(safeMs / MS_PER_DAY));
  return new Intl.NumberFormat(locale, {
    style: "unit",
    unit,
    unitDisplay: "long",
  }).format(value);
}

export function getTimeMeterDisplay(
  expirationDate: string | null,
  now: Date | null,
  locale: string,
): TimeMeterDisplay {
  if (expirationDate == null) return { kind: "unlimited" };
  if (now == null) return { kind: "clock", text: "" };

  const remainingMs = new Date(expirationDate).getTime() - now.getTime();
  if (remainingMs <= 0) return { kind: "clock", text: "00:00:00" };
  if (remainingMs < SHARE_LINK_CLOCK_THRESHOLD_MS) {
    return { kind: "clock", text: formatHms(remainingMs) };
  }
  return { kind: "relative", text: formatRelativeTimeLeft(remainingMs, locale) };
}

export function shouldTickShareLinkClock(expirationDate: string | null, now: Date): boolean {
  if (expirationDate == null) return false;
  return new Date(expirationDate).getTime() - now.getTime() < SHARE_LINK_CLOCK_THRESHOLD_MS;
}

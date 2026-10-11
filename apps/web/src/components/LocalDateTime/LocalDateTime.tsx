"use client";

import { useIsHydrated } from "@/hooks/useIsHydrated";
import { formatCreatedAt } from "@/utils/date";
import type { LocalDateTimeProps } from "./LocalDateTime.types";

/**
 * Server and browser timezones/locales differ, so the formatted date is only
 * rendered after hydration; a non-breaking space holds the line until then.
 */
export function LocalDateTime({ iso }: LocalDateTimeProps) {
  const isHydrated = useIsHydrated();
  return (
    <time dateTime={iso}>{isHydrated ? formatCreatedAt(iso) : "\u00A0"}</time>
  );
}

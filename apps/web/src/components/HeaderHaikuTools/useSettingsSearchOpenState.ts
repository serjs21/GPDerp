"use client";

import { useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { HEADER_SETTINGS_SEARCH_COMPACT_QUERY } from "./consts/headerToolConsts";

/**
 * Open state of the `/settings` header search.
 * Wide: open by default, toggled only by the icon.
 * Compact (header row too narrow): closed by default, also closes on blur when empty.
 */
export function useSettingsSearchOpenState(enabled: boolean, tab: string | null, searchString: string) {
  const compact = useMediaQuery(HEADER_SETTINGS_SEARCH_COMPACT_QUERY);
  const [wideOpen, setWideOpen] = useState(true);
  const [compactOpen, setCompactOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState({ enabled, tab });
  const wasOpenOnPointerDownRef = useRef<boolean | null>(null);

  if (openedFor.enabled !== enabled || openedFor.tab !== tab) {
    setOpenedFor({ enabled, tab });
    if (enabled) {
      setWideOpen(true);
      setCompactOpen(false);
    }
  }

  const toggleExpanded = () => {
    if (!compact) {
      setWideOpen((open) => !open);
      return;
    }
    // A tap on the icon blurs (and closes) the empty input before the click lands.
    const wasOpen = wasOpenOnPointerDownRef.current ?? compactOpen;
    wasOpenOnPointerDownRef.current = null;
    setCompactOpen(!wasOpen);
  };

  const closeIfEmpty = () => {
    if (!searchString.trim()) setCompactOpen(false);
  };

  return {
    expanded: compact ? compactOpen : wideOpen,
    toggleExpanded,
    onSearchPointerDown: compact
      ? () => {
          wasOpenOnPointerDownRef.current = compactOpen;
        }
      : undefined,
    onInputBlur: compact ? closeIfEmpty : undefined,
  };
}

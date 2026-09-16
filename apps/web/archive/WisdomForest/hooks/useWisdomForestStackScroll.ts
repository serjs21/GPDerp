"use client";

import { useEndOfContentScroll } from "@/hooks/useEndOfContentScroll";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type RefObject } from "react";
import {
  getActiveCardIndex,
  getDefaultScrollTop,
  getRootFontSizePx,
  getStackSlotHeightPx,
} from "../wisdomForestStackScroll";

type UseWisdomForestStackScrollOptions = {
  scrollRootRef: RefObject<HTMLElement | null>;
  cardCount: number;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onActiveCardIndexChange?: (index: number) => void;
  enabled?: boolean;
};

export function useWisdomForestStackScroll({
  scrollRootRef,
  cardCount,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onActiveCardIndexChange,
  enabled = true,
}: UseWisdomForestStackScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [activeCardIndex, setActiveCardIndex] = useState(() => Math.max(0, cardCount - 1));
  const [rootFontSizePx, setRootFontSizePx] = useState(16);

  useLayoutEffect(() => {
    const root = scrollRootRef.current;
    if (!root) return;

    const measure = () => setRootFontSizePx(getRootFontSizePx(root));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    return () => observer.disconnect();
  }, [scrollRootRef]);

  const slotHeightPx = getStackSlotHeightPx(rootFontSizePx);

  const scrollToDefault = useCallback(() => {
    const root = scrollRootRef.current;
    if (!root || cardCount <= 0) return;

    root.scrollTop = getDefaultScrollTop(cardCount, slotHeightPx);
    setActiveCardIndex(getActiveCardIndex(root.scrollTop, slotHeightPx, cardCount));
  }, [cardCount, scrollRootRef, slotHeightPx]);

  useLayoutEffect(() => {
    if (!enabled || cardCount <= 0) return;
    scrollToDefault();
  }, [cardCount, enabled, scrollToDefault]);

  const handleEnd = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) onLoadMore();
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  useEndOfContentScroll(scrollRootRef, sentinelRef, handleEnd, {
    enabled: enabled && cardCount > 0 && hasNextPage,
  });

  useEffect(() => {
    const root = scrollRootRef.current;
    if (!root || cardCount <= 0 || slotHeightPx <= 0) return;

    const sync = () => {
      setActiveCardIndex(getActiveCardIndex(root.scrollTop, slotHeightPx, cardCount));
    };

    sync();
    root.addEventListener("scroll", sync, { passive: true });
    return () => root.removeEventListener("scroll", sync);
  }, [cardCount, scrollRootRef, slotHeightPx]);

  useEffect(() => {
    onActiveCardIndexChange?.(activeCardIndex);
  }, [activeCardIndex, onActiveCardIndexChange]);

  return { activeCardIndex, sentinelRef, slotHeightPx, scrollToDefault };
}

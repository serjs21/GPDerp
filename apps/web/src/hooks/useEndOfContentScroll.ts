"use client";

import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

export type UseEndOfContentScrollOptions = {
  /** When false, the observer is not attached. */
  enabled?: boolean;
  rootMargin?: string;
  threshold?: number | number[];
};

/**
 * Invokes `onEnd` when `sentinelRef` intersects the `scrollRootRef` scrollport (end of scrollable content).
 * Both elements must be mounted; `scrollRootRef` should be the element with `overflow: auto|scroll`.
 */
export function useEndOfContentScroll(
  scrollRootRef: RefObject<HTMLElement | null>,
  sentinelRef: RefObject<HTMLElement | null>,
  onEnd: () => void,
  options?: UseEndOfContentScrollOptions,
): void {
  const onEndRef = useRef(onEnd);

  const { enabled = true, rootMargin = "0px", threshold = 0 } = options ?? {};

  useLayoutEffect(() => {
    onEndRef.current = onEnd;
  });

  useEffect(() => {
    if (!enabled) return;

    const root = scrollRootRef.current;
    const target = sentinelRef.current;
    if (!root || !target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) onEndRef.current();
      },
      { root, rootMargin, threshold },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [enabled, rootMargin, scrollRootRef, sentinelRef, threshold]);
}

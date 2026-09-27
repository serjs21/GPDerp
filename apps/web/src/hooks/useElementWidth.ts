"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Tracks an element's content-box width (px) via ResizeObserver.
 * Returns a callback ref plus the latest width (0 until measured or when disabled).
 */
export function useElementWidth<T extends HTMLElement>(enabled = true) {
  const [node, setNode] = useState<T | null>(null);
  const [width, setWidth] = useState(0);

  const ref = useCallback((next: T | null) => setNode(next), []);

  useEffect(() => {
    if (!enabled || !node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, node]);

  return [ref, enabled && node ? width : 0] as const;
}

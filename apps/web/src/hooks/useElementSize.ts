"use client";

import { useCallback, useEffect, useState } from "react";

export type ElementSize = { width: number; height: number };

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 };

/**
 * Tracks an element's content-box size (px) via ResizeObserver.
 * Returns a callback ref plus the latest size (0 x 0 until measured).
 */
export function useElementSize<T extends HTMLElement>() {
  const [node, setNode] = useState<T | null>(null);
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE);

  const ref = useCallback((next: T | null) => setNode(next), []);

  useEffect(() => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [ref, node ? size : EMPTY_SIZE] as const;
}

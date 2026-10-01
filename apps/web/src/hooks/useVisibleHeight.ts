"use client";

import { useEffect, useState, type RefObject } from "react";

const THRESHOLD_STEPS = 40;
const THRESHOLDS = Array.from({ length: THRESHOLD_STEPS + 1 }, (_, i) => i / THRESHOLD_STEPS);

/** Pixel height of `ref`'s element currently inside the viewport (0 when off-screen). */
export function useVisibleHeight(ref: RefObject<HTMLElement | null>): number {
  const [visibleHeight, setVisibleHeight] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisibleHeight(entry.isIntersecting ? Math.round(entry.intersectionRect.height) : 0);
      },
      { threshold: THRESHOLDS },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return visibleHeight;
}

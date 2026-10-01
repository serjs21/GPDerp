"use client";

import { useEffect, useState } from "react";

const THRESHOLD_STEPS = 20;
const THRESHOLDS = Array.from({ length: THRESHOLD_STEPS + 1 }, (_, i) => i / THRESHOLD_STEPS);

/** Share (0–1) of the element with `elementId` inside the viewport. */
export function useElementVisibleRatio(elementId: string): number {
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setRatio(entry.isIntersecting ? entry.intersectionRatio : 0),
      { threshold: THRESHOLDS },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [elementId]);

  return ratio;
}

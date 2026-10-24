"use client";

import { useEffect, useState } from "react";

/**
 * True once the first view reports `viewReady`, or after `maxWaitMs` so a slow or failed view
 * never blocks the first-load reveal. Always true while `enabled` is false.
 */
export function useFirstViewReady(viewReady: boolean, enabled: boolean, maxWaitMs: number) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!enabled || viewReady) return;
    const timer = window.setTimeout(() => setTimedOut(true), maxWaitMs);
    return () => window.clearTimeout(timer);
  }, [enabled, viewReady, maxWaitMs]);

  return !enabled || viewReady || timedOut;
}

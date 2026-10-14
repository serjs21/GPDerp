"use client";

import { useEffect, useState } from "react";
import { useHaikuDisplayMounted } from "@/components/HaikuDisplay/haikuDisplayMountStore";

/**
 * True once the code-split member Main view has mounted, or after `maxWaitMs` so a slow or
 * failed chunk never blocks the reveal. Always true while `enabled` is false.
 */
export function useMemberViewReady(enabled: boolean, maxWaitMs: number) {
  const mounted = useHaikuDisplayMounted();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!enabled || mounted) return;
    const timer = window.setTimeout(() => setTimedOut(true), maxWaitMs);
    return () => window.clearTimeout(timer);
  }, [enabled, mounted, maxWaitMs]);

  return !enabled || mounted || timedOut;
}

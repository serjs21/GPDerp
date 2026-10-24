"use client";

import { useEffect, useState, type RefObject } from "react";
import { waitForRenderedAssets } from "@/utils/visualReadiness/waitForRenderedAssets";

export type UseRenderedContentRevealOptions = {
  /** Data for the content is still loading; nothing is rendered behind the loader yet. */
  pending: boolean;
  /** Reveal anyway once this elapses, so slow or failing art never blocks the content. */
  maxWaitMs: number;
};

/**
 * Whether content rendered (hidden) inside `rootRef` may be shown: false while `pending`, then
 * false until the subtree's images, CSS images and fonts are ready. Failed assets reveal too.
 * Re-arms each time `pending` turns true again.
 */
export function useRenderedContentReveal(
  rootRef: RefObject<HTMLElement | null>,
  { pending, maxWaitMs }: UseRenderedContentRevealOptions,
): boolean {
  const [revealed, setRevealed] = useState(false);
  if (pending && revealed) setRevealed(false);

  useEffect(() => {
    if (pending || revealed) return;
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setRevealed(true);
    };
    const timer = window.setTimeout(reveal, maxWaitMs);
    const root = rootRef.current;
    void (root ? waitForRenderedAssets(root) : Promise.resolve()).then(reveal, reveal);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pending, revealed, rootRef, maxWaitMs]);

  return revealed && !pending;
}

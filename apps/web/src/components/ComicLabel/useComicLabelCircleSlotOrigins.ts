"use client";

import { useLayoutEffect, useState, type RefObject } from "react";
import {
  comicLabelOriginsKey,
  measureComicLabelCircleOrigins,
  type ComicLabelCircleSlot,
} from "./comicLabelCircleLayout";

/**
 * Measure absolute top-left origins so each label's offset box is centered on
 * its ring point. Comicaljs ignores CSS transforms, so we avoid translate(-50%).
 */
export function useComicLabelCircleSlotOrigins(
  stageRef: RefObject<HTMLElement | null>,
  targetRefs: RefObject<Map<string, HTMLElement | null>>,
  slots: readonly ComicLabelCircleSlot[],
): Record<string, { left: number; top: number }> {
  const [slotOrigins, setSlotOrigins] = useState<Record<string, { left: number; top: number }>>(
    {},
  );

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const targets = targetRefs.current;
    if (!stage || !targets) return;

    const sync = () => {
      const next = measureComicLabelCircleOrigins(stage, slots, (id) => targets.get(id));
      setSlotOrigins((prev) =>
        comicLabelOriginsKey(prev) === comicLabelOriginsKey(next) ? prev : next,
      );
    };

    // Defer to the next frame so refs and text metrics are settled before measuring.
    const frameId = requestAnimationFrame(sync);
    const resizeObserver = new ResizeObserver(sync);
    resizeObserver.observe(stage);
    for (const slot of slots) {
      const el = targets.get(slot.label.id);
      if (el) resizeObserver.observe(el);
    }

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
    };
  }, [slots, stageRef, targetRefs]);

  return slotOrigins;
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { takeLabelBeltPuffIn } from "@/components/Lantern/utils/labelBeltEnterQueue";
import { buildEnterStaggerDelays } from "@/components/ManageLabel/consts/magicAnimationConsts";
import type { LabelHaloLabelItem } from "./consts/labelHaloConsts";

/**
 * Staggered puffIn delays for labels that join the halo after first render (or that the label belt
 * queued for a puff). Initial labels appear without animation.
 */
export function useLabelPuffIn(labels: LabelHaloLabelItem[]) {
  const [puffDelays, setPuffDelays] = useState<Record<string, number>>({});
  const knownIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const currentIds = labels.map((label) => label.id);
    const currentSet = new Set(currentIds);
    const queued = takeLabelBeltPuffIn(currentSet);

    if (knownIdsRef.current == null) {
      knownIdsRef.current = currentSet;
      if (queued.length === 0) return;
    }

    const added = queued.length > 0 ? queued : currentIds.filter((id) => !knownIdsRef.current!.has(id));

    knownIdsRef.current = currentSet;
    if (added.length === 0) return;

    const batch = buildEnterStaggerDelays(added);
    setPuffDelays((prev) => {
      const next = { ...prev };
      for (const [id, delay] of Object.entries(batch)) {
        if (id in next) continue;
        next[id] = delay;
      }
      return next;
    });
  }, [labels]);

  const clearPuff = useCallback((labelId: string) => {
    setPuffDelays((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  }, []);

  return { puffDelays, clearPuff };
}

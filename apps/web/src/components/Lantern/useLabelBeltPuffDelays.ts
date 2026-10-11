"use client";

import { useEffect, useRef, useState } from "react";
import { buildEnterStaggerDelays } from "@/components/ManageLabel/consts/magicAnimationConsts";
import type { LabelBeltItem } from "./LabelBelt";
import { takeLabelBeltPuffIn } from "./utils/labelBeltEnterQueue";

/**
 * Stagger delays for labels that should puff in: queued ones (just attached elsewhere), else ids new
 * since the last render. First mount only puffs queued labels.
 */
export function useLabelBeltPuffDelays(labels: LabelBeltItem[]) {
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

    const added =
      queued.length > 0
        ? queued
        : currentIds.filter((id) => !knownIdsRef.current!.has(id));

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

  const clearPuff = (labelId: string) => {
    setPuffDelays((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  };

  return { puffDelays, clearPuff };
}

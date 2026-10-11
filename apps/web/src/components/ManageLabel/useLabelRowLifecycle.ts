"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LabelDto } from "@/api/labels";
import { buildEnterStaggerDelays } from "./consts/magicAnimationConsts";
import { mergeDisplayLabels } from "./utils/mergeDisplayLabels";

type LabelRowLifecycleOptions = {
  active: boolean;
  isPagedLoading: boolean;
  pagedLabels: LabelDto[];
  orderedLabels: LabelDto[];
};

/**
 * Row enter/exit bookkeeping for the manage-labels list: labels created here get a staggered
 * entrance once they arrive from the API, and deleted rows stay mounted until their exit finishes.
 */
export function useLabelRowLifecycle({ active, isPagedLoading, pagedLabels, orderedLabels }: LabelRowLifecycleOptions) {
  /** labelId → boingInUp delay ms (insert order). */
  const [enterDelays, setEnterDelays] = useState<Record<string, number>>({});
  /** Keep deleted rows mounted through boingOutDown after query invalidation. */
  const [exitingById, setExitingById] = useState<Record<string, LabelDto>>({});
  /** Labels created here that haven't reached the list yet; only these get the enter animation + scroll. */
  const pendingCreatedIdsRef = useRef<Set<string>>(new Set());
  const displayOrderRef = useRef<string[]>([]);

  useEffect(() => {
    if (active) return;
    pendingCreatedIdsRef.current.clear();
    displayOrderRef.current = [];
    setEnterDelays({});
    setExitingById({});
  }, [active]);

  const displayLabels = useMemo(() => {
    const { order, labels } = mergeDisplayLabels(displayOrderRef.current, orderedLabels, exitingById);
    displayOrderRef.current = order;
    return labels;
  }, [orderedLabels, exitingById]);

  const scheduleEnterAnimations = useCallback((orderedIds: string[]) => {
    if (orderedIds.length === 0) return;
    const batch = buildEnterStaggerDelays(orderedIds);
    setEnterDelays((prev) => {
      const next = { ...prev };
      for (const [id, delay] of Object.entries(batch)) {
        if (id in next) continue;
        next[id] = delay;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const pending = pendingCreatedIdsRef.current;
    if (!active || isPagedLoading || pending.size === 0) return;
    const arrivedInListOrder = pagedLabels.map((label) => label.id).filter((id) => pending.has(id));
    if (arrivedInListOrder.length === 0) return;
    for (const id of arrivedInListOrder) pending.delete(id);
    scheduleEnterAnimations(arrivedInListOrder);
  }, [active, isPagedLoading, pagedLabels, scheduleEnterAnimations]);

  const trackCreated = useCallback((labelId: string) => {
    pendingCreatedIdsRef.current.add(labelId);
  }, []);

  const clearEnterAnimation = useCallback((labelId: string) => {
    setEnterDelays((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  }, []);

  const handleExitStart = useCallback((label: LabelDto) => {
    setExitingById((prev) => (prev[label.id] ? prev : { ...prev, [label.id]: label }));
  }, []);

  const handleExitComplete = useCallback((labelId: string) => {
    setExitingById((prev) => {
      if (!(labelId in prev)) return prev;
      const next = { ...prev };
      delete next[labelId];
      return next;
    });
  }, []);

  return {
    displayLabels,
    enterDelays,
    exitingById,
    trackCreated,
    clearEnterAnimation,
    handleExitStart,
    handleExitComplete,
  };
}

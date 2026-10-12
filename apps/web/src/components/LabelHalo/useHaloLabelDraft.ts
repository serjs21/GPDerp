"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { LabelHaloLabelItem, LabelPlacement } from "./consts/labelHaloConsts";
import { clearDropAreaRoughOutline } from "./utils/dropAreaRoughOutline";
import { nextDraggingId } from "./utils/haloPlacementUtils";

/**
 * Local placement draft for halo labels while dragging/rotating: positions and rotations update live,
 * resync from `labels` props, and commits are forwarded to `onPlacementCommit`.
 */
export function useHaloLabelDraft(
  labels: LabelHaloLabelItem[],
  outlineRef: RefObject<SVGSVGElement | null>,
  onPlacementCommit: ((labelId: string, placement: LabelPlacement) => void) | undefined,
) {
  const activeDragIdsRef = useRef<Set<string>>(new Set());
  const [draft, setDraft] = useState<LabelHaloLabelItem[]>(labels);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [rotateById, setRotateById] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    for (const label of labels) map[label.id] = label.rotateDeg;
    return map;
  });

  // Passive effect (not render-time sync) so new labels commit in the same flush as
  // `useLabelPuffIn`'s delays; otherwise they paint once at full opacity before puffing in.
  useEffect(() => {
    setDraft(labels);
    setRotateById((prev) => {
      const next = { ...prev };
      for (const label of labels) {
        if (next[label.id] == null) next[label.id] = label.rotateDeg;
      }
      return next;
    });
  }, [labels]);

  const onPositionDraft = useCallback((labelId: string, xPercent: number, yPercent: number) => {
    setDraft((current) => current.map((label) => (label.id === labelId ? { ...label, xPercent, yPercent } : label)));
  }, []);

  const onDragActiveChange = useCallback(
    (labelId: string, active: boolean) => {
      const set = activeDragIdsRef.current;
      if (active) set.add(labelId);
      else set.delete(labelId);
      setDraggingId(nextDraggingId(set, labelId, active));
      if (set.size === 0) clearDropAreaRoughOutline(outlineRef.current);
    },
    [outlineRef],
  );

  const onRotateDraft = useCallback((labelId: string, next: number) => {
    setRotateById((prev) => ({ ...prev, [labelId]: next }));
  }, []);

  const commitPlacement = useCallback(
    (labelId: string, placement: LabelPlacement) => {
      setRotateById((prev) => ({ ...prev, [labelId]: placement.rotateDeg }));
      setDraft((current) =>
        current.map((label) =>
          label.id === labelId
            ? { ...label, xPercent: placement.xPercent, yPercent: placement.yPercent, rotateDeg: placement.rotateDeg }
            : label,
        ),
      );
      onPlacementCommit?.(labelId, placement);
    },
    [onPlacementCommit],
  );

  return { draft, draggingId, rotateById, onPositionDraft, onDragActiveChange, onRotateDraft, commitPlacement };
}

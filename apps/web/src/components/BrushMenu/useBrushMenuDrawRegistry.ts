"use client";

import { useCallback, useRef } from "react";
import type { BrushOptionBrushPaths } from "./BrushPaintLayer";
import type { BrushRevealPathGroup } from "./useBrushMenuDrawAnimation";
import { toPathGroups } from "./utils/brushMenuUtils";

/** Brush mask paths + label nodes registered by the trigger and option rows for the draw animation. */
export function useBrushMenuDrawRegistry(triggerBrush: boolean) {
  const triggerBrushPathsRef = useRef<BrushOptionBrushPaths | null>(null);
  const triggerExpandLabelRef = useRef<HTMLSpanElement | null>(null);
  const brushPathsRef = useRef<(BrushOptionBrushPaths | null)[]>([]);
  const labelElsRef = useRef<(HTMLSpanElement | null)[]>([]);

  const getBrushPathGroups = useCallback(() => {
    const groups: BrushRevealPathGroup[] = [];
    if (triggerBrush && triggerBrushPathsRef.current) {
      groups.push(triggerBrushPathsRef.current);
    }
    groups.push(...toPathGroups(brushPathsRef.current));
    return groups;
  }, [triggerBrush]);

  const getLabelEls = useCallback(() => {
    const labels: HTMLSpanElement[] = [];
    if (triggerBrush && triggerExpandLabelRef.current) {
      labels.push(triggerExpandLabelRef.current);
    }
    for (const label of labelElsRef.current) {
      if (label) labels.push(label);
    }
    return labels;
  }, [triggerBrush]);

  const resetDrawRegistry = useCallback(() => {
    triggerBrushPathsRef.current = null;
    brushPathsRef.current = [];
    labelElsRef.current = [];
  }, []);

  return {
    triggerBrushPathsRef,
    triggerExpandLabelRef,
    brushPathsRef,
    labelElsRef,
    getBrushPathGroups,
    getLabelEls,
    resetDrawRegistry,
  };
}

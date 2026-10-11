"use client";

import { useMemo, type RefObject } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { DeletePack } from "./SVGPath.types";
import type { ParsedSplitPathSvg } from "./utils";
import { computeVisibleLanterns } from "./utils/visibleLanterns";

/** Memoized per-frame lantern poses (focus tween, catch-up, delete pack, loader slot). */
export function useSvgPathVisibleLanterns(params: {
  parsed: ParsedSplitPathSvg | null;
  haikus: HaikuDto[];
  focusIndex: number;
  fromFocusIndex: number;
  tweenProgress: number;
  catchUpStartRef: RefObject<number | null>;
  displayCatchUpT: number;
  deletePack: DeletePack | null;
  deletePackT: number;
  packingActive: boolean;
  loaderShown: boolean;
}) {
  const {
    parsed,
    haikus,
    focusIndex,
    fromFocusIndex,
    tweenProgress,
    catchUpStartRef,
    displayCatchUpT,
    deletePack,
    deletePackT,
    packingActive,
    loaderShown,
  } = params;

  return useMemo(() => {
    if (!parsed) return [];
    return computeVisibleLanterns({
      parsed,
      haikus,
      focusIndex,
      fromFocusIndex,
      tweenProgress,
      catchUpStart: catchUpStartRef.current,
      catchUpT: displayCatchUpT,
      packIndexById: packingActive && deletePack ? deletePack.prevIndexById : null,
      deletePackT,
      loaderShown,
    });
  }, [
    deletePack,
    deletePackT,
    displayCatchUpT,
    focusIndex,
    fromFocusIndex,
    haikus,
    loaderShown,
    packingActive,
    parsed,
    tweenProgress,
    catchUpStartRef,
  ]);
}

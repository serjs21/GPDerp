"use client";

import type { HaikuDto } from "@/api/haikus";
import type { SvgPathListLanternProps } from "./SVGPath.types";
import { SVGPathLantern } from "./SVGPathLantern";
import { isUnderCreationOverlay } from "./utils/svgPathViewUtils";

/** One queued list lantern (or the pagination loader slot) at its current path pose. */
export function SvgPathListLantern({
  entry,
  focusIndex,
  hideListFocusStop,
  isAnimating,
  excludeLabelIds,
  onLanternDeleted,
  onHaikuDeleteFailed,
  onHaikuChanged,
}: SvgPathListLanternProps) {
  const { haiku, haikuIndex, loading, transform, face } = entry;
  if (isUnderCreationOverlay(hideListFocusStop, haikuIndex, focusIndex)) return null;

  const onDeleted = haiku ? (deleted: HaikuDto) => onLanternDeleted(deleted, transform) : undefined;

  return (
    <SVGPathLantern
      haiku={haiku}
      loading={loading}
      transform={transform}
      face={face}
      isAnimating={isAnimating}
      suppressReveal
      actionsAlwaysVisible={haikuIndex === focusIndex}
      excludeLabelIds={excludeLabelIds}
      onDeleted={onDeleted}
      onDeleteFailed={onHaikuDeleteFailed}
      onChanged={onHaikuChanged}
    />
  );
}

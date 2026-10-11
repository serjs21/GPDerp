import type { CSSProperties } from "react";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import {
  CREATION_PATH_LANTERN_ABOVE_CHROME_Z_INDEX,
  CREATION_PATH_LANTERN_Z_INDEX,
} from "../consts/creationPathLanternConsts";

/** Faded out, or nothing to show (no draft streaming and no saved handoff haiku). */
export function isCreationLanternHidden(
  overlayOpacity: number,
  generatingDraft: GeneratingDraft | null | undefined,
  handoffHaiku: HaikuDto | null | undefined,
): boolean {
  return overlayOpacity <= 0.01 || (!generatingDraft && !handoffHaiku);
}

/** The streaming draft wins; the saved handoff haiku shows once the stream ends. */
export function creationLanternHaiku(
  generatingDraft: GeneratingDraft | null | undefined,
  handoffHaiku: HaikuDto | null | undefined,
): HaikuDto | undefined {
  return generatingDraft ? undefined : (handoffHaiku ?? undefined);
}

/** Elevated: fixed over the measured guideBox above PathOverlay; otherwise in-flow above path lanterns. */
export function creationLanternOverlayStyle(guideBoxRect: DOMRect | null, overlayOpacity: number): CSSProperties {
  if (!guideBoxRect) {
    return { opacity: overlayOpacity, zIndex: CREATION_PATH_LANTERN_Z_INDEX };
  }
  return {
    position: "fixed",
    left: guideBoxRect.left,
    top: guideBoxRect.top,
    width: guideBoxRect.width,
    height: guideBoxRect.height,
    opacity: overlayOpacity,
    zIndex: CREATION_PATH_LANTERN_ABOVE_CHROME_Z_INDEX,
    pointerEvents: "none",
  };
}

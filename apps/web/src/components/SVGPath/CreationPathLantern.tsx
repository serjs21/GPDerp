"use client";

import type { RefObject } from "react";
import { createPortal } from "react-dom";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { PathNavigationProvider } from "@/components/PathNavigation";
import { SVGPathLantern } from "./SVGPathLantern";
import { useGuideBoxRect } from "./useGuideBoxRect";
import {
  creationLanternHaiku,
  creationLanternOverlayStyle,
  isCreationLanternHidden,
} from "./utils/creationPathLanternUtils";
import styles from "./CreationPathLantern.module.css";

export type CreationPathLanternProps = {
  transform: LanternTransform;
  /** 1 = fully visible; ≤0.01 unmounts. */
  overlayOpacity: number;
  generatingDraft?: GeneratingDraft | null;
  /** Saved haiku while far-path modal chrome stays open after stream ends. */
  handoffHaiku?: HaikuDto | null;
  excludeLabelIds?: string[];
  /**
   * Far-path: portal above PathOverlay (z=1000) while mirroring guideBox bounds
   * so stop-20 alignment is preserved.
   */
  elevateAboveChrome?: boolean;
  guideBoxRef?: RefObject<HTMLElement | null>;
};

/**
 * Absolute creation lantern in the guideBox (same % coords as list lanterns).
 * Path fly supplies `transform`; z-index sits above all path lanterns — or above
 * PathOverlay when `elevateAboveChrome` is set.
 */
export function CreationPathLantern({
  transform,
  overlayOpacity,
  generatingDraft,
  handoffHaiku,
  excludeLabelIds,
  elevateAboveChrome,
  guideBoxRef,
}: CreationPathLanternProps) {
  const guideBoxRect = useGuideBoxRect(Boolean(elevateAboveChrome), guideBoxRef);

  if (isCreationLanternHidden(overlayOpacity, generatingDraft, handoffHaiku)) return null;

  const elevated = guideBoxRect != null;
  const node = (
    <div
      className={elevated ? styles.overlayElevated : styles.overlay}
      style={creationLanternOverlayStyle(guideBoxRect, overlayOpacity)}
      data-creation-path-lantern=""
    >
      <PathNavigationProvider value={null}>
        <SVGPathLantern
          generatingDraft={generatingDraft}
          haiku={creationLanternHaiku(generatingDraft, handoffHaiku)}
          transform={transform}
          suppressReveal
          isAnimating={overlayOpacity < 1}
          actionsAlwaysVisible
          excludeLabelIds={excludeLabelIds}
        />
      </PathNavigationProvider>
    </div>
  );

  if (elevated && typeof document !== "undefined") {
    return createPortal(node, document.body);
  }

  return node;
}

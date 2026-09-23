"use client";

import {
  useLayoutEffect,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
import type { HaikuDto } from "@/api/haikus";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import {
  CREATION_PATH_LANTERN_ABOVE_CHROME_Z_INDEX,
  CREATION_PATH_LANTERN_Z_INDEX,
} from "./consts/creationPathLanternConsts";
import { SVGPathLantern } from "./SVGPathLantern";
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
  generatingDraft = null,
  handoffHaiku = null,
  excludeLabelIds,
  elevateAboveChrome = false,
  guideBoxRef,
}: CreationPathLanternProps) {
  const [guideBoxRect, setGuideBoxRect] = useState<DOMRect | null>(null);

  useLayoutEffect(() => {
    if (!elevateAboveChrome) {
      setGuideBoxRect(null);
      return;
    }
    const el = guideBoxRef?.current;
    if (!el) return;

    const sync = () => setGuideBoxRect(el.getBoundingClientRect());
    sync();

    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("resize", sync);
    window.addEventListener("scroll", sync, true);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", sync);
      window.removeEventListener("scroll", sync, true);
    };
  }, [elevateAboveChrome, guideBoxRef]);

  if (overlayOpacity <= 0.01) return null;
  if (!generatingDraft && !handoffHaiku) return null;

  const elevated = elevateAboveChrome && guideBoxRect != null;
  const zIndex = elevated
    ? CREATION_PATH_LANTERN_ABOVE_CHROME_Z_INDEX
    : CREATION_PATH_LANTERN_Z_INDEX;

  const style = (
    elevated
      ? {
          position: "fixed",
          left: guideBoxRect.left,
          top: guideBoxRect.top,
          width: guideBoxRect.width,
          height: guideBoxRect.height,
          opacity: overlayOpacity,
          zIndex,
          pointerEvents: "none",
        }
      : {
          opacity: overlayOpacity,
          zIndex,
        }
  ) as CSSProperties;

  const node = (
    <div
      className={elevated ? styles.overlayElevated : styles.overlay}
      style={style}
      data-creation-path-lantern=""
    >
      <SVGPathLantern
        generatingDraft={generatingDraft}
        haiku={generatingDraft ? undefined : (handoffHaiku ?? undefined)}
        transform={transform}
        suppressReveal
        isAnimating={overlayOpacity < 1}
        actionsAlwaysVisible
        excludeLabelIds={excludeLabelIds}
      />
    </div>
  );

  if (elevated && typeof document !== "undefined") {
    return createPortal(node, document.body);
  }

  return node;
}

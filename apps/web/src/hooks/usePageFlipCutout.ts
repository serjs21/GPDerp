"use client";

import { useEffect, type RefObject } from "react";
import { complementClipPath } from "@/components/Loaders/htmlDecorations/htmlLoader/utils/htmlLoaderExitUtils";

/**
 * react-pageflip draws the static page in full under the turn and clips the next page to the uncovered
 * corner. With a transparent next page that would show the static page again, so this mirrors the next
 * page's clip onto the static page as a cut-out (same page-local coordinates), synced before each paint.
 */
export function usePageFlipCutout(
  sceneRef: RefObject<HTMLElement | null>,
  staticContentRef: RefObject<HTMLElement | null>,
  uncoveredPageSelector: string,
): void {
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const observer = new MutationObserver((records) => {
      const uncovered = records.find(
        (record) => record.target instanceof HTMLElement && record.target.matches(uncoveredPageSelector),
      )?.target as HTMLElement | undefined;
      const staticContent = staticContentRef.current;
      if (!uncovered || !staticContent) return;
      const clip = uncovered.style.display === "none" ? "" : uncovered.style.clipPath;
      staticContent.style.clipPath = complementClipPath(clip);
    });
    observer.observe(scene, { subtree: true, attributes: true, attributeFilter: ["style"] });
    return () => observer.disconnect();
  }, [sceneRef, staticContentRef, uncoveredPageSelector]);
}

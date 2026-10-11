"use client";

import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SVG_PATH_LANTERN_WIDTH_REM } from "./consts/pathLanternLayoutConsts";
import { RotatedPathAnchor } from "./RotatedPathAnchor";
import type { GeneratingPathLanternProps } from "./SVGPathLantern.types";
import { SVGPathLanternBody } from "./SVGPathLanternBody";

/** Unsaved path lantern: a streaming draft (rotated or upright) or a loading slot. */
export function GeneratingPathLantern({
  generatingDraft,
  loading,
  transform,
  face,
  isAnimating,
  suppressReveal,
  ariaLabel,
  showActions,
  lanternClass,
}: GeneratingPathLanternProps) {
  if (face.kind === "rotated" && generatingDraft) {
    return (
      <RotatedPathAnchor
        transform={transform}
        suppressReveal={suppressReveal}
        isAnimating={isAnimating}
        ariaLabel={ariaLabel}
      >
        <Lantern
          generatingDraft={generatingDraft}
          rotationBase={face.variant}
          mirrored={face.mirrored}
          showActions={showActions}
          widthRem={SVG_PATH_LANTERN_WIDTH_REM}
          style={{ width: "100%", height: "100%", animation: "none" }}
        />
      </RotatedPathAnchor>
    );
  }

  return (
    <LanternFrame
      className={lanternClass}
      transform={transform}
      flightExiting={suppressReveal}
      widthRem={SVG_PATH_LANTERN_WIDTH_REM}
      ariaLabel={ariaLabel}
      generating={Boolean(generatingDraft)}
    >
      <SVGPathLanternBody
        generatingDraft={generatingDraft}
        loading={loading}
        showActions={showActions}
      />
    </LanternFrame>
  );
}

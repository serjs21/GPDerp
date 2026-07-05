"use client";

import { useMemo, type CSSProperties } from "react";
import {
  PATTERN_TRIANGLES,
  randomFaceColors,
} from "./creasePattern";
import { CRANE_CAMERA, resolveCraneFoldProgress, resolveCraneFolds } from "./origamiCraneSequence";
import {
  craneLandmarksToDataAttributes,
  verifyCraneReferencePose,
} from "./origamiCraneVerification";
import { OrigamiTrianglePanels } from "./OrigamiTrianglePanels";
import styles from "./origamiNote.module.css";

export type OrigamiNoteCraneProps = {
  /** 0 = flat, 1 = full crane pose. Default 1. */
  progress?: number;
  size?: number;
  lineColor?: string;
  colorSeed?: number;
  className?: string;
};

/** Crane pose derived from the flat bird-base via connected hinge transforms. */
export function OrigamiNoteCrane({
  progress = 1,
  size = 320,
  lineColor = "#000000",
  colorSeed = 42,
  className,
}: OrigamiNoteCraneProps) {
  const resolvedFolds = useMemo(
    () => (progress >= 1 ? resolveCraneFolds() : resolveCraneFoldProgress(progress)),
    [progress],
  );

  const verification = useMemo(
    () => (progress >= 1 ? verifyCraneReferencePose(1, CRANE_CAMERA) : null),
    [progress],
  );

  const verificationAttrs = verification ? craneLandmarksToDataAttributes(verification) : {};

  const faceColors = useMemo(
    () => randomFaceColors(PATTERN_TRIANGLES.length, colorSeed),
    [colorSeed],
  );

  const style = {
    "--origami-size": `${size}px`,
    "--origami-line": lineColor,
  } as CSSProperties;

  const rootClass = [styles.square, className].filter(Boolean).join(" ");

  return (
    <div
      className={rootClass}
      style={style}
      role="img"
      aria-label="Origami crane folded from bird-base crease pattern"
      {...verificationAttrs}
    >
      <OrigamiTrianglePanels
        panels={PATTERN_TRIANGLES}
        colors={faceColors}
        resolvedFolds={resolvedFolds}
        cameraOverride={CRANE_CAMERA}
      />
    </div>
  );
}

export { CRANE_CAMERA, resolveCraneFoldProgress, resolveCraneFolds };

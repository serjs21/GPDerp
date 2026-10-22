"use client";

import { LanternRotatedShell } from "@/components/Lantern/LanternRotatedShell";
import { SakuraPetalLoader } from "@/components/Loaders";
import { ROTATED_PATH_LANTERN_STYLE, SVG_PATH_LANTERN_WIDTH_REM } from "./consts/pathLanternLayoutConsts";
import { RotatedPathAnchor } from "./RotatedPathAnchor";
import type { RotatedLoadingPathLanternProps } from "./SVGPathLantern.types";
import styles from "./SVGPath.module.css";

/** Loading slot on a rotated stop: the stop's rotated base with the petal loader on its (skewed) paper face. */
export function RotatedLoadingPathLantern({
  transform,
  face,
  suppressReveal,
  isAnimating,
  ariaLabel,
}: RotatedLoadingPathLanternProps) {
  return (
    <RotatedPathAnchor
      transform={transform}
      suppressReveal={suppressReveal}
      isAnimating={isAnimating}
      ariaLabel={ariaLabel}
    >
      <LanternRotatedShell
        rotationBase={face.variant}
        mirrored={face.mirrored}
        widthRem={SVG_PATH_LANTERN_WIDTH_REM}
        style={ROTATED_PATH_LANTERN_STYLE}
        ariaLabel={ariaLabel}
      >
        <SakuraPetalLoader className={styles.lanternLoader} />
      </LanternRotatedShell>
    </RotatedPathAnchor>
  );
}

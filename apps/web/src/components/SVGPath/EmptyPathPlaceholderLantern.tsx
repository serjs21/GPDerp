"use client";

import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SVG_PATH_LANTERN_WIDTH_REM } from "./consts/pathLanternLayoutConsts";
import { EMPTY_PATH_PLACEHOLDER_ARROW_SRC } from "./consts/emptyPathPlaceholderConsts";
import type { EmptyPathPlaceholderLanternProps } from "./EmptyPathPlaceholder.types";
import {
  haloPathLanternClassName,
  pathLanternCssVars,
  svgPathLanternClassName,
} from "./utils/svgPathLanternUtils";
import styles from "./EmptyPathPlaceholder.module.css";

const IDENTITY_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  positionMode: "translate" as const,
};

/** Placeholder text lantern at a path pose (same box as saved lanterns), without date or actions. */
export function EmptyPathPlaceholderLantern({
  haiku,
  transform,
  ariaLabel,
  isAnimating,
  showArrow,
}: EmptyPathPlaceholderLanternProps) {
  return (
    <div
      className={haloPathLanternClassName(svgPathLanternClassName(isAnimating), false)}
      style={pathLanternCssVars(transform)}
    >
      <LanternFrame
        transform={IDENTITY_TRANSFORM}
        widthRem={SVG_PATH_LANTERN_WIDTH_REM}
        ariaLabel={ariaLabel}
        showLabelBelt={false}
        style={{ width: "100%", height: "100%" }}
      >
        <Lantern haiku={haiku} showActions={false} showMeta={false} />
      </LanternFrame>
      {showArrow ? (
        // eslint-disable-next-line @next/next/no-img-element -- static public SVG
        <img className={styles.arrow} src={EMPTY_PATH_PLACEHOLDER_ARROW_SRC} alt="" aria-hidden draggable={false} />
      ) : null}
    </div>
  );
}

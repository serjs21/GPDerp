"use client";

import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { SVG_PATH_FOCUS_STOP } from "./svgPathPose";
import styles from "./SVGPath.module.css";

export type SVGPathLanternProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  pathStop: number;
  onDeleted?: () => void;
  onChanged?: () => void;
};

export function SVGPathLantern({
  haiku,
  transform,
  pathStop,
  onDeleted,
  onChanged,
}: SVGPathLanternProps) {
  if ((transform.opacity ?? 1) <= 0.01 || transform.scale <= 0) {
    return null;
  }

  const isFocused = Math.abs(pathStop - SVG_PATH_FOCUS_STOP) < 0.5;

  return (
    <LanternFrame
      className={styles.lantern}
      transform={transform}
      widthRem={19}
      ariaLabel={`Haiku lantern: ${haiku.title}`}
    >
      <Lantern haiku={haiku} bodyOnly={!isFocused} onDeleted={onDeleted} onChanged={onChanged} />
    </LanternFrame>
  );
}

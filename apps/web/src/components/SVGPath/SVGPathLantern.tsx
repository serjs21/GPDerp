"use client";

import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import styles from "./SVGPath.module.css";

export type SVGPathLanternProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  onDeleted?: () => void;
  onChanged?: () => void;
};

export function SVGPathLantern({
  haiku,
  transform,
  onDeleted,
  onChanged,
}: SVGPathLanternProps) {
  if ((transform.opacity ?? 1) <= 0.01 || transform.scale <= 0) {
    return null;
  }

  return (
    <LanternFrame
      className={styles.lantern}
      transform={transform}
      widthRem={19}
      ariaLabel={`Haiku lantern: ${haiku.title}`}
    >
      <Lantern haiku={haiku} onDeleted={onDeleted} onChanged={onChanged} />
    </LanternFrame>
  );
}

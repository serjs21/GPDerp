"use client";

import { memo } from "react";
import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import styles from "./SVGPath.module.css";

export type SVGPathLanternProps = {
  haiku: HaikuDto;
  transform: LanternTransform;
  isAnimating?: boolean;
  onDeleted?: () => void;
  onChanged?: () => void;
};

const SVGPathLanternBody = memo(function SVGPathLanternBody({
  haiku,
  showActions,
  onDeleted,
  onChanged,
}: {
  haiku: HaikuDto;
  showActions: boolean;
  onDeleted?: () => void;
  onChanged?: () => void;
}) {
  return (
    <Lantern
      haiku={haiku}
      showActions={showActions}
      onDeleted={onDeleted}
      onChanged={onChanged}
    />
  );
});

export function SVGPathLantern({
  haiku,
  transform,
  isAnimating = false,
  onDeleted,
  onChanged,
}: SVGPathLanternProps) {
  if ((transform.opacity ?? 1) <= 0.01 || transform.scale <= 0) {
    return null;
  }

  const lanternClass = [styles.lantern, isAnimating ? styles.lanternAnimating : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <LanternFrame
      className={lanternClass}
      transform={transform}
      widthRem={19}
      ariaLabel={`Haiku lantern: ${haiku.title}`}
    >
      <SVGPathLanternBody
        haiku={haiku}
        showActions={!isAnimating}
        onDeleted={onDeleted}
        onChanged={onChanged}
      />
    </LanternFrame>
  );
}

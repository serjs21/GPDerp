"use client";

import { memo } from "react";
import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import styles from "./SVGPath.module.css";

export type SVGPathLanternProps = {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  transform: LanternTransform;
  isAnimating?: boolean;
  onDeleted?: () => void;
  onChanged?: () => void;
};

const SVGPathLanternBody = memo(function SVGPathLanternBody({
  haiku,
  generatingDraft,
  showActions,
  onDeleted,
  onChanged,
}: {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  showActions: boolean;
  onDeleted?: () => void;
  onChanged?: () => void;
}) {
  if (generatingDraft) {
    return <Lantern generatingDraft={generatingDraft} showActions={showActions} />;
  }
  if (!haiku) return null;
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
  generatingDraft,
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
  const ariaLabel = generatingDraft
    ? `Generating haiku: ${generatingDraft.subject}`
    : `Haiku lantern: ${haiku?.title ?? ""}`;

  return (
    <LanternFrame
      className={lanternClass}
      transform={transform}
      widthRem={19}
      ariaLabel={ariaLabel}
      generating={Boolean(generatingDraft)}
    >
      <SVGPathLanternBody
        haiku={haiku}
        generatingDraft={generatingDraft}
        showActions={!isAnimating}
        onDeleted={onDeleted}
        onChanged={onChanged}
      />
    </LanternFrame>
  );
}

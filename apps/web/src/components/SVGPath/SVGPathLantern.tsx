"use client";

import { memo } from "react";
import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import type { LanternTransform } from "@/components/Lantern/lanternTransform";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import styles from "./SVGPath.module.css";

export type SVGPathLanternProps = {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  transform: LanternTransform;
  isAnimating?: boolean;
  onDeleted?: () => void;
  onChanged?: () => void;
};

const SVGPathLanternBody = memo(function SVGPathLanternBody({
  haiku,
  generatingDraft,
  loading,
  showActions,
  onDeleted,
  onChanged,
}: {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  showActions: boolean;
  onDeleted?: () => void;
  onChanged?: () => void;
}) {
  if (loading) {
    return (
      <div className={styles.lanternLoader}>
        <SakuraPetalLoader compact />
      </div>
    );
  }
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
  loading = false,
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
  const ariaLabel = loading
    ? "Loading more haikus"
    : generatingDraft
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
        loading={loading}
        showActions={!isAnimating && !loading}
        onDeleted={onDeleted}
        onChanged={onChanged}
      />
    </LanternFrame>
  );
}

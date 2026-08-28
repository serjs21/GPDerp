"use client";

import { memo } from "react";
import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternDeleteExit } from "@/components/Lantern/LanternDeleteExit";
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
  onDelete,
  onChanged,
}: {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  showActions: boolean;
  onDelete?: () => Promise<void>;
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
      onDelete={onDelete}
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

  if (haiku) {
    return (
      <LanternDeleteExit
        haiku={haiku}
        transform={transform}
        onDeleted={onDeleted}
        onChanged={onChanged}
      >
        {({ onDelete, flightStyle, flightExiting }) => (
          <LanternFrame
            className={lanternClass}
            transform={transform}
            style={flightStyle}
            flightExiting={flightExiting}
            widthRem={19}
            ariaLabel={ariaLabel}
          >
            <SVGPathLanternBody
              haiku={haiku}
              loading={loading}
              showActions={!isAnimating && !loading}
              onDelete={onDelete}
              onChanged={onChanged}
            />
          </LanternFrame>
        )}
      </LanternDeleteExit>
    );
  }

  return (
    <LanternFrame
      className={lanternClass}
      transform={transform}
      widthRem={19}
      ariaLabel={ariaLabel}
      generating={Boolean(generatingDraft)}
    >
      <SVGPathLanternBody
        generatingDraft={generatingDraft}
        loading={loading}
        showActions={!isAnimating && !loading}
      />
    </LanternFrame>
  );
}

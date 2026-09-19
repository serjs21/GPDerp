"use client";

import { memo, type CSSProperties, type ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternDeleteExit } from "@/components/Lantern/LanternDeleteExit";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { LanternRotated } from "@/components/Lantern/LanternRotated";
import lanternStyles from "@/components/Lantern/Lantern.module.css";
import {
  lanternTransformToCssVars,
  type LanternTransform,
} from "@/components/Lantern/lanternTransform";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import type { StopFace } from "./pathStopRotation";
import styles from "./SVGPath.module.css";

const WIDTH_REM = 19;

export type SVGPathLanternProps = {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  transform: LanternTransform;
  face?: StopFace;
  isAnimating?: boolean;
  /** Suppress lanternReveal (stepped hard cuts / idle remount after stepped). */
  suppressReveal?: boolean;
  excludeLabelIds?: string[];
  onDeleted?: (haiku: HaikuDto) => void;
  onDeleteFailed?: (haiku: HaikuDto) => void;
  onExitComplete?: (haiku: HaikuDto) => void;
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

function RotatedPathAnchor({
  transform,
  flightStyle,
  suppressReveal,
  isAnimating,
  ariaLabel,
  children,
}: {
  transform: LanternTransform;
  flightStyle?: CSSProperties;
  suppressReveal: boolean;
  isAnimating: boolean;
  ariaLabel: string;
  children: ReactNode;
}) {
  const anchorStyle = {
    ...lanternTransformToCssVars(transform),
    ...flightStyle,
    "--lantern-width": `${WIDTH_REM}rem`,
    animation: "none",
  } as CSSProperties;

  return (
    <div
      className={[
        lanternStyles.root,
        lanternStyles.pathPositioned,
        styles.lantern,
        suppressReveal ? lanternStyles.flightExiting : null,
        isAnimating ? styles.lanternAnimating : null,
      ]
        .filter(Boolean)
        .join(" ")}
      style={anchorStyle}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}

export function SVGPathLantern({
  haiku,
  generatingDraft,
  loading = false,
  transform,
  face = { kind: "upright" },
  isAnimating = false,
  suppressReveal = false,
  excludeLabelIds,
  onDeleted,
  onDeleteFailed,
  onExitComplete,
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
  const showActions = !isAnimating && !loading;

  if (haiku) {
    return (
      <LanternDeleteExit
        haiku={haiku}
        transform={transform}
        onDeleted={onDeleted}
        onDeleteFailed={onDeleteFailed}
        onExitComplete={onExitComplete}
        onChanged={onChanged}
        excludeLabelIds={excludeLabelIds}
      >
        {({ onDelete, flightStyle, flightExiting }) => {
          const exiting = flightExiting || suppressReveal;
          if (face.kind === "rotated") {
            return (
              <RotatedPathAnchor
                transform={transform}
                flightStyle={flightStyle}
                suppressReveal={exiting}
                isAnimating={isAnimating}
                ariaLabel={ariaLabel}
              >
                <LanternRotated
                  haiku={haiku}
                  variant={face.variant}
                  mirrored={face.mirrored}
                  showActions={showActions}
                  onDelete={onDelete}
                  onChanged={onChanged}
                  widthRem={WIDTH_REM}
                  style={{ width: "100%", height: "100%", animation: "none" }}
                />
              </RotatedPathAnchor>
            );
          }

          return (
            <LanternFrame
              className={lanternClass}
              transform={transform}
              style={flightStyle}
              flightExiting={exiting}
              widthRem={WIDTH_REM}
              ariaLabel={ariaLabel}
              haikuLabels={haiku.labels}
              excludeLabelIds={excludeLabelIds}
            >
              <SVGPathLanternBody
                haiku={haiku}
                loading={loading}
                showActions={showActions}
                onDelete={onDelete}
                onChanged={onChanged}
              />
            </LanternFrame>
          );
        }}
      </LanternDeleteExit>
    );
  }

  if (face.kind === "rotated" && generatingDraft) {
    return (
      <RotatedPathAnchor
        transform={transform}
        suppressReveal={suppressReveal}
        isAnimating={isAnimating}
        ariaLabel={ariaLabel}
      >
        <LanternRotated
          generatingDraft={generatingDraft}
          variant={face.variant}
          mirrored={face.mirrored}
          showActions={showActions}
          widthRem={WIDTH_REM}
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
      widthRem={WIDTH_REM}
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

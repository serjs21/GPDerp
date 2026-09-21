"use client";

import { memo, type CSSProperties, type ReactNode } from "react";
import type { HaikuDto } from "@/api/haikus";
import { LabelHalo } from "@/components/LabelHalo/LabelHalo";
import { toLabelHaloItems } from "@/components/LabelHalo/utils/toLabelHaloItems";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternDeleteExit } from "@/components/Lantern/LanternDeleteExit";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import lanternStyles from "@/components/Lantern/Lantern.module.css";
import {
  lanternTransformToCssVars,
  type LanternTransform,
} from "@/components/Lantern/lanternTransform";
import { SakuraPetalLoader } from "@/components/Loaders";
import type { GeneratingDraft } from "@/hooks/useHaikuSocket";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import type { StopFace } from "./pathStopRotation";
import styles from "./SVGPath.module.css";

const WIDTH_REM = 19;

const IDENTITY_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  positionMode: "translate" as const,
};

export type SVGPathLanternProps = {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  transform: LanternTransform;
  face?: StopFace;
  isAnimating?: boolean;
  /** Suppress lanternReveal (stepped hard cuts / idle remount after stepped). */
  suppressReveal?: boolean;
  /** Pin actions visible on mobile for the focus / default-stop lantern. */
  actionsAlwaysVisible?: boolean;
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
  actionsAlwaysVisible,
  onDelete,
  onChanged,
}: {
  haiku?: HaikuDto;
  generatingDraft?: GeneratingDraft | null;
  loading?: boolean;
  showActions: boolean;
  actionsAlwaysVisible?: boolean;
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
    return (
      <Lantern
        generatingDraft={generatingDraft}
        showActions={showActions}
        actionsAlwaysVisible={actionsAlwaysVisible}
      />
    );
  }
  if (!haiku) return null;
  return (
    <Lantern
      haiku={haiku}
      showActions={showActions}
      actionsAlwaysVisible={actionsAlwaysVisible}
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

function LanternWithHalo({
  haiku,
  transform,
  flightStyle,
  lanternClass,
  exiting,
  ariaLabel,
  excludeLabelIds,
  interactive,
  onChanged,
  children,
}: {
  haiku: HaikuDto;
  transform: LanternTransform;
  flightStyle?: CSSProperties;
  lanternClass: string;
  exiting: boolean;
  ariaLabel: string;
  excludeLabelIds?: string[];
  interactive: boolean;
  onChanged?: () => void;
  children: ReactNode;
}) {
  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku.id,
    enabled: interactive,
    onChanged,
  });
  const haloLabels = toLabelHaloItems(haiku.labels, excludeLabelIds);
  const pathStyle = {
    ...lanternTransformToCssVars(transform),
    ...flightStyle,
    "--lantern-width": `${WIDTH_REM}rem`,
  } as CSSProperties;

  return (
    <div
      className={[
        lanternStyles.root,
        lanternStyles.pathPositioned,
        lanternClass,
        exiting ? lanternStyles.flightExiting : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={pathStyle}
    >
      <LabelHalo
        layout="fill"
        interactive={interactive}
        labels={haloLabels}
        onPlacementCommit={interactive ? onPlacementCommit : undefined}
        ariaLabel={`${ariaLabel} labels`}
      >
        <LanternFrame
          transform={IDENTITY_TRANSFORM}
          flightExiting={exiting}
          widthRem={WIDTH_REM}
          ariaLabel={ariaLabel}
          showLabelBelt={false}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </LanternFrame>
      </LabelHalo>
    </div>
  );
}

function RotatedLanternWithHalo({
  haiku,
  transform,
  flightStyle,
  suppressReveal,
  isAnimating,
  ariaLabel,
  face,
  excludeLabelIds,
  interactive,
  showActions,
  actionsAlwaysVisible,
  onDelete,
  onChanged,
}: {
  haiku: HaikuDto;
  transform: LanternTransform;
  flightStyle?: CSSProperties;
  suppressReveal: boolean;
  isAnimating: boolean;
  ariaLabel: string;
  face: Extract<StopFace, { kind: "rotated" }>;
  excludeLabelIds?: string[];
  interactive: boolean;
  showActions: boolean;
  actionsAlwaysVisible?: boolean;
  onDelete?: () => Promise<void>;
  onChanged?: () => void;
}) {
  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku.id,
    enabled: interactive,
    onChanged,
  });
  const haloLabels = toLabelHaloItems(haiku.labels, excludeLabelIds);

  return (
    <RotatedPathAnchor
      transform={transform}
      flightStyle={flightStyle}
      suppressReveal={suppressReveal}
      isAnimating={isAnimating}
      ariaLabel={ariaLabel}
    >
      <Lantern
        haiku={haiku}
        rotationBase={face.variant}
        mirrored={face.mirrored}
        showActions={showActions}
        actionsAlwaysVisible={actionsAlwaysVisible}
        onDelete={onDelete}
        onChanged={onChanged}
        widthRem={WIDTH_REM}
        style={{ width: "100%", height: "100%", animation: "none" }}
        faceHalo={{
          labels: haloLabels,
          interactive,
          onPlacementCommit: interactive ? onPlacementCommit : undefined,
          ariaLabel: `${ariaLabel} labels`,
        }}
      />
    </RotatedPathAnchor>
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
  actionsAlwaysVisible = false,
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
              <RotatedLanternWithHalo
                haiku={haiku}
                transform={transform}
                flightStyle={flightStyle}
                suppressReveal={exiting}
                isAnimating={isAnimating}
                ariaLabel={ariaLabel}
                face={face}
                excludeLabelIds={excludeLabelIds}
                interactive={!isAnimating}
                showActions={showActions}
                actionsAlwaysVisible={actionsAlwaysVisible}
                onDelete={onDelete}
                onChanged={onChanged}
              />
            );
          }

          return (
            <LanternWithHalo
              haiku={haiku}
              transform={transform}
              flightStyle={flightStyle}
              lanternClass={lanternClass}
              exiting={exiting}
              ariaLabel={ariaLabel}
              excludeLabelIds={excludeLabelIds}
              interactive={!isAnimating}
              onChanged={onChanged}
            >
              <SVGPathLanternBody
                haiku={haiku}
                loading={loading}
                showActions={showActions}
                actionsAlwaysVisible={actionsAlwaysVisible}
                onDelete={onDelete}
                onChanged={onChanged}
              />
            </LanternWithHalo>
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
        <Lantern
          generatingDraft={generatingDraft}
          rotationBase={face.variant}
          mirrored={face.mirrored}
          showActions={showActions}
          actionsAlwaysVisible={actionsAlwaysVisible}
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
        actionsAlwaysVisible={actionsAlwaysVisible}
      />
    </LanternFrame>
  );
}

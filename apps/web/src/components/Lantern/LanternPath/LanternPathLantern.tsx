"use client";

import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { LabelHalo } from "@/components/LabelHalo/LabelHalo";
import {
  LABEL_HALO_DROP_PAD_EXTRA_REM,
  LABEL_HALO_DROP_PAD_REM,
} from "@/components/LabelHalo/consts/labelHaloConsts";
import { toLabelHaloItems } from "@/components/LabelHalo/utils/toLabelHaloItems";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import { LANTERN_WIDTH_REM } from "../constants";
import { LanternFrame } from "../LanternFrame";
import { Lantern, type LanternProps } from "../Lantern";
import { lanternTransformToCssVars } from "../lanternTransform";
import lanternStyles from "../Lantern.module.css";
import { LANTERN_PATH_FOCUS_STOP } from "./lanternPath.config";
import { resolveLanternAtPathStop } from "./resolveLanternAtPathStop";
import styles from "./LanternPath.module.css";

export type LanternPathLanternProps = HaikuContainerProps & {
  pathStop: number;
  className?: string;
  excludeLabelIds?: string[];
  onDeleted?: () => void;
  onChanged?: () => void;
};

const IDENTITY_TRANSFORM = {
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
  positionMode: "translate" as const,
};

export function LanternPathLantern({
  pathStop,
  className,
  excludeLabelIds,
  onDeleted,
  onChanged,
  ...contentProps
}: LanternPathLanternProps) {
  const transform = resolveLanternAtPathStop(pathStop);
  const isFocused = Math.abs(pathStop - LANTERN_PATH_FOCUS_STOP) < 0.5;
  const haiku = "haiku" in contentProps ? contentProps.haiku : undefined;

  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku?.id,
    enabled: isFocused && Boolean(haiku?.id),
    onChanged,
  });

  if ((transform.opacity ?? 1) <= 0.01 || transform.scale <= 0) {
    return null;
  }

  const ariaLabel =
    "generatingDraft" in contentProps && contentProps.generatingDraft
      ? `Generating haiku: ${contentProps.generatingDraft.subject}`
      : haiku
        ? `Haiku lantern: ${haiku.title}`
        : "Haiku lantern";

  const lanternClassName = [
    styles.flightPathLantern,
    isFocused ? styles.flightPathLanternFocused : "",
    styles.flightPathStopLantern,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const haloLabels = haiku?.labels
    ? toLabelHaloItems(haiku.labels, excludeLabelIds)
    : [];

  const haloPadTopRem = LABEL_HALO_DROP_PAD_REM + LABEL_HALO_DROP_PAD_EXTRA_REM;

  const pathStyle = {
    ...lanternTransformToCssVars(transform),
    "--lantern-width": `${LANTERN_WIDTH_REM}rem`,
    // Focus stop was authored for the lantern box only; shift down so the
    // LabelHalo fill pad (top) stays inside the viewport.
    ...(isFocused ? { "--lantern-flight-y": `${haloPadTopRem}rem` } : null),
  };

  return (
    <div
      className={[
        lanternStyles.root,
        lanternStyles.pathPositioned,
        lanternClassName,
      ]
        .filter(Boolean)
        .join(" ")}
      style={pathStyle}
    >
      <LabelHalo
        layout="fill"
        interactive={isFocused}
        labels={haloLabels}
        onPlacementCommit={isFocused ? onPlacementCommit : undefined}
        ariaLabel={`${ariaLabel} labels`}
      >
        <LanternFrame
          transform={IDENTITY_TRANSFORM}
          ariaLabel={ariaLabel}
          generating={
            "generatingDraft" in contentProps && Boolean(contentProps.generatingDraft)
          }
          showLabelBelt={false}
          style={{ width: "100%", height: "100%" }}
        >
          <Lantern
            {...({
              ...contentProps,
              bodyOnly: !isFocused,
              onDeleted,
              onChanged,
            } as LanternProps)}
          />
        </LanternFrame>
      </LabelHalo>
    </div>
  );
}

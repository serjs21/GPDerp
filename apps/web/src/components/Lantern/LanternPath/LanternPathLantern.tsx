"use client";

import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { LanternFrame } from "../LanternFrame";
import { Lantern, type LanternProps } from "../Lantern";
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

export function LanternPathLantern({
  pathStop,
  className,
  excludeLabelIds,
  onDeleted,
  onChanged,
  ...contentProps
}: LanternPathLanternProps) {
  const transform = resolveLanternAtPathStop(pathStop);
  if ((transform.opacity ?? 1) <= 0.01 || transform.scale <= 0) {
    return null;
  }

  const isFocused = Math.abs(pathStop - LANTERN_PATH_FOCUS_STOP) < 0.5;
  const ariaLabel =
    "generatingDraft" in contentProps && contentProps.generatingDraft
      ? `Generating haiku: ${contentProps.generatingDraft.subject}`
      : "haiku" in contentProps && contentProps.haiku
        ? `Haiku lantern: ${contentProps.haiku.title}`
        : "Haiku lantern";

  const lanternClassName = [
    styles.flightPathLantern,
    isFocused ? styles.flightPathLanternFocused : "",
    styles.flightPathStopLantern,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const haikuLabels =
    "haiku" in contentProps && contentProps.haiku ? contentProps.haiku.labels : undefined;

  return (
    <LanternFrame
      className={lanternClassName}
      transform={transform}
      ariaLabel={ariaLabel}
      generating={"generatingDraft" in contentProps && Boolean(contentProps.generatingDraft)}
      haikuLabels={haikuLabels}
      excludeLabelIds={excludeLabelIds}
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
  );
}

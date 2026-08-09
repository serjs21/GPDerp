"use client";

import type { HaikuContainerProps } from "@/components/HaikuContainer/HaikuContainer";
import { LanternFrame } from "../LanternFrame";
import { Lantern } from "../Lantern";
import { resolveLanternAtPathStop } from "./resolveLanternAtPathStop";
import styles from "../Lantern.stories.module.css";

export type LanternPathLanternProps = HaikuContainerProps & {
  pathStop: number;
  className?: string;
};

export function LanternPathLantern({ pathStop, className, ...contentProps }: LanternPathLanternProps) {
  const transform = resolveLanternAtPathStop(pathStop);
  if ((transform.opacity ?? 1) <= 0.01 || transform.scale <= 0) {
    return null;
  }

  const ariaLabel =
    "generatingDraft" in contentProps && contentProps.generatingDraft
      ? `Generating haiku: ${contentProps.generatingDraft.subject}`
      : "haiku" in contentProps && contentProps.haiku
        ? `Haiku lantern: ${contentProps.haiku.title}`
        : "Haiku lantern";

  const lanternClassName = `${styles.flightPathLantern} ${styles.flightPathStopLantern}${
    className ? ` ${className}` : ""
  }`;

  return (
    <LanternFrame
      className={lanternClassName}
      transform={transform}
      ariaLabel={ariaLabel}
      generating={"generatingDraft" in contentProps && Boolean(contentProps.generatingDraft)}
    >
      <Lantern {...contentProps} bodyOnly />
    </LanternFrame>
  );
}

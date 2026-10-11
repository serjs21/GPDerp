import type { ReactNode } from "react";
import stageStyles from "../../ComicConfirmModal/comicBubbleStage.module.css";
import {
  stagePaddingClassForDirection,
  type ComicSourceDirection,
} from "../../ComicConfirmModal/comicSourceDirection";
import styles from "../ComicDialogContent.module.css";

/** Comical recalculates when the bubble shape, tail, or (string) copy changes. */
export function comicDialogTargetsKey(
  bubbleStyle: string,
  sourceDirection: ComicSourceDirection,
  children: ReactNode,
): string {
  const labelKey = typeof children === "string" ? children : "node";
  return `dialog:${bubbleStyle}:${sourceDirection}:${labelKey}`;
}

export function comicDialogStageClassName(
  sourceDirection: ComicSourceDirection,
  className?: string,
): string {
  const stagePaddingClass = stagePaddingClassForDirection(sourceDirection, {
    stageTailBottom: styles.stageTailBottom,
    stageTailTop: styles.stageTailTop,
    stageTailLeft: styles.stageTailLeft,
    stageTailRight: styles.stageTailRight,
    stageCompact: styles.stageCompact,
  });
  return [stageStyles.stage, styles.stageStandalone, stagePaddingClass, className]
    .filter(Boolean)
    .join(" ");
}

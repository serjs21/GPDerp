"use client";

import { useCallback, useRef } from "react";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import stageStyles from "@/components/ComicConfirmModal/comicBubbleStage.module.css";
import type { ComicBubbleStyle } from "@/components/ComicConfirmModal/comicBubblePresets";
import {
  stagePaddingClassForDirection,
  type ComicSourceDirection,
} from "@/components/ComicConfirmModal/comicSourceDirection";
import styles from "./ShareMethodIcon.module.css";

export type ShareMethodIconProps = {
  src: string;
  bubbleStyle: ComicBubbleStyle;
  sourceDirection?: ComicSourceDirection;
  /** When false, Comical editing is stopped (avoids multi-stage races). */
  active?: boolean;
};

export function ShareMethodIcon({
  src,
  bubbleStyle,
  sourceDirection = "bottom",
  active = true,
}: ShareMethodIconProps) {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const getTargets = useCallback(
    () => [
      {
        element: targetRef.current,
        style: bubbleStyle,
        sourceDirection,
      },
    ],
    [bubbleStyle, sourceDirection],
  );

  const stagePaddingClass = stagePaddingClassForDirection(sourceDirection, {
    stageTailBottom: styles.stageTailBottom,
    stageTailTop: styles.stageTailTop,
    stageTailLeft: styles.stageTailLeft,
    stageTailRight: styles.stageTailRight,
    stageCompact: styles.stageCompact,
  });

  return (
    <ComicBubbleStage
      ref={stageRef}
      active={active}
      targetsKey={`share-icon:${bubbleStyle}:${sourceDirection}:${src}:${active ? 1 : 0}`}
      getTargets={getTargets}
      className={[stageStyles.stage, styles.stage, stagePaddingClass].filter(Boolean).join(" ")}
    >
      <div ref={targetRef} className={styles.iconTarget}>
        <img src={src} alt="" className={styles.icon} />
      </div>
    </ComicBubbleStage>
  );
}

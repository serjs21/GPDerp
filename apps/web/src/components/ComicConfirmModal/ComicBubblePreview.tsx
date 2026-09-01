"use client";

import { useCallback, useRef } from "react";
import { ComicQuestionBubble } from "./ComicQuestionBubble";
import type { ComicBubbleStyle } from "./comicBubblePresets";
import styles from "./ComicConfirmModal.module.css";
import { useComicalBubbles } from "./useComicalBubbles";

export type ComicBubblePreviewProps = {
  label: string;
  bubbleStyle: ComicBubbleStyle;
  className?: string;
};

/** Isolated bubble for Storybook style gallery (no modal shell). */
export function ComicBubblePreview({ label, bubbleStyle, className }: ComicBubblePreviewProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const getTargets = useCallback(
    () => [{ element: contentRef.current, style: bubbleStyle, isQuestion: true }],
    [bubbleStyle],
  );

  const { refreshBubbles } = useComicalBubbles({
    active: true,
    stageRef,
    targetsKey: `${bubbleStyle}:${label}`,
    getTargets,
  });

  const handlePointer = useCallback(() => {
    requestAnimationFrame(() => refreshBubbles());
  }, [refreshBubbles]);

  return (
    <div
      ref={stageRef}
      className={[styles.stage, styles.previewStage, className].filter(Boolean).join(" ")}
      onMouseEnter={handlePointer}
      onMouseLeave={handlePointer}
    >
      <ComicQuestionBubble ref={contentRef} bubbleStyle={bubbleStyle}>
        {label}
      </ComicQuestionBubble>
    </div>
  );
}

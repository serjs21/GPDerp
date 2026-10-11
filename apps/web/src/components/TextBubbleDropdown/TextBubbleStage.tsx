"use client";

import { memo, useCallback, useMemo } from "react";
import { ComicBubbleStage } from "@/components/ComicConfirmModal/ComicBubbleStage";
import { BUBBLE_FILL } from "./consts/textBubbleConsts";
import type { TextBubbleTarget } from "./TextBubbleDropdown.types";
import type { TextBubbleStageProps } from "./TextBubbleStage.types";
import { textBubblePanelClassName, textBubbleStageClassName } from "./utils/textBubbleUtils";
import styles from "./TextBubbleDropdown.module.css";

/**
 * Bubble stage stays mounted with a stable targetsKey so comical only
 * (re)calculates when direction config changes — not on search/value churn.
 * Owns the comical target spec for the panel shell.
 */
export const TextBubbleStage = memo(function TextBubbleStage({
  dropDirection,
  tailDirection,
  shellRef,
  open,
  bubbleReady,
  onBubblesReady,
  children,
}: TextBubbleStageProps) {
  const stageClassName = useMemo(() => textBubbleStageClassName(tailDirection), [tailDirection]);
  const getTargets = useCallback(
    (): TextBubbleTarget[] => [
      {
        element: shellRef.current,
        style: "speech",
        sourceDirection: tailDirection,
        // Must stay false: isQuestion strips tails in applySourceDirectionToSpec.
        isQuestion: false,
        backgroundColors: [...BUBBLE_FILL],
      },
    ],
    [shellRef, tailDirection],
  );
  const revealOpen = open && bubbleReady;

  return (
    <div
      className={textBubblePanelClassName(dropDirection, open, bubbleReady)}
      data-state={revealOpen ? "open" : "closed"}
      data-drop={dropDirection}
      data-bubble-ready={String(bubbleReady)}
      aria-hidden={!open}
    >
      <ComicBubbleStage
        active={true}
        targetsKey={`text-bubble-dropdown:${tailDirection}:${dropDirection}`}
        getTargets={getTargets}
        className={stageClassName}
        onBubblesReady={onBubblesReady}
      >
        <div ref={shellRef} className={styles.shell} data-comic-role="dialog-content">
          {children}
        </div>
      </ComicBubbleStage>
    </div>
  );
});

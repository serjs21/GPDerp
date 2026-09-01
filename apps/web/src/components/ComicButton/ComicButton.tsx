"use client";

import { useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import type { ComicBubbleStyle } from "../ComicConfirmModal/comicBubblePresets";
import {
  stagePaddingClassForDirection,
  type ComicSourceDirection,
} from "../ComicConfirmModal/comicSourceDirection";
import { useComicalBubbles } from "../ComicConfirmModal/useComicalBubbles";
import styles from "./ComicButton.module.css";

export type ComicButtonProps = {
  children: ReactNode;
  bubbleStyle?: ComicBubbleStyle;
  /** Where the speech originates; `none` renders a tail-less bubble. */
  sourceDirection?: ComicSourceDirection;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

/**
 * Standalone comic speech-bubble button. Content is a direct child of the
 * comical stage so bubble art aligns with the label (same rule as ComicCtaBubble).
 */
export function ComicButton({
  children,
  bubbleStyle = "speech",
  sourceDirection = "none",
  disabled = false,
  className,
  style,
  type = "button",
  onClick,
}: ComicButtonProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const getTargets = useCallback(
    () => [
      {
        element: buttonRef.current,
        style: bubbleStyle,
        sourceDirection,
      },
    ],
    [bubbleStyle, sourceDirection],
  );

  const labelKey = typeof children === "string" ? children : "node";

  const { refreshBubbles } = useComicalBubbles({
    active: true,
    stageRef,
    targetsKey: `${bubbleStyle}:${sourceDirection}:${labelKey}`,
    getTargets,
  });

  const handlePointer = useCallback(() => {
    requestAnimationFrame(() => refreshBubbles());
  }, [refreshBubbles]);

  const stagePaddingClass = stagePaddingClassForDirection(sourceDirection, {
    stageTailBottom: styles.stageTailBottom,
    stageTailTop: styles.stageTailTop,
    stageTailLeft: styles.stageTailLeft,
    stageTailRight: styles.stageTailRight,
    stageCompact: styles.stageCompact,
  });

  return (
    <div
      ref={stageRef}
      className={[styles.stage, stagePaddingClass, className].filter(Boolean).join(" ")}
      style={style}
    >
      <button
        ref={buttonRef}
        type={type}
        className={[styles.bubble, bubbleStyle === "shout" ? styles.bubbleShout : ""]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled}
        data-bubble-style={bubbleStyle}
        data-source-direction={sourceDirection}
        onClick={onClick}
        onMouseEnter={handlePointer}
        onMouseLeave={handlePointer}
        onFocus={handlePointer}
        onBlur={handlePointer}
      >
        {children}
      </button>
    </div>
  );
}

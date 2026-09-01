"use client";

import { forwardRef, useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { ComicBubbleStage } from "../ComicConfirmModal/ComicBubbleStage";
import stageStyles from "../ComicConfirmModal/comicBubbleStage.module.css";
import type { ComicBubbleStyle } from "../ComicConfirmModal/comicBubblePresets";
import {
  stagePaddingClassForDirection,
  type ComicSourceDirection,
} from "../ComicConfirmModal/comicSourceDirection";
import styles from "./ComicButton.module.css";

export type ComicButtonMode = "standalone" | "embedded";

export type ComicButtonProps = {
  children: ReactNode;
  bubbleStyle?: ComicBubbleStyle;
  /** Where the speech originates; `none` renders a tail-less bubble. */
  sourceDirection?: ComicSourceDirection;
  mode?: ComicButtonMode;
  /** Embedded modal CTA placement. */
  slot?: "start" | "end" | "center";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export const ComicButton = forwardRef<HTMLButtonElement, ComicButtonProps>(function ComicButton(
  {
    children,
    bubbleStyle = "speech",
    sourceDirection = "none",
    mode = "standalone",
    slot = "center",
    disabled = false,
    className,
    style,
    type = "button",
    onClick,
  },
  ref,
) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const setButtonRef = (node: HTMLButtonElement | null) => {
    buttonRef.current = node;
    if (typeof ref === "function") {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

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

  if (mode === "embedded") {
    return (
      <button
        ref={setButtonRef}
        type={type}
        className={[styles.bubbleEmbedded, className].filter(Boolean).join(" ")}
        style={style}
        disabled={disabled}
        data-comic-role="cta"
        data-bubble-style={bubbleStyle}
        data-source-direction={sourceDirection}
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

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
      active
      targetsKey={`btn:${bubbleStyle}:${sourceDirection}:${labelKey}`}
      getTargets={getTargets}
      className={[stageStyles.stage, styles.stageStandalone, stagePaddingClass, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      <button
        ref={setButtonRef}
        type={type}
        className={styles.bubble}
        disabled={disabled}
        data-bubble-style={bubbleStyle}
        data-source-direction={sourceDirection}
        onClick={onClick}
      >
        {children}
      </button>
    </ComicBubbleStage>
  );
});

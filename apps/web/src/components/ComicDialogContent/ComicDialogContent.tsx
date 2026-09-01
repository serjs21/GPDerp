"use client";

import { forwardRef, useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { ComicBubbleStage } from "../ComicConfirmModal/ComicBubbleStage";
import stageStyles from "../ComicConfirmModal/comicBubbleStage.module.css";
import type { ComicBubbleStyle } from "../ComicConfirmModal/comicBubblePresets";
import {
  stagePaddingClassForDirection,
  type ComicSourceDirection,
} from "../ComicConfirmModal/comicSourceDirection";
import styles from "./ComicDialogContent.module.css";

export type ComicDialogContentMode = "standalone" | "embedded";

export type ComicDialogContentProps = {
  children: ReactNode;
  bubbleStyle?: ComicBubbleStyle;
  sourceDirection?: ComicSourceDirection;
  mode?: ComicDialogContentMode;
  className?: string;
  contentClassName?: string;
  style?: CSSProperties;
  backgroundColors?: string[];
};

const ComicDialogContentInner = forwardRef<HTMLDivElement, ComicDialogContentProps>(
  function ComicDialogContentInner(
    { children, className, contentClassName, style },
    ref,
  ) {
    return (
      <div
        ref={ref}
        className={[styles.content, contentClassName, className].filter(Boolean).join(" ")}
        style={style}
        data-comic-role="dialog-content"
      >
        {children}
      </div>
    );
  },
);

/**
 * Non-interactive comic bubble for dialog questions / body copy.
 * Embedded mode renders only the inner div (direct child of ComicBubbleStage).
 */
export const ComicDialogContent = forwardRef<HTMLDivElement, ComicDialogContentProps>(
  function ComicDialogContent(
    {
      children,
      bubbleStyle = "pointedArcs",
      sourceDirection = "none",
      mode = "standalone",
      className,
      contentClassName,
      style,
      backgroundColors,
    },
    ref,
  ) {
    const innerRef = useRef<HTMLDivElement | null>(null);
    const stageRef = useRef<HTMLDivElement | null>(null);

    const setRef = (node: HTMLDivElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const getTargets = useCallback(
      () => [
        {
          element: innerRef.current,
          style: bubbleStyle,
          sourceDirection,
          isQuestion: true,
          backgroundColors,
        },
      ],
      [backgroundColors, bubbleStyle, sourceDirection],
    );

    const labelKey = typeof children === "string" ? children : "node";

    if (mode === "embedded") {
      return (
        <ComicDialogContentInner ref={setRef} contentClassName={contentClassName} className={className} style={style}>
          {children}
        </ComicDialogContentInner>
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
        targetsKey={`dialog:${bubbleStyle}:${sourceDirection}:${labelKey}`}
        getTargets={getTargets}
        className={[stageStyles.stage, styles.stageStandalone, stagePaddingClass, className]
          .filter(Boolean)
          .join(" ")}
        style={style}
      >
        <ComicDialogContentInner ref={setRef} contentClassName={contentClassName}>
          {children}
        </ComicDialogContentInner>
      </ComicBubbleStage>
    );
  },
);

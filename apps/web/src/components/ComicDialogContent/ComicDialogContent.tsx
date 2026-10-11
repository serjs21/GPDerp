"use client";

import { forwardRef, useCallback, useRef, type CSSProperties, type ReactNode } from "react";
import { withDefaults } from "@/utils/props/withDefaults";
import { ComicBubbleStage } from "../ComicConfirmModal/ComicBubbleStage";
import type { ComicBubbleStyle } from "../ComicConfirmModal/comicBubblePresets";
import type { ComicSourceDirection } from "../ComicConfirmModal/comicSourceDirection";
import { comicDialogStageClassName, comicDialogTargetsKey } from "./utils/comicDialogContentUtils";
import styles from "./ComicDialogContent.module.css";

const COMIC_DIALOG_CONTENT_DEFAULTS = {
  bubbleStyle: "pointedArcs",
  sourceDirection: "none",
  mode: "standalone",
} as const;

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
    props,
    ref,
  ) {
    const { bubbleStyle, sourceDirection, mode } = withDefaults(props, COMIC_DIALOG_CONTENT_DEFAULTS);
    const { children, className, contentClassName, style, backgroundColors } = props;
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

    if (mode === "embedded") {
      return (
        <ComicDialogContentInner ref={setRef} contentClassName={contentClassName} className={className} style={style}>
          {children}
        </ComicDialogContentInner>
      );
    }

    return (
      <ComicBubbleStage
        ref={stageRef}
        active
        targetsKey={comicDialogTargetsKey(bubbleStyle, sourceDirection, children)}
        getTargets={getTargets}
        className={comicDialogStageClassName(sourceDirection, className)}
        style={style}
      >
        <ComicDialogContentInner ref={setRef} contentClassName={contentClassName}>
          {children}
        </ComicDialogContentInner>
      </ComicBubbleStage>
    );
  },
);

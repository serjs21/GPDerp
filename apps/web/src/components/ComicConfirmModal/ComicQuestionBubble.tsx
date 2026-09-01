"use client";

import { forwardRef, type ReactNode } from "react";
import type { ComicBubbleStyle } from "./comicBubblePresets";
import styles from "./ComicConfirmModal.module.css";

export type ComicQuestionBubbleProps = {
  bubbleStyle?: ComicBubbleStyle;
  children: ReactNode;
  className?: string;
};

/**
 * Question bubble content — direct child of the comical stage so offsetParent
 * matches the canvas coordinate system.
 */
export const ComicQuestionBubble = forwardRef<HTMLDivElement, ComicQuestionBubbleProps>(
  function ComicQuestionBubble({ bubbleStyle = "shout", children, className }, ref) {
    return (
      <div
        ref={ref}
        className={[
          styles.questionBubble,
          bubbleStyle === "shout" ? styles.questionShout : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        data-comic-role="question"
      >
        {children}
      </div>
    );
  },
);

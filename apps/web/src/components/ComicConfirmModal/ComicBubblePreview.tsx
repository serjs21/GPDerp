"use client";

import type { ComicBubbleStyle } from "./comicBubblePresets";
import { ComicDialogContent } from "../ComicDialogContent/ComicDialogContent";
import styles from "../ComicDialogContent/ComicDialogContent.module.css";

export type ComicBubblePreviewProps = {
  label: string;
  bubbleStyle: ComicBubbleStyle;
  className?: string;
};

/** Isolated bubble for Storybook style gallery (no modal shell). */
export function ComicBubblePreview({ label, bubbleStyle, className }: ComicBubblePreviewProps) {
  return (
    <ComicDialogContent
      bubbleStyle={bubbleStyle}
      className={[styles.previewStage, className].filter(Boolean).join(" ")}
    >
      {label}
    </ComicDialogContent>
  );
}

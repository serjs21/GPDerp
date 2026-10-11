"use client";

import { useEffect, useState } from "react";
import { COMIC_ANIM_MS } from "@/components/ComicConfirmModal/comicBubblePresets";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import dialogStyles from "@/components/ComicDialogContent/ComicDialogContent.module.css";
import { getComicToastPreset } from "./comicToastPresets";
import type { ComicToastRecord } from "./comicToastState";
import { toastContentClassName, toastItemClassName } from "./utils/comicToastItemUtils";
import styles from "./ComicToast.module.css";

export type ComicToastItemProps = {
  toast: ComicToastRecord;
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ComicToastItem({ toast, onDismiss, onRemove }: ComicToastItemProps) {
  const [entered, setEntered] = useState(false);
  const preset = getComicToastPreset(toast.tone);

  useEffect(() => {
    const enterId = requestAnimationFrame(() => {
      setEntered(true);
    });
    return () => cancelAnimationFrame(enterId);
  }, []);

  useEffect(() => {
    if (toast.exiting) return;
    const timeoutId = window.setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration);
    return () => window.clearTimeout(timeoutId);
  }, [onDismiss, toast.duration, toast.exiting, toast.id]);

  useEffect(() => {
    if (!toast.exiting) return;
    const timeoutId = window.setTimeout(() => {
      onRemove(toast.id);
    }, COMIC_ANIM_MS);
    return () => window.clearTimeout(timeoutId);
  }, [onRemove, toast.exiting, toast.id]);

  return (
    <div
      className={toastItemClassName(toast.exiting, entered)}
      role="status"
      aria-live="polite"
    >
      <ComicDialogContent
        bubbleStyle={preset.bubbleStyle}
        backgroundColors={preset.backgroundColors}
        className={[dialogStyles.previewStage, styles.stage].join(" ")}
        contentClassName={toastContentClassName(toast.content)}
      >
        {toast.content}
        {toast.description ? <div className={styles.description}>{toast.description}</div> : null}
      </ComicDialogContent>
    </div>
  );
}

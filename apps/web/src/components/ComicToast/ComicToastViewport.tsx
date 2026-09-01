"use client";

import { createPortal } from "react-dom";
import { COMIC_TOAST_MAX_VISIBLE } from "./comicToastPresets";
import { ComicToastItem } from "./ComicToastItem";
import type { ComicToastRecord } from "./comicToastState";
import styles from "./ComicToast.module.css";

export type ComicToastViewportProps = {
  toasts: ComicToastRecord[];
  onDismiss: (id: string) => void;
  onRemove: (id: string) => void;
};

export function ComicToastViewport({ toasts, onDismiss, onRemove }: ComicToastViewportProps) {
  if (typeof document === "undefined") return null;

  const visible = toasts.slice(-COMIC_TOAST_MAX_VISIBLE);

  return createPortal(
    <div className={styles.viewport} aria-label="Notifications">
      {visible.map((toast) => (
        <ComicToastItem key={toast.id} toast={toast} onDismiss={onDismiss} onRemove={onRemove} />
      ))}
    </div>,
    document.body,
  );
}

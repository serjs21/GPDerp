"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
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
  const t = useTranslations("ComicToast");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const visible = toasts.slice(-COMIC_TOAST_MAX_VISIBLE);

  return createPortal(
    <div className={styles.viewport} role="region" aria-label={t("notifications")}>
      {visible.map((toast) => (
        <ComicToastItem key={toast.id} toast={toast} onDismiss={onDismiss} onRemove={onRemove} />
      ))}
    </div>,
    document.body,
  );
}

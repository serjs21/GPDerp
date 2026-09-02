"use client";

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
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isServer = typeof document === "undefined";
  // #region agent log
  fetch("http://127.0.0.1:7498/ingest/732c0002-567b-4a51-a696-ac38fea9237b", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "baf7a7" },
    body: JSON.stringify({
      sessionId: "baf7a7",
      runId: "post-fix",
      hypothesisId: "A",
      location: "ComicToastViewport.tsx:render",
      message: "toast viewport server/client branch",
      data: {
        isServer,
        mounted,
        toastCount: toasts.length,
        willReturnNull: !mounted,
        willPortal: mounted,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion
  if (!mounted) return null;

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

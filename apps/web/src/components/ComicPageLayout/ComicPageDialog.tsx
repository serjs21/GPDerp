"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { ReactNode } from "react";
import { ComicPageLayout } from "./ComicPageLayout";
import styles from "./ComicPageLayout.module.css";

export type ComicPageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
  /** Close when clicking outside the page content. Default true. */
  closeOnOverlayClick?: boolean;
  /** Close when pressing Escape. Default true. */
  closeOnEscape?: boolean;
  showClose?: boolean;
  className?: string;
  /** Applied to the dialog content shell (width / max-height). */
  contentClassName?: string;
};

export function ComicPageDialog({
  open,
  onOpenChange,
  title,
  children,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showClose = false,
  className,
  contentClassName,
}: ComicPageDialogProps) {
  return (
    <Dialog.Root
      open={open}
      disablePointerDismissal={!closeOnOverlayClick}
      onOpenChange={(nextOpen, details) => {
        if (!nextOpen && !closeOnEscape && details.reason === "escape-key") {
          details.cancel();
          return;
        }
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.dialogBackdrop} />
        <Dialog.Viewport className={styles.dialogViewport}>
          <Dialog.Popup
            className={[styles.dialogPopup, contentClassName].filter(Boolean).join(" ")}
          >
            <div className={styles.comicPageShell}>
              {title ? (
                <Dialog.Title className={styles.srOnly}>{title}</Dialog.Title>
              ) : (
                <Dialog.Title className={styles.srOnly}>Dialog</Dialog.Title>
              )}
              <ComicPageLayout title={title} showClose={showClose} className={className}>
                {children}
              </ComicPageLayout>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

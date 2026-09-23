"use client";

import { Dialog } from "@base-ui/react/dialog";
import type { KeyboardEvent, ReactNode } from "react";
import { ComicPageLayout } from "./ComicPageLayout";
import styles from "./ComicPageLayout.module.css";

export type ComicPageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
  /** Sticky bottom-center action row (prefer `ComicPageCtaAction` children). */
  ctaFooter?: ReactNode;
  /** Close when clicking outside the page content. Default true. */
  closeOnOverlayClick?: boolean;
  /** Close when pressing Escape. Default true. */
  closeOnEscape?: boolean;
  showClose?: boolean;
  className?: string;
  /** Applied to the dialog content shell (width / max-height). */
  contentClassName?: string;
};

function submitOnEnter(event: KeyboardEvent<HTMLElement>) {
  if (event.key !== "Enter" || event.defaultPrevented || event.nativeEvent.isComposing) {
    return;
  }
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (target.closest("textarea, select, [contenteditable='true']")) return;
  if (target.closest("button, a, [role='button']")) return;

  const submit = event.currentTarget.querySelector<HTMLButtonElement>(
    'button[type="submit"]:not(:disabled)',
  );
  if (!submit) return;
  event.preventDefault();
  submit.click();
}

export function ComicPageDialog({
  open,
  onOpenChange,
  title,
  children,
  ctaFooter,
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
            <div className={styles.comicPageShell} onKeyDown={submitOnEnter}>
              {title ? (
                <Dialog.Title className={styles.srOnly}>{title}</Dialog.Title>
              ) : (
                <Dialog.Title className={styles.srOnly}>Dialog</Dialog.Title>
              )}
              <ComicPageLayout title={title} showClose={showClose} className={className}>
                {children}
                {ctaFooter ? (
                  <div className={styles.ctaFooter}>
                    <div className={styles.ctaFooterInner}>{ctaFooter}</div>
                  </div>
                ) : null}
              </ComicPageLayout>
            </div>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

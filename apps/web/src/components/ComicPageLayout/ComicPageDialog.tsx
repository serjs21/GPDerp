"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState, type ReactNode } from "react";
import { ComicPageLayout } from "./ComicPageLayout";
import styles from "./ComicPageLayout.module.css";

export type ComicPageDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  children: ReactNode;
  closeOnOverlayClick?: boolean;
  className?: string;
};

export function ComicPageDialog({
  open,
  onOpenChange,
  title,
  children,
  closeOnOverlayClick = false,
  className,
}: ComicPageDialogProps) {
  const [present, setPresent] = useState(open);

  useEffect(() => {
    setPresent(open);
  }, [open]);

  if (!present && !open) {
    return (
      <Dialog.Root open={false} onOpenChange={onOpenChange}>
        {null}
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setPresent(false);
      }}
    >
      <Dialog.Portal forceMount>
        <Dialog.Overlay asChild forceMount>
          <div className={styles.dialogOverlay} />
        </Dialog.Overlay>

        <div className={styles.dialogRoot}>
          <Dialog.Content
            asChild
            forceMount
            onPointerDownOutside={(event) => {
              if (!closeOnOverlayClick) event.preventDefault();
            }}
            onInteractOutside={(event) => {
              if (!closeOnOverlayClick) event.preventDefault();
            }}
            onEscapeKeyDown={(event) => {
              event.preventDefault();
            }}
          >
            <div className={styles.dialogContent}>
              {title ? (
                <Dialog.Title className={styles.srOnly}>{title}</Dialog.Title>
              ) : null}
              <ComicPageLayout title={title} className={className}>
                {children}
              </ComicPageLayout>
            </div>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

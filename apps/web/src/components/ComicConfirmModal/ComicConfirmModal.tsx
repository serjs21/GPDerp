"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useCallback } from "react";
import { ComicButton } from "@/components/ComicButton/ComicButton";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import { COMIC_PANEL_COLORS } from "@/components/ComicPageLayout/comicPagePresets";
import type { ComicBubbleStyle } from "./comicBubblePresets";
import styles from "./ComicConfirmModal.module.css";

const DEFAULT_QUESTION_FILL = COMIC_PANEL_COLORS.cream.base;
const DEFAULT_CONFIRM_FILL = COMIC_PANEL_COLORS.red.base;
const DEFAULT_CANCEL_FILL = "#ffffff";
const DEFAULT_CANCEL_LABEL = "Cancel";
const DEFAULT_CONFIRM_LABEL = "Confirm";
const DEFAULT_QUESTION_STYLE: ComicBubbleStyle = "thought";
const DEFAULT_CANCEL_STYLE: ComicBubbleStyle = "speech";
const DEFAULT_CONFIRM_STYLE: ComicBubbleStyle = "pointedArcs";

export type ComicConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Comical bubble fill for the question. Default warning amber. */
  questionFill?: string;
  /** Comical bubble fill for confirm. Default critical red. */
  confirmFill?: string;
  /** Comical bubble fill for cancel. Default white. */
  cancelFill?: string;
  questionBubbleStyle?: ComicBubbleStyle;
  cancelBubbleStyle?: ComicBubbleStyle;
  confirmBubbleStyle?: ComicBubbleStyle;
  /** Click outside the content panel dismisses. Default true. */
  closeOnOverlayClick?: boolean;
  /** Close after confirm select. Default true. */
  closeOnSelect?: boolean;
  /** Disables CTAs and blocks overlay/escape dismiss while true. */
  confirming?: boolean;
  className?: string;
};

export function ComicConfirmModal({
  open,
  onOpenChange,
  question,
  onConfirm,
  onCancel,
  confirmLabel = DEFAULT_CONFIRM_LABEL,
  cancelLabel = DEFAULT_CANCEL_LABEL,
  questionFill = DEFAULT_QUESTION_FILL,
  confirmFill = DEFAULT_CONFIRM_FILL,
  cancelFill = DEFAULT_CANCEL_FILL,
  questionBubbleStyle = DEFAULT_QUESTION_STYLE,
  cancelBubbleStyle = DEFAULT_CANCEL_STYLE,
  confirmBubbleStyle = DEFAULT_CONFIRM_STYLE,
  closeOnOverlayClick = true,
  closeOnSelect = true,
  confirming = false,
  className,
}: ComicConfirmModalProps) {
  const allowOutsideDismiss = closeOnOverlayClick && !confirming;

  const handleCancel = useCallback(() => {
    if (confirming) return;
    onCancel?.();
    onOpenChange(false);
  }, [confirming, onCancel, onOpenChange]);

  const handleConfirm = useCallback(() => {
    if (confirming) return;
    onConfirm();
    if (closeOnSelect) onOpenChange(false);
  }, [closeOnSelect, confirming, onConfirm, onOpenChange]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && confirming) return;
        onOpenChange(nextOpen);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className={styles.overlay} />
        <Dialog.Content
          className={styles.contentRoot}
          onPointerDownOutside={(event) => {
            if (!allowOutsideDismiss) event.preventDefault();
          }}
          onInteractOutside={(event) => {
            if (!allowOutsideDismiss) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (confirming) event.preventDefault();
          }}
        >
          <div className={[styles.panel, className].filter(Boolean).join(" ")}>
            <Dialog.Title className={styles.visuallyHidden}>{question}</Dialog.Title>
            <Dialog.Description className={styles.visuallyHidden}>
              Choose confirm or cancel.
            </Dialog.Description>

            <div className={styles.dialogLayout}>
              <div className={styles.question}>
                <ComicDialogContent
                  bubbleStyle={questionBubbleStyle}
                  sourceDirection="none"
                  backgroundColors={[questionFill]}
                >
                  {question}
                </ComicDialogContent>
              </div>

              <div className={styles.ctaRow}>
                <ComicButton
                  bubbleStyle={cancelBubbleStyle}
                  sourceDirection="none"
                  backgroundColors={[cancelFill]}
                  disabled={confirming}
                  onClick={handleCancel}
                >
                  {cancelLabel}
                </ComicButton>
                <ComicButton
                  fontColor="darkGreen"
                  bubbleStyle={confirmBubbleStyle}
                  sourceDirection="none"
                  backgroundColors={[confirmFill]}
                  disabled={confirming}
                  onClick={handleConfirm}
                >
                  {confirmLabel}
                </ComicButton>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { ComicBubbleStyle } from "./comicBubblePresets";

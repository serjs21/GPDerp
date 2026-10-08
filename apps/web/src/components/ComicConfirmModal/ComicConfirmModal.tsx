"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ComicButton } from "@/components/ComicButton/ComicButton";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import { COMIC_PANEL_COLORS } from "@/components/ComicPageLayout/comicPagePresets";
import {
  ACTIVATING_DOT_CYCLE,
  ACTIVATING_DOT_MS,
} from "@/components/ShareLink/useShareLinkControls";
import { ComicBubbleStage } from "./ComicBubbleStage";
import type { ComicBubbleStyle } from "./comicBubblePresets";
import stageStyles from "./comicBubbleStage.module.css";
import { useComicConfirmStage } from "./useComicConfirmStage";
import styles from "./ComicConfirmModal.module.css";

const DEFAULT_QUESTION_FILL = COMIC_PANEL_COLORS.cream.base;
const DEFAULT_CONFIRM_FILL = COMIC_PANEL_COLORS.red.base;
const DEFAULT_CANCEL_FILL = "#ffffff";
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
  confirmLabel: confirmLabelProp,
  cancelLabel: cancelLabelProp,
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
  const t = useTranslations("ComicConfirmModal");
  const confirmLabel = confirmLabelProp ?? t("confirm");
  const cancelLabel = cancelLabelProp ?? t("cancel");
  const allowOutsideDismiss = closeOnOverlayClick && !confirming;
  const [busyDots, setBusyDots] = useState<(typeof ACTIVATING_DOT_CYCLE)[number]>("");
  const { questionRef, cancelRef, confirmRef, getTargets, targetsKey } = useComicConfirmStage({
    question,
    cancelLabel,
    confirmLabel,
    questionBubbleStyle,
    cancelBubbleStyle,
    confirmBubbleStyle,
    questionFill,
    cancelFill,
    confirmFill,
  });

  useEffect(() => {
    if (!confirming) {
      setBusyDots("");
      return;
    }
    setBusyDots("");
    let step = 0;
    const id = window.setInterval(() => {
      step = (step + 1) % ACTIVATING_DOT_CYCLE.length;
      setBusyDots(ACTIVATING_DOT_CYCLE[step]!);
    }, ACTIVATING_DOT_MS);
    return () => window.clearInterval(id);
  }, [confirming]);

  const handleCancel = () => {
    if (confirming) return;
    onCancel?.();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    if (confirming) return;
    onConfirm();
    if (closeOnSelect) onOpenChange(false);
  };

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
              {t("description")}
            </Dialog.Description>

            <ComicBubbleStage
              active={open}
              targetsKey={targetsKey}
              getTargets={getTargets}
              className={[stageStyles.stage, styles.dialogLayout].filter(Boolean).join(" ")}
            >
              <ComicDialogContent
                ref={questionRef}
                mode="embedded"
                className={styles.question}
                bubbleStyle={questionBubbleStyle}
                sourceDirection="none"
                backgroundColors={[questionFill]}
              >
                {question}
              </ComicDialogContent>
              <ComicButton
                ref={cancelRef}
                mode="embedded"
                slot="start"
                className={styles.ctaCancel}
                bubbleStyle={cancelBubbleStyle}
                sourceDirection="none"
                fontColor="black"
                backgroundColors={[cancelFill]}
                disabled={confirming}
                onClick={handleCancel}
              >
                {cancelLabel}
              </ComicButton>
              <ComicButton
                ref={confirmRef}
                mode="embedded"
                slot="end"
                className={styles.ctaConfirm}
                fontColor="white"
                bubbleStyle={confirmBubbleStyle}
                sourceDirection="none"
                backgroundColors={[confirmFill]}
                disabled={confirming}
                onClick={handleConfirm}
              >
                {confirming ? (
                  <span className={styles.confirmingLabel} aria-live="polite">
                    {confirmLabel}
                    <span className={styles.confirmingDots}>{busyDots}</span>
                  </span>
                ) : (
                  confirmLabel
                )}
              </ComicButton>
            </ComicBubbleStage>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export type { ComicBubbleStyle } from "./comicBubblePresets";

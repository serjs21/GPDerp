"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { ComicButton } from "@/components/ComicButton/ComicButton";
import { ComicDialogContent } from "@/components/ComicDialogContent/ComicDialogContent";
import { COMIC_PANEL_COLORS } from "@/components/ComicPageLayout/comicPagePresets";
import { useActivatingDots } from "@/hooks/useActivatingDots";
import { withDefaults } from "@/utils/props/withDefaults";
import { ComicBubbleStage } from "./ComicBubbleStage";
import type { ComicBubbleStyle } from "./comicBubblePresets";
import stageStyles from "./comicBubbleStage.module.css";
import { useComicConfirmStage } from "./useComicConfirmStage";
import styles from "./ComicConfirmModal.module.css";

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

const COMIC_CONFIRM_MODAL_DEFAULTS = {
  questionFill: COMIC_PANEL_COLORS.cream.base,
  confirmFill: COMIC_PANEL_COLORS.red.base,
  cancelFill: "#ffffff",
  questionBubbleStyle: "thought" as ComicBubbleStyle,
  cancelBubbleStyle: "speech" as ComicBubbleStyle,
  confirmBubbleStyle: "pointedArcs" as ComicBubbleStyle,
  closeOnOverlayClick: true,
  closeOnSelect: true,
  confirming: false,
};

export function ComicConfirmModal(props: ComicConfirmModalProps) {
  const {
    open,
    question,
    questionFill,
    confirmFill,
    cancelFill,
    questionBubbleStyle,
    cancelBubbleStyle,
    confirmBubbleStyle,
    closeOnOverlayClick,
    closeOnSelect,
    confirming,
  } = withDefaults(props, COMIC_CONFIRM_MODAL_DEFAULTS);
  const { onOpenChange, onConfirm, onCancel } = props;
  const t = useTranslations("ComicConfirmModal");
  const confirmLabel = props.confirmLabel ?? t("confirm");
  const cancelLabel = props.cancelLabel ?? t("cancel");
  const allowOutsideDismiss = closeOnOverlayClick && !confirming;
  const busyDots = useActivatingDots(confirming);
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

  const blockOutsideDismiss = (event: Event) => {
    if (!allowOutsideDismiss) event.preventDefault();
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
          onPointerDownOutside={blockOutsideDismiss}
          onInteractOutside={blockOutsideDismiss}
          onEscapeKeyDown={(event) => {
            if (confirming) event.preventDefault();
          }}
        >
          <div className={[styles.panel, props.className].filter(Boolean).join(" ")}>
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

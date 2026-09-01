"use client";

import { type ReactNode } from "react";
import { ComicConfirmModal, type ComicConfirmOption } from "@/components/ComicConfirmModal";

export type DeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirming?: boolean;
  question?: ReactNode;
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
};

const DEFAULT_QUESTION = "Send this lantern away?";
const DEFAULT_CANCEL = "Not yet";
const DEFAULT_CONFIRM = "Let it fly";

export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  confirming = false,
  question = DEFAULT_QUESTION,
  cancelLabel = DEFAULT_CANCEL,
  confirmLabel = DEFAULT_CONFIRM,
}: DeleteConfirmModalProps) {
  const options: ComicConfirmOption[] = [
    {
      id: "cancel",
      label: cancelLabel,
      onSelect: () => {
        onOpenChange(false);
      },
      bubbleStyle: "speech",
      disabled: confirming,
    },
    {
      id: "confirm",
      label: confirmLabel,
      onSelect: () => {
        void onConfirm();
      },
      bubbleStyle: "pointedArcs",
      disabled: confirming,
    },
  ];

  return (
    <ComicConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      question={question}
      questionBubbleStyle="pointedArcs"
      closeOnOverlayClick={false}
      closeOnSelect={false}
      options={options}
    />
  );
}

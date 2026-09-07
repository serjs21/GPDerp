"use client";

import { ComicConfirmModal } from "@/components/ComicConfirmModal";

export type DeleteConfirmModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  confirming?: boolean;
  question?: string;
  cancelLabel?: string;
  confirmLabel?: string;
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
  return (
    <ComicConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      question={question}
      cancelLabel={cancelLabel}
      confirmLabel={confirmLabel}
      confirming={confirming}
      closeOnSelect={false}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}

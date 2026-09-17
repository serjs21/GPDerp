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

const DEFAULT_QUESTION = "Did you mean to do that?";
const DEFAULT_CANCEL = "Nope";
const DEFAULT_CONFIRM = "Yep";

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

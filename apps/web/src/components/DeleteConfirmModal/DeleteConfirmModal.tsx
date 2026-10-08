"use client";

import { useTranslations } from "next-intl";
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

export function DeleteConfirmModal({
  open,
  onOpenChange,
  onConfirm,
  confirming = false,
  question,
  cancelLabel,
  confirmLabel,
}: DeleteConfirmModalProps) {
  const t = useTranslations("DeleteConfirmModal");
  return (
    <ComicConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      question={question ?? t("question")}
      cancelLabel={cancelLabel ?? t("cancel")}
      confirmLabel={confirmLabel ?? t("confirm")}
      confirming={confirming}
      closeOnSelect={false}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}

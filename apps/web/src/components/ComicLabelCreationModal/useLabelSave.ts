"use client";

import { useTranslations } from "next-intl";
import type { LabelDto } from "@/api/labels";
import { comicToast } from "@/components/ComicToast";
import { useAccountLabels } from "@/hooks/useAccountLabels";
import type { ComicLabelCreationModalProps } from "./ComicLabelCreationModal";

type LabelSaveOptions = Pick<
  ComicLabelCreationModalProps,
  "open" | "accountId" | "label" | "onClose" | "onCreated" | "onUpdated"
> & {
  embedded: boolean;
  /** Called after a create succeeds so the form can start a fresh draft. */
  onCreateReset: () => void;
};

type LabelSaveDraft = { name: string; color: string; shape: string };

/** Account labels (for duplicate checks) and create-or-update with toasts and close behavior. */
export function useLabelSave({
  open,
  accountId,
  label,
  embedded,
  onClose,
  onCreated,
  onUpdated,
  onCreateReset,
}: LabelSaveOptions) {
  const t = useTranslations("ComicLabelCreationModal");
  const { labels, isLoading, createLabel, updateLabel, isCreating, isUpdating } = useAccountLabels({
    accountId,
    autofetch: open,
  });

  const update = (existing: LabelDto, draft: LabelSaveDraft) =>
    updateLabel({
      labelId: existing.id,
      ...draft,
      onSuccess: async (updated) => {
        comicToast.success(t("updated"));
        onUpdated?.(updated);
        onClose();
      },
      onError: async () => {
        comicToast.error(t("updateError"));
      },
    });

  const create = (draft: LabelSaveDraft) =>
    createLabel({
      ...draft,
      onSuccess: async (created) => {
        comicToast.success(t("created"));
        onCreated?.(created);
        onCreateReset();
        // Embedded hubs keep the shell open (e.g. switch to Add); standalone closes.
        if (!embedded) onClose();
      },
      onError: async () => {
        comicToast.error(t("createError"));
      },
    });

  const save = (draft: LabelSaveDraft) => {
    void (label ? update(label, draft) : create(draft));
  };

  return { labels, isLoading, busy: isCreating || isUpdating, save };
}

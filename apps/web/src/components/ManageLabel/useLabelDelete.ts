"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { comicToast } from "@/components/ComicToast";
import { useAccountLabels } from "@/hooks/useAccountLabels";

/** Delete-confirm dialog state and the delete call; `onDeleted` runs after the dialog closes. */
export function useLabelDelete(accountId: string, labelId: string, onDeleted: () => void) {
  const t = useTranslations("ManageLabel.manageLabel");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const { deleteLabel } = useAccountLabels({ accountId, autofetch: false });

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteLabel({
        labelId,
        onSuccess: async () => {
          comicToast.success(t("deleted"));
          setDeleteOpen(false);
          onDeleted();
        },
        onError: async () => {
          comicToast.error(t("deleteError"));
        },
      });
    } finally {
      setDeleting(false);
    }
  };

  return { deleteOpen, setDeleteOpen, deleting, confirmDelete };
}

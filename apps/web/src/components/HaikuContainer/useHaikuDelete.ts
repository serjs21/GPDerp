"use client";

import axios from "axios";
import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import type { HaikuDto } from "@/api/haikus";
import { deleteHaiku } from "@/api/haikus";
import { comicToast } from "@/components/ComicToast";

/**
 * Delete-confirm modal state. With `onDelete` the caller orchestrates (exit animation + API + toasts)
 * and failures keep the modal open; otherwise delete directly and toast the outcome.
 */
export function useHaikuDelete(params: {
  haiku: HaikuDto;
  onDelete: (() => Promise<void>) | undefined;
  onDeleted: (() => void) | undefined;
}) {
  const { haiku, onDelete, onDeleted } = params;
  const t = useTranslations("HaikuContainer.haikuActions");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteConfirm = useCallback(async () => {
    setDeleting(true);
    try {
      if (onDelete) {
        await onDelete();
        setDeleteOpen(false);
        return;
      }
      await deleteHaiku(haiku.id);
      comicToast.success(t("deleted"));
      onDeleted?.();
      setDeleteOpen(false);
    } catch (e) {
      if (onDelete) {
        // LanternDeleteExit already toasted / reported failure; keep modal open.
        return;
      }
      if (axios.isAxiosError(e) && e.response?.status === 403) {
        comicToast.error(t("deleteForbidden"));
      } else {
        comicToast.error(t("deleteFailed"));
      }
    } finally {
      setDeleting(false);
    }
  }, [haiku, onDelete, onDeleted, t]);

  return { deleteOpen, setDeleteOpen, deleting, handleDeleteConfirm };
}

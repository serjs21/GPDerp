"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { deleteShareLink } from "@/api/shareLinks";
import { comicToast } from "@/components/ComicToast";
import { MAGIC_EXIT_COLLAPSE_MS } from "@/components/ManageLabel/consts/magicAnimationConsts";
import { useCollapseExit } from "@/hooks/useCollapseExit";

/** Delete confirm → collapse-out animation → erase request (instant erase under reduced motion). */
export function useShareLinkRowDelete(linkId: string, onChanged: () => void) {
  const t = useTranslations("ShareLinkManagement.row");
  const reduceMotion = useReducedMotion();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // Animate first: the delete socket event drops the row from cache immediately.
  const eraseLink = async () => {
    try {
      await deleteShareLink(linkId);
      comicToast.success(t("erased"));
      onChanged();
    } catch {
      setExiting(false);
      comicToast.error(t("eraseError"));
    }
  };

  useCollapseExit({
    ref: rowRef,
    exiting,
    durationMs: MAGIC_EXIT_COLLAPSE_MS,
    listGap: "var(--share-link-list-gap, 1.75rem)",
    onComplete: () => void eraseLink(),
  });

  const confirmDelete = () => {
    setDeleteOpen(false);
    if (reduceMotion) {
      void eraseLink();
      return;
    }
    setExiting(true);
  };

  return { rowRef, exiting, deleteOpen, setDeleteOpen, confirmDelete };
}

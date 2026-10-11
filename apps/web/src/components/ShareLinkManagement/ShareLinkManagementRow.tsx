"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { deleteShareLink, type ShareLinkListItem } from "@/api/shareLinks";
import type { HaikuDto } from "@/api/haikus";
import { ComicConfirmModal } from "@/components/ComicConfirmModal";
import { comicToast } from "@/components/ComicToast";
import { ShareLinkActions } from "@/components/ShareLinkActions";
import { ShareLinkControlsColumn } from "@/components/ShareLinkControlsColumn";
import { ShareLinkLanternPanel } from "@/components/ShareLinkLanternPanel";
import { useShareLinkControls } from "@/components/ShareLink/useShareLinkControls";
import { MAGIC_EXIT_COLLAPSE_MS } from "@/components/ManageLabel/consts/magicAnimationConsts";
import { useCollapseExit } from "@/hooks/useCollapseExit";
import { ShareLinkPreviewModal } from "@/components/ShareLinkPreviewModal";
import { SHARE_LINK_HAIKUS_QUERY_KEY } from "./useShareLinkHaikuEnrichment";
import styles from "./ShareLinkManagement.module.css";

export type ShareLinkManagementRowProps = {
  link: ShareLinkListItem;
  haiku?: HaikuDto;
  haikuLoading?: boolean;
  onChanged: () => void;
};

export function ShareLinkManagementRow({
  link,
  haiku,
  haikuLoading = false,
  onChanged,
}: ShareLinkManagementRowProps) {
  const t = useTranslations("ShareLinkManagement.row");
  const reduceMotion = useReducedMotion();
  const queryClient = useQueryClient();
  // Optimistic until the list refetch catches up (`base` stops matching the link).
  const [labelsOverride, setLabelsOverride] = useState<{ base: boolean; value: boolean } | null>(
    null,
  );
  const showLabels =
    labelsOverride && labelsOverride.base === link.showLabels
      ? labelsOverride.value
      : link.showLabels;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [exiting, setExiting] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const ctrl = useShareLinkControls({
    link,
    haikuId: link.sharedHaikuId ?? "",
    haikuSubject: link.haikuSubject,
    onChanged,
    onLinkUpdate: (updated) =>
      setLabelsOverride({ base: link.showLabels, value: updated.showLabels }),
  });

  // Animate first: the delete socket event drops the row from cache immediately.
  const eraseLink = async () => {
    try {
      await deleteShareLink(link.id);
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

  const handleDeleteConfirm = () => {
    setDeleteOpen(false);
    if (reduceMotion) {
      void eraseLink();
      return;
    }
    setExiting(true);
  };

  return (
    <div
      ref={rowRef}
      className={[styles.linkRowShell, exiting ? styles.linkRowShellExiting : ""]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className={[
          styles.linkRow,
          ctrl.grayscale ? styles.linkRowInactive : "",
          exiting ? styles.boingOutDown : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <ShareLinkLanternPanel
          ctrl={ctrl}
          haiku={haiku}
          loading={haikuLoading}
          fallbackId={link.sharedHaikuId ?? link.id}
          createdAt={link.createdAt}
        />

        <ShareLinkActions
          subject={ctrl.subject}
          shareUrl={link.shareUrl}
          showLabels={showLabels}
          togglingLabels={ctrl.togglingLabels}
          onPreview={() => setPreviewOpen(true)}
          onToggleLabels={() => void ctrl.onToggleLabels(!showLabels)}
          onDelete={() => setDeleteOpen(true)}
          className={styles.actionsCell}
        />

        <ShareLinkControlsColumn ctrl={ctrl} />

        <ShareLinkPreviewModal
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          subject={ctrl.subject}
          shareUrl={link.shareUrl}
          haiku={haiku}
          loading={haikuLoading}
          showLabels={showLabels}
          togglingLabels={ctrl.togglingLabels}
          onToggleLabels={() => void ctrl.onToggleLabels(!showLabels)}
          onHaikuChanged={() =>
            void queryClient.invalidateQueries({ queryKey: [SHARE_LINK_HAIKUS_QUERY_KEY] })
          }
        />

        <ComicConfirmModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          question={t("deleteQuestion")}
          cancelLabel={t("deleteCancel")}
          confirmLabel={t("deleteConfirm")}
          onConfirm={handleDeleteConfirm}
        />
      </div>
    </div>
  );
}

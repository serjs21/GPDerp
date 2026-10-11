"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import type { HaikuDto } from "@/api/haikus";
import { ComicConfirmModal } from "@/components/ComicConfirmModal";
import { ShareLinkActions } from "@/components/ShareLinkActions";
import { ShareLinkControlsColumn } from "@/components/ShareLinkControlsColumn";
import { ShareLinkLanternPanel } from "@/components/ShareLinkLanternPanel";
import { useShareLinkControls } from "@/components/ShareLink/useShareLinkControls";
import { ShareLinkPreviewModal } from "@/components/ShareLinkPreviewModal";
import { useOptimisticShowLabels } from "./useOptimisticShowLabels";
import { SHARE_LINK_HAIKUS_QUERY_KEY } from "./useShareLinkHaikuEnrichment";
import { useShareLinkRowDelete } from "./useShareLinkRowDelete";
import { shareLinkRowClassNames } from "./utils/shareLinkRowUtils";
import styles from "./ShareLinkManagement.module.css";

export type ShareLinkManagementRowProps = {
  link: ShareLinkListItem;
  haiku?: HaikuDto;
  haikuLoading?: boolean;
  onChanged: () => void;
};

export function ShareLinkManagementRow({ link, haiku, haikuLoading, onChanged }: ShareLinkManagementRowProps) {
  const t = useTranslations("ShareLinkManagement.row");
  const queryClient = useQueryClient();
  const { showLabels, onLinkUpdate } = useOptimisticShowLabels(link);
  const [previewOpen, setPreviewOpen] = useState(false);
  const { rowRef, exiting, deleteOpen, setDeleteOpen, confirmDelete } = useShareLinkRowDelete(link.id, onChanged);

  const ctrl = useShareLinkControls({
    link,
    haikuId: link.sharedHaikuId ?? "",
    haikuSubject: link.haikuSubject,
    onChanged,
    onLinkUpdate,
  });

  const classNames = shareLinkRowClassNames(exiting, ctrl.grayscale);
  const toggleLabels = () => void ctrl.onToggleLabels(!showLabels);

  return (
    <div ref={rowRef} className={classNames.shell}>
      <div className={classNames.row}>
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
          onToggleLabels={toggleLabels}
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
          onToggleLabels={toggleLabels}
          onHaikuChanged={() => void queryClient.invalidateQueries({ queryKey: [SHARE_LINK_HAIKUS_QUERY_KEY] })}
        />

        <ComicConfirmModal
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          question={t("deleteQuestion")}
          cancelLabel={t("deleteCancel")}
          confirmLabel={t("deleteConfirm")}
          onConfirm={confirmDelete}
        />
      </div>
    </div>
  );
}

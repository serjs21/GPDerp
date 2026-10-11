"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { ComicPageDialog, ComicPagePanel } from "@/components/ComicPageLayout";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { shareLinkPreviewPanelStyle } from "./utils/shareLinkPreviewModalUtils";
import { ShareLinkPreviewBody } from "./ShareLinkPreviewBody";
import { ShareLinkPreviewFooter } from "./ShareLinkPreviewFooter";
import type { ShareLinkPreviewModalProps } from "./ShareLinkPreviewModal.types";
import styles from "./ShareLinkPreviewModal.module.css";

export function ShareLinkPreviewModal({
  open,
  onOpenChange,
  subject,
  shareUrl,
  haiku,
  loading,
  showLabels,
  togglingLabels,
  onToggleLabels,
  onHaikuChanged,
}: ShareLinkPreviewModalProps) {
  const t = useTranslations("ShareLinkPreviewModal");
  const [labelsOpen, setLabelsOpen] = useState(false);

  return (
    <>
      <ComicPageDialog
        open={open}
        onOpenChange={onOpenChange}
        showClose
        className={styles.page}
        contentClassName={styles.dialog}
        ctaFooter={
          <ShareLinkPreviewFooter
            subject={subject}
            shareUrl={shareUrl}
            showLabels={showLabels}
            togglingLabels={togglingLabels}
            onToggleLabels={onToggleLabels}
            canEditLabels={Boolean(haiku)}
            onEditLabels={() => setLabelsOpen(true)}
            onDone={() => onOpenChange(false)}
          />
        }
      >
        <ComicPagePanel
          background="solid"
          color="sky"
          span="full"
          overflowVisible
          className={styles.panel}
          style={shareLinkPreviewPanelStyle()}
          ariaLabel={t("panelAriaLabel", { subject })}
        >
          <ShareLinkPreviewBody
            subject={subject}
            haiku={haiku}
            loading={loading}
            showLabels={showLabels}
            onHaikuChanged={onHaikuChanged}
          />
        </ComicPagePanel>
      </ComicPageDialog>

      {haiku ? (
        <CreateAddLabelsModal
          open={labelsOpen}
          haiku={haiku}
          initialTab="add"
          onClose={() => setLabelsOpen(false)}
          onSaved={onHaikuChanged}
        />
      ) : null}
    </>
  );
}

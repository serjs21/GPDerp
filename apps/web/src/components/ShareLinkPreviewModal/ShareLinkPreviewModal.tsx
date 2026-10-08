"use client";

import { useMemo, useState } from "react";
import { ComicPageDialog, ComicPagePanel } from "@/components/ComicPageLayout";
import { CreateAddLabelsModal } from "@/components/CreateAddLabelsModal";
import { LabelHalo, toLabelHaloItems } from "@/components/LabelHalo";
import { Lantern } from "@/components/Lantern/Lantern";
import { LanternFrame } from "@/components/Lantern/LanternFrame";
import { SakuraPetalLoader } from "@/components/Loaders";
import {
  SHARE_LINK_PREVIEW_ACTION_LAYOUTS,
  SHARE_LINK_PREVIEW_LABELS_TOGGLE_LAYOUTS,
  ShareLinkDoneAction,
  ShareLinkEditLabelsAction,
  ShareLinkGoToLinkAction,
  ShareLinkLabelsToggle,
} from "@/components/ShareLinkActions";
import { useHaikuLabelPlacement } from "@/hooks/useHaikuLabelPlacement";
import { shareLinkPreviewPanelStyle } from "./utils/shareLinkPreviewModalUtils";
import type { ShareLinkPreviewModalProps } from "./ShareLinkPreviewModal.types";
import styles from "./ShareLinkPreviewModal.module.css";

export function ShareLinkPreviewModal({
  open,
  onOpenChange,
  subject,
  shareUrl,
  haiku,
  loading = false,
  showLabels,
  togglingLabels,
  onToggleLabels,
  onHaikuChanged,
}: ShareLinkPreviewModalProps) {
  const [labelsOpen, setLabelsOpen] = useState(false);

  const { onPlacementCommit } = useHaikuLabelPlacement({
    haikuId: haiku?.id,
    enabled: Boolean(haiku),
    onChanged: onHaikuChanged,
  });

  const haloLabels = useMemo(() => toLabelHaloItems(haiku?.labels ?? []), [haiku?.labels]);

  return (
    <>
      <ComicPageDialog
        open={open}
        onOpenChange={onOpenChange}
        showClose
        className={styles.page}
        contentClassName={styles.dialog}
        ctaFooter={
          <div className={styles.footerActions}>
            <div className={styles.footerAction}>
              <ShareLinkLabelsToggle
                subject={subject}
                showLabels={showLabels}
                togglingLabels={togglingLabels}
                onToggleLabels={onToggleLabels}
                layouts={SHARE_LINK_PREVIEW_LABELS_TOGGLE_LAYOUTS}
                captionClassName={styles.footerCaption}
              />
            </div>
            <div className={styles.footerAction}>
              <ShareLinkEditLabelsAction
                subject={subject}
                disabled={!haiku}
                onEditLabels={() => setLabelsOpen(true)}
                captionClassName={styles.footerCaption}
              />
            </div>
            <div className={styles.footerAction}>
              <ShareLinkGoToLinkAction
                subject={subject}
                shareUrl={shareUrl ?? ""}
                disabled={!shareUrl}
                layout={SHARE_LINK_PREVIEW_ACTION_LAYOUTS.followLink}
                captionClassName={styles.footerCaption}
              />
            </div>
            <div className={[styles.footerAction, styles.footerActionWide].join(" ")}>
              <ShareLinkDoneAction
                subject={subject}
                onDone={() => onOpenChange(false)}
                captionClassName={styles.footerCaption}
              />
            </div>
          </div>
        }
      >
        <ComicPagePanel
          background="solid"
          color="sky"
          span="full"
          overflowVisible
          className={styles.panel}
          style={shareLinkPreviewPanelStyle()}
          ariaLabel={`Shared lantern: ${subject}`}
        >
          {haiku ? (
            <LabelHalo
              labels={haloLabels}
              onPlacementCommit={(labelId, placement) => void onPlacementCommit(labelId, placement)}
              ariaLabel={`${subject} labels`}
              className={showLabels ? undefined : styles.labelsHidden}
            >
              <LanternFrame ariaLabel={`Haiku lantern: ${subject}`} showLabelBelt={false}>
                <Lantern haiku={haiku} showActions={false} bodyOnly />
              </LanternFrame>
            </LabelHalo>
          ) : loading ? (
            <div className={styles.loader}>
              <SakuraPetalLoader />
            </div>
          ) : (
            <p className={styles.empty}>This haiku is no longer available.</p>
          )}
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

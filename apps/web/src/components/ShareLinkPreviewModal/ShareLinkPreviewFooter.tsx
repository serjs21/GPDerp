"use client";

import {
  SHARE_LINK_PREVIEW_ACTION_LAYOUTS,
  SHARE_LINK_PREVIEW_LABELS_TOGGLE_LAYOUTS,
  ShareLinkDoneAction,
  ShareLinkEditLabelsAction,
  ShareLinkGoToLinkAction,
  ShareLinkLabelsToggle,
} from "@/components/ShareLinkActions";
import type { ShareLinkPreviewFooterProps } from "./ShareLinkPreviewModal.types";
import styles from "./ShareLinkPreviewModal.module.css";

/** Preview dialog footer: labels toggle, edit labels, follow link, done. */
export function ShareLinkPreviewFooter({
  subject,
  shareUrl,
  showLabels,
  togglingLabels,
  onToggleLabels,
  canEditLabels,
  onEditLabels,
  onDone,
}: ShareLinkPreviewFooterProps) {
  return (
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
          disabled={!canEditLabels}
          onEditLabels={onEditLabels}
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
        <ShareLinkDoneAction subject={subject} onDone={onDone} captionClassName={styles.footerCaption} />
      </div>
    </div>
  );
}

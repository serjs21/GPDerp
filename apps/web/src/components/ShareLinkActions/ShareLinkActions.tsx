"use client";

import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import { ShareLinkGoToLinkAction } from "./ShareLinkGoToLinkAction";
import { ShareLinkLabelsToggle } from "./ShareLinkLabelsToggle";
import type { ShareLinkActionsProps } from "./ShareLinkActions.types";
import styles from "./ShareLinkActions.module.css";

/**
 * Stacked comic panel actions for a share-link row:
 * Preview → Go to link → Show/hide labels → Delete.
 */
export function ShareLinkActions({
  subject,
  shareUrl,
  showLabels,
  togglingLabels,
  onPreview,
  onToggleLabels,
  onDelete,
  className,
}: ShareLinkActionsProps) {
  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={`Share link actions for ${subject}`}
    >
      <ShareLinkActionButton
        src={SHARE_LINK_ACTION_ICONS.preview}
        caption="Preview"
        layout={SHARE_LINK_ACTION_LAYOUTS.preview}
        ariaLabel={`Preview ${subject}`}
        color={SHARE_LINK_ACTION_COLORS.preview.panel}
        hoverFill={SHARE_LINK_ACTION_COLORS.preview.hover}
        onSelect={onPreview}
      />
      <ShareLinkGoToLinkAction subject={subject} shareUrl={shareUrl} />
      <ShareLinkLabelsToggle
        subject={subject}
        showLabels={showLabels}
        togglingLabels={togglingLabels}
        onToggleLabels={onToggleLabels}
      />
      <ShareLinkActionButton
        src={SHARE_LINK_ACTION_ICONS.delete}
        caption="Delete"
        layout={SHARE_LINK_ACTION_LAYOUTS.delete}
        ariaLabel={`Delete share link for ${subject}`}
        color={SHARE_LINK_ACTION_COLORS.delete.panel}
        hoverFill={SHARE_LINK_ACTION_COLORS.delete.hover}
        invertCaptionOnHover
        onSelect={onDelete}
      />
    </div>
  );
}

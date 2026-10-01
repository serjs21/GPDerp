"use client";

import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import { ShareLinkUpdateAction } from "./ShareLinkUpdateAction";
import type { ShareLinkActionsProps } from "./ShareLinkActions.types";
import styles from "./ShareLinkActions.module.css";

/**
 * Stacked comic panel actions for a share-link row:
 * Preview → Update → Show/hide labels → Delete.
 */
export function ShareLinkActions({
  subject,
  active,
  canUpdate,
  updating,
  showLabels,
  togglingLabels,
  onPreview,
  onUpdate,
  onToggleLabels,
  onDelete,
  className,
}: ShareLinkActionsProps) {
  const labelsColors = showLabels
    ? SHARE_LINK_ACTION_COLORS.showLabels
    : SHARE_LINK_ACTION_COLORS.hideLabels;

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
      <ShareLinkUpdateAction
        subject={subject}
        active={active}
        canUpdate={canUpdate}
        updating={updating}
        onUpdate={onUpdate}
      />
      <ShareLinkActionButton
        src={showLabels ? SHARE_LINK_ACTION_ICONS.showLabels : SHARE_LINK_ACTION_ICONS.hideLabels}
        caption={showLabels ? "Labels" : "Hidden"}
        layout={showLabels ? SHARE_LINK_ACTION_LAYOUTS.showLabels : SHARE_LINK_ACTION_LAYOUTS.hideLabels}
        ariaLabel={`Show labels on share link for ${subject}`}
        color={labelsColors.panel}
        hoverFill={labelsColors.hover}
        pressed={showLabels}
        busy={togglingLabels}
        inverted={!showLabels}
        onSelect={onToggleLabels}
      />
      <ShareLinkActionButton
        src={SHARE_LINK_ACTION_ICONS.delete}
        caption="Delete"
        layout={SHARE_LINK_ACTION_LAYOUTS.delete}
        ariaLabel={`Delete share link for ${subject}`}
        color={SHARE_LINK_ACTION_COLORS.delete.panel}
        hoverFill={SHARE_LINK_ACTION_COLORS.delete.hover}
        invertIconOnHover
        onSelect={onDelete}
      />
    </div>
  );
}

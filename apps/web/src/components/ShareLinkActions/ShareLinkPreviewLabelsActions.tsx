"use client";

import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
} from "./consts/shareLinkActionsConsts";
import { SHARE_LINK_ACTION_ROW_LAYOUTS } from "./consts/shareLinkActionRowConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import { ShareLinkLabelsToggle } from "./ShareLinkLabelsToggle";
import type { ShareLinkPreviewLabelsActionsProps } from "./ShareLinkPreviewLabelsActions.types";
import styles from "./ShareLinkPreviewLabelsActions.module.css";

export function ShareLinkPreviewLabelsActions({
  subject,
  showLabels,
  togglingLabels,
  onPreview,
  onToggleLabels,
  disabled = false,
  className,
}: ShareLinkPreviewLabelsActionsProps) {
  return (
    <div
      className={[styles.strip, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={`Share link actions for ${subject}`}
    >
      <ShareLinkActionButton
        src={SHARE_LINK_ACTION_ICONS.preview}
        caption="Preview"
        captionClassName={styles.caption}
        layout={SHARE_LINK_ACTION_ROW_LAYOUTS.preview}
        ariaLabel={`Preview ${subject}`}
        color={SHARE_LINK_ACTION_COLORS.preview.panel}
        hoverFill={SHARE_LINK_ACTION_COLORS.preview.hover}
        disabled={disabled}
        onSelect={onPreview}
      />
      <ShareLinkLabelsToggle
        subject={subject}
        showLabels={showLabels}
        togglingLabels={togglingLabels}
        onToggleLabels={onToggleLabels}
        captionClassName={styles.caption}
        layouts={{
          show: SHARE_LINK_ACTION_ROW_LAYOUTS.showLabels,
          hide: SHARE_LINK_ACTION_ROW_LAYOUTS.hideLabels,
        }}
        disabled={disabled}
      />
    </div>
  );
}

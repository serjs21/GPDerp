"use client";

import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkLabelsToggleProps } from "./ShareLinkLabelsToggle.types";
import styles from "./ShareLinkActions.module.css";

/** Show/hide labels panel toggle; fills its parent box. */
export function ShareLinkLabelsToggle({
  subject,
  showLabels,
  togglingLabels,
  onToggleLabels,
}: ShareLinkLabelsToggleProps) {
  const colors = showLabels
    ? SHARE_LINK_ACTION_COLORS.showLabels
    : SHARE_LINK_ACTION_COLORS.hideLabels;

  return (
    <ShareLinkActionButton
      src={showLabels ? SHARE_LINK_ACTION_ICONS.showLabels : SHARE_LINK_ACTION_ICONS.hideLabels}
      caption={showLabels ? "Labels visible" : "Labels hidden"}
      captionClassName={styles.captionLabels}
      layout={showLabels ? SHARE_LINK_ACTION_LAYOUTS.showLabels : SHARE_LINK_ACTION_LAYOUTS.hideLabels}
      ariaLabel={`Show labels on share link for ${subject}`}
      color={colors.panel}
      hoverFill={colors.hover}
      pressed={showLabels}
      busy={togglingLabels}
      inverted={!showLabels}
      onSelect={onToggleLabels}
    />
  );
}

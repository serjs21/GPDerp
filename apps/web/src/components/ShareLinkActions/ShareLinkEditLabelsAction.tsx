"use client";

import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkEditLabelsActionProps } from "./ShareLinkEditLabelsAction.types";
import styles from "./ShareLinkActions.module.css";

/** Opens the haiku label editor; fills its parent box. */
export function ShareLinkEditLabelsAction({
  subject,
  disabled = false,
  onEditLabels,
}: ShareLinkEditLabelsActionProps) {
  return (
    <ShareLinkActionButton
      src={SHARE_LINK_ACTION_ICONS.editLabels}
      caption="Edit labels"
      captionClassName={styles.captionLabels}
      layout={SHARE_LINK_ACTION_LAYOUTS.editLabels}
      ariaLabel={`Edit labels for ${subject}`}
      color={SHARE_LINK_ACTION_COLORS.editLabels.panel}
      hoverFill={SHARE_LINK_ACTION_COLORS.editLabels.hover}
      disabled={disabled}
      onSelect={onEditLabels}
    />
  );
}

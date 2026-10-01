"use client";

import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_PREVIEW_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkGoToLinkActionProps } from "./ShareLinkGoToLinkAction.types";
import styles from "./ShareLinkActions.module.css";

/** Opens the public share page in a new tab; fills its parent box. */
export function ShareLinkGoToLinkAction({ subject, shareUrl }: ShareLinkGoToLinkActionProps) {
  return (
    <ShareLinkActionButton
      src={SHARE_LINK_ACTION_ICONS.followLink}
      caption="Go to link"
      captionClassName={styles.captionLabels}
      layout={SHARE_LINK_PREVIEW_ACTION_LAYOUTS.followLink}
      ariaLabel={`Open share link for ${subject} in a new tab`}
      color={SHARE_LINK_ACTION_COLORS.followLink.panel}
      hoverFill={SHARE_LINK_ACTION_COLORS.followLink.hover}
      onSelect={() => window.open(shareUrl, "_blank", "noopener,noreferrer")}
    />
  );
}

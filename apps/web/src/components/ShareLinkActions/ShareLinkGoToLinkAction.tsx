"use client";

import { useTranslations } from "next-intl";
import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { SHARE_LINK_ACTION_ROW_LAYOUTS } from "./consts/shareLinkActionRowConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkGoToLinkActionProps } from "./ShareLinkGoToLinkAction.types";
import styles from "./ShareLinkActions.module.css";

/** Opens the public share page in a new tab; fills its parent box. */
export function ShareLinkGoToLinkAction({
  subject,
  shareUrl,
  captionClassName,
  layout = SHARE_LINK_ACTION_LAYOUTS.followLink,
  disabled,
}: ShareLinkGoToLinkActionProps) {
  const t = useTranslations("ShareLinkActions.goToLink");
  return (
    <ShareLinkActionButton
      src={SHARE_LINK_ACTION_ICONS.followLink}
      caption={t("caption")}
      captionClassName={[styles.captionLabels, captionClassName].filter(Boolean).join(" ")}
      layout={layout}
      disabled={disabled}
      rowLayout={SHARE_LINK_ACTION_ROW_LAYOUTS.followLink}
      ariaLabel={t("ariaLabel", { subject })}
      color={SHARE_LINK_ACTION_COLORS.followLink.panel}
      hoverFill={SHARE_LINK_ACTION_COLORS.followLink.hover}
      onSelect={() => window.open(shareUrl, "_blank", "noopener,noreferrer")}
    />
  );
}

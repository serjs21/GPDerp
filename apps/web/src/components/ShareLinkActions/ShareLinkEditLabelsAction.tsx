"use client";

import { useTranslations } from "next-intl";
import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_PREVIEW_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkEditLabelsActionProps } from "./ShareLinkEditLabelsAction.types";
import styles from "./ShareLinkActions.module.css";

/** Opens the haiku label editor; fills its parent box. */
export function ShareLinkEditLabelsAction({
  subject,
  disabled = false,
  onEditLabels,
  captionClassName,
}: ShareLinkEditLabelsActionProps) {
  const t = useTranslations("ShareLinkActions.editLabels");
  return (
    <ShareLinkActionButton
      src={SHARE_LINK_ACTION_ICONS.editLabels}
      caption={t("caption")}
      captionClassName={[styles.captionLabels, captionClassName].filter(Boolean).join(" ")}
      layout={SHARE_LINK_PREVIEW_ACTION_LAYOUTS.editLabels}
      ariaLabel={t("ariaLabel", { subject })}
      color={SHARE_LINK_ACTION_COLORS.editLabels.panel}
      hoverFill={SHARE_LINK_ACTION_COLORS.editLabels.hover}
      disabled={disabled}
      onSelect={onEditLabels}
    />
  );
}

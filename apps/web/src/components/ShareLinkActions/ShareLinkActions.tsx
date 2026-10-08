"use client";

import { useTranslations } from "next-intl";
import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { SHARE_LINK_ACTION_ROW_LAYOUTS } from "./consts/shareLinkActionRowConsts";
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
  const t = useTranslations("ShareLinkActions.actions");
  return (
    <div
      className={[styles.stack, className].filter(Boolean).join(" ")}
      role="group"
      aria-label={t("groupAriaLabel", { subject })}
    >
      <ShareLinkGoToLinkAction subject={subject} shareUrl={shareUrl} />
      <ShareLinkActionButton
        src={SHARE_LINK_ACTION_ICONS.preview}
        caption={t("preview")}
        layout={SHARE_LINK_ACTION_LAYOUTS.preview}
        rowLayout={SHARE_LINK_ACTION_ROW_LAYOUTS.preview}
        ariaLabel={t("previewAriaLabel", { subject })}
        color={SHARE_LINK_ACTION_COLORS.preview.panel}
        hoverFill={SHARE_LINK_ACTION_COLORS.preview.hover}
        onSelect={onPreview}
      />
      <ShareLinkLabelsToggle
        subject={subject}
        showLabels={showLabels}
        togglingLabels={togglingLabels}
        onToggleLabels={onToggleLabels}
        rowLayouts={{
          show: SHARE_LINK_ACTION_ROW_LAYOUTS.showLabels,
          hide: SHARE_LINK_ACTION_ROW_LAYOUTS.hideLabels,
        }}
      />
      <ShareLinkActionButton
        src={SHARE_LINK_ACTION_ICONS.delete}
        caption={t("delete")}
        layout={SHARE_LINK_ACTION_LAYOUTS.delete}
        rowLayout={SHARE_LINK_ACTION_ROW_LAYOUTS.delete}
        ariaLabel={t("deleteAriaLabel", { subject })}
        color={SHARE_LINK_ACTION_COLORS.delete.panel}
        hoverFill={SHARE_LINK_ACTION_COLORS.delete.hover}
        invertCaptionOnHover
        onSelect={onDelete}
      />
    </div>
  );
}

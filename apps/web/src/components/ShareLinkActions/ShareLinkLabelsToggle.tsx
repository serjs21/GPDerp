"use client";

import { useTranslations } from "next-intl";
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
  layouts = { show: SHARE_LINK_ACTION_LAYOUTS.showLabels, hide: SHARE_LINK_ACTION_LAYOUTS.hideLabels },
  rowLayouts,
  captionClassName,
  disabled = false,
}: ShareLinkLabelsToggleProps) {
  const t = useTranslations("ShareLinkActions.labelsToggle");
  const colors = showLabels
    ? SHARE_LINK_ACTION_COLORS.showLabels
    : SHARE_LINK_ACTION_COLORS.hideLabels;

  return (
    <ShareLinkActionButton
      src={showLabels ? SHARE_LINK_ACTION_ICONS.showLabels : SHARE_LINK_ACTION_ICONS.hideLabels}
      caption={showLabels ? t("visible") : t("hidden")}
      captionClassName={[styles.captionLabels, captionClassName].filter(Boolean).join(" ")}
      layout={showLabels ? layouts.show : layouts.hide}
      rowLayout={showLabels ? rowLayouts?.show : rowLayouts?.hide}
      ariaLabel={t("ariaLabel", { subject })}
      color={colors.panel}
      hoverFill={colors.hover}
      pressed={showLabels}
      busy={togglingLabels}
      inverted={!showLabels}
      disabled={disabled}
      onSelect={onToggleLabels}
    />
  );
}

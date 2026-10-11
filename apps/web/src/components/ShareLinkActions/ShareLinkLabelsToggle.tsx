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

const DEFAULT_LAYOUTS = { show: SHARE_LINK_ACTION_LAYOUTS.showLabels, hide: SHARE_LINK_ACTION_LAYOUTS.hideLabels };

const LABELS_TOGGLE_VARIANTS = {
  show: {
    placement: "show",
    captionKey: "visible",
    src: SHARE_LINK_ACTION_ICONS.showLabels,
    colors: SHARE_LINK_ACTION_COLORS.showLabels,
  },
  hide: {
    placement: "hide",
    captionKey: "hidden",
    src: SHARE_LINK_ACTION_ICONS.hideLabels,
    colors: SHARE_LINK_ACTION_COLORS.hideLabels,
  },
} as const;

/** Show/hide labels panel toggle; fills its parent box. */
export function ShareLinkLabelsToggle({
  subject,
  showLabels,
  togglingLabels,
  onToggleLabels,
  layouts,
  rowLayouts,
  captionClassName,
  disabled,
}: ShareLinkLabelsToggleProps) {
  const t = useTranslations("ShareLinkActions.labelsToggle");
  const variant = showLabels ? LABELS_TOGGLE_VARIANTS.show : LABELS_TOGGLE_VARIANTS.hide;

  return (
    <ShareLinkActionButton
      src={variant.src}
      caption={t(variant.captionKey)}
      captionClassName={[styles.captionLabels, captionClassName].filter(Boolean).join(" ")}
      layout={(layouts ?? DEFAULT_LAYOUTS)[variant.placement]}
      rowLayout={rowLayouts?.[variant.placement]}
      ariaLabel={t("ariaLabel", { subject })}
      color={variant.colors.panel}
      hoverFill={variant.colors.hover}
      pressed={showLabels}
      busy={togglingLabels}
      inverted={!showLabels}
      disabled={disabled}
      onSelect={onToggleLabels}
    />
  );
}

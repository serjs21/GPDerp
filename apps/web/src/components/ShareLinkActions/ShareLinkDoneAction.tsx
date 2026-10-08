"use client";

import { useTranslations } from "next-intl";
import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_PREVIEW_ACTION_LAYOUTS,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkDoneActionProps } from "./ShareLinkDoneAction.types";
import styles from "./ShareLinkActions.module.css";

/** Closes the share link preview; fills its parent box. */
export function ShareLinkDoneAction({ subject, onDone, captionClassName }: ShareLinkDoneActionProps) {
  const t = useTranslations("ShareLinkActions.done");
  return (
    <ShareLinkActionButton
      src={SHARE_LINK_ACTION_ICONS.done}
      caption={t("caption")}
      captionClassName={[styles.captionLabels, captionClassName].filter(Boolean).join(" ")}
      layout={SHARE_LINK_PREVIEW_ACTION_LAYOUTS.done}
      ariaLabel={t("ariaLabel", { subject })}
      color={SHARE_LINK_ACTION_COLORS.done.panel}
      hoverFill={SHARE_LINK_ACTION_COLORS.done.hover}
      onSelect={onDone}
    />
  );
}

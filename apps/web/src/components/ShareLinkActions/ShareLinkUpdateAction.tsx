"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import {
  SHARE_LINK_UPDATE_COLORS,
  SHARE_LINK_UPDATE_ICONS,
  SHARE_LINK_UPDATE_LAYOUT,
} from "./consts/shareLinkUpdateActionConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkUpdateActionProps } from "./ShareLinkUpdateAction.types";
import { ShareLinkUpdateUnavailable } from "./ShareLinkUpdateUnavailable";
import { ShareLinkWakeTransition } from "./ShareLinkWakeTransition";
import styles from "./ShareLinkUpdateAction.module.css";

export function ShareLinkUpdateAction({
  subject,
  active,
  canUpdate,
  updating,
  onUpdate,
  wakeSegment,
  onWakeAnimationEnd,
}: ShareLinkUpdateActionProps) {
  const t = useTranslations("ShareLinkActions.update");
  const reduceMotion = useReducedMotion();
  if (wakeSegment) {
    return (
      <ShareLinkWakeTransition
        subject={subject}
        segment={wakeSegment}
        reducedMotion={reduceMotion ?? false}
        onComplete={onWakeAnimationEnd}
      />
    );
  }

  if (!active || !canUpdate) {
    return <ShareLinkUpdateUnavailable subject={subject} active={active} />;
  }

  return (
    <ShareLinkActionButton
      src={SHARE_LINK_UPDATE_ICONS.enabled}
      caption={t("caption")}
      className={styles.enabled}
      layout={SHARE_LINK_UPDATE_LAYOUT}
      ariaLabel={t("ariaLabel", { subject })}
      color={SHARE_LINK_UPDATE_COLORS.panel}
      accentColor={SHARE_LINK_UPDATE_COLORS.accent}
      background="sunburst"
      isMotionBackground={false}
      shine
      hoverFill={SHARE_LINK_UPDATE_COLORS.hover}
      busy={updating}
      onSelect={onUpdate}
    />
  );
}

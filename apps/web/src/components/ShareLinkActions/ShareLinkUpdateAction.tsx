"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { HoverHoldCallout } from "@/components/HoverHoldCallout";
import {
  SHARE_LINK_UPDATE_CALLOUT_POSITION,
  SHARE_LINK_UPDATE_CALLOUT_TIMING,
  SHARE_LINK_UPDATE_COLORS,
  SHARE_LINK_UPDATE_DISABLED_MESSAGE_KEYS,
  SHARE_LINK_UPDATE_ICONS,
  SHARE_LINK_UPDATE_LAYOUT,
  SHARE_LINK_UPDATE_NOT_STARTED_CALLOUT_POSITION,
} from "./consts/shareLinkUpdateActionConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkUpdateActionProps } from "./ShareLinkUpdateAction.types";
import { ShareLinkWakeTransition } from "./ShareLinkWakeTransition";
import actionStyles from "./ShareLinkActions.module.css";
import styles from "./ShareLinkUpdateAction.module.css";

export function ShareLinkUpdateAction({
  subject,
  active,
  canUpdate,
  updating,
  onUpdate,
  wakeSegment = null,
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

  if (active && canUpdate) {
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

  const message = t(
    active
      ? SHARE_LINK_UPDATE_DISABLED_MESSAGE_KEYS.unchanged
      : SHARE_LINK_UPDATE_DISABLED_MESSAGE_KEYS.inactive,
  );

  return (
    <HoverHoldCallout
      className={styles.callout}
      holdMs={SHARE_LINK_UPDATE_CALLOUT_TIMING.holdMs}
      fadeMs={SHARE_LINK_UPDATE_CALLOUT_TIMING.fadeMs}
      position={
        active
          ? SHARE_LINK_UPDATE_CALLOUT_POSITION
          : SHARE_LINK_UPDATE_NOT_STARTED_CALLOUT_POSITION
      }
      callout={
        <div className={active ? styles.speechBubble : styles.notStartedBubble}>
          {message}
        </div>
      }
      calloutClassName={
        active ? styles.speechBubbleSlot : styles.notStartedBubbleSlot
      }
    >
      <ComicPagePanel
        background="solid"
        color="sky"
        flexWeight={1}
        contentAlign="start"
        isMotionBackground={false}
        className={[actionStyles.action, styles.disabled].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.iconFill}
          src={
            active
              ? SHARE_LINK_UPDATE_ICONS.disabled
              : SHARE_LINK_UPDATE_ICONS.notStarted
          }
          alt={t("unavailableAlt", { subject, message })}
          draggable={false}
          decoding="async"
        />
      </ComicPagePanel>
    </HoverHoldCallout>
  );
}

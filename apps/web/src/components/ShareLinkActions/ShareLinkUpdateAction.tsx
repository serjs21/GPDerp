"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { HoverHoldCallout } from "@/components/HoverHoldCallout";
import {
  SHARE_LINK_ACTION_COLORS,
  SHARE_LINK_ACTION_ICONS,
  SHARE_LINK_ACTION_LAYOUTS,
  SHARE_LINK_UPDATE_CALLOUT_POSITION,
  SHARE_LINK_UPDATE_DISABLED_MESSAGES,
} from "./consts/shareLinkActionsConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkUpdateActionProps } from "./ShareLinkUpdateAction.types";
import styles from "./ShareLinkActions.module.css";

export function ShareLinkUpdateAction({
  subject,
  active,
  canUpdate,
  updating,
  onUpdate,
}: ShareLinkUpdateActionProps) {
  if (active && canUpdate) {
    return (
      <ShareLinkActionButton
        src={SHARE_LINK_ACTION_ICONS.update}
        caption="Update"
        layout={SHARE_LINK_ACTION_LAYOUTS.update}
        ariaLabel={`Update share link for ${subject}`}
        color={SHARE_LINK_ACTION_COLORS.update.panel}
        hoverFill={SHARE_LINK_ACTION_COLORS.update.hover}
        busy={updating}
        onSelect={onUpdate}
      />
    );
  }

  const message = active
    ? SHARE_LINK_UPDATE_DISABLED_MESSAGES.unchanged
    : SHARE_LINK_UPDATE_DISABLED_MESSAGES.inactive;

  return (
    <HoverHoldCallout
      className={styles.updateCallout}
      holdMs={3000}
      fadeMs={200}
      position={SHARE_LINK_UPDATE_CALLOUT_POSITION}
      callout={<div className={styles.speechBubble}>{message}</div>}
      calloutClassName={styles.speechBubbleSlot}
    >
      <ComicPagePanel
        background="solid"
        color="sky"
        flexWeight={1}
        contentAlign="start"
        isMotionBackground={false}
        className={[styles.action, styles.updateDisabled].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img
          className={styles.iconFill}
          src={SHARE_LINK_ACTION_ICONS.updateDisabled}
          alt={`Update unavailable for ${subject}: ${message}`}
          draggable={false}
          decoding="async"
        />
      </ComicPagePanel>
    </HoverHoldCallout>
  );
}

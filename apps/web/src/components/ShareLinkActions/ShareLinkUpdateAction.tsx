"use client";

import { ComicPagePanel } from "@/components/ComicPageLayout";
import { HoverHoldCallout } from "@/components/HoverHoldCallout";
import {
  SHARE_LINK_UPDATE_CALLOUT_POSITION,
  SHARE_LINK_UPDATE_CALLOUT_TIMING,
  SHARE_LINK_UPDATE_COLORS,
  SHARE_LINK_UPDATE_DISABLED_MESSAGES,
  SHARE_LINK_UPDATE_ICONS,
  SHARE_LINK_UPDATE_LAYOUT,
  SHARE_LINK_UPDATE_NOT_STARTED_CALLOUT_POSITION,
} from "./consts/shareLinkUpdateActionConsts";
import { ShareLinkActionButton } from "./ShareLinkActionButton";
import type { ShareLinkUpdateActionProps } from "./ShareLinkUpdateAction.types";
import actionStyles from "./ShareLinkActions.module.css";
import styles from "./ShareLinkUpdateAction.module.css";

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
        src={SHARE_LINK_UPDATE_ICONS.enabled}
        caption="Update"
        layout={SHARE_LINK_UPDATE_LAYOUT}
        ariaLabel={`Update share link for ${subject}`}
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

  const message = active
    ? SHARE_LINK_UPDATE_DISABLED_MESSAGES.unchanged
    : SHARE_LINK_UPDATE_DISABLED_MESSAGES.inactive;

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
          alt={`Update unavailable for ${subject}: ${message}`}
          draggable={false}
          decoding="async"
        />
      </ComicPagePanel>
    </HoverHoldCallout>
  );
}

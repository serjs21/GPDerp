"use client";

import { useTranslations } from "next-intl";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { HoverHoldCallout } from "@/components/HoverHoldCallout";
import {
  SHARE_LINK_UPDATE_CALLOUT_TIMING,
  SHARE_LINK_UPDATE_UNAVAILABLE_VARIANTS,
} from "./consts/shareLinkUpdateActionConsts";
import type { ShareLinkUpdateUnavailableProps } from "./ShareLinkUpdateUnavailable.types";
import actionStyles from "./ShareLinkActions.module.css";
import styles from "./ShareLinkUpdateAction.module.css";

/** Greyed Update panel whose hover-hold bubble explains why updating isn't possible yet. */
export function ShareLinkUpdateUnavailable({ subject, active }: ShareLinkUpdateUnavailableProps) {
  const t = useTranslations("ShareLinkActions.update");
  const variant = active ? SHARE_LINK_UPDATE_UNAVAILABLE_VARIANTS.unchanged : SHARE_LINK_UPDATE_UNAVAILABLE_VARIANTS.inactive;
  const message = t(variant.messageKey);

  return (
    <HoverHoldCallout
      className={styles.callout}
      holdMs={SHARE_LINK_UPDATE_CALLOUT_TIMING.holdMs}
      fadeMs={SHARE_LINK_UPDATE_CALLOUT_TIMING.fadeMs}
      position={variant.position}
      callout={<div className={styles[variant.bubbleClass]}>{message}</div>}
      calloutClassName={styles[variant.slotClass]}
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
          src={variant.icon}
          alt={t("unavailableAlt", { subject, message })}
          draggable={false}
          decoding="async"
        />
      </ComicPagePanel>
    </HoverHoldCallout>
  );
}

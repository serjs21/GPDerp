"use client";

import { useTranslations } from "next-intl";
import { useSteppedTransition } from "@/components/animations/SteppedTransition";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import {
  SHARE_LINK_WAKE_FRAMES,
  SHARE_LINK_WAKE_SEGMENT_POSES,
  SHARE_LINK_WAKE_TIMING,
} from "./consts/shareLinkUpdateActionConsts";
import type { ShareLinkWakeTransitionProps } from "./ShareLinkWakeTransition.types";
import { shareLinkWakeFrameOpacities } from "./utils/shareLinkWakeUtils";
import actionStyles from "./ShareLinkActions.module.css";
import updateStyles from "./ShareLinkUpdateAction.module.css";
import styles from "./ShareLinkWakeTransition.module.css";

/**
 * Stepped wake-up / shut-down in the Update panel slot over
 * not_started ↔ wake_1 ↔ wake_2 ↔ update_disabled, one segment at a time.
 */
export function ShareLinkWakeTransition({
  subject,
  segment,
  holdMs = SHARE_LINK_WAKE_TIMING.holdMs,
  crossfadeMs = SHARE_LINK_WAKE_TIMING.crossfadeMs,
  fadeMode = "crossfade",
  reducedMotion = false,
  onComplete,
}: ShareLinkWakeTransitionProps) {
  const t = useTranslations("ShareLinkActions.update");
  const { layers } = useSteppedTransition({
    poses: SHARE_LINK_WAKE_SEGMENT_POSES[segment],
    active: true,
    holdMs,
    crossfadeMs,
    fadeMode,
    reducedMotion,
    onComplete,
  });
  const opacities = shareLinkWakeFrameOpacities(SHARE_LINK_WAKE_FRAMES.length, layers);

  return (
    <ComicPagePanel
      background="solid"
      color="sky"
      flexWeight={1}
      contentAlign="start"
      isMotionBackground={false}
      className={[actionStyles.action, updateStyles.disabled].join(" ")}
    >
      <div className={styles.frames} role="img" aria-label={t("wakingAlt", { subject })}>
        {SHARE_LINK_WAKE_FRAMES.map((src, index) => (
          // eslint-disable-next-line @next/next/no-img-element -- static public SVG
          <img
            key={src}
            className={styles.frame}
            src={src}
            alt=""
            draggable={false}
            decoding="async"
            style={{ opacity: opacities[index] }}
          />
        ))}
      </div>
    </ComicPagePanel>
  );
}

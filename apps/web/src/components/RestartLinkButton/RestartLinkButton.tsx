"use client";

import { useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { ComicPressButton } from "@/components/ComicPressButton";
import { withDefaults } from "@/utils/props/withDefaults";
import { HOVER_LABEL, RESTART_LINK_BUTTON_DEFAULTS } from "./consts/restartLinkButtonConsts";
import { RestartButtonFace } from "./RestartButtonFace";
import type { RestartLinkButtonProps } from "./RestartLinkButton.types";
import { RestartReviveLockup } from "./RestartReviveLockup";
import styles from "./RestartLinkButton.module.css";
import { useRestartLinkButtonAnimation, type RestartLinkButtonAnimationRefs } from "./useRestartLinkButtonAnimation";
import { useRestartLinkHover } from "./useRestartLinkHover";
import { restartLinkRootStyle } from "./utils/restartLinkButtonUtils";

export type { RestartLinkButtonProps, RestartLinkReason } from "./RestartLinkButton.types";

export function RestartLinkButton(props: RestartLinkButtonProps) {
  const { reason, disabled, className, forceHover, reviveTextX, reviveTextY, reviveTextRotate } = withDefaults(
    props,
    RESTART_LINK_BUTTON_DEFAULTS,
  );
  const t = useTranslations("RestartLinkButton");
  const idleFace = useRef<HTMLElement | null>(null);
  const idleChars = useRef<HTMLElement | null>(null);
  const hoverChars = useRef<HTMLElement | null>(null);
  const hipoints = useRef<HTMLElement | null>(null);
  const filterIcon = useRef<HTMLElement | null>(null);
  const reviveLockup = useRef<HTMLElement | null>(null);
  const reviveBanner = useRef<HTMLElement | null>(null);

  const refs = useMemo<RestartLinkButtonAnimationRefs>(
    () => ({
      idleFace,
      idleChars,
      hoverChars,
      hipoints,
      filterIcon,
      reviveLockup,
      reviveBanner,
    }),
    [],
  );

  const hover = useRestartLinkHover(disabled, forceHover);
  useRestartLinkButtonAnimation(hover.expanded, !disabled, refs, reason, forceHover);

  return (
    <ComicPressButton
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={restartLinkRootStyle(reason, { x: reviveTextX, y: reviveTextY, rotate: reviveTextRotate })}
      disabled={disabled}
      aria-label={t(HOVER_LABEL[reason])}
      onClick={props.onClick}
      {...hover.handlers}
    >
      <RestartButtonFace
        reason={reason}
        showHipoints={reason === "limit_reached"}
        idleFace={idleFace}
        idleChars={idleChars}
        hoverChars={hoverChars}
        hipoints={hipoints}
        filterIcon={filterIcon}
      />
      {reason === "expired" ? <RestartReviveLockup lockupRef={reviveLockup} bannerRef={reviveBanner} /> : null}
    </ComicPressButton>
  );
}

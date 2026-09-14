"use client";

import { useCallback, useMemo, useRef, useState, type CSSProperties, type FocusEvent } from "react";
import styles from "./RestartLinkButton.module.css";
import {
  useRestartLinkButtonAnimation,
  type RestartLinkButtonAnimationRefs,
} from "./useRestartLinkButtonAnimation";

export type RestartLinkReason = "expired" | "limit_reached";

export type RestartLinkButtonProps = {
  reason: RestartLinkReason;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** Keep the hover lockup visible (Storybook / previews). */
  forceHover?: boolean;
  /** Banner left, as a percent of the expired emblem. Default 50. */
  reviveTextX?: number;
  /** Banner top, as a percent of the expired emblem. Default 50. */
  reviveTextY?: number;
  /** Banner rotation in degrees. Default -3. */
  reviveTextRotate?: number;
};

const FILTER_ICON_SRC: Record<RestartLinkReason, string> = {
  expired: "/share_links_filter/expired.svg",
  limit_reached: "/share_links_filter/limit_reached.svg",
};

const IDLE_LABEL: Record<RestartLinkReason, string> = {
  expired: "Expired",
  limit_reached: "0 hits left",
};

const HOVER_LABEL: Record<RestartLinkReason, string> = {
  expired: "Revive!",
  limit_reached: "Resurrect!",
};

const HIPOINTS_SRC = "/profile/re-hipoints.svg";
const RE_EXPIRED_SRC = "/profile/re-expired.svg";

function reviveBannerStyle(x: number, y: number, rotate: number): CSSProperties {
  return {
    "--revive-banner-x": `${String(x)}%`,
    "--revive-banner-y": `${String(y)}%`,
    "--revive-banner-rotate": `${String(rotate)}deg`,
  } as CSSProperties;
}

function CharLine({
  text,
  className,
  lineRef,
}: {
  text: string;
  className: string;
  lineRef: RestartLinkButtonAnimationRefs["idleChars"];
}) {
  return (
    <span ref={lineRef} className={className} aria-hidden>
      {Array.from(text).map((ch, index) => (
        <span key={`${ch}-${String(index)}`} className={styles.char} data-restart-char>
          {ch === " " ? "\u00a0" : ch}
        </span>
      ))}
    </span>
  );
}

function HipointsMark({ markRef }: { markRef: RestartLinkButtonAnimationRefs["hipoints"] }) {
  return (
    <span className={styles.hipointsWell} aria-hidden>
      <span ref={markRef} className={styles.hipointsIcon}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
        <img src={HIPOINTS_SRC} alt="" className={styles.hipointsGlyph} />
      </span>
    </span>
  );
}

function ReviveLockup({
  lockupRef,
  bannerRef,
}: {
  lockupRef: RestartLinkButtonAnimationRefs["reviveLockup"];
  bannerRef: RestartLinkButtonAnimationRefs["reviveBanner"];
}) {
  return (
    <span ref={lockupRef} className={styles.reviveLockup} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
      <img src={RE_EXPIRED_SRC} alt="" className={styles.reviveEmblem} />
      <span ref={bannerRef} className={styles.reviveBanner}>
        <span className={styles.reviveText}>Revive!</span>
      </span>
    </span>
  );
}

function ButtonFace({
  reason,
  showHipoints,
  idleChars,
  hoverChars,
  hipoints,
  filterIcon,
}: {
  reason: RestartLinkReason;
  showHipoints: boolean;
  idleChars: RestartLinkButtonAnimationRefs["idleChars"];
  hoverChars: RestartLinkButtonAnimationRefs["hoverChars"];
  hipoints: RestartLinkButtonAnimationRefs["hipoints"];
  filterIcon: RestartLinkButtonAnimationRefs["filterIcon"];
}) {
  return (
    <span className={[styles.row, showHipoints ? styles.rowWithHipoints : ""].filter(Boolean).join(" ")}>
      <span className={styles.iconCluster}>
        {showHipoints ? <HipointsMark markRef={hipoints} /> : null}
        <span className={styles.iconStage} aria-hidden>
          <span ref={filterIcon} className={styles.filterIcon}>
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
            <img src={FILTER_ICON_SRC[reason]} alt="" className={styles.filterGlyph} />
          </span>
        </span>
      </span>
      <span className={styles.labelSlot}>
        <CharLine text={IDLE_LABEL[reason]} className={styles.labelLine} lineRef={idleChars} />
        {showHipoints ? (
          <CharLine
            text={HOVER_LABEL.limit_reached}
            className={[styles.labelLine, styles.labelLineHover].join(" ")}
            lineRef={hoverChars}
          />
        ) : null}
      </span>
    </span>
  );
}

export function RestartLinkButton({
  reason,
  onClick,
  disabled = false,
  className,
  forceHover = false,
  reviveTextX = 50,
  reviveTextY = 80,
  reviveTextRotate = -3,
}: RestartLinkButtonProps) {
  const idleChars = useRef<HTMLElement | null>(null);
  const hoverChars = useRef<HTMLElement | null>(null);
  const hipoints = useRef<HTMLElement | null>(null);
  const filterIcon = useRef<HTMLElement | null>(null);
  const reviveLockup = useRef<HTMLElement | null>(null);
  const reviveBanner = useRef<HTMLElement | null>(null);
  const [pointerInside, setPointerInside] = useState(false);
  const [focusVisible, setFocusVisible] = useState(false);

  const refs = useMemo<RestartLinkButtonAnimationRefs>(
    () => ({
      idleChars,
      hoverChars,
      hipoints,
      filterIcon,
      reviveLockup,
      reviveBanner,
    }),
    [],
  );

  const expanded = !disabled && (forceHover || pointerInside || focusVisible);
  useRestartLinkButtonAnimation(expanded, !disabled, refs, reason, forceHover);

  const syncFocusVisible = useCallback((event: FocusEvent<HTMLButtonElement>) => {
    setFocusVisible(event.currentTarget.matches(":focus-visible"));
  }, []);

  const showRevive = reason === "expired";

  return (
    <button
      type="button"
      className={[styles.root, className].filter(Boolean).join(" ")}
      style={showRevive ? reviveBannerStyle(reviveTextX, reviveTextY, reviveTextRotate) : undefined}
      disabled={disabled}
      aria-label={HOVER_LABEL[reason]}
      onClick={onClick}
      onMouseEnter={() => setPointerInside(true)}
      onMouseLeave={() => setPointerInside(false)}
      onFocus={syncFocusVisible}
      onBlur={() => setFocusVisible(false)}
    >
      <ButtonFace
        reason={reason}
        showHipoints={reason === "limit_reached"}
        idleChars={idleChars}
        hoverChars={hoverChars}
        hipoints={hipoints}
        filterIcon={filterIcon}
      />
      {showRevive ? <ReviveLockup lockupRef={reviveLockup} bannerRef={reviveBanner} /> : null}
    </button>
  );
}

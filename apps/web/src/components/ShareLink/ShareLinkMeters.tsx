"use client";

import { motion } from "motion/react";
import type { HitsMeterDisplay, TimeMeterDisplay } from "@/utils/shareLinkDisplay";
import styles from "./ShareLink.module.css";
import {
  CLOCK_SRC,
  HEART_FILLED_SRC,
  HEART_SRC,
  INFINITY_SRC,
  PAPER_PLANE_SRC,
  planeVariants,
  type PlanePhase,
} from "./useShareLinkControls";

export type ShareLinkMetersProps = {
  hits: HitsMeterDisplay;
  time: TimeMeterDisplay;
  hitsLabel: string;
  timeLabel: string;
  planePhase: PlanePhase;
  planeInitial: "idle" | { x: number; y: number; rotate: number };
  copyEnabled: boolean;
  onCopy: () => void;
  className?: string;
};

export function ShareLinkMeters({
  hits,
  time,
  hitsLabel,
  timeLabel,
  planePhase,
  planeInitial,
  copyEnabled,
  onCopy,
  className,
}: ShareLinkMetersProps) {
  const panelBodyClass = [
    styles.panelBody,
    className,
    copyEnabled ? styles.panelBodyCopyable : null,
  ]
    .filter(Boolean)
    .join(" ");

  const content = (
    <>
      <div className={styles.meters}>
        <span className={styles.meter} aria-label={hitsLabel}>
          {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
          <img
            src={hits.kind === "empty" ? HEART_SRC : HEART_FILLED_SRC}
            alt=""
            className={styles.meterIcon}
            aria-hidden
          />
          {hits.kind === "unlimited" ? (
            // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
            <img src={INFINITY_SRC} alt="" className={styles.meterIcon} aria-hidden />
          ) : (
            <span className={styles.meterValue}>{hits.count}</span>
          )}
        </span>
        <span className={styles.meter} aria-label={timeLabel}>
          {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
          <img src={CLOCK_SRC} alt="" className={styles.meterIcon} aria-hidden />
          {time.kind === "unlimited" ? (
            // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
            <img src={INFINITY_SRC} alt="" className={styles.meterIcon} aria-hidden />
          ) : (
            <span className={styles.meterValue}>{time.text}</span>
          )}
        </span>
      </div>
      <div className={styles.planeStage}>
        <motion.img
          src={PAPER_PLANE_SRC}
          alt=""
          className={styles.plane}
          aria-hidden
          variants={planeVariants}
          initial={planeInitial}
          animate={planePhase}
        />
      </div>
    </>
  );

  if (copyEnabled) {
    return (
      <button
        type="button"
        className={panelBodyClass}
        onClick={onCopy}
        aria-label="Copy share link"
      >
        {content}
      </button>
    );
  }

  return <div className={panelBodyClass}>{content}</div>;
}

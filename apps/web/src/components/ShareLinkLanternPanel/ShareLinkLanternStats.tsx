"use client";

import { useTranslations } from "next-intl";
import {
  CLOCK_SRC,
  HEART_FILLED_SRC,
  HEART_SRC,
  INFINITY_SRC,
} from "@/components/ShareLink/useShareLinkControls";
import type { ShareLinkLanternStatsProps } from "./ShareLinkLanternPanel.types";
import styles from "./ShareLinkLanternPanel.module.css";

/** Hits / time-left meters shown in the lantern panel header while the link is active. */
export function ShareLinkLanternStats({ hits, time, hitsLabel, timeLabel }: ShareLinkLanternStatsProps) {
  const t = useTranslations("ShareLinkLanternPanel");
  return (
    <div className={styles.stats} aria-label={t("statsAriaLabel")}>
      <span className={styles.stat} aria-label={hitsLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
        <img
          src={hits.kind === "empty" ? HEART_SRC : HEART_FILLED_SRC}
          alt=""
          className={styles.statIcon}
          aria-hidden
        />
        {hits.kind === "unlimited" ? (
          // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
          <img src={INFINITY_SRC} alt="" className={styles.statIcon} aria-hidden />
        ) : (
          <span className={styles.statValue}>
            {hits.count}/{hits.total}
          </span>
        )}
      </span>
      <span className={styles.stat} aria-label={timeLabel}>
        {/* eslint-disable-next-line @next/next/no-img-element -- pixel meter icons */}
        <img src={CLOCK_SRC} alt="" className={styles.statIcon} aria-hidden />
        {time.kind === "unlimited" ? (
          // eslint-disable-next-line @next/next/no-img-element -- pixel meter icons
          <img src={INFINITY_SRC} alt="" className={styles.statIcon} aria-hidden />
        ) : (
          <span className={styles.statValue}>{time.text}</span>
        )}
      </span>
    </div>
  );
}

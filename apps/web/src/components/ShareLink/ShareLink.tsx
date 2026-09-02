"use client";

import axios from "axios";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { setShareLinkDisabled } from "@/api/shareLinks";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { CopyText } from "@/components/CopyText/CopyText";
import { comicToast } from "@/components/ComicToast";
import { Tooltip, Typography } from "@/components/StyledComponents";
import { useLocale } from "@/hooks/useLocale";
import {
  getHitsMeterDisplay,
  getTimeMeterDisplay,
  shouldTickShareLinkClock,
} from "@/utils/shareLinkDisplay";
import { canStartShareLink, isActiveShareLink } from "@/utils/shareLinkStatus";
import styles from "./ShareLink.module.css";

const PAPER_PLANE_SRC = "/share_modal/link/paper_plane.svg";
const START_ICON_SRC = "/share_modal/link/start.svg";
const PAUSE_ICON_SRC = "/share_modal/link/pause.svg";
const HEART_FILLED_SRC = "/share_modal/link/heart_filled.svg";
const HEART_SRC = "/share_modal/link/heart.svg";
const CLOCK_SRC = "/share_modal/link/clock.svg";
const INFINITY_SRC = "/share_modal/link/infinity.svg";

export type ShareLinkProps = {
  link: ShareLinkListItem;
  onChanged: () => void;
  /** Optional local update after start/stop (e.g. ShareModal) before a list refetch. */
  onLinkUpdate?: (link: ShareLinkListItem) => void;
};

export function ShareLink({ link, onChanged, onLinkUpdate }: ShareLinkProps) {
  const reduceMotion = useReducedMotion();
  const { locale } = useLocale();
  const [isUpdating, setIsUpdating] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  const active = isActiveShareLink(link, now ?? undefined);
  const canStart = canStartShareLink(link, now ?? undefined);
  const isFlying = active && !reduceMotion;
  const hits = getHitsMeterDisplay(link);
  const time = getTimeMeterDisplay(link.expirationDate, now, locale);

  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    if (!shouldTickShareLinkClock(link.expirationDate, new Date())) return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [link.expirationDate]);

  const onStop = async () => {
    if (!active || isUpdating) return;
    try {
      setIsUpdating(true);
      const updated = await setShareLinkDisabled(link.id, true);
      onLinkUpdate?.(updated);
      comicToast.success("Share link stopped");
      onChanged();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { error?: string } | undefined)?.error;
        comicToast.error(typeof msg === "string" ? msg : "Could not stop share link");
      } else {
        comicToast.error("Could not stop share link");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const onStart = async () => {
    if (!canStart || isUpdating) return;
    try {
      setIsUpdating(true);
      const updated = await setShareLinkDisabled(link.id, false);
      onLinkUpdate?.(updated);
      comicToast.success("Share link started");
      onChanged();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { error?: string } | undefined)?.error;
        comicToast.error(typeof msg === "string" ? msg : "Could not start share link");
      } else {
        comicToast.error("Could not start share link");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const startTooltip = !canStart ? "Update link limits to restart" : "Start link";
  const hitsLabel =
    hits.kind === "unlimited"
      ? "Unlimited visits"
      : hits.kind === "empty"
        ? "No visits left"
        : `${hits.count} visits left`;
  const timeLabel =
    time.kind === "unlimited"
      ? "No expiration"
      : time.kind === "relative"
        ? `Expires ${time.text}`
        : time.text
          ? `Time left ${time.text}`
          : "Time left";

  return (
    <article className={styles.root}>
      <div className={styles.actionColumn}>
        {active ? (
          <Tooltip title="Stop link">
            <button
              type="button"
              className={styles.iconButton}
              aria-label="Stop link"
              disabled={isUpdating}
              onClick={() => void onStop()}
            >
              <img src={PAUSE_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
            </button>
          </Tooltip>
        ) : (
          <Tooltip title={startTooltip}>
            <span className={styles.actionHit}>
              <button
                type="button"
                className={styles.iconButton}
                aria-label="Start link"
                disabled={!canStart || isUpdating}
                onClick={() => void onStart()}
              >
                <img src={START_ICON_SRC} alt="" className={styles.actionIcon} aria-hidden />
              </button>
            </span>
          </Tooltip>
        )}
      </div>

      <div className={[styles.panelShell, active ? styles.panelShellActive : styles.panelShellInactive].join(" ")}>
        <ComicPagePanel
          span="full"
          background="sunburst"
          color={active ? "teal" : "white"}
          shine={active}
          contentAlign="start"
          className={styles.panel}
          ariaLabel={`Share link for ${link.haikuSubject}`}
        >
          <div className={styles.content}>
            <div className={styles.planeStage}>
              <motion.img
                src={PAPER_PLANE_SRC}
                alt=""
                className={styles.plane}
                aria-hidden
                animate={
                  isFlying
                    ? {
                        x: [0, 3, -2, 4, 1, 0],
                        y: [0, -4, -7, -5, -2, 0],
                        rotate: [0, -5, 4, -3, 2, 0],
                      }
                    : {
                        x: 0,
                        y: 10,
                        rotate: 78,
                      }
                }
                transition={
                  isFlying
                    ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                    : { duration: 0.3, ease: "easeOut" }
                }
              />
            </div>
            <div className={styles.details}>
              <Typography.Title level={5} className={styles.subject}>
                {link.haikuSubject}
              </Typography.Title>
              <div className={styles.meters}>
                <span className={styles.meter} aria-label={hitsLabel}>
                  <img
                    src={hits.kind === "empty" ? HEART_SRC : HEART_FILLED_SRC}
                    alt=""
                    className={styles.meterIcon}
                    aria-hidden
                  />
                  {hits.kind === "unlimited" ? (
                    <img src={INFINITY_SRC} alt="" className={styles.meterIcon} aria-hidden />
                  ) : (
                    <span className={styles.meterValue}>{hits.count}</span>
                  )}
                </span>
                <span className={styles.meter} aria-label={timeLabel}>
                  <img src={CLOCK_SRC} alt="" className={styles.meterIcon} aria-hidden />
                  {time.kind === "unlimited" ? (
                    <img src={INFINITY_SRC} alt="" className={styles.meterIcon} aria-hidden />
                  ) : (
                    <span className={styles.meterValue}>{time.text}</span>
                  )}
                </span>
              </div>
              <CopyText text={link.shareUrl} mode="link" className={styles.urlCopy} />
            </div>
          </div>
        </ComicPagePanel>
      </div>
    </article>
  );
}

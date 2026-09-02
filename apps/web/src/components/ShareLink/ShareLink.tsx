"use client";

import axios from "axios";
import { motion, useReducedMotion } from "motion/react";
import { useMemo, useState } from "react";
import type { ShareLinkListItem } from "@/api/shareLinks";
import { deleteShareLink, setShareLinkDisabled } from "@/api/shareLinks";
import { ComicPagePanel } from "@/components/ComicPageLayout";
import { CopyText } from "@/components/CopyText/CopyText";
import { comicToast } from "@/components/ComicToast";
import { Button, Tooltip, Typography } from "@/components/StyledComponents";
import {
  canStartShareLink,
  getShareLinkStatus,
  isActiveShareLink,
  isWithinShareLinkLimits,
} from "@/utils/shareLinkStatus";
import styles from "./ShareLink.module.css";

const PAPER_PLANE_SRC = "/share_modal/link/paper_plane.svg";

export type ShareLinkProps = {
  link: ShareLinkListItem;
  onChanged: () => void;
};

export function ShareLink({ link, onChanged }: ShareLinkProps) {
  const reduceMotion = useReducedMotion();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const status = useMemo(() => getShareLinkStatus(link), [link]);
  const active = isActiveShareLink(link);
  const showStop = active;
  const showStart = link.disabled && isWithinShareLinkLimits(link);
  const startDisabled = link.disabled && !canStartShareLink(link);
  const startTooltip = startDisabled ? "Update link limits to restart" : "";
  const isFlying = active && !reduceMotion;

  const onStop = async () => {
    try {
      setIsUpdating(true);
      await setShareLinkDisabled(link.id, true);
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
    if (startDisabled) return;
    try {
      setIsUpdating(true);
      await setShareLinkDisabled(link.id, false);
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

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteShareLink(link.id);
      comicToast.success("Share link deleted");
      onChanged();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg = (error.response?.data as { error?: string } | undefined)?.error;
        comicToast.error(typeof msg === "string" ? msg : "Could not delete share link");
      } else {
        comicToast.error("Could not delete share link");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className={styles.root}>
      <div className={styles.actionColumn}>
        {showStop ? (
          <Button danger loading={isUpdating} onClick={() => void onStop()}>
            Stop
          </Button>
        ) : null}
        {showStart ? (
          <Tooltip title={startTooltip}>
            <span>
              <Button
                type="primary"
                loading={isUpdating}
                disabled={startDisabled}
                onClick={() => void onStart()}
              >
                Start
              </Button>
            </span>
          </Tooltip>
        ) : null}
      </div>

      <div className={[styles.panelShell, active ? styles.panelShellActive : styles.panelShellInactive].join(" ")}>
        <ComicPagePanel
          span="full"
          background={active ? "motion" : "solid"}
          color={active ? "teal" : "white"}
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
              <Typography.Text className={styles.statusLine}>
                {status.label}
                {status.detail ? `: ${status.detail}` : ""}
              </Typography.Text>
              <CopyText text={link.shareUrl} mode="link" className={styles.urlCopy} />
            </div>
          </div>
        </ComicPagePanel>
      </div>

      <div className={styles.deleteColumn}>
        <Button danger type="text" loading={isDeleting} onClick={() => void onDelete()}>
          Delete
        </Button>
      </div>
    </article>
  );
}

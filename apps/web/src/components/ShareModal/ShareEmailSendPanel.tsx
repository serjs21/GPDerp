"use client";

import { motion, useReducedMotion } from "motion/react";
import { Tooltip } from "@/components/StyledComponents";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import styles from "./ShareEmailSendPanel.module.css";

export type ShareEmailSendPanelProps = {
  canSendEmail: boolean;
  sendingEmail: boolean;
  emailCtaHint: string;
  onSendEmail: () => void;
};

export function ShareEmailSendPanel({
  canSendEmail,
  sendingEmail,
  emailCtaHint,
  onSendEmail,
}: ShareEmailSendPanelProps) {
  const reduceMotion = useReducedMotion();
  const ready = canSendEmail && !sendingEmail;
  const active = canSendEmail || sendingEmail;
  const tooltipTitle = ready ? "" : emailCtaHint;
  const isFlying = sendingEmail && !reduceMotion;

  const handleSelect = () => {
    if (!ready) return;
    onSendEmail();
  };

  return (
    <ComicPageRow className={styles.sendRow}>
      <Tooltip title={tooltipTitle}>
        <span className={styles.tooltipWrap}>
          <ComicPagePanel
            span="full"
            selectable
            selected={active}
            loading={sendingEmail}
            onSelect={handleSelect}
            background={active ? "halftone" : "solid"}
            color={active ? "teal" : "white"}
            ariaLabel="Send email"
            className={styles.sendPanel}
          >
            <motion.span
              className={styles.iconWrap}
              animate={
                isFlying
                  ? {
                      x: [0, 3, -2, 4, 1, 0],
                      y: [0, -4, -7, -5, -2, 0],
                      rotate: [0, -5, 4, -3, 2, 0],
                    }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={
                isFlying
                  ? { duration: 1.4, repeat: Infinity, ease: "easeInOut" }
                  : { duration: 0.2 }
              }
            >
              <img src="/share_modal/email_send.svg" alt="" className={styles.icon} />
            </motion.span>
          </ComicPagePanel>
        </span>
      </Tooltip>
    </ComicPageRow>
  );
}

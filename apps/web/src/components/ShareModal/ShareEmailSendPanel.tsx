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
  const tooltipTitle = ready ? "" : emailCtaHint;

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
            selected={ready}
            onSelect={handleSelect}
            background={ready ? "halftone" : "solid"}
            color={ready ? "purple" : "white"}
            ariaLabel="Send email"
            className={styles.sendPanel}
          >
            <motion.span
              className={styles.iconWrap}
              animate={
                ready && !reduceMotion
                  ? {
                      filter: [
                        "drop-shadow(0 0 0 rgb(206 147 216 / 0%))",
                        "drop-shadow(0 0 0.65rem rgb(206 147 216 / 55%))",
                        "drop-shadow(0 0 0 rgb(206 147 216 / 0%))",
                      ],
                    }
                  : { filter: "drop-shadow(0 0 0 transparent)" }
              }
              transition={
                ready && !reduceMotion
                  ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
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

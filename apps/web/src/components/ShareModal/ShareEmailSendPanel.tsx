"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/StyledComponents";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { ComicPressButton } from "@/components/ComicPressButton";
import styles from "./ShareEmailSendPanel.module.css";

export type ShareEmailSendPanelProps = {
  canSendEmail: boolean;
  sendingEmail: boolean;
  /** Postcard images are being generated (part of the sending phase). */
  preparingPostcard?: boolean;
  emailCtaHint: string;
  onSendEmail: () => void;
};

const getSendTooltipTitle = (
  preparingPostcard: boolean,
  ready: boolean,
  emailCtaHint: string,
  preparingPostcardLabel: string,
) => {
  if (preparingPostcard) return preparingPostcardLabel;
  return ready ? "" : emailCtaHint;
};

export function ShareEmailSendPanel({
  canSendEmail,
  sendingEmail,
  preparingPostcard = false,
  emailCtaHint,
  onSendEmail,
}: ShareEmailSendPanelProps) {
  const t = useTranslations("ShareModal.sendPanel");
  const preparingPostcardLabel = t("preparingPostcard");
  const reduceMotion = useReducedMotion();
  const ready = canSendEmail && !sendingEmail;
  const active = canSendEmail || sendingEmail;
  const tooltipTitle = getSendTooltipTitle(preparingPostcard, ready, emailCtaHint, preparingPostcardLabel);
  const isFlying = sendingEmail && !reduceMotion;

  const handleSelect = () => {
    if (!ready) return;
    onSendEmail();
  };

  return (
    <ComicPageRow className={styles.sendRow}>
      <Tooltip title={tooltipTitle} open={preparingPostcard || undefined}>
        <span className={styles.tooltipWrap}>
          <ComicPressButton
            className={styles.pressShell}
            aria-label={preparingPostcard ? preparingPostcardLabel : t("sendEmail")}
            aria-busy={sendingEmail}
            disabled={!ready}
            onClick={handleSelect}
          >
            <ComicPagePanel
              span="full"
              loading={sendingEmail}
              background={active ? "halftone" : "solid"}
              color={active ? "teal" : "white"}
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
          </ComicPressButton>
        </span>
      </Tooltip>
    </ComicPageRow>
  );
}

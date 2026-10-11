"use client";

import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Tooltip } from "@/components/StyledComponents";
import { ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import { ComicPressButton } from "@/components/ComicPressButton";
import { ShareEmailSendIcon } from "./ShareEmailSendIcon";
import type { ShareEmailSendPanelProps } from "./ShareEmailSendPanel.types";
import { shareEmailSendView } from "./utils/shareEmailSendUtils";
import styles from "./ShareEmailSendPanel.module.css";

export type { ShareEmailSendPanelProps } from "./ShareEmailSendPanel.types";

export function ShareEmailSendPanel({
  canSendEmail,
  sendingEmail,
  preparingPostcard,
  emailCtaHint,
  onSendEmail,
}: ShareEmailSendPanelProps) {
  const t = useTranslations("ShareModal.sendPanel");
  const reduceMotion = useReducedMotion();
  const view = shareEmailSendView({
    canSendEmail,
    sendingEmail,
    preparingPostcard: Boolean(preparingPostcard),
    emailCtaHint,
    preparingPostcardLabel: t("preparingPostcard"),
    sendEmailLabel: t("sendEmail"),
  });

  const handleSelect = () => {
    if (!view.ready) return;
    onSendEmail();
  };

  return (
    <ComicPageRow className={styles.sendRow}>
      <Tooltip title={view.tooltipTitle} open={view.tooltipOpen}>
        <span className={styles.tooltipWrap}>
          <ComicPressButton
            className={styles.pressShell}
            aria-label={view.ariaLabel}
            aria-busy={sendingEmail}
            disabled={!view.ready}
            onClick={handleSelect}
          >
            <ComicPagePanel
              span="full"
              loading={sendingEmail}
              background={view.panelBackground}
              color={view.panelColor}
              className={styles.sendPanel}
            >
              <ShareEmailSendIcon flying={sendingEmail && !reduceMotion} />
            </ComicPagePanel>
          </ComicPressButton>
        </span>
      </Tooltip>
    </ComicPageRow>
  );
}

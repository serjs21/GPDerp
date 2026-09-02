"use client";

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
            <span className={`${styles.iconWrap}${ready ? ` ${styles.iconWrapReady}` : ""}`}>
              <img src="/share_modal/email_send.svg" alt="" className={styles.icon} />
            </span>
          </ComicPagePanel>
        </span>
      </Tooltip>
    </ComicPageRow>
  );
}

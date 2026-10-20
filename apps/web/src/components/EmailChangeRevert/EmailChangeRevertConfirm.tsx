"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction, ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import type { EmailChangeRevertConfirmProps } from "./EmailChangeRevertConfirm.types";
import { EmailChangeRevertUnoPanel } from "./EmailChangeRevertUnoPanel";
import styles from "./EmailChangeRevertView.module.css";

export function EmailChangeRevertConfirm({
  restoreEmail,
  changedToEmail,
  busy,
  onConfirm,
  onKeep,
}: EmailChangeRevertConfirmProps) {
  const t = useTranslations("EmailChangeRevert");

  return (
    <>
      <ComicPageRow className={styles.addressRow}>
        <ComicPagePanel title={t("restoreLabel")} background="solid" color="green">
          <p className={styles.address}>{restoreEmail}</p>
        </ComicPagePanel>
        <EmailChangeRevertUnoPanel color="blue" />
        <ComicPagePanel title={t("changedToLabel")} background="solid" color="red">
          <p className={styles.address}>{changedToEmail}</p>
        </ComicPagePanel>
      </ComicPageRow>
      <ComicPagePanel background="solid" color="white" className={styles.stackPanel}>
        <div className={styles.copy}>
          <p className={styles.lead}>{t("confirmLead")}</p>
          <p className={styles.note}>{t("confirmConsequences")}</p>
        </div>
      </ComicPagePanel>
      <div className={styles.actions}>
        <ComicPageCtaAction label={t("confirmCta")} busy={busy} onClick={onConfirm} fill="#f44336" textColor="#fff" />
        <ComicPageCtaAction label={t("keepCta")} disabled={busy} onClick={onKeep} />
      </div>
    </>
  );
}

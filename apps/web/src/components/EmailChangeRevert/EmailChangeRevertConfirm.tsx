"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction, ComicPagePanel, ComicPageRow } from "@/components/ComicPageLayout";
import type { EmailChangeRevertConfirmProps } from "./EmailChangeRevertConfirm.types";
import styles from "./EmailChangeRevertView.module.css";

/** Both addresses side by side, then "undo it" / "keep it". Nothing changes until the user confirms. */
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
        <ComicPagePanel title={t("restoreLabel")} titleColor="green" background="halftone" color="green">
          <p className={styles.address}>{restoreEmail}</p>
        </ComicPagePanel>
        <ComicPagePanel title={t("changedToLabel")} titleColor="yellow" background="sunburst" color="red">
          <p className={styles.address}>{changedToEmail}</p>
        </ComicPagePanel>
      </ComicPageRow>
      <ComicPagePanel background="solid" color="cream" className={styles.stackPanel}>
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

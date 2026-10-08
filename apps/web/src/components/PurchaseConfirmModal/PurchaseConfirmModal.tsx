"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction, ComicPageDialog } from "@/components/ComicPageLayout";
import { PURCHASE_CONFIRM_DONE_LABEL, PURCHASE_CONFIRM_TITLE } from "./consts/purchaseConfirmConsts";
import type { PurchaseConfirmModalProps } from "./PurchaseConfirmModal.types";
import styles from "./PurchaseConfirmModal.module.css";

export function PurchaseConfirmModal({ open, onOpenChange, message }: PurchaseConfirmModalProps) {
  const t = useTranslations("PurchaseConfirmModal");
  return (
    <ComicPageDialog
      open={open}
      onOpenChange={onOpenChange}
      showClose
      contentClassName={styles.dialogContent}
      ctaFooter={
        <ComicPageCtaAction label={t(PURCHASE_CONFIRM_DONE_LABEL)} onClick={() => onOpenChange(false)} />
      }
    >
      <div className={styles.body}>
        <h2 className={styles.title}>{t(PURCHASE_CONFIRM_TITLE)}</h2>
        <p className={styles.message}>{message}</p>
      </div>
    </ComicPageDialog>
  );
}

"use client";

import { ComicPageCtaAction, ComicPageDialog } from "@/components/ComicPageLayout";
import { PURCHASE_CONFIRM_DONE_LABEL, PURCHASE_CONFIRM_TITLE } from "./consts/purchaseConfirmConsts";
import type { PurchaseConfirmModalProps } from "./PurchaseConfirmModal.types";
import styles from "./PurchaseConfirmModal.module.css";

export function PurchaseConfirmModal({ open, onOpenChange, message }: PurchaseConfirmModalProps) {
  return (
    <ComicPageDialog
      open={open}
      onOpenChange={onOpenChange}
      showClose
      contentClassName={styles.dialogContent}
      ctaFooter={
        <ComicPageCtaAction label={PURCHASE_CONFIRM_DONE_LABEL} onClick={() => onOpenChange(false)} />
      }
    >
      <div className={styles.body}>
        <h2 className={styles.title}>{PURCHASE_CONFIRM_TITLE}</h2>
        <p className={styles.message}>{message}</p>
      </div>
    </ComicPageDialog>
  );
}

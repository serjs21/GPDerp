"use client";

import { useTranslations } from "next-intl";
import { ComicPageCtaAction, ComicPageDialog } from "@/components/ComicPageLayout";
import {
  NO_GENERATIONS_LEFT_BUY_LABEL,
  NO_GENERATIONS_LEFT_DISMISS_LABEL,
  NO_GENERATIONS_LEFT_TITLE,
} from "./consts/noGenerationsLeftConsts";
import type { NoGenerationsLeftModalProps } from "./NoGenerationsLeftModal.types";
import styles from "./NoGenerationsLeftModal.module.css";

export function NoGenerationsLeftModal({
  open,
  onOpenChange,
  message,
  onBuy,
  buying = false,
  buyDisabled = false,
}: NoGenerationsLeftModalProps) {
  const t = useTranslations("NoGenerationsLeftModal");
  return (
    <ComicPageDialog
      open={open}
      onOpenChange={onOpenChange}
      showClose
      contentClassName={styles.dialogContent}
      ctaFooter={
        <>
          <ComicPageCtaAction
            label={t(NO_GENERATIONS_LEFT_DISMISS_LABEL)}
            disabled={buying}
            onClick={() => onOpenChange(false)}
          />
          <ComicPageCtaAction
            label={t(NO_GENERATIONS_LEFT_BUY_LABEL)}
            busy={buying}
            disabled={buyDisabled}
            onClick={onBuy}
          />
        </>
      }
    >
      <div className={styles.body}>
        <h2 className={styles.title}>{t(NO_GENERATIONS_LEFT_TITLE)}</h2>
        <p className={styles.message}>{message}</p>
      </div>
    </ComicPageDialog>
  );
}

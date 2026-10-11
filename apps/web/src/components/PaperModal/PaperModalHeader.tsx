"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import type { PaperModalHeaderProps } from "./PaperModalBody.types";
import styles from "./PaperModal.module.css";

/**
 * Visible title and/or close button. The dialog always gets a title: a visually hidden fallback
 * when no `title` is given (and no header row at all when there is also no close button).
 */
export function PaperModalHeader({ title, showClose }: PaperModalHeaderProps) {
  const t = useTranslations("PaperModal");
  const dialogTitle = title ? (
    <Dialog.Title className={styles.title}>{title}</Dialog.Title>
  ) : (
    <Dialog.Title className={styles.visuallyHidden}>{t("dialog")}</Dialog.Title>
  );

  if (!showClose && !title) return dialogTitle;

  return (
    <div className={styles.header}>
      {dialogTitle}
      {showClose ? (
        <Dialog.Close asChild>
          <button type="button" className={styles.closeButton} aria-label={t("close")}>
            ×
          </button>
        </Dialog.Close>
      ) : null}
    </div>
  );
}

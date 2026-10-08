"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/StyledComponents";
import { PaperModal } from "@/components/PaperModal";
import styles from "./DeleteFailedModal.module.css";

export type DeleteFailedModalProps = {
  open: boolean;
  retrying?: boolean;
  onRetry: () => void;
  onLeaveItBe: () => void;
};

export function DeleteFailedModal({
  open,
  retrying = false,
  onRetry,
  onLeaveItBe,
}: DeleteFailedModalProps) {
  const t = useTranslations("DeleteFailedModal");
  return (
    <PaperModal
      open={open}
      onOpenChange={(next) => {
        if (!next && !retrying) onLeaveItBe();
      }}
      title={t("title")}
      roughSeed={19}
      size="sm"
      footer={
        <div className={styles.footer}>
          <Button onClick={onLeaveItBe} disabled={retrying}>
            {t("leaveItBe")}
          </Button>
          <Button type="primary" danger loading={retrying} onClick={onRetry}>
            {t("retry")}
          </Button>
        </div>
      }
    >
      <p className={styles.body}>
        {t("body")}
      </p>
    </PaperModal>
  );
}

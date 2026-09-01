"use client";

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
  return (
    <PaperModal
      open={open}
      onOpenChange={(next) => {
        if (!next && !retrying) onLeaveItBe();
      }}
      title="Deletion failed"
      roughSeed={19}
      size="sm"
      footer={
        <div className={styles.footer}>
          <Button onClick={onLeaveItBe} disabled={retrying}>
            Leave it be
          </Button>
          <Button type="primary" danger loading={retrying} onClick={onRetry}>
            Retry
          </Button>
        </div>
      }
    >
      <p className={styles.body}>
        We couldn&apos;t delete this haiku. You can try again, or leave it in your list.
      </p>
    </PaperModal>
  );
}

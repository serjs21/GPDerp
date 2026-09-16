"use client";

import { Button } from "@/components/StyledComponents";
import { PaperModal } from "@/components/PaperModal";
import styles from "./NoCreditsLeft.module.css";

export type NoCreditsLeftProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuy: () => void;
  buying?: boolean;
  buyDisabled?: boolean;
};

export function NoCreditsLeft({
  open,
  onOpenChange,
  onBuy,
  buying = false,
  buyDisabled = false,
}: NoCreditsLeftProps) {
  return (
    <PaperModal
      open={open}
      onOpenChange={onOpenChange}
      title="You're out of haiku generations"
      roughSeed={21}
      size="sm"
      footer={
        <div className={styles.footer}>
          <Button onClick={() => onOpenChange(false)} disabled={buying}>
            Not now
          </Button>
          <Button type="primary" loading={buying} disabled={buyDisabled || buying} onClick={onBuy}>
            Buy 100 generations — $3.0
          </Button>
        </div>
      }
    >
      <p className={styles.body}>Buy more generations to keep writing. Credits are added after payment is confirmed.</p>
    </PaperModal>
  );
}

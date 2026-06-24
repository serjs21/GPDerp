import { Button } from "@/components/StyledComponents";
import styles from "./WisdomForest.module.css";

export function WisdomForestErrorFooter({ onRetry }: { onRetry: () => void }) {
  return (
    <div className={styles.footerActions}>
      <Button type="primary" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

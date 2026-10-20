import { ComicPageRow } from "@/components/ComicPageLayout";
import { EmailChangeRevertUnoPanel } from "./EmailChangeRevertUnoPanel";
import type { EmailChangeRevertSuccessRowProps } from "./EmailChangeRevertSuccessRow.types";
import styles from "./EmailChangeRevertView.module.css";

/** Success message with the Uno reverse card (green sunburst) on its left. */
export function EmailChangeRevertSuccessRow({ children }: EmailChangeRevertSuccessRowProps) {
  return (
    <ComicPageRow className={styles.successRow}>
      <EmailChangeRevertUnoPanel color="green" />
      {children}
    </ComicPageRow>
  );
}

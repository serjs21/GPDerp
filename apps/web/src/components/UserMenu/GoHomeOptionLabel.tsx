import type { GoHomeOptionLabelProps } from "./GoHomeOptionLabel.types";
import styles from "./UserMenu.module.css";

/** Text-only row label; the go-back arrow is the painted row background. */
export function GoHomeOptionLabel({ text }: GoHomeOptionLabelProps) {
  return (
    <span className={styles.goHomeLabel}>
      <span className={styles.optionName}>{text}</span>
    </span>
  );
}

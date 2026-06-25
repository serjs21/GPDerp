import styles from "./BranchConnectors.module.css";

export function BranchConnectors() {
  return (
    <div className={styles.connectors} aria-hidden>
      <span className={styles.lineLeft} />
      <span className={styles.lineRight} />
    </div>
  );
}

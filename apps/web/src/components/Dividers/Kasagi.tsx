import type { DividerProps } from "./types";
import styles from "./styles.module.css";

export const Kasagi = ({ className, style }: DividerProps) => (
  <div className={`${styles.dividers} ${styles.kasagi} ${className ?? ""}`} style={style} />
);

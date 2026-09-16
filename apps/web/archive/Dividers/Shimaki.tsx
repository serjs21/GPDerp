import type { DividerProps } from "./types";
import styles from "./styles.module.css";

export const Shimaki = ({ className, style }: DividerProps) => (
  <div className={`${styles.dividers} ${styles.shimaki} ${className ?? ""}`} style={style} />
);

import type { DividerProps } from "./types";
import styles from "./styles.module.css";

export const Nuki = ({ className, style }: DividerProps) => (
  <div className={`${styles.dividers} ${styles.nuki} ${className ?? ""}`} style={style} />
);

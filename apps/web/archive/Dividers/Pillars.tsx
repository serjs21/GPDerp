import type { ReactNode } from "react";
import type { DividerProps } from "./types";
import styles from "./styles.module.css";

interface PillarsProps extends DividerProps {
  children: ReactNode;
}

export const Pillars = ({ children, className, style }: PillarsProps) => (
  <div className={`${styles.dividers} ${styles.pillars} ${className ?? ""}`} style={style}>
    <div className={styles.pillar} />
    <div className={styles.pillarsInner}>
    {children}
    </div>
    <div className={styles.pillar} />
  </div>
);

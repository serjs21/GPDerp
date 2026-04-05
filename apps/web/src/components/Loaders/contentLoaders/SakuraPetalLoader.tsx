import type { CSSProperties } from "react";

import styles from "./SakuraPetalLoader.module.css";

export interface SakuraPetalLoaderProps {
  className?: string;
}

const PETAL_COUNT = 7;

/**
 * Sakura petals arranged like Ant Design Spin indicators: steady linear rotation
 * of the ring plus a phased pulse on each petal. Orbit radius is updated on an
 * inner rack so spin and breathe stay independent.
 */
export function SakuraPetalLoader({ className }: SakuraPetalLoaderProps) {
  return (
    <div
      className={[styles.root, className].filter(Boolean).join(" ")}
      role="status"
      aria-label="Loading"
    >
      <div className={styles.fadeShell}>
        <div className={styles.cluster}>
          <div className={styles.orbitRack}>
            {Array.from({ length: PETAL_COUNT }, (_, i) => (
              <div
                key={i}
                className={styles.arm}
                style={{ "--i": i } as CSSProperties}
              >
                <div className={styles.stem}>
                  <span className={styles.petal} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

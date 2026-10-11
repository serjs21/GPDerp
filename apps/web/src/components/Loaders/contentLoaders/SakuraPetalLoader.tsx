import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";

import { sakuraLoaderFadeStyle } from "./utils/sakuraPetalLoaderUtils";
import styles from "./SakuraPetalLoader.module.css";

export interface SakuraPetalLoaderProps {
  className?: string;
  /**
   * Fixed orbit radius — no expand/contract cycle. Better for small inline loaders.
   */
  compact?: boolean;
  /** Overall visual scale (1 = default for each mode). */
  scale?: number;
}

const PETAL_COUNT = 7;

/**
 * Sakura petals arranged like Ant Design Spin indicators: steady linear rotation
 * of the ring plus a phased pulse on each petal. Orbit radius is updated on an
 * inner rack so spin and breathe stay independent (unless `compact` is set).
 */
export const SakuraPetalLoader = ({
  className,
  compact = false,
  scale = 1,
}: SakuraPetalLoaderProps) => {
  const t = useTranslations("Loaders.sakuraPetalLoader");
  const fadeStyle = sakuraLoaderFadeStyle(compact, scale);

  return (
    <div
      className={[styles.root, compact ? styles.compact : "", className].filter(Boolean).join(" ")}
      role="status"
      aria-label={t("ariaLabel")}
    >
      <div className={styles.fadeShell} style={fadeStyle}>
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
};

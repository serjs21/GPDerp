import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";

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

/** Diameter ≈ 2 × (orbit at 1rem + default petal height 0.82rem); fits root.compact 1.5rem box */
const COMPACT_INTRINSIC_DIAMETER_REM = 2 * (1 + 0.82);
const COMPACT_ACTION_ROW_HEIGHT_REM = 1.5;
const COMPACT_FIT_SCALE = COMPACT_ACTION_ROW_HEIGHT_REM / COMPACT_INTRINSIC_DIAMETER_REM;

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
  const fadeStyle: CSSProperties | undefined = compact
    ? {
        transform: `scale(${COMPACT_FIT_SCALE * scale})`,
        transformOrigin: "center center",
      }
    : scale !== 1
      ? { transform: `scale(${scale})`, transformOrigin: "center center" }
      : undefined;

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

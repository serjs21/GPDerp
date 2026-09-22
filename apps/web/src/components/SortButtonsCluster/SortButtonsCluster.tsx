"use client";

import { motion, useReducedMotion } from "motion/react";
import { useCallback, type ReactNode } from "react";
import {
  SORT_DIRECTION_FLIP_MS,
  SORT_DIRECTION_ICON_SRC,
  type SortButtonsValue,
  type SortDirection,
} from "./consts/sortButtonsConsts";
import { SortCategoryButton } from "./SortCategoryButton";
import styles from "./SortButtonsCluster.module.css";

export type SortButtonsCategory = {
  id: string;
  label?: ReactNode;
  startIcon: ReactNode;
  endIcon: ReactNode;
  /** Accessible name when label is decorative / missing. */
  ariaLabel?: string;
};

export type SortButtonsClusterProps = {
  categories: SortButtonsCategory[];
  value: SortButtonsValue;
  onChange: (next: SortButtonsValue) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
};

function flipDirection(direction: SortDirection): SortDirection {
  return direction === "asc" ? "desc" : "asc";
}

export function SortButtonsCluster({
  categories,
  value,
  onChange,
  className,
  disabled = false,
  "aria-label": ariaLabel = "Sort options",
}: SortButtonsClusterProps) {
  const reduceMotion = useReducedMotion();

  const onCategoryClick = useCallback(
    (categoryId: string) => {
      if (categoryId === value.categoryId) {
        onChange({ categoryId, direction: flipDirection(value.direction) });
        return;
      }
      onChange({ categoryId, direction: value.direction });
    },
    [onChange, value.categoryId, value.direction],
  );

  const flipSeconds = SORT_DIRECTION_FLIP_MS / 1000;
  const indicatorRotateY = value.direction === "desc" ? 180 : 0;

  return (
    <div
      className={[styles.cluster, className].filter(Boolean).join(" ")}
      role="radiogroup"
      aria-label={ariaLabel}
    >
      {categories.map((category) => {
        const selected = category.id === value.categoryId;
        return (
          <div key={category.id} className={styles.column}>
            <div className={styles.indicatorSlot} aria-hidden={!selected}>
              {selected ? (
                <motion.div
                  className={styles.indicator}
                  initial={false}
                  animate={{ rotateY: indicatorRotateY }}
                  transition={
                    reduceMotion
                      ? { duration: 0 }
                      : { duration: flipSeconds, ease: [0.4, 0.05, 0.2, 1] }
                  }
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG */}
                  <img
                    className={styles.indicatorImg}
                    src={SORT_DIRECTION_ICON_SRC}
                    alt=""
                    width={400}
                    height={400}
                    draggable={false}
                    decoding="async"
                  />
                </motion.div>
              ) : (
                <span className={styles.indicatorSpacer} />
              )}
            </div>
            <SortCategoryButton
              startIcon={category.startIcon}
              endIcon={category.endIcon}
              label={category.label}
              selected={selected}
              disabled={disabled}
              aria-label={
                category.ariaLabel ??
                (typeof category.label === "string" ? category.label : category.id)
              }
              onClick={() => onCategoryClick(category.id)}
            />
          </div>
        );
      })}
    </div>
  );
}

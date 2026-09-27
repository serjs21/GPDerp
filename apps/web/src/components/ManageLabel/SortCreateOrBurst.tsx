"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import styles from "./SortCreateOrBurst.module.css";

/** "Or" diamond on the seam between the sort panel and the create panel. */
export function SortCreateOrBurst() {
  return (
    <span className={styles.orBurst} aria-hidden>
      <ComicBurstLabel
        className={styles.burst}
        text="Or"
        fill="#ffffff"
        stroke="#111111"
        textColor="#111111"
        shapeKind="diamond"
        seed="sort-create-or"
        fontSize={26}
        paddingX={26}
        paddingY={18}
        strokeWidth={3}
      />
    </span>
  );
}

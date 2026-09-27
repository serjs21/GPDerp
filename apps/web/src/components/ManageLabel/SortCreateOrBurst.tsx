"use client";

import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import styles from "./SortCreateOrBurst.module.css";

/** "Or" burst on the seam between the sort panel and the create panel. */
export function SortCreateOrBurst() {
  const shape = resolveComicLabelShapePreset("classic");
  return (
    <span className={styles.orBurst} aria-hidden>
      <ComicBurstLabel
        className={styles.burst}
        text="Or"
        fill="#ffffff"
        stroke="#111111"
        textColor="#ffffff"
        shapeKind={shape.kind}
        spikeCount={shape.spikeCount}
        randomness={shape.randomness}
        seed="sort-create-or"
        fontSize={26}
        strokeWidth={3}
      />
    </span>
  );
}

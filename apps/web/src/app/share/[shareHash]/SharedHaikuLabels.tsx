"use client";

import type { HaikuLinkedLabelDto } from "@/api/haikus";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import { resolveComicLabelShapePreset } from "@/components/ComicLabelCreationModal/comicLabelShapes";
import styles from "./styles.module.css";

export type SharedHaikuLabelsProps = {
  labels: HaikuLinkedLabelDto[];
};

export function SharedHaikuLabels({ labels }: SharedHaikuLabelsProps) {
  if (labels.length === 0) return null;

  return (
    <ul className={styles.labels} aria-label="Labels">
      {labels.map((label) => {
        const shape = resolveComicLabelShapePreset(label.shape);
        return (
          <li key={label.id} className={styles.labelItem}>
            <ComicBurstLabel
              text={formatComicLabelText(label.name)}
              fill={label.color || "#888888"}
              shapeKind={shape.kind}
              spikeCount={shape.spikeCount}
              randomness={shape.randomness}
              seed={shape.id}
              fontSize={14}
            />
          </li>
        );
      })}
    </ul>
  );
}

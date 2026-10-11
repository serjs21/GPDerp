"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";
import { withDefaults } from "@/utils/props/withDefaults";
import { LabelBeltNav } from "./LabelBeltNav";
import { LabelBeltSlotStack } from "./LabelBeltSlotStack";
import { LABEL_BELT_MAX_VISIBLE } from "./labelBeltLayout";
import { useLabelBeltPuffDelays } from "./useLabelBeltPuffDelays";
import { useLabelBeltRotation } from "./useLabelBeltRotation";
import styles from "./LabelBelt.module.css";

export type LabelBeltItem = {
  id: string;
  name: string;
  color: string;
  shape?: string;
};

export function toLabelBeltItems(
  labels: ReadonlyArray<{
    id: string;
    name: string;
    color?: string | null;
    shape?: string | null;
  }>,
  excludeLabelIds?: ReadonlyArray<string> | ReadonlySet<string>,
): LabelBeltItem[] {
  const exclude =
    excludeLabelIds == null
      ? null
      : excludeLabelIds instanceof Set
        ? excludeLabelIds
        : new Set(excludeLabelIds);
  return labels
    .filter((label) => !exclude?.has(label.id))
    .map((label) => ({
      id: label.id,
      name: label.name,
      color: label.color || "#888888",
      shape: label.shape ?? "classic",
    }));
}

export type LabelBeltProps = {
  labels: LabelBeltItem[];
  /** Override max visible slots (default 6). */
  maxVisible?: number;
  className?: string;
};

/**
 * Side-column ComicBurstLabels at LABEL_BELT_STOPS.
 * Overflow rotates with a stacked-block portal wipe: both labels are normal
 * flow blocks with 1rem gap; the portal clips; the entering block ends where idle sits.
 */
export const LabelBelt = memo(function LabelBelt(props: LabelBeltProps) {
  const { maxVisible, className } = withDefaults(props, { maxVisible: LABEL_BELT_MAX_VISIBLE });
  const t = useTranslations("Lantern.labelBelt");
  const { puffDelays, clearPuff } = useLabelBeltPuffDelays(props.labels);
  const { slots, transitionDelta, navDisabled, overflow, setLayerRef, step } = useLabelBeltRotation(
    props.labels,
    maxVisible,
  );

  if (props.labels.length === 0) return null;

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      aria-label={t("ariaLabel")}
    >
      {slots.map((slot) => (
        <LabelBeltSlotStack
          key={slot.id}
          slot={slot}
          transitionDelta={transitionDelta}
          setLayerRef={setLayerRef}
          puffDelays={puffDelays}
          onPuffEnd={clearPuff}
        />
      ))}

      {overflow ? <LabelBeltNav disabled={navDisabled} onStep={step} /> : null}
    </div>
  );
});

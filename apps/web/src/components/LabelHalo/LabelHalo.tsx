"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { withDefaults } from "@/utils/props/withDefaults";
import type { LabelHaloLabelItem, LabelPlacement } from "./consts/labelHaloConsts";
import { DraggableLabel } from "./DraggableLabel";
import { useHaloLabelDraft } from "./useHaloLabelDraft";
import { useLabelPuffIn } from "./useLabelPuffIn";
import { haloPadStyle } from "./utils/haloPlacementUtils";
import styles from "./LabelHalo.module.css";

export type LabelHaloProps = {
  labels: LabelHaloLabelItem[];
  /** Lantern (or other) content centered inside the padded drop area. */
  children?: ReactNode;
  onPlacementCommit?: (labelId: string, placement: LabelPlacement) => void;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the halo region. */
  ariaLabel?: string;
  /**
   * wrap — fit-content around children (Storybook).
   * fill — absolute overlay expanding pad outside a path-sized parent.
   */
  layout?: "wrap" | "fill";
  /** When false, labels render without drag/rotate. */
  interactive?: boolean;
};

const LABEL_HALO_DEFAULTS = { layout: "wrap", interactive: true } as const;

export function LabelHalo(props: LabelHaloProps) {
  const { layout, interactive } = withDefaults(props, LABEL_HALO_DEFAULTS);
  const { labels } = props;
  const t = useTranslations("LabelHalo.halo");
  const dropRef = useRef<HTMLDivElement | null>(null);
  const outlineRef = useRef<SVGSVGElement | null>(null);
  const halo = useHaloLabelDraft(labels, outlineRef, props.onPlacementCommit);
  const { puffDelays, clearPuff } = useLabelPuffIn(labels);
  const fill = layout === "fill";

  return (
    <div
      ref={dropRef}
      className={[styles.halo, fill && styles.haloFill, props.className].filter(Boolean).join(" ")}
      style={haloPadStyle(props.style)}
      role="region"
      aria-label={props.ariaLabel ?? t("ariaLabel")}
    >
      <div className={[styles.content, fill && styles.contentFill].filter(Boolean).join(" ")}>{props.children}</div>

      {halo.draggingId ? <div className={styles.dragBlocker} aria-hidden /> : null}

      <svg ref={outlineRef} className={styles.outline} aria-hidden />

      {halo.draft.map((label) => (
        <DraggableLabel
          key={label.id}
          label={label}
          rotateDeg={halo.rotateById[label.id] ?? label.rotateDeg}
          isDragging={halo.draggingId === label.id}
          interactive={interactive}
          dropRef={dropRef}
          outlineRef={outlineRef}
          onDragActiveChange={halo.onDragActiveChange}
          onPositionDraft={halo.onPositionDraft}
          onRotateDraft={halo.onRotateDraft}
          onPlacementCommit={halo.commitPlacement}
          puffDelayMs={puffDelays[label.id]}
          onPuffEnd={() => clearPuff(label.id)}
        />
      ))}
    </div>
  );
}

"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { ComicLabel } from "@/components/ComicLabel/ComicLabel";
import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import {
  buildLabelBeltSlots,
  LABEL_BELT_EDGE_GAP,
  LABEL_BELT_MAX_VISIBLE,
} from "./labelBeltLayout";
import styles from "./LabelBelt.module.css";

export type LabelBeltItem = {
  id: string;
  name: string;
  color: string;
};

export type LabelBeltProps = {
  labels: LabelBeltItem[];
  /** Override max visible slots on the arc (default 9). */
  maxVisible?: number;
  className?: string;
};

const ARROW_SRC = "/inkbrush-arrow.svg";

/**
 * Upper-half arc of ComicLabels around a lantern frame (`position: relative` host).
 * Label centers sit `LABEL_BELT_EDGE_GAP` outside the host box edge.
 * Standalone ComicLabel per slot so each bubble can rotate toward center.
 */
export function LabelBelt({
  labels,
  maxVisible = LABEL_BELT_MAX_VISIBLE,
  className,
}: LabelBeltProps) {
  const [rotationOffset, setRotationOffset] = useState(0);

  const overflow = labels.length > maxVisible;
  const visible = useMemo(
    () => rotateLabelsWindow(labels, rotationOffset, maxVisible),
    [labels, maxVisible, rotationOffset],
  );

  const slots = useMemo(
    () =>
      buildLabelBeltSlots(visible.length).map((slot, index) => ({
        ...slot,
        label: visible[index]!,
      })),
    [visible],
  );

  if (labels.length === 0) return null;

  const windowStart = ((rotationOffset % labels.length) + labels.length) % labels.length;

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      aria-label="Haiku label belt"
    >
      {slots.map((slot) => (
        <div
          key={slot.label.id}
          className={styles.slot}
          style={
            {
              left: `calc(50% + (50% + ${LABEL_BELT_EDGE_GAP}) * ${slot.cos})`,
              top: `calc(50% + (50% + ${LABEL_BELT_EDGE_GAP}) * ${slot.sin})`,
              transform: `translate(-50%, -50%) rotate(${slot.rotateDeg}deg)`,
              transformOrigin: "center center",
            } as CSSProperties
          }
        >
          <ComicLabel name={slot.label.name} color={slot.label.color} sourceDirection="none" />
        </div>
      ))}

      {overflow ? (
        <>
          <button
            type="button"
            className={[styles.navButton, styles.navPrev].join(" ")}
            aria-label="Previous labels"
            onClick={() => setRotationOffset((prev) => prev - 1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
          </button>
          <button
            type="button"
            className={[styles.navButton, styles.navNext].join(" ")}
            aria-label="Next labels"
            onClick={() => setRotationOffset((prev) => prev + 1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
          </button>
          <p className={styles.navMeta} aria-live="polite">
            {windowStart + 1}/{labels.length}
          </p>
        </>
      ) : null}
    </div>
  );
}

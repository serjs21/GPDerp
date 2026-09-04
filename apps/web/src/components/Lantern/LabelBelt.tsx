"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ComicLabel } from "@/components/ComicLabel/ComicLabel";
import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import {
  buildLabelBeltSlots,
  LABEL_BELT_MAX_VISIBLE,
  LABEL_BELT_SPIKE_GAP,
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

type SlotPush = { x: number; y: number };

function remToPx(rem: string): number {
  const n = Number.parseFloat(rem);
  if (!Number.isFinite(n)) return 12;
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;width:1rem;visibility:hidden";
  document.body.appendChild(probe);
  const px = probe.offsetWidth || 16;
  probe.remove();
  return n * px;
}

/**
 * Upper-half belt of upright ComicLabels on a rectangular outline.
 * Clearance uses half the label content size + spike gap (not the padded stage AABB).
 */
export function LabelBelt({
  labels,
  maxVisible = LABEL_BELT_MAX_VISIBLE,
  className,
}: LabelBeltProps) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const [pushes, setPushes] = useState<SlotPush[]>([]);

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

  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Measure content boxes and push centers just outside the lantern edge.
  useLayoutEffect(() => {
    const spikePx = remToPx(LABEL_BELT_SPIKE_GAP);
    const next = slots.map((slot, index) => {
      const el = slotRefs.current[index];
      const content = el?.querySelector("[data-comic-role='label']") as HTMLElement | null;
      const w = content?.offsetWidth ?? 48;
      const h = content?.offsetHeight ?? 28;
      return {
        x: slot.rectX * (w / 2 + spikePx),
        y: slot.rectY * (h / 2 + spikePx),
      };
    });
    setPushes((prev) => {
      if (
        prev.length === next.length &&
        prev.every((p, i) => Math.abs(p.x - next[i]!.x) < 0.5 && Math.abs(p.y - next[i]!.y) < 0.5)
      ) {
        return prev;
      }
      return next;
    });
  }, [slots]);

  if (labels.length === 0) return null;

  const windowStart = ((rotationOffset % labels.length) + labels.length) % labels.length;

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      aria-label="Haiku label belt"
    >
      {slots.map((slot, index) => {
        const push = pushes[index] ?? { x: 0, y: 0 };
        return (
          <div
            key={slot.label.id}
            ref={(el) => {
              slotRefs.current[index] = el;
            }}
            className={styles.slot}
            style={
              {
                left: `calc(50% + 50% * ${slot.rectX})`,
                top: `calc(50% + 50% * ${slot.rectY})`,
                transform: `translate(calc(-50% + ${push.x}px), calc(-50% + ${push.y}px))`,
              } as CSSProperties
            }
          >
            <ComicLabel text={slot.label.name} shape="burst" color={slot.label.color} />
          </div>
        );
      })}

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

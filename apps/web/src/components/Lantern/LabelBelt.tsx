"use client";

import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { ComicBurstLabel } from "@/components/ComicBurstLabel/ComicBurstLabel";
import { formatComicLabelText } from "@/components/ComicBurstLabel/formatComicLabelText";
import {
  labelBeltStopInsetStyle,
  labelBeltStopTransformOrigin,
} from "./config";
import { rotateLabelsWindow } from "./lanternLabelRingLayout";
import {
  buildLabelBeltSlots,
  LABEL_BELT_MAX_VISIBLE,
  type LabelBeltSlot,
} from "./labelBeltLayout";
import { useLabelBeltPortalTransition } from "./useLabelBeltPortalTransition";
import styles from "./LabelBelt.module.css";

export type LabelBeltItem = {
  id: string;
  name: string;
  color: string;
};

export type LabelBeltProps = {
  labels: LabelBeltItem[];
  /** Override max visible slots (default 6). */
  maxVisible?: number;
  className?: string;
};

const ARROW_SRC = "/inkbrush-arrow.svg";

type PortalTransition = {
  delta: 1 | -1;
  nextOffset: number;
  fromVisible: LabelBeltItem[];
  toVisible: LabelBeltItem[];
};

function burstFor(label: LabelBeltItem) {
  return (
    <ComicBurstLabel text={formatComicLabelText(label.name)} fill={label.color} />
  );
}

/**
 * Side-column ComicBurstLabels (corners first, then mids).
 * Overflow rotates through a 6-slot ring with anime.js portal scroll.
 *
 * During transition the entering label owns portal size from t=0 (final layout).
 * The exiting label is offset by that footprint so the two never share a layout
 * box — avoiding the commit snap when the enterer is rendered alone.
 */
export function LabelBelt({
  labels,
  maxVisible = LABEL_BELT_MAX_VISIBLE,
  className,
}: LabelBeltProps) {
  const [rotationOffset, setRotationOffset] = useState(0);
  const [transition, setTransition] = useState<PortalTransition | null>(null);
  const { busy, setLayerRef, runPortal } = useLabelBeltPortalTransition();

  const overflow = labels.length > maxVisible;
  const committedVisible = useMemo(
    () => rotateLabelsWindow(labels, rotationOffset, maxVisible),
    [labels, maxVisible, rotationOffset],
  );

  const displayOutgoing = transition?.fromVisible ?? committedVisible;
  const displayIncoming = transition?.toVisible ?? null;

  const slots = useMemo((): Array<
    LabelBeltSlot & { out: LabelBeltItem; inn: LabelBeltItem | null }
  > => {
    const base = buildLabelBeltSlots(displayOutgoing.length);
    return base.map((slot, index) => ({
      ...slot,
      out: displayOutgoing[index]!,
      inn: displayIncoming?.[index] ?? null,
    }));
  }, [displayOutgoing, displayIncoming]);

  const portalStartedFor = useRef<PortalTransition | null>(null);

  useLayoutEffect(() => {
    if (!transition) {
      portalStartedFor.current = null;
      return;
    }
    if (portalStartedFor.current === transition) return;
    portalStartedFor.current = transition;
    runPortal({
      delta: transition.delta,
      onComplete: () => {
        setRotationOffset(transition.nextOffset);
        setTransition(null);
      },
    });
  }, [transition, runPortal]);

  if (labels.length === 0) return null;

  const windowStart = ((rotationOffset % labels.length) + labels.length) % labels.length;

  const step = (delta: 1 | -1) => {
    if (!overflow || busy || transition) return;
    const nextOffset = rotationOffset + delta;
    const fromVisible = committedVisible;
    const toVisible = rotateLabelsWindow(labels, nextOffset, maxVisible);
    setTransition({ delta, nextOffset, fromVisible, toVisible });
  };

  return (
    <div
      className={[styles.overlay, className].filter(Boolean).join(" ")}
      aria-label="Haiku label belt"
    >
      {slots.map((slot) => {
        const rotating = Boolean(slot.inn);
        const inset = labelBeltStopInsetStyle(slot.stop);
        return (
          <div
            key={slot.id}
            className={styles.slot}
            style={
              {
                ...inset,
                transform: `rotate(${slot.rotateDeg}deg)`,
                transformOrigin: labelBeltStopTransformOrigin(slot.side),
              } as CSSProperties
            }
          >
            <div
              className={[styles.portal, rotating ? styles.portalRotating : ""]
                .filter(Boolean)
                .join(" ")}
            >
              <div
                className={styles.portalLayer}
                data-belt-layer="out"
                ref={(el) => setLayerRef(slot.id, "out", el)}
              >
                {burstFor(slot.out)}
              </div>
              {rotating ? (
                <div
                  className={[styles.portalLayer, styles.portalLayerIncoming].join(" ")}
                  data-belt-layer="inn"
                  ref={(el) => setLayerRef(slot.id, "inn", el)}
                >
                  {burstFor(slot.inn!)}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}

      {overflow ? (
        <>
          <button
            type="button"
            className={[styles.navButton, styles.navPrev].join(" ")}
            aria-label="Previous labels"
            disabled={busy || Boolean(transition)}
            onClick={() => step(-1)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public SVG asset */}
            <img className={styles.navIcon} src={ARROW_SRC} alt="" draggable={false} />
          </button>
          <button
            type="button"
            className={[styles.navButton, styles.navNext].join(" ")}
            aria-label="Next labels"
            disabled={busy || Boolean(transition)}
            onClick={() => step(1)}
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
